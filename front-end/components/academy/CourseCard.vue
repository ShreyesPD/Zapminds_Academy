<script lang="ts" setup>
import type { Course } from "~/types/academy";

interface Props {
  course: Course;
}

const props = defineProps<Props>();
const router = useRouter();

const difficultyColors = {
  beginner: "#10b981",
  intermediate: "#f59e0b",
  advanced: "#ef4444",
};

const difficultyLabels = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const handleClick = () => {
  router.push(`/dashboard/courses/${props.course.id}`);
};
</script>

<template>
  <div :class="$style.card" @click="handleClick">
    <div :class="$style.header">
      <h3 :class="$style.title">{{ course.title }}</h3>
      <span
        v-if="course.difficulty"
        :class="$style.difficulty"
        :style="{ color: difficultyColors[course.difficulty] }"
      >
        {{ difficultyLabels[course.difficulty] }}
      </span>
    </div>

    <p v-if="course.description" :class="$style.description">
      {{ course.description }}
    </p>

    <div :class="$style.footer">
      <span v-if="course.estimated_time" :class="$style.time">
        ⏱ {{ course.estimated_time }} min
      </span>
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

.title {
  font-family: var(--display-font);
  text-transform: uppercase;
  font-size: 1.25rem;
  margin: 0;
  flex: 1;
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
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--foreground-color);
  opacity: 0.6;
}

.time {
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

