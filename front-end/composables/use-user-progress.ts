import { computed } from "vue";
import { formatTierProgressLabel } from "~/utils/xp-tiers";

export type UserProgressResponse = {
  xp: {
    total: number;
    tier: string;
    nextTier: string | null;
    xpIntoTier: number;
    xpToNextTier: number;
    xpNeededForNextTier: number | null;
    percentToNextTier: number;
  };
  streak: {
    current: number;
    longest: number;
    lastCompletedDate: string | null;
  };
  submissionsToday: number;
  reviewQueueCount: number;
  recentBadges: Array<{
    badge_key: string;
    badge_name: string;
    badge_icon: string | null;
    earned_at: string;
  }>;
};

const defaultProgress = (): UserProgressResponse => ({
  xp: {
    total: 0,
    tier: "Bronze",
    nextTier: "Silver",
    xpIntoTier: 0,
    xpToNextTier: 1000,
    xpNeededForNextTier: 1000,
    percentToNextTier: 0,
  },
  streak: {
    current: 0,
    longest: 0,
    lastCompletedDate: null,
  },
  submissionsToday: 0,
  reviewQueueCount: 0,
  recentBadges: [],
});

export const useUserProgress = () => {
  const fetchProgress = async (): Promise<UserProgressResponse> => {
    try {
      // Only get token on client side
      let token: string | undefined;
      if (import.meta.client) {
        const supabase = useSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token;
        
        if (!token) {
          console.warn("[user-progress] No auth token available");
          return defaultProgress();
        }
      }
      
      const response = await $fetch<UserProgressResponse>("/api/user/stats", {
        method: "GET",
        ...(token && {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }),
      });
      
      if (import.meta.client) {
        console.log("[user-progress] Fetched stats:", response?.xp?.total, "XP");
      }
      return response ?? defaultProgress();
    } catch (fetchError: any) {
      console.error("[user-progress] Failed to load stats", fetchError);
      if (fetchError?.statusCode === 401) {
        console.warn("[user-progress] Unauthorized");
      }
      return defaultProgress();
    }
  };
  
  const { data, pending, refresh, error } = useAsyncData("user-progress", fetchProgress, {
    default: defaultProgress,
    server: true,
    lazy: false,
  });

  const progress = computed(() => data.value ?? defaultProgress());

  const xpSummary = computed(() => ({
    ...progress.value.xp,
    tierLabel: formatTierProgressLabel(progress.value.xp.total),
  }));

  const streakSummary = computed(() => progress.value.streak);
  const recentBadges = computed(() => progress.value.recentBadges);

  return {
    progress,
    xpSummary,
    streakSummary,
    recentBadges,
    submissionsToday: computed(() => progress.value.submissionsToday),
    reviewQueueCount: computed(() => progress.value.reviewQueueCount),
    pending,
    error,
    refresh,
  };
};
