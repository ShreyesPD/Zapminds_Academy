export type PythonExerciseTest = {
  id: string;
  description: string;
  assertion: string;
  expected?: string;
};

export type PythonExercise = {
  id: string;
  title: string;
  prompt: string;
  starterCode: string;
  hints: string[];
  tests: PythonExerciseTest[];
};

export type PythonModule = {
  id: string;
  title: string;
  duration: string;
  difficulty: "warmup" | "core" | "challenge";
  overview: string;
  learningObjectives: string[];
  reading: {
    label: string;
    url: string;
  }[];
  codeConcepts: string[];
  exercise: PythonExercise;
};

export type PythonProjectBrief = {
  id: string;
  title: string;
  summary: string;
  deliverables: string[];
  checkpoints: string[];
};

export type PythonCourseContent = {
  courseId: string;
  title: string;
  hero: {
    headline: string;
    kicker: string;
    description: string;
    progressPercent: number;
  };
  modules: PythonModule[];
  capstone: PythonProjectBrief;
};

export const pythonFoundationsContent: PythonCourseContent = {
  courseId: "python",
  title: "Python Foundations",
  hero: {
    headline: "Python Foundations",
    kicker: "Beginner · Programming",
    description:
      "Become fluent with Python’s modern syntax, data structures, and automation patterns. Each module ends with a hands-on exercise designed to reinforce concepts in a LeetCode-style playground.",
    progressPercent: 72,
  },
  modules: [
    {
      id: "python-data-classes",
      title: "Organising State with Dataclasses",
      duration: "18 min",
      difficulty: "core",
      overview:
        "Dataclasses dramatically reduce boilerplate when modelling domain entities. Along the way you will explore default factories, post-init hooks, and immutability.",
      learningObjectives: [
        "Model structured data with dataclasses and default factories",
        "Implement custom validation with `__post_init__` hooks",
        "Compare dataclasses to `NamedTuple` and Pydantic models",
      ],
      reading: [
        {
          label: "PEP 557 – Data Classes",
          url: "https://peps.python.org/pep-0557/",
        },
        {
          label: "dataclasses — Python docs",
          url: "https://docs.python.org/3/library/dataclasses.html",
        },
      ],
      codeConcepts: [
        "@dataclass decorator",
        "field defaults",
        "__post_init__",
        "slots",
      ],
      exercise: {
        id: "exercise-dataclasses",
        title: "Annotate Learning Notes",
        prompt:
          "Design a `LearningNote` dataclass that auto-generates a unique id, normalises tags to uppercase, and records the created timestamp. Implement an `add_tag` method that avoids duplicates.",
        starterCode: `from dataclasses import dataclass, field
from datetime import datetime
from typing import List
from uuid import uuid4


@dataclass
class LearningNote:
    title: str
    body: str
    tags: List[str] = field(default_factory=list)
    # TODO: add id and created_at fields

    def add_tag(self, tag: str) -> None:
        # TODO: implement tag normalisation and dedupe
        ...


def format_note(note: LearningNote) -> str:
    return f"{note.title} :: {', '.join(note.tags)}"
`,
        hints: [
          "Use `field(default_factory=uuid4)` to assign ids.",
          "Strip whitespace and uppercase tags before storing them.",
          "Guard against duplicates by checking membership before appending.",
        ],
        tests: [
          {
            id: "assigns-id",
            description: "LearningNote instances expose a 32-character hexadecimal id.",
            assertion: `
def __test__():
    note = LearningNote("Dataclasses", "Less boilerplate!", ["python"])
    return len(note.id) == 32
__test__()
`,
            expected: "True",
          },
          {
            id: "normalises-tags",
            description: "Repeated tags are deduplicated and uppercased.",
            assertion: `
def __test__():
    note = LearningNote("Decorators", "Great for cross-cutting")
    note.add_tag("patterns")
    note.add_tag("Patterns ")
    return format_note(note) == "Decorators :: PATTERNS"
__test__()
`,
            expected: "True",
          },
          {
            id: "records-created-at",
            description: "created_at stores a datetime instance.",
            assertion: `
import datetime as _dt
def __test__():
    note = LearningNote("Async IO", "Await!")
    return isinstance(note.created_at, _dt.datetime)
__test__()
`,
            expected: "True",
          },
        ],
      },
    },
    {
      id: "python-async",
      title: "Async IO Fundamentals",
      duration: "22 min",
      difficulty: "core",
      overview:
        "Write cooperative multitasking code with `asyncio`, structured concurrency, and cancellation handling. Learn to build resilient async workflows ready for production.",
      learningObjectives: [
        "Create coroutines, gather tasks, and await results in parallel",
        "Implement graceful cancellation and timeout strategies",
        "Trace event loop behaviour with logging and instrumentation",
      ],
      reading: [
        {
          label: "Asyncio official tutorial",
          url: "https://docs.python.org/3/library/asyncio-task.html",
        },
        {
          label: "Structural concurrency using TaskGroups",
          url: "https://realpython.com/python310-new-features/#exception-groups-and-taskgroup",
        },
      ],
      codeConcepts: [
        "async/await",
        "create_task",
        "gather",
        "asyncio.to_thread",
        "timeouts",
      ],
      exercise: {
        id: "exercise-async",
        title: "Parallel Course Fetcher",
        prompt:
          "Implement `fetch_course` to simulate fetching a course module with latency. Compose `load_progress` using `asyncio.gather` so modules resolve in parallel. Apply a timeout so hung requests don’t block progress.",
        starterCode: `import asyncio
from typing import Dict, List


async def fetch_course(course_id: str) -> Dict[str, str]:
    \"\"\"Simulate fetching course metadata.\"\"\"
    # TODO: add random latency and return a payload
    ...


async def load_progress(course_ids: List[str], timeout: float = 1.0) -> List[Dict[str, str]]:
    \"\"\"Return course payloads, skipping requests that exceed the timeout.\"\"\"
    # TODO: schedule tasks concurrently and cancel those exceeding the timeout
    ...


async def main():
    response = await load_progress(["python", "ml", "rag"])
    print(len(response))


if __name__ == "__main__":
    asyncio.run(main())
`,
        hints: [
          "Use `asyncio.sleep` with a random value to emulate API latency.",
          "Wrap `asyncio.gather(..., return_exceptions=True)` so timeouts don’t crash the batch.",
          "Cancel pending tasks when `asyncio.wait_for` raises `TimeoutError`.",
        ],
        tests: [
          {
            id: "returns-length",
            description: "One course id yields one payload.",
            assertion: `
import asyncio
def __test__():
    result = asyncio.run(load_progress(["python"]))
    return len(result) == 1
__test__()
`,
            expected: "True",
          },
          {
            id: "parallel-execution",
            description: "Three ids complete within the timeout window.",
            assertion: `
import asyncio
import time
def __test__():
    start = time.perf_counter()
    result = asyncio.run(load_progress(["python", "ml", "rag"]))
    duration = time.perf_counter() - start
    return (len(result) == 3) and (duration < 1.5)
__test__()
`,
            expected: "True",
          },
          {
            id: "handles-timeout",
            description: "Aggressive timeout cancels pending fetches gracefully.",
            assertion: `
import asyncio
def __test__():
    result = asyncio.run(load_progress(["python"], timeout=0.01))
    return len(result) == 0
__test__()
`,
            expected: "True",
          },
        ],
      },
    },
    {
      id: "python-typing",
      title: "Type Hints & Protocols",
      duration: "20 min",
      difficulty: "challenge",
      overview:
        "Use Python’s typing ecosystem to document contracts, enforce structural subtyping, and improve tooling support for larger codebases.",
      learningObjectives: [
        "Express callable contracts with Protocols and TypeVar constraints",
        "Leverage `TypedDict` and `Literal` for JSON-like payloads",
        "Use `mypy` and `pyright` to catch regressions in CI",
      ],
      reading: [
        {
          label: "Protocols and Structural Subtyping",
          url: "https://mypy.readthedocs.io/en/stable/protocols.html",
        },
        {
          label: "Typing cheat sheet",
          url: "https://mypy.readthedocs.io/en/stable/cheat_sheet_py3.html",
        },
      ],
      codeConcepts: ["Protocol", "TypeVar", "Literal types", "TypedDict", "mypy"],
      exercise: {
        id: "exercise-typing",
        title: "Formatter Registry",
        prompt:
          "Create a protocol-driven formatter registry. Consumers should register callables that accept a `LearningNote` and return a string. The registry must preserve type safety and expose a `render` helper.",
        starterCode: `from dataclasses import dataclass
from typing import Callable, Dict, Protocol


@dataclass
class LearningNote:
    title: str
    body: str


class Formatter(Protocol):
    def __call__(self, note: LearningNote) -> str: ...


class FormatterRegistry:
    def __init__(self):
        self._formatters: Dict[str, Formatter] = {}

    def register(self, name: str, formatter: Formatter) -> None:
        # TODO: store the formatter
        ...

    def render(self, name: str, note: LearningNote) -> str:
        # TODO: call the registered formatter
        ...
`,
        hints: [
          "Store callables in a `Dict[str, Formatter]` so mypy understands the contract.",
          "Raise `KeyError` when a formatter is not found.",
          "Demonstrate registering a lambda or standard function in your tests.",
        ],
        tests: [
          {
            id: "registers-formatter",
            description: "Registered formatters process notes correctly.",
            assertion: `
def __test__():
    registry = FormatterRegistry()
    registry.register("title", lambda n: n.title.upper())
    return registry.render("title", LearningNote("Python", "Rocks")) == "PYTHON"
__test__()
`,
            expected: "True",
          },
          {
            id: "unknown-formatter",
            description: "Requesting unknown formatter raises KeyError.",
            assertion: `
def __test__():
    registry = FormatterRegistry()
    try:
        registry.render("unknown", LearningNote("Zap", "Minds"))
    except KeyError:
        return True
    return False
__test__()
`,
            expected: "True",
          },
        ],
      },
    },
  ],
  capstone: {
    id: "capstone-python-automation",
    title: "Automation Toolkit",
    summary:
      "Build a personal automation toolkit that synchronises learning notes, summarises study sessions, and publishes a weekly briefing. The project combines dataclasses, asyncio, and typed contracts.",
    deliverables: [
      "Command-line interface with progress visualisation",
      "Async pipeline that pulls notes, enriches metadata, and generates summaries",
      "Typed formatter registry feeding a Markdown or Notion export",
    ],
    checkpoints: [
      "Dataclass models wired with persistence layer",
      "Async ingestion pipeline with caching and retries",
      "End-to-end demo script and README walkthrough",
    ],
  },
};
