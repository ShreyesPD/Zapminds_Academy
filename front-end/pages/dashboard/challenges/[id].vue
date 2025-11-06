<script lang="ts" setup>
import type { SupportedLanguage } from "~/utils/code-templates";
import { getCodeTemplate } from "~/utils/code-templates";

const route = useRoute();
const router = useRouter();
const { user } = useAuth();

// Redirect if not authenticated
onMounted(() => {
  if (!user.value) {
    router.push("/signin");
  }
});

const challengeId = route.params.id as string;
const {
  fetchChallengeWithProgress,
  getTestCases,
  loading: challengeLoading,
} = useChallenges();
const { executeCode, loading: executionLoading } = useCodeExecution();
const { saveSubmission, updateChallengeProgress } = useSubmissions();
const { refreshProgress } = useUserProgress();
const { success, error: showError } = useToast();

const challenge = ref<any>(null);
const code = ref("");
const selectedLanguage = ref<SupportedLanguage>("javascript");
const testResults = ref<any[]>([]);
const executionResult = ref<any>(null);
const showResults = ref(false);
const isSubmitting = ref(false);

// Load challenge
onMounted(async () => {
  const data = await fetchChallengeWithProgress(challengeId);
  if (!data) {
    router.push("/dashboard");
    return;
  }
  challenge.value = data;

  // Load starter code
  if (data.starter_code && data.starter_code[selectedLanguage.value]) {
    code.value = data.starter_code[selectedLanguage.value];
  } else {
    code.value = getCodeTemplate(selectedLanguage.value);
  }

  // Load saved code from localStorage
  const savedCode = localStorage.getItem(
    `challenge_${challengeId}_${selectedLanguage.value}`
  );
  if (savedCode) {
    code.value = savedCode;
  }
});

// Save code to localStorage on change
watch(code, (newCode) => {
  if (challenge.value) {
    localStorage.setItem(
      `challenge_${challenge.value.id}_${selectedLanguage.value}`,
      newCode
    );
  }
});

// Load code when language changes
watch(selectedLanguage, async (newLang) => {
  if (challenge.value) {
    if (
      challenge.value.starter_code &&
      challenge.value.starter_code[newLang]
    ) {
      code.value = challenge.value.starter_code[newLang];
    } else {
      code.value = getCodeTemplate(newLang);
    }

    // Try to load saved code
    const savedCode = localStorage.getItem(
      `challenge_${challenge.value.id}_${newLang}`
    );
    if (savedCode) {
      code.value = savedCode;
    }
  }
});

const handleRunCode = async () => {
  if (!challenge.value) return;

  showResults.value = true;
  testResults.value = [];
  executionResult.value = null;

  const allTestCases = challenge.value.test_cases || [];
  const result = await executeCode(
    code.value,
    selectedLanguage.value,
    allTestCases
  );

  executionResult.value = result;
  testResults.value = result.test_results || [];
};

const handleSubmit = async () => {
  if (!challenge.value || !executionResult.value) {
    await handleRunCode();
    if (!executionResult.value) return;
  }

  isSubmitting.value = true;

  try {
    // Save submission
    const submission = await saveSubmission(
      challenge.value.id,
      code.value,
      selectedLanguage.value,
      executionResult.value.status,
      executionResult.value.test_results,
      executionResult.value.execution_time,
      executionResult.value.memory_used
    );

    if (submission) {
      // Update challenge progress
      const isCompleted = executionResult.value.status === "accepted";
      await updateChallengeProgress(
        challenge.value.id,
        submission.id,
        isCompleted
      );

      // Refresh user progress
      await refreshProgress();

      // Show success message
      if (isCompleted) {
        success("🎉 Congratulations! Challenge completed!");
      } else {
        success("Submission saved. Keep trying!");
      }

      if (isCompleted) {
        // Navigate back to course
        if (challenge.value.course_id) {
          router.push(`/dashboard/courses/${challenge.value.course_id}`);
        }
      }
    }
  } catch (err) {
    console.error("Error submitting:", err);
    showError("Error submitting solution. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};

// Keyboard shortcut: Ctrl+Enter to run
onMounted(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRunCode();
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });
});
</script>

