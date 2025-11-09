import { computed, ref } from "vue";

export type CourseCompletionsResponse = {
  completedModuleIds: number[];
  completedExternalIds: string[];
};

export const useCourseCompletions = (courseSlug: string) => {
  const key = `course-completions:${courseSlug}`;
  const completedExternalIds = ref<string[]>([]);

  const { data, pending, refresh, error } = useAsyncData(
    key,
    async () => {
      if (!courseSlug) {
        return { completedModuleIds: [], completedExternalIds: [] };
      }

      try {
        // Get the Supabase client to retrieve the access token
        const nuxtApp = useNuxtApp();
        const supabase = nuxtApp.$supabase as any;

        if (!supabase) {
          console.error("[course-completions] Supabase client not available");
          return { completedModuleIds: [], completedExternalIds: [] };
        }

        // Get the current session
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) {
          console.error("[course-completions] No access token available. User must be logged in.");
          return { completedModuleIds: [], completedExternalIds: [] };
        }

        const response = await $fetch<CourseCompletionsResponse>(
          `/api/courses/${courseSlug}/completions`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        completedExternalIds.value = response.completedExternalIds || [];
        return response;
      } catch (fetchError) {
        console.error(`[course-completions] Failed to load completions for '${courseSlug}'`, fetchError);
        return { completedModuleIds: [], completedExternalIds: [] };
      }
    },
    {
      default: () => ({ completedModuleIds: [], completedExternalIds: [] }),
      server: false,
      lazy: false,
    }
  );

  const isModuleCompleted = (externalId: string) => {
    return computed(() => completedExternalIds.value.includes(externalId));
  };

  return {
    completedModuleIds: computed(() => data.value?.completedModuleIds ?? []),
    completedExternalIds: computed(() => data.value?.completedExternalIds ?? []),
    isModuleCompleted,
    pending,
    error,
    refresh,
  };
};

