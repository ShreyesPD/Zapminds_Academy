import type { UserProgress } from "~/types/academy";

export const useUserProgress = () => {
  const supabase = useSupabase();
  const { user } = useAuth();

  const progress = useState<UserProgress | null>(
    "academy_user_progress",
    () => null
  );
  const loading = useState<boolean>("academy_user_progress_loading", () => false);
  const error = useState<Error | null>("academy_user_progress_error", () => null);

  // Fetch user progress
  const fetchUserProgress = async (): Promise<UserProgress | null> => {
    if (!user.value) {
      progress.value = null;
      return null;
    }

    try {
      loading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.value.id)
        .single();

      if (fetchError) {
        // If no progress exists, create one
        if (fetchError.code === "PGRST116") {
          return await initializeUserProgress();
        }
        throw fetchError;
      }

      progress.value = data as UserProgress;
      return progress.value;
    } catch (err: any) {
      error.value = err;
      console.error("Error fetching user progress:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Initialize user progress if it doesn't exist
  const initializeUserProgress = async (): Promise<UserProgress | null> => {
    if (!user.value) return null;

    try {
      const { data, error: insertError } = await supabase
        .from("user_progress")
        .insert({
          user_id: user.value.id,
          total_points: 0,
          challenges_completed: 0,
          courses_completed: 0,
          current_streak: 0,
          longest_streak: 0,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      progress.value = data as UserProgress;
      return progress.value;
    } catch (err: any) {
      error.value = err;
      console.error("Error initializing user progress:", err);
      return null;
    }
  };

  // Update user progress (called after successful submission)
  const updateProgress = async (
    points: number,
    challengeCompleted: boolean = false
  ): Promise<void> => {
    if (!user.value) return;

    try {
      // Get current progress
      let currentProgress = progress.value;
      if (!currentProgress) {
        currentProgress = await fetchUserProgress();
      }

      if (!currentProgress) {
        currentProgress = await initializeUserProgress();
      }

      if (!currentProgress) return;

      // Calculate new streak
      const now = new Date();
      const lastActivity = currentProgress.last_activity_at
        ? new Date(currentProgress.last_activity_at)
        : null;

      let newStreak = currentProgress.current_streak;
      let longestStreak = currentProgress.longest_streak;

      if (lastActivity) {
        const daysSinceLastActivity = Math.floor(
          (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastActivity === 0) {
          // Same day, keep streak
          newStreak = currentProgress.current_streak;
        } else if (daysSinceLastActivity === 1) {
          // Consecutive day, increment streak
          newStreak = currentProgress.current_streak + 1;
        } else {
          // Streak broken, reset to 1
          newStreak = 1;
        }
      } else {
        // First activity
        newStreak = 1;
      }

      if (newStreak > longestStreak) {
        longestStreak = newStreak;
      }

      // Update progress
      const { error: updateError } = await supabase
        .from("user_progress")
        .update({
          total_points: currentProgress.total_points + points,
          challenges_completed: challengeCompleted
            ? currentProgress.challenges_completed + 1
            : currentProgress.challenges_completed,
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("user_id", user.value.id);

      if (updateError) throw updateError;

      // Refresh progress
      await fetchUserProgress();
    } catch (err: any) {
      error.value = err;
      console.error("Error updating user progress:", err);
    }
  };

  // Refresh progress from database
  const refreshProgress = async (): Promise<void> => {
    await fetchUserProgress();
  };

  return {
    progress: readonly(progress),
    loading: readonly(loading),
    error: readonly(error),
    fetchUserProgress,
    updateProgress,
    refreshProgress,
  };
};

