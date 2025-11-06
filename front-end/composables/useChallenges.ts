import type {
  Challenge,
  ChallengeWithProgress,
  TestCase,
} from "~/types/academy";

export const useChallenges = () => {
  const supabase = useSupabase();
  const { user } = useAuth();

  const challenges = useState<Challenge[]>("academy_challenges", () => []);
  const loading = useState<boolean>("academy_challenges_loading", () => false);
  const error = useState<Error | null>("academy_challenges_error", () => null);

  // Fetch all challenges for a course
  const fetchChallengesByCourse = async (
    courseId: string
  ): Promise<Challenge[]> => {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase
        .from("challenges")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (fetchError) throw fetchError;

      const parsedChallenges = (data || []).map((challenge) => ({
        ...challenge,
        test_cases: Array.isArray(challenge.test_cases)
          ? challenge.test_cases
          : [],
        starter_code: challenge.starter_code || null,
        solution_code: challenge.solution_code || null,
      })) as Challenge[];

      challenges.value = parsedChallenges;
      return parsedChallenges;
    } catch (err: any) {
      error.value = err;
      console.error("Error fetching challenges:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Fetch a single challenge by ID
  const fetchChallengeById = async (
    id: string
  ): Promise<Challenge | null> => {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase
        .from("challenges")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const challenge = {
        ...data,
        test_cases: Array.isArray(data.test_cases) ? data.test_cases : [],
        starter_code: data.starter_code || null,
        solution_code: data.solution_code || null,
      } as Challenge;

      return challenge;
    } catch (err: any) {
      error.value = err;
      console.error("Error fetching challenge:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Fetch a single challenge by slug
  const fetchChallengeBySlug = async (
    slug: string
  ): Promise<Challenge | null> => {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase
        .from("challenges")
        .select("*")
        .eq("slug", slug)
        .single();

      if (fetchError) throw fetchError;

      const challenge = {
        ...data,
        test_cases: Array.isArray(data.test_cases) ? data.test_cases : [],
        starter_code: data.starter_code || null,
        solution_code: data.solution_code || null,
      } as Challenge;

      return challenge;
    } catch (err: any) {
      error.value = err;
      console.error("Error fetching challenge by slug:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Get challenge with progress for current user
  const fetchChallengeWithProgress = async (
    challengeId: string
  ): Promise<ChallengeWithProgress | null> => {
    try {
      const challenge = await fetchChallengeById(challengeId);
      if (!challenge || !user.value) {
        return challenge as ChallengeWithProgress | null;
      }

      // Get user's progress for this challenge
      const { data: progressData } = await supabase
        .from("user_challenge_progress")
        .select("*")
        .eq("user_id", user.value.id)
        .eq("challenge_id", challengeId)
        .single();

      const challengeWithProgress: ChallengeWithProgress = {
        ...challenge,
        progress: progressData
          ? {
              status: progressData.status,
              best_submission_id: progressData.best_submission_id,
              completed_at: progressData.completed_at,
            }
          : {
              status: "not_started",
              best_submission_id: null,
              completed_at: null,
            },
      };

      return challengeWithProgress;
    } catch (err: any) {
      error.value = err;
      console.error("Error fetching challenge with progress:", err);
      return null;
    }
  };

  // Get test cases for a challenge (filter hidden ones if needed)
  const getTestCases = (
    challenge: Challenge,
    includeHidden: boolean = false
  ): TestCase[] => {
    if (!challenge.test_cases || !Array.isArray(challenge.test_cases)) {
      return [];
    }

    if (includeHidden) {
      return challenge.test_cases;
    }

    return challenge.test_cases.filter((tc) => !tc.is_hidden);
  };

  return {
    challenges: readonly(challenges),
    loading: readonly(loading),
    error: readonly(error),
    fetchChallengesByCourse,
    fetchChallengeById,
    fetchChallengeBySlug,
    fetchChallengeWithProgress,
    getTestCases,
  };
};

