import type { SubmissionStatus } from "~/types/academy";

interface SaveSubmissionRequest {
  challengeId: string;
  code: string;
  language: string;
  status: SubmissionStatus;
  testResults: any;
  executionTime: number | null;
  memoryUsed: number | null;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  );
  const body = await readBody<SaveSubmissionRequest>(event);

  const {
    challengeId,
    code,
    language,
    status,
    testResults,
    executionTime,
    memoryUsed,
  } = body;

  if (!challengeId || !code || !language || !status) {
    return {
      success: false,
      error: "Missing required fields",
    };
  }

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  try {
    // Save submission
    const { data, error: insertError } = await supabase
      .from("submissions")
      .insert({
        user_id: user.id,
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

    // Update challenge progress
    const isCompleted = status === "accepted";
    const { error: upsertError } = await supabase
      .from("user_challenge_progress")
      .upsert(
        {
          user_id: user.id,
          challenge_id: challengeId,
          status: isCompleted ? "completed" : "in_progress",
          best_submission_id: isCompleted ? data.id : null,
          completed_at: isCompleted ? new Date().toISOString() : null,
        },
        {
          onConflict: "user_id,challenge_id",
        }
      );

    if (upsertError) {
      console.error("Error updating challenge progress:", upsertError);
      // Don't fail the request if progress update fails
    }

    // Update user progress if accepted
    if (isCompleted) {
      // Get challenge points
      const { data: challenge } = await supabase
        .from("challenges")
        .select("points")
        .eq("id", challengeId)
        .single();

      if (challenge) {
        // Get or create user progress
        const { data: userProgress } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (userProgress) {
          // Check if this is first completion
          const { count } = await supabase
            .from("user_challenge_progress")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("status", "completed");

          const isFirstCompletion = (count || 0) === 1;

          // Update progress
          const now = new Date();
          const lastActivity = userProgress.last_activity_at
            ? new Date(userProgress.last_activity_at)
            : null;

          let newStreak = userProgress.current_streak;
          let longestStreak = userProgress.longest_streak;

          if (lastActivity) {
            const daysSinceLastActivity = Math.floor(
              (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysSinceLastActivity === 0) {
              newStreak = userProgress.current_streak;
            } else if (daysSinceLastActivity === 1) {
              newStreak = userProgress.current_streak + 1;
            } else {
              newStreak = 1;
            }
          } else {
            newStreak = 1;
          }

          if (newStreak > longestStreak) {
            longestStreak = newStreak;
          }

          await supabase
            .from("user_progress")
            .update({
              total_points: userProgress.total_points + challenge.points,
              challenges_completed: isFirstCompletion
                ? userProgress.challenges_completed + 1
                : userProgress.challenges_completed,
              current_streak: newStreak,
              longest_streak: longestStreak,
              last_activity_at: now.toISOString(),
              updated_at: now.toISOString(),
            })
            .eq("user_id", user.id);
        } else {
          // Create new user progress
          await supabase.from("user_progress").insert({
            user_id: user.id,
            total_points: challenge.points,
            challenges_completed: 1,
            courses_completed: 0,
            current_streak: 1,
            longest_streak: 1,
            last_activity_at: new Date().toISOString(),
          });
        }
      }
    }

    return {
      success: true,
      submission: data,
    };
  } catch (err: any) {
    console.error("Error saving submission:", err);
    return {
      success: false,
      error: err.message || "Failed to save submission",
    };
  }
});

