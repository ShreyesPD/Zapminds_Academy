import type { LeaderboardEntry } from "~/types/academy";

export const useLeaderboard = () => {
  const supabase = useSupabase();
  const { user } = useAuth();

  const leaderboard = useState<LeaderboardEntry[]>(
    "academy_leaderboard",
    () => []
  );
  const loading = useState<boolean>("academy_leaderboard_loading", () => false);
  const error = useState<Error | null>("academy_leaderboard_error", () => null);

  // Fetch leaderboard
  const fetchLeaderboard = async (
    limit: number = 100
  ): Promise<LeaderboardEntry[]> => {
    try {
      loading.value = true;
      error.value = null;

      // Get all user progress with user profiles
      const { data, error: fetchError } = await supabase
        .from("user_progress")
        .select(
          `
          user_id,
          total_points,
          challenges_completed,
          current_streak,
          profiles (
            email,
            designation
          )
        `
        )
        .order("total_points", { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      // Transform data to LeaderboardEntry format
      const entries: LeaderboardEntry[] =
        data?.map((item: any, index: number) => ({
          user_id: item.user_id,
          email: item.profiles?.email || "Unknown",
          designation: item.profiles?.designation || null,
          total_points: item.total_points || 0,
          challenges_completed: item.challenges_completed || 0,
          current_streak: item.current_streak || 0,
          rank: index + 1,
        })) || [];

      leaderboard.value = entries;
      return entries;
    } catch (err: any) {
      error.value = err;
      console.error("Error fetching leaderboard:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Get current user's rank
  const getUserRank = async (): Promise<number | null> => {
    if (!user.value) return null;

    try {
      const { data, error: fetchError } = await supabase
        .from("user_progress")
        .select("total_points")
        .eq("user_id", user.value.id)
        .single();

      if (fetchError || !data) return null;

      // Count users with more points
      const { count, error: countError } = await supabase
        .from("user_progress")
        .select("*", { count: "exact", head: true })
        .gt("total_points", data.total_points);

      if (countError) throw countError;

      return (count || 0) + 1;
    } catch (err: any) {
      error.value = err;
      console.error("Error fetching user rank:", err);
      return null;
    }
  };

  return {
    leaderboard: readonly(leaderboard),
    loading: readonly(loading),
    error: readonly(error),
    fetchLeaderboard,
    getUserRank,
  };
};

