#!/usr/bin/env node
import "dotenv/config";
import crypto from "node:crypto";
import process from "node:process";
import { createClient, type User } from "@supabase/supabase-js";

import { pythonFoundationsContent } from "../utils/python-foundations-data";
import { UIElements } from "../assets/static-data/ui-elements";
import { getModuleXp } from "../utils/module-xp-values";

type Serializable =
  | string
  | number
  | boolean
  | null
  | Serializable[]
  | { [key: string]: Serializable }
  | { __kind: "function"; source: string };

const SYSTEM_USER_EMAIL = process.env.SEED_SYSTEM_EMAIL ?? "system@zapminds.academy";
const SYSTEM_USER_NAME = process.env.SEED_SYSTEM_NAME ?? "Zapminds Academy System";

const SUPABASE_URL = process.env.NUXT_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error("[seed] Missing NUXT_SUPABASE_URL. Populate your environment before running the seed script.");
  process.exitCode = 1;
  throw new Error("NUXT_SUPABASE_URL is not defined");
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "[seed] Missing SUPABASE_SERVICE_ROLE_KEY. Populate your environment before running the seed script."
  );
  process.exitCode = 1;
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const logStep = (message: string) => {
  console.info(`[seed] ${message}`);
};

const describeError = (error: unknown) => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  if (typeof error === "object" && error !== null) {
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }

  return String(error);
};

const fatal = (error: unknown, context?: string): never => {
  const details = describeError(error);
  console.error(`[seed] ${context ?? "Seed failed"}: ${details}`);
  if (error instanceof Error) {
    throw error;
  }
  throw new Error(details);
};

const findSystemUser = async (): Promise<User | null> => {
  const existing = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (existing.error) {
    fatal(existing.error, "Failed to list existing users");
  }

  const normalizedTarget = SYSTEM_USER_EMAIL.toLowerCase();

  return (
    existing.data?.users?.find(
      (user) => user.email?.toLowerCase() === normalizedTarget
    ) ?? null
  );
};

const ensureSystemUser = async (): Promise<User> => {
  logStep(`Ensuring service user '${SYSTEM_USER_EMAIL}' exists`);

  const existing = await findSystemUser();
  if (existing) {
    return existing;
  }

  const password = crypto.randomBytes(24).toString("hex");

  const created = await supabase.auth.admin.createUser({
    email: SYSTEM_USER_EMAIL,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: SYSTEM_USER_NAME,
      role: "admin",
      source: "seed-script",
    },
  });

  if (created.error) {
    // Handle race conditions where the user may already exist.
    if ((created.error as any)?.status === 422) {
      const fallback = await findSystemUser();
      if (fallback) {
        logStep("Service user already exists, reusing existing account");
        return fallback;
      }
    }

    fatal(created.error, "Failed to create system user");
  }

  if (!created.data?.user) {
    fatal(new Error("Admin createUser returned no user payload"), "Failed to create system user");
  }

  logStep("Created new service user account");
  return created.data.user;
};

const ensureSystemProfile = async (user: User) => {
  const profilePayload = {
    user_id: user.id,
    role: "admin",
    display_name: SYSTEM_USER_NAME,
  } as const;

  const result = await supabase.from("profiles").upsert(profilePayload, {
    onConflict: "user_id",
  });

  if (result.error) {
    fatal(result.error, "Failed to upsert admin profile");
  }

  logStep("Profile record aligned for service user");
};

const upsertCourse = async (user: User) => {
  // Slug is auto-generated in database from title
  // Use simple title "Python" to generate slug "python" matching route /courses/python
  const courseTitle = "Python";
  
  // First check if course exists by slug since we want to match the route
  const existing = await supabase
    .from("courses")
    .select("*")
    .eq("slug", "python")
    .maybeSingle();

  if (existing.data) {
    // Update existing course
    const updated = await supabase
      .from("courses")
      .update({
        description: pythonFoundationsContent.hero.description,
        is_published: true,
      })
      .eq("id", existing.data.id)
      .select("*")
      .single();

    if (updated.error) {
      fatal(updated.error, "Failed to update existing course");
    }

    logStep(`Course '${updated.data.slug}' updated (id=${updated.data.id})`);
    return updated.data;
  }

  // Create new course - title "Python" will auto-generate slug "python"
  const coursePayload = {
    title: courseTitle,
    description: pythonFoundationsContent.hero.description,
    is_published: true,
    created_by: user.id,
  } as const;

  const result = await supabase
    .from("courses")
    .insert(coursePayload)
    .select("*")
    .single();

  if (result.error) {
    fatal(result.error, "Failed to insert new course");
  }

  logStep(`Course '${result.data.slug}' created (id=${result.data.id})`);
  return result.data;
};

