<script lang="ts" setup>
const route = useRoute();
const router = useRouter();
const { user } = useAuth();

// Redirect if not authenticated
onMounted(() => {
  if (!user.value) {
    router.push("/signin");
  }
});

const courseId = route.params.id as string;
const { fetchCourseWithProgress, loading: courseLoading } = useCourses();
const {
  fetchChallengesByCourse,
  loading: challengesLoading,
} = useChallenges();

const course = ref<any>(null);
const challenges = ref<any[]>([]);

onMounted(async () => {
  const courseData = await fetchCourseWithProgress(courseId);
  if (!courseData) {
    router.push("/dashboard");
    return;
  }
  course.value = courseData;

  const challengesData = await fetchChallengesByCourse(courseId);
  challenges.value = challengesData;
});
</script>

<template>
  <div :class="$style.root">
    <div :class="$style.container">
      <div v-if="courseLoading" :class="$style.loading">
        <p>Loading course...</p>
      </div>

      <div v-else-if="!course" :class="$style.error">
        <p>Course not found.</p>
      </div>

      <div v-else>
        <div :class="$style.header">
          <button :class="$style.backButton" @click="router.push('/dashboard')">
            ← Back to Courses
          </button>
          <h1 :class="$style.title">{{ course.title }}</h1>
          <p v-if="course.description" :class="$style.description">
            {{ course.description }}
          </p>
          <div :class="$style.meta">
            <span
              v-if="course.difficulty"
              :class="$style.difficulty"
            >
              {{ course.difficulty }}
            </span>
            <span v-if="course.estimated_time" :class="$style.time">
              ⏱ {{ course.estimated_time }} minutes
            </span>
          </div>
          <div v-if="course.progress" :class="$style.progressSection">
            <ProgressBar
              :current="course.progress.challenges_completed"
              :total="course.progress.total_challenges"
              label="Course Progress"
            />
          </div>
        </div>

        <div :class="$style.challengesSection">
          <h2 :class="$style.sectionTitle">Challenges</h2>
          <div v-if="challengesLoading" :class="$style.loading">
            <p>Loading challenges...</p>
          </div>
          <div
            v-else-if="challenges.length === 0"
            :class="$style.empty"
          >
            <p>No challenges available yet.</p>
          </div>
          <div v-else :class="$style.challengesGrid">
            <ChallengeCard
              v-for="challenge in challenges"
              :key="challenge.id"
              :challenge="challenge"
              :progress="challenge.progress"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
.root {
  min-height: 100vh;
  padding: 2rem 1rem;
  padding-top: calc(2rem + 80px); // Account for fixed header
  background: var(--background-color);
  color: var(--foreground-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 3rem;
  font-family: var(--text-font);
  opacity: 0.7;
}

.header {
  margin-bottom: 3rem;
}

.backButton {
  padding: 0.5rem 1rem;
  margin-bottom: 1.5rem;
  font-family: var(--text-font);
  font-size: 0.875rem;
  background: transparent;
  border: 2px solid var(--foreground-color);
  color: var(--foreground-color);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: var(--foreground-color);
    color: var(--background-color);
  }
}

.title {
  font-family: var(--display-font);
  text-transform: uppercase;
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
}

.description {
  font-family: var(--text-font);
  font-size: 1.125rem;
  line-height: 1.8;
  margin: 0 0 1.5rem 0;
  opacity: 0.9;
}

.meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  font-family: var(--text-font);
  font-size: 0.9375rem;
}

.difficulty {
  text-transform: capitalize;
  font-weight: 600;
}

.time {
  opacity: 0.8;
}

.progressSection {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 2px solid var(--foreground-color);
  border-radius: 0.5rem;
}

.challengesSection {
  margin-top: 3rem;
}

.sectionTitle {
  font-family: var(--display-font);
  text-transform: uppercase;
  font-size: 1.5rem;
  margin: 0 0 2rem 0;
}

.challengesGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }

  .challengesGrid {
    grid-template-columns: 1fr;
  }

  .meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>

