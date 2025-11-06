<script lang="ts" setup>
// SEO
const config = useRuntimeConfig();
const pageTitle = "Leaderboard - ZapMinds Academy";

useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  ogUrl: config.public.siteBaseUrl + config.app.baseURL + "dashboard/leaderboard",
  ogType: "website",
  twitterCard: "summary",
  twitterTitle: pageTitle,
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
});

const { fetchLeaderboard, leaderboard, loading } = useLeaderboard();
const { user } = useAuth();
const router = useRouter();

onMounted(async () => {
  if (!user.value) {
    router.push("/signin");
    return;
  }
  await fetchLeaderboard();
});
</script>

<template>
  <div :class="$style.root">
    <div :class="$style.container">
      <header :class="$style.header">
        <h1 :class="$style.title">Leaderboard</h1>
        <p :class="$style.subtitle">Top performers</p>
      </header>

      <nav :class="$style.nav">
        <NuxtLink to="/dashboard" :class="$style.navLink">
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

      <div v-if="loading" :class="$style.loading">
        <p>Loading leaderboard...</p>
      </div>

      <div v-else-if="leaderboard.length === 0" :class="$style.empty">
        <p>No entries yet. Be the first to complete a challenge!</p>
      </div>

      <div v-else>
        <LeaderboardTable
          :entries="leaderboard"
          :current-user-id="user?.id"
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

.loading,
.empty {
  text-align: center;
  padding: 3rem;
  font-family: var(--text-font);
  opacity: 0.7;
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
}
</style>

