import type { Submission, SubmissionStatus } from "~/types/academy";
import type { SupportedLanguage } from "~/utils/code-templates";

export const useSubmissions = () => {
  const supabase = useSupabase();
  const { user } = useAuth();

  const submissions = useState<Submission[]>("academy_submissions", () => []);
  const loading = useState<boolean>("academy_submissions_loading", () => false);
  const error = useState<Error | null>("academy_submissions_error", () => null);

  // Save a submission
  const saveSubmission = async (
    challengeId: string,
    code: string,
    language: SupportedLanguage,
    status: SubmissionStatus,
    testResults: any,
    executionTime: number | null,
    memoryUsed: number | null
  ): Promise<Submission | null> => {
    if (!user.value) {
      error.value = new Error("User must be authenticated to save submissions");
      return null;
    }

    try {
      loading.value = true;
      error.value = null;

      const { data, error: insertError } = await supabase
        .from("submissions")
        .insert({
          user_id: user.value.id,
          challenge_id: challengeId,
          code,
          language,
          status,
          test_results: testResults,
          execution_time: executionTime,
          memory_used: memoryUsed,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const submission = data as Submission;
      submissions.value = [submission, ...submissions.value];
      return submission;
    } catch (err: any) {
      error.value = err;
      console.error("Error saving submission:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Get submissions for a challenge
  const getSubmissionsByChallenge = async (
    challengeId: string
  ): Promise<Submission[]> => {
    if (!user.value) {
      return [];
    }

    try {
      loading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase
        .from("submissions")
        .select("*")
        .eq("user_id", user.value.id)
        .eq("challenge_id", challengeId)
        .order("submitted_at", { ascending: false });

      if (fetchError) throw fetchError;

      submissions.value = (data as Submission[]) || [];
      return submissions.value;
    } catch (err: any) {
      error.value = err;
      console.error("Error fetching submissions:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Get best submission for a challenge
  const getBestSubmission = async (
    challengeId: string
  ): Promise<Submission | null> => {
    if (!user.value) {
      return null;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from("submissions")
        .select("*")
        .eq("user_id", user.value.id)
        .eq("challenge_id", challengeId)
        .eq("status", "accepted")
        .order("submitted_at", { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          // No submission found
          return null;
        }
        throw fetchError;
      }

      return data as Submission;
    } catch (err: any) {
      error.value = err;
      console.error("Error fetching best submission:", err);
      return null;
    }
  };

  // Update challenge progress after successful submission
  const updateChallengeProgress = async (
    challengeId: string,
    submissionId: string,
    isCompleted: boolean
  ): Promise<void> => {
    if (!user.value) return;

    try {
      const { error: upsertError } = await supabase
        .from("user_challenge_progress")
        .upsert(
          {
            user_id: user.value.id,
            challenge_id: challengeId,
            status: isCompleted ? "completed" : "in_progress",
            best_submission_id: submissionId,
            completed_at: isCompleted ? new Date().toISOString() : null,
          },
          {
            onConflict: "user_id,challenge_id",
          }
        );

      if (upsertError) throw upsertError;
    } catch (err: any) {
      error.value = err;
      console.error("Error updating challenge progress:", err);
    }
  };

  return {
    submissions: readonly(submissions),
    loading: readonly(loading),
    error: readonly(error),
    saveSubmission,
    getSubmissionsByChallenge,
    getBestSubmission,
    updateChallengeProgress,
  };
};

