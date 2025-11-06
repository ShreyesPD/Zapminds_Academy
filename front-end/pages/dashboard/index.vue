<script lang="ts" setup>
// SEO
const config = useRuntimeConfig();
const pageTitle = "Dashboard - ZapMinds Academy";

useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  ogUrl: config.public.siteBaseUrl + config.app.baseURL + "dashboard",
  ogType: "website",
  twitterCard: "summary",
  twitterTitle: pageTitle,
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
});

const { fetchCourses, courses, loading, error } = useCourses();
const { user } = useAuth();
const router = useRouter();

// Wait for auth to initialize, then redirect or fetch courses
onMounted(async () => {
  // Wait for auth to initialize
  await nextTick();
  
  // Check authentication
  if (!user.value) {
    // Wait a bit more in case auth is still loading
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!user.value) {
      router.push("/signin");
      return;
    }
  }
  
  // Fetch courses
  if (courses.value.length === 0) {
    await fetchCourses();
  }
});

const searchQuery = ref("");
const selectedDifficulty = ref<string | null>(null);

const filteredCourses = computed(() => {
  let filtered = courses.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query)
    );
  }

  if (selectedDifficulty.value) {
    filtered = filtered.filter(
      (course) => course.difficulty === selectedDifficulty.value
    );
  }

  return filtered;
});
</script>

<template>
  <div :class="$style.root">
    <div :class="$style.container">
      <header :class="$style.header">
        <h1 :class="$style.title">ZapMinds Academy</h1>
        <p :class="$style.subtitle">Learn, Practice, Master</p>
      </header>

      <nav :class="$style.nav">
        <NuxtLink to="/dashboard" :class="$style.navLink" active-class="active">
          Courses
        </NuxtLink>
        <NuxtLink
          to="/dashboard/leaderboard"
          :class="$style.navLink"
          active-class="active"
        >
          Leaderboard
        </NuxtLink>
      </nav>

      <div :class="$style.filters">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search courses..."
          :class="$style.searchInput"
        />
        <select
          v-model="selectedDifficulty"
          :class="$style.filterSelect"
        >
          <option :value="null">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div v-if="loading" :class="$style.loading">
        <p>Loading courses...</p>
      </div>

      <div v-else-if="error" :class="$style.error">
        <h2>Error loading courses</h2>
        <p>{{ (error as Error)?.message || "An error occurred while loading courses." }}</p>
        <button :class="$style.retryButton" @click="fetchCourses">Retry</button>
      </div>

      <div v-else-if="filteredCourses.length === 0" :class="$style.empty">
        <h2>No courses found</h2>
        <p v-if="searchQuery || selectedDifficulty">
          Try adjusting your search or filter criteria.
        </p>
        <p v-else>
          No courses are available at the moment. Check back soon!
        </p>
      </div>

      <div v-else :class="$style.coursesGrid">
        <CourseCard
          v-for="course in filteredCourses"
          :key="course.id"
          :course="course"
        />
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

.header {
  margin-bottom: 2rem;
  text-align: center;
}

.title {
  font-family: var(--display-font);
  text-transform: uppercase;
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  font-family: var(--text-font);
  font-size: 1.125rem;
  margin: 0;
  opacity: 0.7;
}

.nav {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--foreground-color);
}

.navLink {
  font-family: var(--text-font);
  font-size: 1rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: var(--foreground-color);
  border: 2px solid transparent;
  border-radius: 0.5rem;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--foreground-color);
  }

  &.active {
    border-color: var(--foreground-color);
    background: var(--foreground-color);
    color: var(--background-color);
  }
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.searchInput,
.filterSelect {
  padding: 0.75rem 1rem;
  font-family: var(--text-font);
  font-size: 1rem;
  border: 2px solid var(--foreground-color);
  background: var(--background-color);
  color: var(--foreground-color);
  border-radius: 0.5rem;
  flex: 1;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: var(--foreground-color);
  }
}

.filterSelect {
  flex: 0 0 auto;
  min-width: 180px;
}

.loading,
.empty,
.error {
  text-align: center;
  padding: 3rem;
  font-family: var(--text-font);
  opacity: 0.9;
}

.error {
  h2 {
    font-family: var(--display-font);
    text-transform: uppercase;
    font-size: 1.5rem;
    margin: 0 0 1rem 0;
    color: #ef4444;
  }

  p {
    margin: 0.5rem 0 1.5rem 0;
  }
}

.retryButton {
  padding: 0.75rem 1.5rem;
  font-family: var(--text-font);
  font-size: 1rem;
  background: var(--foreground-color);
  color: var(--background-color);
  border: 2px solid var(--foreground-color);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
}

.empty {
  h2 {
    font-family: var(--display-font);
    text-transform: uppercase;
    font-size: 1.5rem;
    margin: 0 0 1rem 0;
  }

  p {
    font-size: 1rem;
    margin: 0.5rem 0;
    opacity: 0.8;
  }
}

.coursesGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .coursesGrid {
    grid-template-columns: 1fr;
  }

  .title {
    font-size: 2rem;
  }

  .filters {
    flex-direction: column;
  }

  .searchInput,
  .filterSelect {
    width: 100%;
  }
}
</style>

