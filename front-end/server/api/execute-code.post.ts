import type { TestCase, TestResult } from "~/types/academy";
import {
  getJudge0LanguageId,
  type SupportedLanguage,
} from "~/utils/code-templates";

interface ExecuteCodeRequest {
  code: string;
  language: SupportedLanguage;
  testCases: TestCase[];
  runOnly?: boolean; // If true, just run without validation
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody<ExecuteCodeRequest>(event);

  const { code, language, testCases, runOnly = false } = body;

  if (!code || !language || !testCases || testCases.length === 0) {
    return {
      success: false,
      error: "Missing required fields: code, language, or testCases",
    };
  }

  const judge0ApiKey = config.judge0ApiKey;
  const judge0ApiUrl =
    config.judge0ApiUrl || "https://judge0-ce.p.rapidapi.com";

  if (!judge0ApiKey) {
    console.warn("Judge0 API key not configured, using mock execution");
    // Return mock results for development
    return {
      success: true,
      result: {
        success: true,
        status: "accepted",
        test_results: testCases.map((tc, index) => ({
          test_case_index: index,
          passed: true,
          input: tc.input,
          expected_output: tc.expected_output,
          actual_output: tc.expected_output,
          error_message: null,
          execution_time: 100,
          memory_used: 1024,
        })),
        execution_time: 100,
        memory_used: 1024,
        error_message: null,
        stdout: null,
        stderr: null,
      },
    };
  }

  const languageId = getJudge0LanguageId(language);

  try {
    // Execute code for each test case
    const testResults: TestResult[] = [];
    let allPassed = true;
    let totalExecutionTime = 0;
    let maxMemoryUsed = 0;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];

      // Prepare input
      const inputStr = Array.isArray(testCase.input)
        ? testCase.input.join("\n")
        : testCase.input;

      // Submit code to Judge0
      const submissionResponse = await fetch(
        `${judge0ApiUrl}/submissions?base64_encoded=false&wait=true`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": judge0ApiKey,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
          body: JSON.stringify({
            source_code: code,
            language_id: languageId,
            stdin: inputStr,
            cpu_time_limit: 2, // 2 seconds
            memory_limit: 128000, // 128 MB
          }),
        }
      );

      if (!submissionResponse.ok) {
        const errorText = await submissionResponse.text();
        throw new Error(
          `Judge0 API error: ${submissionResponse.status} - ${errorText}`
        );
      }

      const submission = await submissionResponse.json();

      // Check submission status
      if (submission.status?.id === 3) {
        // Accepted
        const actualOutput = (submission.stdout || "").trim();
        const expectedOutput = testCase.expected_output.trim();
        const passed = actualOutput === expectedOutput;

        if (!passed) {
          allPassed = false;
        }

        testResults.push({
          test_case_index: i,
          passed,
          input: testCase.input,
          expected_output: expectedOutput,
          actual_output: actualOutput,
          error_message: null,
          execution_time: submission.time ? parseFloat(submission.time) * 1000 : null,
          memory_used: submission.memory || null,
        });

        totalExecutionTime += submission.time
          ? parseFloat(submission.time) * 1000
          : 0;
        maxMemoryUsed = Math.max(maxMemoryUsed, submission.memory || 0);
      } else {
        // Error occurred
        allPassed = false;
        const errorMessage = submission.stderr || submission.compile_output || "Unknown error";
        const statusId = submission.status?.id;

        let status: "runtime_error" | "timeout" | "wrong_answer" = "runtime_error";
        if (statusId === 5) status = "timeout";

        testResults.push({
          test_case_index: i,
          passed: false,
          input: testCase.input,
          expected_output: testCase.expected_output,
          actual_output: null,
          error_message: errorMessage,
          execution_time: submission.time ? parseFloat(submission.time) * 1000 : null,
          memory_used: submission.memory || null,
        });
      }
    }

    // If runOnly, just return the first result's output
    if (runOnly && testResults.length > 0) {
      const firstResult = testResults[0];
      return {
        success: true,
        output: firstResult.actual_output,
        error: firstResult.error_message,
        execution_time: firstResult.execution_time,
      };
    }

    return {
      success: true,
      result: {
        success: allPassed,
        status: allPassed ? "accepted" : "wrong_answer",
        test_results: testResults,
        execution_time: totalExecutionTime,
        memory_used: maxMemoryUsed,
        error_message: allPassed ? null : "Some test cases failed",
        stdout: null,
        stderr: null,
      },
    };
  } catch (err: any) {
    console.error("Error executing code:", err);
    return {
      success: false,
      error: err.message || "Code execution failed",
    };
  }
});

