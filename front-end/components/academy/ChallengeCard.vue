<script lang="ts" setup>
import type { Challenge, ChallengeProgressStatus } from "~/types/academy";

interface Props {
  challenge: Challenge;
  progress?: {
    status: ChallengeProgressStatus;
    completed_at: string | null;
  };
}

const props = defineProps<Props>();
const router = useRouter();

const difficultyColors = {
  easy: "#10b981",
  medium: "#f59e0b",
  hard: "#ef4444",
};

const difficultyLabels = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const statusIcons = {
  not_started: "",
  in_progress: "⏳",
  completed: "✓",
};

const handleClick = () => {
  router.push(`/dashboard/challenges/${props.challenge.id}`);
};
</script>

<template>
  <div :class="$style.card" @click="handleClick">
    <div :class="$style.header">
      <div :class="$style.titleRow">
        <h3 :class="$style.title">{{ challenge.title }}</h3>
        <span
          v-if="progress && statusIcons[progress.status]"
          :class="$style.statusIcon"
        >
          {{ statusIcons[progress.status] }}
        </span>
      </div>
      <span
        v-if="challenge.difficulty"
        :class="$style.difficulty"
        :style="{ color: difficultyColors[challenge.difficulty] }"
      >
        {{ difficultyLabels[challenge.difficulty] }}
      </span>
    </div>

    <p :class="$style.description">
      {{ challenge.description.substring(0, 150)
      }}{{ challenge.description.length > 150 ? "..." : "" }}
    </p>

    <div :class="$style.footer">
      <span :class="$style.points">⭐ {{ challenge.points }} points</span>
      <span :class="$style.arrow">→</span>
    </div>
  </div>
</template>

<style module lang="scss">
.card {
  padding: 1.5rem;
  border: 2px solid var(--foreground-color);
  border-radius: 0.5rem;
  background: var(--background-color);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.titleRow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.title {
  font-family: var(--display-font);
  text-transform: uppercase;
  font-size: 1.125rem;
  margin: 0;
  flex: 1;
}

.statusIcon {
  font-size: 1.25rem;
}

.difficulty {
  font-family: var(--text-font);
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
}

.description {
  font-family: var(--text-font);
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  opacity: 0.8;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--foreground-color);
  opacity: 0.6;
}

.points {
  font-family: var(--text-font);
  font-size: 0.875rem;
}

.arrow {
  font-size: 1.25rem;
  transition: transform 0.2s;
}

.card:hover .arrow {
  transform: translateX(4px);
}
</style>