<template>
  <div :class="$style.root">
    <div :class="$style.container">
      <div v-if="challengeLoading" :class="$style.loading">
        <p>Loading challenge...</p>
      </div>

      <div v-else-if="!challenge" :class="$style.error">
        <p>Challenge not found.</p>
      </div>

      <div v-else :class="$style.content">
        <div :class="$style.leftPanel">
          <div :class="$style.header">
            <button
              :class="$style.backButton"
              @click="router.back()"
            >
              ← Back
            </button>
            <h1 :class="$style.title">{{ challenge.title }}</h1>
            <div :class="$style.meta">
              <span
                v-if="challenge.difficulty"
                :class="$style.difficulty"
              >
                {{ challenge.difficulty }}
              </span>
              <span :class="$style.points">⭐ {{ challenge.points }} points</span>
            </div>
          </div>

          <div :class="$style.description">
            <div v-html="challenge.description.replace(/\n/g, '<br>')"></div>
          </div>

          <div v-if="challenge.test_cases" :class="$style.testCases">
            <h3 :class="$style.sectionTitle">Test Cases</h3>
            <div
              v-for="(testCase, index) in getTestCases(challenge, false)"
              :key="index"
              :class="$style.testCase"
            >
              <div :class="$style.testCaseItem">
                <strong>Input:</strong>
                <pre>{{ Array.isArray(testCase.input) ? testCase.input.join('\n') : testCase.input }}</pre>
              </div>
              <div :class="$style.testCaseItem">
                <strong>Expected Output:</strong>
                <pre>{{ testCase.expected_output }}</pre>
              </div>
            </div>
          </div>
        </div>

        <div :class="$style.rightPanel">
          <div :class="$style.editorSection">
            <div :class="$style.editorHeader">
              <select
                v-model="selectedLanguage"
                :class="$style.languageSelect"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
              </select>
              <div :class="$style.actions">
                <button
                  :class="$style.runButton"
                  :disabled="executionLoading"
                  @click="handleRunCode"
                >
                  {{ executionLoading ? "Running..." : "Run Code" }}
                </button>
                <button
                  :class="$style.submitButton"
                  :disabled="isSubmitting || executionLoading"
                  @click="handleSubmit"
                >
                  {{ isSubmitting ? "Submitting..." : "Submit" }}
                </button>
              </div>
            </div>
            <CodeEditor
              v-model="code"
              :language="selectedLanguage"
              height="500px"
            />
            <div :class="$style.hint">
              <small>💡 Tip: Press Ctrl+Enter (Cmd+Enter on Mac) to run your code</small>
            </div>
          </div>

          <div v-if="showResults" :class="$style.resultsSection">
            <TestResults
              :test-results="testResults"
              :loading="executionLoading"
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
  max-width: 1400px;
  margin: 0 auto;
}

.loading,
.error {
  text-align: center;
  padding: 3rem;
  font-family: var(--text-font);
}

.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.leftPanel {
  position: sticky;
  top: 2rem;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
}

.header {
  margin-bottom: 2rem;
}

.backButton {
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
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
  font-size: 2rem;
  margin: 0 0 1rem 0;
}

.meta {
  display: flex;
  gap: 1rem;
  font-family: var(--text-font);
  font-size: 0.875rem;
}

.difficulty {
  text-transform: capitalize;
  font-weight: 600;
}

.points {
  opacity: 0.8;
}

.description {
  font-family: var(--text-font);
  font-size: 1rem;
  line-height: 1.8;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.testCases {
  margin-top: 2rem;
}

.sectionTitle {
  font-family: var(--display-font);
  text-transform: uppercase;
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
}

.testCase {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid var(--foreground-color);
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.05);
}

.testCaseItem {
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }

  strong {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    opacity: 0.8;
  }

  pre {
    margin: 0;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 0.25rem;
    font-family: "Courier New", monospace;
    font-size: 0.875rem;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.rightPanel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.editorSection {
  border: 2px solid var(--foreground-color);
  border-radius: 0.5rem;
  overflow: hidden;
}

.editorHeader {
  padding: 1rem;
  background: var(--foreground-color);
  color: var(--background-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.languageSelect {
  padding: 0.5rem 1rem;
  font-family: var(--text-font);
  font-size: 0.875rem;
  background: var(--background-color);
  color: var(--foreground-color);
  border: 2px solid var(--background-color);
  border-radius: 0.25rem;
  cursor: pointer;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.runButton,
.submitButton {
  padding: 0.5rem 1rem;
  font-family: var(--text-font);
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid var(--background-color);
  border-radius: 0.25rem;
  cursor: pointer;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.runButton {
  background: transparent;
  color: var(--background-color);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }
}

.submitButton {
  background: var(--background-color);
  color: var(--foreground-color);

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
}

.hint {
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.05);
  font-family: var(--text-font);
  font-size: 0.8125rem;
  opacity: 0.7;
  text-align: center;
}

.resultsSection {
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .content {
    grid-template-columns: 1fr;
  }

  .leftPanel {
    position: static;
    max-height: none;
  }
}
</style>

