<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useStudentAuth } from "~/composables/use-auth";

definePageMeta({
  layout: "default",
  middleware: ["student-auth"],
});

interface StreakStatus {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  claimedToday: boolean;
  canClaimToday: boolean;
  nextStreakDay: number;
  xpReward: number;
  timeUntilNextClaim: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

interface ClaimResult {
  success: boolean;
  streak: {
    current: number;
    longest: number;
    wasReset: boolean;
  };
  xpAwarded: number;
  xpResult: {
    newXpTotal: number;
    tierChanged: boolean;
    newTier: { name: string; icon: string } | null;
  };
  badges: {
    tierBadge: { name: string; icon: string } | null;
    streakBadge: { name: string; icon: string } | null;
  };
}

const router = useRouter();
const { profile } = useStudentAuth();

const streakStatus = ref<StreakStatus | null>(null);
const isLoading = ref(true);
const isClaiming = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Countdown timer state
const countdown = ref({ hours: 0, minutes: 0, seconds: 0 });
let countdownInterval: NodeJS.Timeout | null = null;

// Modal states
const showTierUpModal = ref(false);
const newTierInfo = ref<{ name: string; icon: string } | null>(null);
const showBadgeModal = ref(false);
const earnedBadgeInfo = ref<{ name: string; icon: string } | null>(null);
const showXpAnimation = ref(false);
const xpAwardAmount = ref(0);

const studentName = computed(() => profile.value?.name ?? "Zapmind Student");

const fetchStreakStatus = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await $fetch<StreakStatus>("/api/daily-streak/status", {
      method: "GET",
    });
    streakStatus.value = response;
    countdown.value = response.timeUntilNextClaim;
  } catch (e: any) {
    error.value = e.data?.message || e.message || "Failed to load streak status.";
    console.error("Error fetching streak status:", e);
  } finally {
    isLoading.value = false;
  }
};

const claimStreak = async () => {
  if (isClaiming.value || !streakStatus.value?.canClaimToday) {
    return;
  }

  isClaiming.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    const response = await $fetch<ClaimResult>("/api/daily-streak/claim", {
      method: "POST",
    });

    if (response.success) {
      // Show XP animation
      xpAwardAmount.value = response.xpAwarded;
      showXpAnimation.value = true;
      setTimeout(() => (showXpAnimation.value = false), 2000);

      // Update streak status
      if (streakStatus.value) {
        streakStatus.value.currentStreak = response.streak.current;
        streakStatus.value.longestStreak = response.streak.longest;
        streakStatus.value.claimedToday = true;
        streakStatus.value.canClaimToday = false;
      }

      // Show success message
      if (response.streak.wasReset) {
        successMessage.value = `Your streak was reset, but you're back on track! You earned ${response.xpAwarded} XP. Come back tomorrow to continue!`;
      } else {
        successMessage.value = `Streak claimed! You earned ${response.xpAwarded} XP. Day ${response.streak.current} complete!`;
      }

      // Check for tier change
      if (response.xpResult.tierChanged && response.xpResult.newTier) {
        newTierInfo.value = response.xpResult.newTier;
        showTierUpModal.value = true;
      }

      // Check for badges
      if (response.badges.streakBadge) {
        earnedBadgeInfo.value = response.badges.streakBadge;
        showBadgeModal.value = true;
      } else if (response.badges.tierBadge) {
        earnedBadgeInfo.value = response.badges.tierBadge;
        showBadgeModal.value = true;
      }
    }
  } catch (e: any) {
    error.value = e.data?.message || e.message || "Failed to claim streak.";
    console.error("Error claiming streak:", e);
  } finally {
    isClaiming.value = false;
  }
};

const startCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  countdownInterval = setInterval(() => {
    if (countdown.value.seconds > 0) {
      countdown.value.seconds--;
    } else if (countdown.value.minutes > 0) {
      countdown.value.minutes--;
      countdown.value.seconds = 59;
    } else if (countdown.value.hours > 0) {
      countdown.value.hours--;
      countdown.value.minutes = 59;
      countdown.value.seconds = 59;
    } else {
      // Countdown finished, refresh status
      fetchStreakStatus();
    }
  }, 1000);
};

onMounted(() => {
  fetchStreakStatus();
  startCountdown();
});

