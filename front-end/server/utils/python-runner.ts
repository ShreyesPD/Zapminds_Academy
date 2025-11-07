import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const PYTHON_TIMEOUT = 8000;

export type PlaygroundTestPayload = {
  id: string;
  description: string;
  assertion: string;
  expected?: string;
};

export type PlaygroundTestResult = {
  id: string;
  status: "passed" | "failed";
  output: string;
};

const escapeForPython = (value: string) => JSON.stringify(value);

const buildScript = (code: string, assertion: string) => {
  const captureReady = assertion.replace(
    /(?<!def )__test__\(\)/g,
    "__zapminds_capture(__test__())"
  );

  return `
import json
import traceback
import contextlib
import io

code = ${escapeForPython(code)}
test_code = ${escapeForPython(captureReady)}

globals_dict = {"__builtins__": __builtins__}
exec(code, globals_dict, globals_dict)

__zapminds_result = None

def __zapminds_capture(value):
    global __zapminds_result
    __zapminds_result = value
    return value

try:
    _buffer = io.StringIO()
    with contextlib.redirect_stdout(_buffer), contextlib.redirect_stderr(_buffer):
        exec(test_code, globals_dict, globals_dict)
        if __zapminds_result is None and "__test__" in globals_dict:
            __zapminds_result = __zapminds_capture(globals_dict["__test__"]())
    print(json.dumps({"result": __zapminds_result, "stdout": _buffer.getvalue()}, default=str))
except Exception:
    print(json.dumps({"error": traceback.format_exc()}))
`.trim();
};

export const runPythonTests = async (
  code: string,
  tests: PlaygroundTestPayload[]
): Promise<PlaygroundTestResult[]> => {
  const execution: PlaygroundTestResult[] = [];

  for (const test of tests) {
    const script = buildScript(code, test.assertion);

    try {
      const { stdout } = await execFileAsync("python3", ["-c", script], {
        timeout: PYTHON_TIMEOUT,
        maxBuffer: 1024 * 1024,
      });

      const payloadLine = stdout
        .trim()
        .split("\n")
        .filter(Boolean)
        .pop();
      const payload = payloadLine ? JSON.parse(payloadLine) : {};
      const hasError = Boolean(payload.error);
      const rawResult = payload.result;
      const capturedStdout =
        typeof payload.stdout === "string" ? payload.stdout.trim() : "";
      let status: "passed" | "failed" = "failed";

      if (!hasError) {
        if (typeof test.expected === "string") {
          status =
            String(rawResult).trim() === String(test.expected).trim()
              ? "passed"
              : "failed";
        } else {
          status =
            rawResult === true ||
            String(rawResult).toLowerCase() === "true" ||
            rawResult === "SUCCESS"
              ? "passed"
              : "failed";
        }
      }

      execution.push({
        id: test.id,
        status: hasError ? "failed" : status,
        output: hasError
          ? payload.error
          : capturedStdout || (rawResult !== undefined ? String(rawResult) : "Success"),
      });
    } catch (error: any) {
      const message =
        error?.stderr ||
        error?.stdout ||
        error?.message ||
        "Execution failed.";
      execution.push({
        id: test.id,
        status: "failed",
        output: message,
      });
    }
  }

  return execution;
};
