import { useServerSupabase } from "~/server/utils/supabase-client";
import { awardXp, calculateModuleXp } from "~/server/utils/xp-calculator";
import { checkAndAwardTierBadge } from "~/server/utils/badge-manager";

const extractBearerToken = (authorizationHeader: string | undefined | null) => {
  if (!authorizationHeader) {
    return null;
  }

  const parts = authorizationHeader.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1];
  }

  return null;
};

interface SubmitRequestBody {
  moduleId?: number | string;
  passed?: boolean;
  code?: string;
}

export default defineEventHandler(async (event) => {
  const supabase = useServerSupabase();
  const token = extractBearerToken(getHeader(event, "authorization"));

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: "Missing bearer token" });
  }

  const { data: authUser, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authUser?.user) {
    throw createError({ statusCode: 401, statusMessage: "Invalid authentication token" });
  }

  const body = await readBody<SubmitRequestBody>(event);
  if (!body?.moduleId) {
    throw createError({ statusCode: 400, statusMessage: "moduleId is required" });
  }

  if (!body.passed) {
    return {
      awarded: false,
      reason: "Submission did not pass required tests.",
    };
  }

  const moduleIdentifier = body.moduleId;

  let moduleRow: { id: number; course_id: number; xp_value: number | null } | null = null;

  if (typeof moduleIdentifier === "number") {
    const { data, error } = await supabase
      .from("modules")
      .select("id, course_id, xp_value")
      .eq("id", moduleIdentifier)
      .maybeSingle();

    if (error) {
      throw createError({ statusCode: 500, statusMessage: `Failed to load module: ${error.message}` });
    }
    moduleRow = data;
  } else {
    const { data, error } = await supabase
      .from("module_details")
      .select("module_id, course_id, external_id, modules:module_id(id, course_id, xp_value)")
      .eq("external_id", moduleIdentifier)
      .maybeSingle();

    if (error) {
      throw createError({ statusCode: 500, statusMessage: `Failed to load module: ${error.message}` });
    }

    if (data?.modules) {
      moduleRow = {
        id: data.modules.id,
        course_id: data.modules.course_id,
        xp_value: data.modules.xp_value,
      };
    }
  }

  if (!moduleRow) {
    throw createError({ statusCode: 404, statusMessage: "Module not found" });
  }

  const { data: moduleDetail, error: detailError } = await supabase
    .from("module_details")
    .select("difficulty, external_id")
    .eq("module_id", moduleRow.id)
    .maybeSingle();

  if (detailError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to load module metadata: ${detailError.message}`,
    });
  }

  const existingCompletion = await supabase
    .from("module_completions")
    .select("module_id")
    .eq("user_id", authUser.user.id)
    .eq("module_id", moduleRow.id)
    .maybeSingle();

  const alreadyCompleted = !!existingCompletion.data;

  const baseXp = moduleRow.xp_value ?? calculateModuleXp(moduleDetail?.difficulty ?? null);

  let awardedXp = 0;
  let xpResult = null;
  let tierBadge = null;

  if (!alreadyCompleted) {
    awardedXp = baseXp;

    const { error: completionError } = await supabase.from("module_completions").insert({
      user_id: authUser.user.id,
      module_id: moduleRow.id,
      awarded_xp: awardedXp,
    });

    if (completionError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to record module completion: ${completionError.message}`,
      });
    }

    xpResult = await awardXp({
      userId: authUser.user.id,
      amount: awardedXp,
      type: "module",
      sourceId: moduleRow.id,
      description:
        typeof moduleIdentifier === "string"
          ? moduleIdentifier
          : moduleDetail?.external_id ?? `module:${moduleRow.id}`,
    });

    if (xpResult.tierChanged) {
      tierBadge = await checkAndAwardTierBadge(authUser.user.id, xpResult.newTier.name);
    }
  }

  return {
    awarded: !alreadyCompleted,
    moduleId: moduleRow.id,
    xpAwarded: awardedXp,
    xpResult,
    tierBadge,
  };
});
