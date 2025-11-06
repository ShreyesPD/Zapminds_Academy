<script setup lang="ts">
import { onBeforeUnmount, onMounted, nextTick, ref, shallowRef, watch } from "vue";
import loader from "@monaco-editor/loader";
import type { editor as MonacoEditorNS, IDisposable } from "monaco-editor";
import type {
  PythonExercise,
  PythonExerciseTest,
} from "~/utils/python-foundations-data";

const props = defineProps<{
  exercise: PythonExercise;
}>();

const editorContainer = ref<HTMLDivElement | null>(null);
const monacoEditor = shallowRef<MonacoEditorNS.IStandaloneCodeEditor | null>(
  null
);
const monacoDisposables: IDisposable[] = [];

const isEditorReady = ref(false);
const isRunning = ref(false);
const results = ref<
  Array<{
    test: PythonExerciseTest;
    status: "pending" | "passed" | "failed";
    output: string;
  }>
>([]);
const runtimeMessage = ref<string | null>(null);

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

type PyodideLoader = {
  loadPyodide: (options: { indexURL: string }) => Promise<PyodideInterface>;
};

type PyodideInterface = {
  runPythonAsync: (code: string) => Promise<any>;
};

let pyodideInstance: PyodideInterface | null = null;
let pyodideLoading: Promise<PyodideInterface> | null = null;

declare global {
  interface Window {
    loadPyodide?: PyodideLoader["loadPyodide"];
  }
}

const loadPyodideScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.loadPyodide) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-pyodide="true"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        (event) => reject(event),
        {
          once: true,
        }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
    script.async = true;
    script.dataset.pyodide = "true";
    script.onload = () => resolve();
    script.onerror = (event) => reject(event);
    document.head.appendChild(script);
  });

const ensurePyodide = async () => {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (!pyodideLoading) {
    pyodideLoading = (async () => {
      await loadPyodideScript();
      if (!window.loadPyodide) {
        throw new Error("Pyodide failed to load.");
      }

      return window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
      });
    })();
  }

  pyodideInstance = await pyodideLoading;
  return pyodideInstance as PyodideInterface;
};

const resetEnvironment = async (pyodide: PyodideInterface) => {
  await pyodide.runPythonAsync(`
import builtins
globals().clear()
globals()["__builtins__"] = builtins
`);
};

const runTests = async () => {
  if (!monacoEditor.value) return;

  isRunning.value = true;
  results.value = props.exercise.tests.map((test) => ({
    test,
    status: "pending",
    output: "",
  }));
  runtimeMessage.value = "Booting Python runtime...";

  try {
    const pyodide = await ensurePyodide();
    runtimeMessage.value = "Preparing sandbox…";
    await resetEnvironment(pyodide);

    const userCode = monacoEditor.value.getValue();
    await pyodide.runPythonAsync(userCode);

    runtimeMessage.value = null;

    const updated = [];
    for (const result of results.value) {
      const testCode = result.test.assertion.trim();
      let output = "";
      let status: "passed" | "failed" = "failed";

      try {
        const evaluation = await pyodide.runPythonAsync(testCode);
        const rendered =
          typeof evaluation === "string"
            ? evaluation
            : typeof evaluation === "boolean"
            ? evaluation
              ? "True"
              : "False"
            : evaluation === undefined || evaluation === null
            ? "None"
            : typeof evaluation === "number"
            ? evaluation.toString()
            : evaluation?.toString?.() ?? "";

        output = typeof rendered === "string" ? rendered : String(rendered);

        const passed =
          evaluation === true ||
          output === "True" ||
          output === "SUCCESS" ||
          output === "None";

        status = passed ? "passed" : "failed";
      } catch (error: any) {
        output = error?.message ?? String(error);
        status = "failed";
      }

      updated.push({
        ...result,
        status,
        output,
      });
    }

    results.value = updated;
  } catch (error: any) {
    runtimeMessage.value =
      error?.message ??
      "Something went wrong while running the exercise. Please try again.";
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
