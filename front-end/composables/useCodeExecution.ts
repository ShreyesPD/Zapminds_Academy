import type {
  CodeExecutionResult,
  TestCase,
  TestResult,
} from "~/types/academy";
import {
  getJudge0LanguageId,
  type SupportedLanguage,
} from "~/utils/code-templates";

export const useCodeExecution = () => {
  const loading = useState<boolean>("code_execution_loading", () => false);
  const error = useState<Error | null>("code_execution_error", () => null);

  // Execute code with test cases
  const executeCode = async (
    code: string,
    language: SupportedLanguage,
    testCases: TestCase[]
  ): Promise<CodeExecutionResult> => {
    try {
      loading.value = true;
      error.value = null;

      const response = await $fetch<{
        success: boolean;
        result: CodeExecutionResult;
        error?: string;
      }>("/api/execute-code", {
        method: "POST",
        body: {
          code,
          language,
          testCases,
        },
      });

      if (!response.success || response.error) {
        throw new Error(response.error || "Code execution failed");
      }

      return response.result;
    } catch (err: any) {
      error.value = err;
      console.error("Error executing code:", err);
      return {
        success: false,
        status: "runtime_error",
        test_results: [],
        execution_time: null,
        memory_used: null,
        error_message: err.message || "Code execution failed",
        stdout: null,
        stderr: null,
      };
    } finally {
      loading.value = false;
    }
  };

  // Run code with a single test case (for testing/debugging)
  const runCode = async (
    code: string,
    language: SupportedLanguage,
    input: string | string[]
  ): Promise<{
    output: string | null;
    error: string | null;
    execution_time: number | null;
  }> => {
    try {
      loading.value = true;
      error.value = null;

      const response = await $fetch<{
        success: boolean;
        output: string | null;
        error: string | null;
        execution_time: number | null;
      }>("/api/execute-code", {
        method: "POST",
        body: {
          code,
          language,
          testCases: [
            {
              input,
              expected_output: "", // Not needed for single run
              is_hidden: false,
            },
          ],
          runOnly: true, // Just run, don't validate
        },
      });

      if (!response.success) {
        throw new Error("Code execution failed");
      }

      return {
        output: response.output || null,
        error: response.error || null,
        execution_time: response.execution_time || null,
      };
    } catch (err: any) {
      error.value = err;
      console.error("Error running code:", err);
      return {
        output: null,
        error: err.message || "Code execution failed",
        execution_time: null,
      };
    } finally {
      loading.value = false;
    }
  };

  return {
    loading: readonly(loading),
    error: readonly(error),
    executeCode,
    runCode,
  };
};