const syncModules = async (courseId: number) => {
  logStep("Refreshing modules for course");

  const purge = await supabase.from("modules").delete().eq("course_id", courseId);
  if (purge.error) {
    fatal(purge.error, "Failed to delete existing modules");
  }

  const moduleRows = pythonFoundationsContent.modules.map((module, index) => ({
    course_id: courseId,
    title: module.title,
    order_index: index + 1,
    xp_value: getModuleXp(module.difficulty),
    is_required: true,
    content_url: `course/${pythonFoundationsContent.courseId}/modules/${module.id}`,
  }));

  const inserted = await supabase
    .from("modules")
    .insert(moduleRows)
    .select("*")
    .order("order_index", { ascending: true });

  if (inserted.error || !inserted.data) {
    fatal(inserted.error ?? new Error("Module insert returned no rows"), "Failed to insert modules");
  }

  logStep(`Inserted ${inserted.data.length} modules`);
  return inserted.data;
};

const syncModuleDetails = async (courseId: number, modules: { id: number; order_index: number }[]) => {
  logStep("Upserting module details payload");

  const detailsPayload = modules.map((row) => {
    const moduleIndex = row.order_index - 1;
    const module = pythonFoundationsContent.modules[moduleIndex];
    if (!module) {
      fatal(new Error(`Missing source module for order_index=${row.order_index}`));
    }

    return {
      module_id: row.id,
      course_id: courseId,
      external_id: module.id,
      duration: module.duration,
      difficulty: module.difficulty,
      overview: module.overview,
      learning_objectives: module.learningObjectives,
      reading: module.reading,
      code_concepts: module.codeConcepts,
      exercise: module.exercise,
      updated_at: new Date().toISOString(),
    };
  });

  const upserted = await supabase.from("module_details").upsert(detailsPayload, {
    onConflict: "module_id",
  });

  if (upserted.error) {
    fatal(upserted.error, "Failed to upsert module details");
  }

  logStep(`Module details stored for ${detailsPayload.length} modules`);
};

const syncCourseContent = async (courseId: number) => {
  logStep("Upserting course-level content");

  // Delete any existing content with slug "python" to avoid unique constraint issues
  const deleteResult = await supabase
    .from("course_content")
    .delete()
    .eq("course_slug", "python");

  if (deleteResult.error && deleteResult.error.code !== "PGRST116") {
    // PGRST116 is "no rows deleted" which is fine
    fatal(deleteResult.error, "Failed to delete existing course content");
  }

  const payload = {
    course_id: courseId,
    course_slug: "python", // Use the actual slug that was generated
    hero: pythonFoundationsContent.hero,
    capstone: pythonFoundationsContent.capstone,
    updated_at: new Date().toISOString(),
  };

  const result = await supabase.from("course_content").insert(payload);

  if (result.error) {
    fatal(result.error, "Failed to insert course content");
  }
};

const serializeUIValue = (value: unknown): Serializable => {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "function") {
    return {
      __kind: "function",
      source: value.toString(),
    };
  }

  if (Array.isArray(value)) {
    return value.map((entry) => serializeUIValue(entry));
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, Serializable>>(
      (acc, [key, inner]) => {
        acc[key] = serializeUIValue(inner);
        return acc;
      },
      {}
    );
  }

  return {
    __kind: "unknown",
    source: String(value),
  };
};

const syncUIContent = async () => {
  logStep("Upserting UI content payload");

  const serialized = serializeUIValue(UIElements);
  const payload = {
    id: "ui-elements",
    payload: serialized,
    updated_at: new Date().toISOString(),
  };

  const result = await supabase.from("ui_content").upsert(payload, {
    onConflict: "id",
  });

  if (result.error) {
    fatal(result.error, "Failed to upsert UI content payload");
  }
};

const main = async () => {
  logStep("Starting Supabase seed for course and UI content");

  const systemUser = await ensureSystemUser();
  await ensureSystemProfile(systemUser);
  const course = await upsertCourse(systemUser);
  const modules = await syncModules(course.id);
  await syncModuleDetails(course.id, modules);
  await syncCourseContent(course.id);
  await syncUIContent();

  logStep("Seed run completed successfully");
};

main().catch((error) => {
  fatal(error, "Seed script crashed");
});
