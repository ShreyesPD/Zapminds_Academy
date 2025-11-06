<script lang="ts" setup>
import loader from "@monaco-editor/loader";
import type { SupportedLanguage } from "~/utils/code-templates";
import { getLanguageDisplayName } from "~/utils/code-templates";

interface Props {
  modelValue: string;
  language: SupportedLanguage;
  height?: string;
}

interface Emits {
  (e: "update:modelValue", value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  height: "400px",
});

const emit = defineEmits<Emits>();

const editorRef = ref<HTMLDivElement>();
let editor: any = null;
let monaco: any = null;

onMounted(async () => {
  if (!editorRef.value) return;

  try {
    monaco = await loader.init();
    editor = monaco.editor.create(editorRef.value, {
      value: props.modelValue,
      language: props.language === "javascript" ? "typescript" : props.language,
      theme: "vs-dark",
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: "on",
      scrollBeyondLastLine: false,
      wordWrap: "on",
    });

    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      emit("update:modelValue", value);
    });
  } catch (error) {
    console.error("Error loading Monaco Editor:", error);
  }
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (editor && editor.getValue() !== newValue) {
      editor.setValue(newValue);
    }
  }
);

watch(
  () => props.language,
  (newLanguage) => {
    if (editor && monaco) {
      const languageId =
        newLanguage === "javascript" ? "typescript" : newLanguage;
      monaco.editor.setModelLanguage(editor.getModel(), languageId);
    }
  }
);

onUnmounted(() => {
  if (editor) {
    editor.dispose();
  }
});

defineExpose({
  getValue: () => editor?.getValue() || "",
  setValue: (value: string) => editor?.setValue(value),
  focus: () => editor?.focus(),
});
</script>

<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <span :class="$style.language">{{ getLanguageDisplayName(language) }}</span>
    </div>
    <div ref="editorRef" :class="$style.editor" :style="{ height }"></div>
  </div>
</template>

<style module lang="scss">
.container {
  border: 2px solid var(--foreground-color);
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--background-color);
}

.header {
  padding: 0.5rem 1rem;
  background: var(--foreground-color);
  color: var(--background-color);
  font-family: var(--text-font);
  font-size: 0.875rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.language {
  font-weight: 600;
}

.editor {
  width: 100%;
}
</style>

