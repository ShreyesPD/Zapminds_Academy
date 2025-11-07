<script setup lang="ts">
import { onBeforeUnmount, onMounted, nextTick, ref, shallowRef, watch } from "vue";
import loader from "@monaco-editor/loader";
import type { editor as MonacoEditorNS, IDisposable } from "monaco-editor";

type PlaygroundTest = {
  id: string;
  description: string;
  assertion: string;
  expected?: string;
};

type PlaygroundExercise = {
  starterCode: string;
  hints: string[];
  tests: PlaygroundTest[];
  language?: string;
};

type PlaygroundResult = {
  id: string;
  status: "passed" | "failed";
  output: string;
};

type PlaygroundResponse = {
  results: PlaygroundResult[];
};

const props = defineProps<{
  exercise: PlaygroundExercise;
}>();

const editorContainer = ref<HTMLDivElement | null>(null);
const monacoEditor = shallowRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null);
const monacoDisposables: IDisposable[] = [];

const isEditorReady = ref(false);
const isRunning = ref(false);
const runtimeMessage = ref<string | null>(null);
const results = ref<
  Array<{
    test: PlaygroundTest;
    status: "passed" | "failed";
    output: string;
  }>
>([]);

const ensureEditor = async () => {
  if (isEditorReady.value || !editorContainer.value) {
    return;
  }

  const monaco = await loader.init();

  const editor = monaco.editor.create(editorContainer.value, {
    value: props.exercise.starterCode,
    language: "python",
    theme: "vs-dark",
    automaticLayout: true,
    minimap: {
      enabled: false,
    },
    fontSize: 14,
    fontFamily: '"Fira Code", "Source Code Pro", monospace',
    lineHeight: 22,
    scrollBeyondLastLine: false,
  });

  monacoEditor.value = editor;
  isEditorReady.value = true;
};

onMounted(async () => {
  await ensureEditor();
});

watch(
  () => props.exercise,
  (exercise) => {
    nextTick(() => {
      if (monacoEditor.value) {
        monacoEditor.value.setValue(exercise.starterCode);
        results.value = [];
        runtimeMessage.value = null;
      }
    });
  }
);

onBeforeUnmount(() => {
  if (monacoEditor.value) {
    monacoEditor.value.dispose();
  }

  monacoDisposables.forEach((disposable) => disposable.dispose());
});

const runTests = async () => {
  if (!monacoEditor.value) return;

  isRunning.value = true;
  runtimeMessage.value = "Sending code to runner…";

  try {
    const userCode = monacoEditor.value.getValue();
    const response = await $fetch<PlaygroundResponse>("/api/playground", {
      method: "POST",
      body: {
        language: props.exercise.language ?? "python",
        code: userCode,
        tests: props.exercise.tests,
      },
    });

    const mapped = props.exercise.tests.map((test) => {
      const match = response.results.find((result) => result.id === test.id);
      return {
        test,
        status: match?.status ?? "failed",
        output: match?.output ?? "",
      };
    });

    results.value = mapped;
    runtimeMessage.value = null;
  } catch (error: any) {
    const message =
      error?.data?.message ??
      error?.message ??
      "Something went wrong while running the exercise. Please try again.";
    runtimeMessage.value = message;
  } finally {
    isRunning.value = false;
  }
};

const onResetCode = () => {
  if (!monacoEditor.value) return;
  monacoEditor.value.setValue(props.exercise.starterCode);
  results.value = [];
  runtimeMessage.value = null;
};
</script>

