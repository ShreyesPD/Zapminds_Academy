import type { Course, CourseWithProgress } from "~/types/academy";

export const useCourses = () => {
  const supabase = useSupabase();
  const { user } = useAuth();

  const courses = useState<Course[]>("academy_courses", () => []);
  const loading = useState<boolean>("academy_courses_loading", () => false);
  const error = useState<Error | null>("academy_courses_error", () => null);

  // Fetch all published courses
  const fetchCourses = async (): Promise<Course[]> => {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("order_index", { ascending: true });

      if (fetchError) throw fetchError;

      courses.value = (data as Course[]) || [];
      return courses.value;
    } catch (err: any) {
      error.value = err;
      console.error("Error fetching courses:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Fetch a single course by ID
  const fetchCourseById = async (id: string): Promise<Course | null> => {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .eq("is_published", true)
        .single();

      if (fetchError) throw fetchError;

      return data as Course;
    } catch (err: any) {
      error.value = err;
      console.error("Error fetching course:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Fetch a single course by slug
  const fetchCourseBySlug = async (slug: string): Promise<Course | null> => {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: fetchError } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (fetchError) throw fetchError;

      return data as Course;
    } catch (err: any) {
      error.value = err;
      console.error("Error fetching course by slug:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Get course with progress for current user
  const fetchCourseWithProgress = async (
    courseId: string
  ): Promise<CourseWithProgress | null> => {
    try {
      const course = await fetchCourseById(courseId);
      if (!course || !user.value) return course as CourseWithProgress | null;

      // Get total challenges in course
      const { count: totalChallenges } = await supabase
        .from("challenges")
        .select("*", { count: "exact", head: true })
        .eq("course_id", courseId);

      // Get completed challenges for user
      const { count: challengesCompleted } = await supabase
        .from("user_challenge_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.value.id)
        .eq("status", "completed")
        .in(
          "challenge_id",
          (
            await supabase
              .from("challenges")
              .select("id")
              .eq("course_id", courseId)
          ).data?.map((c) => c.id) || []
        );

      const courseWithProgress: CourseWithProgress = {
        ...course,
        progress: {
          challenges_completed: challengesCompleted || 0,
          total_challenges: totalChallenges || 0,
          percentage:
            totalChallenges && totalChallenges > 0
              ? Math.round(
                  ((challengesCompleted || 0) / totalChallenges) * 100
                )
              : 0,
        },
      };

      return courseWithProgress;
    } catch (err: any) {
      error.value = err;
      console.error("Error fetching course with progress:", err);
      return null;
    }
  };

  return {
    courses: readonly(courses),
    loading: readonly(loading),
    error: readonly(error),
    fetchCourses,
    fetchCourseById,
    fetchCourseBySlug,
    fetchCourseWithProgress,
  };
};