onBeforeUnmount(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});

const pageTitle = "Daily Streak – Zapminds Academy";
useSeoMeta({
  title: pageTitle,
  description: "Claim your daily streak and earn XP rewards at Zapminds Academy.",
});
</script>

<template>
  <div :class="$style.root">
    <section :class="$style.hero">
      <div class="container grid">
        <header :class="$style.header">
          <NuxtLink to="/dashboard" :class="$style.backLink">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Back to Dashboard
          </NuxtLink>
          <h1>Daily Streak Quest</h1>
          <p>Keep your learning momentum alive and earn bonus XP every day!</p>
        </header>

        <div v-if="isLoading" :class="$style.loading">
          <p>Loading your streak...</p>
        </div>

        <div v-else-if="error && !streakStatus" :class="$style.error">
          <p>{{ error }}</p>
          <button type="button" @click="fetchStreakStatus">Try Again</button>
        </div>

        <div v-else-if="streakStatus" :class="$style.content">
          <!-- Streak Stats -->
          <div :class="$style.stats">
            <div :class="$style.statCard">
              <span :class="$style.statLabel">Current Streak</span>
              <strong :class="$style.statValue">
                {{ streakStatus.currentStreak }}
                <small>days</small>
              </strong>
            </div>
            <div :class="$style.statCard">
              <span :class="$style.statLabel">Longest Streak</span>
              <strong :class="$style.statValue">
                {{ streakStatus.longestStreak }}
                <small>days</small>
              </strong>
            </div>
            <div :class="$style.statCard">
              <span :class="$style.statLabel">Next Reward</span>
              <strong :class="$style.statValue">
                {{ streakStatus.xpReward }}
                <small>XP</small>
              </strong>
            </div>
          </div>

          <!-- Claim Section -->
          <div :class="$style.claimSection">
            <div v-if="streakStatus.claimedToday" :class="$style.claimedMessage">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="24" cy="24" r="24" fill="var(--color-success)" opacity="0.2" />
                <path
                  d="M16 24L22 30L32 18"
                  stroke="var(--color-success)"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <h2>Streak Claimed!</h2>
              <p>You've already claimed your streak for today. Come back tomorrow!</p>
              <div :class="$style.countdown">
                <span>Next claim in:</span>
                <strong>
                  {{ countdown.hours.toString().padStart(2, "0") }}:{{
                    countdown.minutes.toString().padStart(2, "0")
                  }}:{{ countdown.seconds.toString().padStart(2, "0") }}
                </strong>
              </div>
            </div>

            <div v-else :class="$style.claimPrompt">
              <div :class="$style.claimIcon">🔥</div>
              <h2>Day {{ streakStatus.nextStreakDay }} Awaits!</h2>
              <p>
                Claim your daily streak now and earn
                <strong>{{ streakStatus.xpReward }} XP</strong>!
              </p>

              <button
                type="button"
                :class="$style.claimButton"
                :disabled="isClaiming || !streakStatus.canClaimToday"
                @click="claimStreak"
              >
                {{ isClaiming ? "Claiming..." : "Claim Streak" }}
              </button>

              <p v-if="successMessage" :class="$style.successMessage">
                {{ successMessage }}
              </p>
              <p v-if="error" :class="$style.errorMessage">
                {{ error }}
              </p>
            </div>
          </div>

          <!-- Streak Milestones -->
          <div :class="$style.milestones">
            <h3>Streak Milestones</h3>
            <p>Earn special badges for reaching these milestones:</p>
            <ul>
              <li :class="streakStatus.currentStreak >= 3 ? $style.achieved : ''">
                <span :class="$style.milestoneIcon">🥉</span>
                <div>
                  <strong>3 Day Streak</strong>
                  <span>Consistent Learner Badge</span>
                </div>
              </li>
              <li :class="streakStatus.currentStreak >= 7 ? $style.achieved : ''">
                <span :class="$style.milestoneIcon">🥈</span>
                <div>
                  <strong>7 Day Streak</strong>
                  <span>Week Warrior Badge</span>
                </div>
              </li>
              <li :class="streakStatus.currentStreak >= 30 ? $style.achieved : ''">
                <span :class="$style.milestoneIcon">🥇</span>
                <div>
                  <strong>30 Day Streak</strong>
                  <span>Monthly Master Badge</span>
                </div>
              </li>
              <li :class="streakStatus.currentStreak >= 100 ? $style.achieved : ''">
                <span :class="$style.milestoneIcon">👑</span>
                <div>
                  <strong>100 Day Streak</strong>
                  <span>Century Champion Badge</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Modals and Animations -->
    <VXpAwardAnimation v-if="showXpAnimation" :xp-amount="xpAwardAmount" />
    <VTierUpModal
      v-if="showTierUpModal"
      :new-tier="newTierInfo"
      @close="showTierUpModal = false"
    />
    <VBadgeEarnedModal
      v-if="showBadgeModal"
      :badge="earnedBadgeInfo"
      @close="showBadgeModal = false"
    />
  </div>