<template>
  <div :class="$style.root">
    <div :class="$style.header">
      <div :class="$style.actions">
        <button type="button" :disabled="isRunning" @click="runTests">
          {{ isRunning ? "Running…" : "Run tests" }}
        </button>
        <button type="button" :disabled="isRunning" @click="onResetCode">
          Reset code
        </button>
      </div>

      <ul :class="$style.hints">
        <li v-for="hint in exercise.hints" :key="hint">{{ hint }}</li>
      </ul>
    </div>

    <div :class="$style.editor">
      <div ref="editorContainer" :class="$style['editor-canvas']">
        <div v-if="!isEditorReady" :class="$style['editor-placeholder']">
          Initialising editor…
        </div>
      </div>

      <aside :class="$style.results">
        <h4>Test run</h4>

        <p v-if="runtimeMessage" :class="$style.status">{{ runtimeMessage }}</p>

        <ul v-else>
          <li
            v-for="result in results"
            :key="result.test.id"
            :class="[$style['results-item'], $style[`results-item--${result.status}`]]"
          >
            <div>
              <strong>{{ result.test.description }}</strong>
              <span v-if="result.test.expected">
                Expected: {{ result.test.expected }}
              </span>
            </div>
            <code>{{ result.output || "Not yet executed" }}</code>
          </li>
        </ul>

        <p v-if="!results.length && !runtimeMessage" :class="$style.placeholder">
          Write your solution and run the tests to see results here.
        </p>
      </aside>
    </div>
  </div>
</template>

<style module lang="scss">
.root {
  display: grid;
  gap: 1.5rem;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;

  button {
    background: var(--foreground-color);
    color: var(--background-color);
    border: 0;
    border-radius: 0.75rem;
    padding: 0.7rem 1.2rem;
    font-family: var(--display-font);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: transform 0.3s ease(out-cubic), box-shadow 0.3s ease(out-cubic),
      opacity 0.2s ease(out-cubic);

    &:hover,
    &:focus-visible {
      transform: translate3d(0, -0.1rem, 0);
      box-shadow: 0 12px 30px color-mix(in srgb, var(--foreground-color) 25%, transparent);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    &:last-of-type {
      background: transparent;
      color: var(--foreground-color);
      border: 1px solid color-mix(in srgb, var(--foreground-color) 20%, transparent);
    }
  }
}

.hints {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;

  li {
    border-radius: 0.75rem;
    border: 1px solid color-mix(in srgb, var(--foreground-color) 15%, transparent);
    padding: 0.5rem 0.9rem;
    font-size: 0.85rem;
    opacity: 0.8;
  }
}

.editor {
  display: grid;
  grid-template-columns: minmax(0, 1.75fr) minmax(16rem, 1fr);
  gap: 1.5rem;

  @media screen and (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
}

.editor-canvas {
  height: clamp(30rem, 70vh, 36rem);
  border-radius: 1.25rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 12%, transparent);
  background: #1e1e1e;
}

.editor-placeholder {
  display: grid;
  place-items: center;
  height: 100%;
  font-size: 0.9rem;
  opacity: 0.7;
}

.results {
  display: grid;
  gap: 1rem;
  border-radius: 1.25rem;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 12%, transparent);
  padding: 1.5rem;
  background: color-mix(in srgb, var(--background-color) 96%, transparent);
  box-shadow: 0 15px 40px color-mix(in srgb, #000 16%, transparent);

  h4 {
    margin: 0;
    font-family: var(--display-font);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.9rem;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 1rem;
  }
}

.status {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  opacity: 0.75;
}

.placeholder {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.7;
}

.results-item {
  display: grid;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.9rem;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 12%, transparent);

  strong {
    display: block;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  span {
    font-size: 0.75rem;
    opacity: 0.6;
  }

  code {
    font-family: "Fira Code", "Source Code Pro", monospace;
    background: color-mix(in srgb, var(--foreground-color) 12%, transparent);
    border-radius: 0.6rem;
    padding: 0.45rem 0.6rem;
    font-size: 0.8rem;
  }

  &--passed {
    border-color: color-mix(in srgb, #2ecc71 35%, transparent);

    code {
      background: color-mix(in srgb, #2ecc71 20%, transparent);
    }
  }

  &--failed {
    border-color: color-mix(in srgb, #ff6b6b 35%, transparent);

    code {
      background: color-mix(in srgb, #ff6b6b 20%, transparent);
    }
  }

  &--pending {
    opacity: 0.7;
  }
}
</style>
