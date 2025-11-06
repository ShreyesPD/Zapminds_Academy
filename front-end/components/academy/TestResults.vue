<script lang="ts" setup>
import type { TestResult } from "~/types/academy";

interface Props {
  testResults: TestResult[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const passedCount = computed(() =>
  props.testResults.filter((r) => r.passed).length
);
const totalCount = computed(() => props.testResults.length);
const allPassed = computed(() => passedCount.value === totalCount.value);
</script>

<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <h3 :class="$style.title">Test Results</h3>
      <div
        :class="[
          $style.status,
          allPassed ? $style.statusPassed : $style.statusFailed,
        ]"
      >
        {{ passedCount }} / {{ totalCount }} passed
      </div>
    </div>

    <div v-if="loading" :class="$style.loading">
      <p>Running tests...</p>
    </div>

    <div v-else-if="testResults.length === 0" :class="$style.empty">
      <p>No test results yet. Run your code to see results.</p>
    </div>

    <div v-else :class="$style.results">
      <div
        v-for="(result, index) in testResults"
        :key="index"
        :class="[
          $style.testCase,
          result.passed ? $style.testCasePassed : $style.testCaseFailed,
        ]"
      >
        <div :class="$style.testCaseHeader">
          <span :class="$style.testCaseIcon">
            {{ result.passed ? "✓" : "✗" }}
          </span>
          <span :class="$style.testCaseTitle">
            Test Case {{ result.test_case_index + 1 }}
          </span>
        </div>

        <div :class="$style.testCaseContent">
          <div v-if="result.input" :class="$style.testCaseSection">
            <strong>Input:</strong>
            <pre>{{ Array.isArray(result.input) ? result.input.join('\n') : result.input }}</pre>
          </div>

          <div :class="$style.testCaseSection">
            <strong>Expected:</strong>
            <pre>{{ result.expected_output }}</pre>
          </div>

          <div v-if="result.actual_output !== null" :class="$style.testCaseSection">
            <strong>Actual:</strong>
            <pre :class="result.passed ? $style.outputPassed : $style.outputFailed">
              {{ result.actual_output }}
            </pre>
          </div>

          <div
            v-if="result.error_message"
            :class="[$style.testCaseSection, $style.errorSection]"
          >
            <strong>Error:</strong>
            <pre :class="$style.errorMessage">{{ result.error_message }}</pre>
          </div>

          <div v-if="result.execution_time" :class="$style.testCaseMeta">
            <span>Time: {{ result.execution_time.toFixed(2) }}ms</span>
            <span v-if="result.memory_used">
              Memory: {{ (result.memory_used / 1024).toFixed(2) }} KB
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
.container {
  border: 2px solid var(--foreground-color);
  border-radius: 0.5rem;
  background: var(--background-color);
  overflow: hidden;
}

.header {
  padding: 1rem;
  background: var(--foreground-color);
  color: var(--background-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-family: var(--display-font);
  text-transform: uppercase;
  font-size: 1rem;
  margin: 0;
}

.status {
  font-family: var(--text-font);
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
}

.statusPassed {
  background: #10b981;
  color: white;
}

.statusFailed {
  background: #ef4444;
  color: white;
}

.loading,
.empty {
  padding: 2rem;
  text-align: center;
  font-family: var(--text-font);
  opacity: 0.7;
}

.results {
  max-height: 600px;
  overflow-y: auto;
}

.testCase {
  padding: 1rem;
  border-bottom: 1px solid var(--foreground-color);
  opacity: 0.8;

  &:last-child {
    border-bottom: none;
  }
}

.testCasePassed {
  background: rgba(16, 185, 129, 0.1);
}

.testCaseFailed {
  background: rgba(239, 68, 68, 0.1);
}

.testCaseHeader {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-family: var(--text-font);
  font-weight: 600;
}

.testCaseIcon {
  font-size: 1.25rem;
  font-weight: bold;
}

.testCaseTitle {
  font-size: 0.9375rem;
}

.testCaseContent {
  font-family: var(--text-font);
  font-size: 0.875rem;
}

.testCaseSection {
  margin-bottom: 0.75rem;

  strong {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.8125rem;
    text-transform: uppercase;
    opacity: 0.8;
  }

  pre {
    margin: 0;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 0.25rem;
    font-family: "Courier New", monospace;
    font-size: 0.8125rem;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.errorSection {
  margin-top: 0.5rem;
}

.errorMessage {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1) !important;
}

.outputPassed {
  color: #10b981;
}

.outputFailed {
  color: #ef4444;
}

.testCaseMeta {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  opacity: 0.6;
}
</style>

