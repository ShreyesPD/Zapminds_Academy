<script lang="ts" setup>
interface Props {
  current: number;
  total: number;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: "Progress",
});

const percentage = computed(() => {
  if (props.total === 0) return 0;
  return Math.round((props.current / props.total) * 100);
});
</script>

<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <span :class="$style.label">{{ label }}</span>
      <span :class="$style.percentage">{{ percentage }}%</span>
    </div>
    <div :class="$style.bar">
      <div
        :class="$style.fill"
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>
    <div :class="$style.footer">
      <span>{{ current }} / {{ total }} completed</span>
    </div>
  </div>
</template>

<style module lang="scss">
.container {
  font-family: var(--text-font);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.label {
  font-weight: 600;
}

.percentage {
  font-weight: 600;
  opacity: 0.8;
}

.bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--foreground-color);
}

.fill {
  height: 100%;
  background: var(--foreground-color);
  transition: width 0.3s ease;
}

.footer {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  opacity: 0.7;
}
</style>

