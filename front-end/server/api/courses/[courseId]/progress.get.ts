import { useServerSupabase } from "~/server/utils/supabase-client";

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

  const userId = authUser.user.id;
  const params = event.context.params ?? {};
  const courseSlug = params.courseId;

  if (!courseSlug) {
    throw createError({ statusCode: 400, statusMessage: "Course identifier is required." });
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, slug")
    .eq("slug", courseSlug)
    .maybeSingle();

  if (courseError || !course) {
    throw createError({ statusCode: 404, statusMessage: "Course not found" });
  }

  const { data: modules, error: modulesError } = await supabase
    .from("modules")
    .select("id, xp_value, order_index, title")
    .eq("course_id", course.id)
    .order("order_index", { ascending: true });

  if (modulesError) {
    throw createError({ statusCode: 500, statusMessage: `Failed to load modules: ${modulesError.message}` });
  }

  const moduleIds = (modules ?? []).map((module) => module.id);

  const completionsQuery = moduleIds.length
    ? await supabase
        .from("module_completions")
        .select("module_id, awarded_xp, completed_at")
        .eq("user_id", userId)
        .in("module_id", moduleIds)
    : { data: [], error: null };

  if (completionsQuery.error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to load module completions: ${completionsQuery.error.message}`,
    });
  }

  const completionsByModule = new Map<number, { awarded_xp: number; completed_at: string | null }>();
  for (const completion of completionsQuery.data ?? []) {
    completionsByModule.set(completion.module_id, {
      awarded_xp: completion.awarded_xp ?? 0,
      completed_at: completion.completed_at ?? null,
    });
  }

  const { data: details, error: detailsError } = moduleIds.length
    ? await supabase
        .from("module_details")
        .select("module_id, external_id, difficulty")
        .in("module_id", moduleIds)
    : { data: [], error: null };

  if (detailsError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to load module details: ${detailsError.message}`,
    });
  }

  const detailByModule = new Map<number, { external_id: string | null; difficulty: string | null }>();
  for (const detail of details ?? []) {
    detailByModule.set(detail.module_id, {
      external_id: detail.external_id ?? null,
      difficulty: detail.difficulty ?? null,
    });
  }

  const totalModules = modules?.length ?? 0;
  const completedModules = modules?.filter((module) => completionsByModule.has(module.id)).length ?? 0;
  const totalXp = modules?.reduce((acc, module) => acc + (module.xp_value ?? 0), 0) ?? 0;
  const earnedXp = modules?.reduce((acc, module) => {
    const completion = completionsByModule.get(module.id);
    return acc + (completion?.awarded_xp ?? 0);
  }, 0) ?? 0;

  const completionPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const nextModule = modules?.find((module) => !completionsByModule.has(module.id)) ?? null;
  const nextDetail = nextModule ? detailByModule.get(nextModule.id) : null;

  return {
    courseId: course.id,
    courseSlug: course.slug,
    completedModules,
    totalModules,
    earnedXp,
    totalXp,
    completionPercent,
    nextModuleId: nextModule?.id ?? null,
    nextModuleSlug: nextDetail?.external_id ?? null,
    nextModuleTitle: nextModule?.title ?? null,
  };
});