</template>

<style module lang="scss">
.root {
  min-height: 100vh;
  padding: 2rem 0;
}

.hero {
  padding: 2rem 0;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;

  h1 {
    font-size: 2.5rem;
    margin: 0;
  }

  p {
    font-size: 1.1rem;
    opacity: 0.8;
    margin: 0;
  }
}

.backLink {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--foreground-color);
  text-decoration: none;
  font-size: 0.9rem;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

.loading,
.error {
  text-align: center;
  padding: 3rem 1rem;

  p {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  button {
    background: var(--color-accent);
    color: var(--color-accent-contrast);
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.6rem;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: color-mix(in srgb, var(--color-accent) 80%, black);
    }
  }
}

.content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.statCard {
  background: color-mix(in srgb, var(--background-color) 90%, transparent);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: var(--shadow-elevation-low);
}

.statLabel {
  font-size: 0.9rem;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.statValue {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-accent);
  display: flex;
  align-items: baseline;
  gap: 0.5rem;

  small {
    font-size: 1rem;
    opacity: 0.6;
    font-weight: normal;
  }
}

.claimSection {
  background: color-mix(in srgb, var(--background-color) 95%, transparent);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  box-shadow: var(--shadow-elevation-medium);
}

.claimedMessage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  h2 {
    font-size: 1.8rem;
    margin: 0;
    color: var(--color-success);
  }

  p {
    font-size: 1.1rem;
    opacity: 0.8;
    margin: 0;
  }
}

.countdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;

  span {
    font-size: 0.9rem;
    opacity: 0.7;
  }

  strong {
    font-size: 2rem;
    font-family: monospace;
    color: var(--color-accent);
  }
}

.claimPrompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  h2 {
    font-size: 1.8rem;
    margin: 0;
  }

  p {
    font-size: 1.1rem;
    opacity: 0.8;
    margin: 0;

    strong {
      color: var(--color-accent);
    }
  }
}

.claimIcon {
  font-size: 4rem;
  line-height: 1;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.claimButton {
  background: var(--color-accent);
  color: var(--color-accent-contrast);
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.8rem;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;

  &:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--color-accent) 80%, black);
    transform: translateY(-2px);
    box-shadow: var(--shadow-elevation-high);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.successMessage {
  color: var(--color-success);
  font-weight: bold;
  margin-top: 1rem;
}

.errorMessage {
  color: var(--color-danger);
  font-weight: bold;
  margin-top: 1rem;
}

.milestones {
  background: color-mix(in srgb, var(--background-color) 90%, transparent);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: var(--shadow-elevation-low);

  h3 {
    font-size: 1.5rem;
    margin: 0 0 0.5rem 0;
  }

  > p {
    font-size: 0.95rem;
    opacity: 0.7;
    margin: 0 0 1.5rem 0;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 1rem;
  }

  li {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: color-mix(in srgb, var(--background-color) 80%, transparent);
    border-radius: 0.8rem;
    opacity: 0.5;
    transition: opacity 0.2s ease;

    &.achieved {
      opacity: 1;
      background: color-mix(in srgb, var(--color-success) 10%, transparent);
      border: 2px solid var(--color-success);
    }

    div {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      strong {
        font-size: 1.1rem;
      }

      span {
        font-size: 0.9rem;
        opacity: 0.7;
      }
    }
  }
}

.milestoneIcon {
  font-size: 2rem;
  line-height: 1;
  flex-shrink: 0;
}
</style>

