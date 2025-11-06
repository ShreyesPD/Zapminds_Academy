<script lang="ts" setup>
import { useToast } from "~/composables/useToast";

const { toasts, removeToast } = useToast();

const getToastClass = (type: string) => {
  const classes: Record<string, string> = {
    success: "toastSuccess",
    error: "toastError",
    info: "toastInfo",
    warning: "toastWarning",
  };
  return classes[type] || "toastInfo";
};
</script>

<template>
  <div :class="$style.container">
    <TransitionGroup name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[$style.toast, $style[getToastClass(toast.type)]]"
        @click="removeToast(toast.id)"
      >
        <span :class="$style.message">{{ toast.message }}</span>
        <button :class="$style.closeButton" @click.stop="removeToast(toast.id)">
          ×
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style module lang="scss">
.container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

.toast {
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  font-family: var(--text-font);
  font-size: 0.9375rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-width: 300px;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;

  &:hover {
    transform: translateX(-4px);
  }
}

.toastSuccess {
  background: #10b981;
  color: white;
}

.toastError {
  background: #ef4444;
  color: white;
}

.toastInfo {
  background: #3b82f6;
  color: white;
}

.toastWarning {
  background: #f59e0b;
  color: white;
}

.message {
  flex: 1;
}

.closeButton {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .container {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
  }

  .toast {
    min-width: auto;
    max-width: none;
  }
}
</style>

