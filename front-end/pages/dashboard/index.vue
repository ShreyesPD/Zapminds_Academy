<script setup lang="ts">
import { UIElements } from "~/assets/static-data/ui-elements";

definePageMeta({
  layout: "default",
  middleware: ["student-auth"],
});

const { profile, logout } = useStudentAuth();
const router = useRouter();

const studentName = computed(() => profile.value.name ?? "Zapmind Student");
const streakDays = 5;
const totalXp = 1825;
const solvedToday = 3;
const reviewQueue = 4;
const weeklyGoal = {
  completed: 7,
  total: 12,
};

const pageTitle = "Dashboard – Zapminds Academy";

useSeoMeta({
  title: pageTitle,
  description:
    "Track your Zapminds Academy progress, jump back into active courses, and compete on the leaderboard.",
});

type TopicStatus = "completed" | "in-progress" | "locked";

interface CourseTopic {
  id: string;
  title: string;
  description: string;
  status: TopicStatus;
  language: string;
  code: string;
}

interface CourseProject {
  id: string;
  title: string;
  summary: string;
  techStack: string[];
  duration: string;
  deliverables: string[];
}

type CourseDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

interface Course {
  id: string;
  title: string;
  difficulty: CourseDifficulty;
  category: string;
  tags: string[];
  progress: number;
  completedModules: number;
  totalModules: number;
  nextTopic: string;
  eta: string;
  topics: CourseTopic[];
  projects: CourseProject[];
}

const courses = reactive<Course[]>([
  {
    id: "python",
    title: "Python Foundations",
    difficulty: "beginner",
    category: "Programming",
    tags: ["Syntax", "Data Structures", "Automation"],
    progress: 72,
    completedModules: 18,
    totalModules: 25,
    nextTopic: "Working with Async IO",
    eta: "10 min",
    topics: [
      {
        id: "python-data-classes",
        title: "Organising State with Dataclasses",
        description:
          "Use `@dataclass` to define lightweight models with defaults and validation hooks.",
        status: "completed",
        language: "Python",
        code: `from dataclasses import dataclass, field
from uuid import uuid4

@dataclass
class CourseNote:
    title: str
    tags: list[str] = field(default_factory=list)
    id: str = field(default_factory=lambda: uuid4().hex)

    def add_tag(self, tag: str) -> None:
        if tag not in self.tags:
            self.tags.append(tag.upper())`,
      },
      {
        id: "python-async",
        title: "Async IO Fundamentals",
        description:
          "Build non-blocking scripts with `asyncio` tasks, gather, and timeouts.",
        status: "in-progress",
        language: "Python",
        code: `import asyncio

async def fetch(course_id: str) -> dict:
    await asyncio.sleep(0.4)
    return {"id": course_id, "status": "ready"}

async def main(ids: list[str]) -> list[dict]:
    tasks = [asyncio.create_task(fetch(i)) for i in ids]
    return await asyncio.gather(*tasks)

asyncio.run(main(["python", "ml"]))`,
      },
      {
        id: "python-typing",
        title: "Type Hints & Protocols",
        description:
          "Document data structures with modern typing features and structural subtyping.",
        status: "locked",
        language: "Python",
        code: `from typing import Protocol, Iterable

class Formatter(Protocol):
    def __call__(self, record: dict) -> str: ...

def export(records: Iterable[dict], format_record: Formatter) -> list[str]:
    return [format_record(row) for row in records]`,
      },
    ],
    projects: [
      {
        id: "cli-daily-habits",
        title: "Terminal Habit Tracker",
        summary:
          "Build a CLI that tracks daily learning rituals, emits weekly reports, and syncs to Notion.",
        techStack: ["Rich", "Typer", "SQLite"],
        duration: "8 hrs",
        deliverables: [
          "Interactive CLI with colored output",
          "SQLite schema & migration script",
          "Export option to Markdown dashboards",
        ],
      },
      {
        id: "automation-gmail",
        title: "Inbox Automation Service",
        summary:
          "Use Gmail + Google Drive APIs to archive receipts, label AI newsletters, and surface summaries.",
        techStack: ["Google APIs", "OAuth2", "pydantic"],
        duration: "12 hrs",
        deliverables: [
          "OAuth2 authenticated service account",
          "Worker that batches and labels messages",
          "Daily digest email with highlights",
        ],
      },
      {
        id: "python-data-visual",
        title: "Learning Analytics Dashboard",
        summary:
          "Parse course progress JSON, compute study streaks, and render interactive charts.",
        techStack: ["FastAPI", "Pandas", "Plotly"],
        duration: "10 hrs",
        deliverables: [
          "API endpoint returning aggregated study metrics",
          "Responsive dashboard with Plotly visuals",
          "Unit tests for analytics helpers",
        ],
      },
    ],
  },
  {
    id: "machine-learning",
    title: "Machine Learning Systems",
    difficulty: "intermediate",
    category: "ML Ops",
    tags: ["Pipelines", "Evaluation", "Feature Stores"],
    progress: 20,
    completedModules: 2,
    totalModules: 10,
    nextTopic: "Feature Engineering for Production",
    eta: "20 min",
    topics: [
      {
        id: "ml-feature-store",
        title: "Feature Store Contracts",
        description:
          "Design reusable feature definitions with validation to power offline and online inference.",
        status: "completed",
        language: "Python",
        code: `from feast import Feature, Entity, ValueType

user = Entity(name="user_id", value_type=ValueType.STRING, join_keys=["user_id"])

avg_session = Feature(
    name="avg_session_duration",
    dtype=ValueType.FLOAT,
    ttl="7d",
    online=True,
    description="Average time spent per session"
)`,
      },
      {
        id: "ml-evaluation",
        title: "Robust Evaluation Matrices",
        description:
          "Build evaluation harnesses that slice metrics across cohorts and serve dashboards.",
        status: "in-progress",
        language: "Python",
        code: `from sklearn.metrics import classification_report
import pandas as pd

def diagnostics(y_true, y_pred, cohort: pd.Series) -> dict:
    report = classification_report(y_true, y_pred, output_dict=True)
    by_cohort = (
        pd.DataFrame({"truth": y_true, "pred": y_pred, "cohort": cohort})
        .groupby("cohort")
        .apply(lambda frame: classification_report(frame.truth, frame.pred, output_dict=True))
    )
    return {"overall": report, "by_cohort": by_cohort.to_dict()}`,
      },
      {
        id: "ml-ci-cd",
        title: "Model CI/CD Blueprint",
        description:
          "Trigger retraining from drift alerts and version artifacts with rollbacks.",
        status: "locked",
        language: "YAML",
        code: `stages:
  - lint
  - train
  - deploy

train:
  script:
    - python pipelines/train.py --run-id $CI_PIPELINE_ID
  artifacts:
    paths:
      - artifacts/models/
  when: manual`,
      },
    ],
    projects: [
      {
        id: "ml-loan-risk",
        title: "Responsible Loan Risk Scoring",
        summary:
          "Deliver a gradient boosted model with bias analysis and auto-updating SHAP dashboards.",
        techStack: ["LightGBM", "Evidently", "Dagster"],
        duration: "16 hrs",
        deliverables: [
          "Pipeline orchestrating data prep, training, evaluation",
          "Bias & fairness report with mitigations",
          "Deployment notebook documenting infra decisions",
        ],
      },
      {
        id: "ml-retraining-bot",
        title: "Retraining Copilot",
        summary:
          "Slack bot monitors performance decay, opens Jira tickets, and schedules GPU jobs.",
        techStack: ["Slack Bolt", "Prefect", "AWS Batch"],
        duration: "12 hrs",
        deliverables: [
          "Latency & accuracy monitoring hooks",
          "Interactive Slack bot commands",
          "Automated rollout approval workflow",
        ],
      },
      {
        id: "ml-feature-marketplace",
        title: "Feature Marketplace",
        summary:
          "Expose curated datasets and semantic search over feature catalog for data scientists.",
        techStack: ["Feast", "FastAPI", "Qdrant"],
        duration: "20 hrs",
        deliverables: [
          "Metadata ingestion jobs",
          "Vector search across feature documentation",
          "Role-based access & audit logs",
        ],
      },
    ],
  },
  {
    id: "deep-learning",
    title: "Deep Learning Studio",
    difficulty: "advanced",
    category: "Neural Networks",
    tags: ["PyTorch", "Vision", "Optimization"],
    progress: 44,
    completedModules: 4,
    totalModules: 10,
    nextTopic: "Scaled Dot-Product Attention",
    eta: "23 min",
    topics: [
      {
        id: "dl-tensor-shapes",
        title: "Tensor Shape Diagnostics",
        description:
          "Infer tensor dimensions from nested Python lists and raise precise ragged errors.",
        status: "completed",
        language: "Python",
        code: `def infer_shape(tensor):
    if not isinstance(tensor, list):
        return ()
    length = len(tensor)
    inner = infer_shape(tensor[0])
    for row in tensor:
        if infer_shape(row) != inner:
            raise ValueError("ragged tensor detected")
    return (length, *inner)`,
      },
      {
        id: "dl-attention",
        title: "Attention Mechanics",
        description:
          "Implement scaled dot-product attention complete with masking for causal decoders.",
        status: "in-progress",
        language: "Python",
        code: `weights, context = scaled_dot_attention(
    query=[1.0, 0.0],
    keys=[[1.0, 0.0], [0.0, 1.0]],
    values=[[1.0, 1.0], [0.0, 2.0]],
)`,
      },
      {
        id: "dl-diffusion",
        title: "Diffusion Sampling Fundamentals",
        description:
          "Step through reverse diffusion updates with stable denoising math.",
        status: "locked",
        language: "Python",
        code: `from math import sqrt

def denoise_step(x_t, beta, noise):
    scale = sqrt(1 - beta)
    return [(x - beta * n) / scale for x, n in zip(x_t, noise)]`,
      },
    ],
    projects: [
      {
        id: "dl-vision",
        title: "Zero-Shot Vision Playground",
        summary:
          "Fine-tune CLIP encoders for retail catalog search with prompt engineering experiments.",
        techStack: ["CLIP", "W&B", "Lightning"],
        duration: "18 hrs",
        deliverables: [
          "Custom datamodule for multi-modal pairs",
          "Evaluation scripts for retrieval precision",
          "Interactive Gradio demo for buyers",
        ],
      },
      {
        id: "dl-speech",
        title: "Speech-to-Intent Service",
        summary:
          "Adapt Whisper to classify customer intents and deploy as streaming inference endpoint.",
        techStack: ["Whisper", "TorchServe", "Redis"],
        duration: "22 hrs",
        deliverables: [
          "Fine-tuned model checkpoint",
          "Batch & streaming inference pipelines",
          "Latency benchmarks & scaling plan",
        ],
      },
      {
        id: "dl-diffusion",
        title: "Controlled Diffusion Studio",
        summary:
          "Train ControlNet for brand-specific marketing assets with textual inversion tokens.",
        techStack: ["Diffusers", "LoRA", "ComfyUI"],
        duration: "24 hrs",
        deliverables: [
          "Dataset curation notebook",
          "Inference UI to tweak prompts & seeds",
          "Governance checklist for safe outputs",
        ],
      },
    ],
  },
  {
    id: "llm-engineering",
    title: "LLM Engineering Lab",
    difficulty: "advanced",
    category: "Generative AI",
    tags: ["Prompting", "Guardrails", "Tooling"],
    progress: 62,
    completedModules: 6,
    totalModules: 10,
    nextTopic: "Guardrail Policies & Moderation",
    eta: "14 min",
    topics: [
      {
        id: "llm-prompt-playbooks",
        title: "Prompt Playbooks & Pattern Libraries",
        description:
          "Build structured prompts that stitch system tone, constraints, and conversation history together.",
        status: "completed",
        language: "Python",
        code: `prompt = build_prompt(
    [{"role": "system", "content": "You are a coach."},
     {"role": "user", "content": "Draft onboarding email."}],
    {"tone": "positive", "constraints": ["Use bullet list."]}
)`,
      },
      {
        id: "llm-tool-routing",
        title: "Tool Router Strategies",
        description:
          "Map user intents to the exact tool roster with transparent reasoning a reviewer can audit.",
        status: "in-progress",
        language: "Python",
        code: `selected = route_tools(
    {"schedule", "handoff"},
    [
        {"id": "calendar", "tags": {"schedule"}, "priority": "required"},
        {"id": "handoff", "tags": {"handoff", "ticket"}}
    ],
)`,
      },
      {
        id: "llm-memory",
        title: "Conversation Memory Strategies",
        description:
          "Capture pinned commitments and rolling summaries for assistants that stay contextually sharp.",
        status: "locked",
        language: "Python",
        code: `memory = summarise_memory(
    [{"role": "user", "content": "Demo Friday", "pinned": True},
     {"role": "assistant", "content": "Drafting agenda now."}]
)`,
      },
    ],
    projects: [
      {
        id: "llm-support-copilot",
        title: "Support Copilot Assistant",
        summary:
          "Integrate docs, runbooks, and customer context to propose answers with live tool calls.",
        techStack: ["LangChain", "OpenAI Responses", "Temporal"],
        duration: "18 hrs",
        deliverables: [
          "Retrieval + evaluation pipeline",
          "Human-in-the-loop review surface",
          "Metrics dashboard (deflection, CSAT impact)",
        ],
      },
      {
        id: "llm-fine-tune",
        title: "Instruction Fine-Tuning Suite",
        summary:
          "Craft dataset generation workflows and fine-tune a small language model with RLHF heuristics.",
        techStack: ["OpenAI Finetuning", "DPO", "W&B"],
        duration: "24 hrs",
        deliverables: [
          "Synthetic + curated dataset generator",
          "Fine-tuned checkpoint with eval comparisons",
          "Playground to contrast base vs tuned models",
        ],
      },
      {
        id: "llm-guardrails",
        title: "Guardrail Policy Engine",
        summary:
          "Implement safety filters, jailbreak detection, and red-teaming automation.",
        techStack: ["Guardrails AI", "Pydantic", "Supabase"],
        duration: "14 hrs",
        deliverables: [
          "Policy registry with version history",
          "Adversarial testing notebook",
          "Real-time alerting integration",
        ],
      },
    ],
  },
  {
    id: "rag",
    title: "Retrieval Augmented Generation",
    difficulty: "expert",
    category: "Knowledge Systems",
    tags: ["Indexing", "Chunking", "Evaluation"],
    progress: 51,
    completedModules: 5,
    totalModules: 10,
    nextTopic: "Hybrid Ranking & Signals",
    eta: "18 min",
    topics: [
      {
        id: "rag-ingestion-contracts",
        title: "Ingestion Contracts & Source Registry",
        description:
          "Normalise source metadata so ingestion workers respect freshness and auth scopes.",
        status: "completed",
        language: "Python",
        code: `source = build_source({"id": "docs", "type": "notion", "refresh_minutes": 720})`,
      },
      {
        id: "rag-chunking-strategy",
        title: "Adaptive Chunk Sizes",
        description:
          "Slice documents into retrieval-ready windows with overlap for semantic continuity.",
        status: "in-progress",
        language: "Python",
        code: `chunks = adaptive_chunks(
    ["Intro", "Architecture details", "Evaluation checklist"],
    max_tokens=400,
    overlap_tokens=60,
)`,
      },
      {
        id: "rag-evals",
        title: "End-to-end RAG Evaluation",
        description:
          "Design attribution tests, faithfulness scores, and latency/quality benchmarking loops.",
        status: "locked",
        language: "TypeScript",
        code: `const run = await grader.evaluate({
  answer,
  citations,
  sourceDocuments,
  metrics: ["faithfulness", "answer_relevancy", "context_precision"],
});`,
      },
    ],
    projects: [
      {
        id: "rag-product-docs",
        title: "Product Ops RAG Suite",
        summary:
          "Centralize product specs, ADRs, and release notes with freshness-aware reranking.",
        techStack: ["Qdrant", "OpenTelemetry", "LangGraph"],
        duration: "20 hrs",
        deliverables: [
          "Ingestion workers with dependency graphs",
          "Latency & accuracy benchmark notebook",
          "Feedback loop for relevance voting",
        ],
      },
      {
        id: "rag-contract-review",
        title: "Contract Intelligence Workspace",
        summary:
          "Extract clauses, classify risk, and suggest mitigations with highlight citations.",
        techStack: ["Elastic", "spaCy", "OpenAI Responses"],
        duration: "18 hrs",
        deliverables: [
          "Clause extraction pipeline with tests",
          "Reviewer UI with inline citations",
          "Audit logs satisfying compliance trails",
        ],
      },
      {
        id: "rag-learning-companion",
        title: "Learning Companion",
        summary:
          "RAG chatbot over Zapminds notes that creates flashcards, quizzes, and personalised study paths.",
        techStack: ["Neo4j", "OpenAI", "Next.js"],
        duration: "16 hrs",
        deliverables: [
          "Graph store for knowledge dependencies",
          "Quiz generation and spaced repetition scheduler",
          "Usage analytics & outcome tracking",
        ],
      },
    ],
  },
  {
    id: "mcp",
    title: "Model Context Protocol",
    difficulty: "intermediate",
    category: "AI Infrastructure",
    tags: ["Protocol Design", "Interoperability", "Toolchains"],
    progress: 47,
    completedModules: 3,
    totalModules: 10,
    nextTopic: "Resource URI Scoping",
    eta: "16 min",
    topics: [
      {
        id: "mcp-handshake",
        title: "Handshake Frames & Metadata",
        description:
          "Assemble handshake payloads that advertise client identity and capability versions.",
        status: "completed",
        language: "Python",
        code: `handshake = build_handshake(
    "zapminds-shell",
    [{"name": "fs/read", "version": "1.0"}]
)`,
      },
      {
        id: "mcp-negotiation",
        title: "Capability Negotiation",
        description:
          "Match requested capabilities with provider support and prioritize the best versions.",
        status: "in-progress",
        language: "Python",
        code: `matches = negotiate_capabilities(
    {"search": ["1.0", "1.1"], "fs/read": ["1.0"]},
    [{"name": "search", "min_version": "1.1", "priority": 0}]
)`,
      },
      {
        id: "mcp-telemetry",
        title: "Telemetry Bundles",
        description:
          "Batch protocol telemetry under byte budgets before shipping to observability stacks.",
        status: "locked",
        language: "Python",
        code: `bundles = list(bundle_events(log_events, max_bytes=1024))`,
      },
    ],
    projects: [
      {
        id: "mcp-devtools",
        title: "MCP DevTools Extension",
        summary:
          "Browser extension that inspects MCP traffic, visualises payloads, and validates contracts.",
        techStack: ["Vite", "MCP JS SDK", "WebSockets"],
        duration: "14 hrs",
        deliverables: [
          "Traffic inspector UI",
          "Schema validation warnings",
          "Session export for debugging",
        ],
      },
      {
        id: "mcp-observability",
        title: "Observability Control Plane",
        summary:
          "Central dashboard aggregating metrics, traces, and alerts for active MCP sessions.",
        techStack: ["OpenTelemetry", "ClickHouse", "Grafana"],
        duration: "18 hrs",
        deliverables: [
          "Collector and ingestion pipeline",
          "Unified timeline view of requests",
          "Policy violation alerting",
        ],
      },
      {
        id: "mcp-marketplace",
        title: "Capability Marketplace",
        summary:
          "Marketplace where providers register capabilities and consumers subscribe with quotas.",
        techStack: ["Next.js", "Stripe", "Postgres"],
        duration: "16 hrs",
        deliverables: [
          "Provider onboarding flow",
          "Usage metering & billing hooks",
          "Consumer dashboard with SLA tracking",
        ],
      },
    ],
  },
  {
    id: "agentic-ai",
    title: "Agentic AI Applications",
    difficulty: "expert",
    category: "Autonomous Agents",
    tags: ["Planning", "Multi-agent", "Monitoring"],
    progress: 39,
    completedModules: 3,
    totalModules: 10,
    nextTopic: "Adaptive Goal Re-planning",
    eta: "21 min",
    topics: [
      {
        id: "agent-goal-profiles",
        title: "Goal Profiles & Constraints",
        description:
          "Normalise objectives with priorities and constraints so planners know what to protect.",
        status: "completed",
        language: "Python",
        code: `goal = build_goal_profile({
    "name": "Launch onboarding",
    "priority": 2,
    "success_metrics": ["activation-rate", "nps"],
    "constraints": ["security-review"],
})`,
      },
      {
        id: "agent-scheduling",
        title: "Event Loop & Throttling",
        description:
          "Prototype a round-robin scheduler that prevents starvation while respecting concurrency caps.",
        status: "in-progress",
        language: "Python",
        code: `order = schedule({1: ["plan"], 2: ["review"]}, concurrency=1)`,
      },
      {
        id: "agent-risk",
        title: "Proactive Risk Monitoring",
        description:
          "Audit proposed actions for policy violations before the agent executes them.",
        status: "locked",
        language: "Python",
        code: `report = risk_report(
    [{"name": "delete_db", "risk_scores": {"safety": 0.9}, "prohibited": True}],
    {"safety": 1.0}
)`,
      },
    ],
    projects: [
      {
        id: "agent-growth",
        title: "Growth Analyst Agent",
        summary:
          "Autonomous agent that ingests analytics, drafts experiment briefs, and syncs with PM tools.",
        techStack: ["LangGraph", "dbt", "ClickHouse"],
        duration: "18 hrs",
        deliverables: [
          "Daily briefing report",
          "Notion integration with experiment backlog",
          "Self-healing monitoring & alerting",
        ],
      },
      {
        id: "agent-product-builder",
        title: "Product Builder Collective",
        summary:
          "Team of agents that ideate, prototype UI wireframes, and generate code scaffolds.",
        techStack: ["Figma API", "OpenAI", "Supabase"],
        duration: "24 hrs",
        deliverables: [
          "Agent roles with personas",
          "Prototype QA checklist",
          "Repository scaffolding generator",
        ],
      },
      {
        id: "agent-security",
        title: "SecOps Threat Hunter",
        summary:
          "Agent monitors logs, enriches IoCs, and files incident reports with recommended remediation.",
        techStack: ["MISP", "Elastic SIEM", "LangChain"],
        duration: "20 hrs",
        deliverables: [
          "Streaming log ingestion & triage workflow",
          "Auto-generated incident reports",
          "Escalation ladder with human approvals",
        ],
      },
    ],
  },
]);
const selectedCourseId = ref(courses[0]?.id ?? "");

const selectedCourse = computed(() =>
  courses.find((course) => course.id === selectedCourseId.value)
);

const weeklyGoalPercent = computed(() => {
  if (!weeklyGoal.total) {
    return 0;
  }

  return Math.round((weeklyGoal.completed / weeklyGoal.total) * 100);
});

const onSelectCourse = (id: string) => {
  selectedCourseId.value = id;
};

const topicStatusLabel = (status: TopicStatus) => {
  switch (status) {
    case "completed":
      return UIElements.dashboard.topicStatus.completed;
    case "in-progress":
      return UIElements.dashboard.topicStatus.inProgress;
    case "locked":
    default:
      return UIElements.dashboard.topicStatus.locked;
  }
};

const onLogout = async () => {
  logout();
  await router.push("/login");
};
</script>

<template>
  <section :class="$style.root">
    <div class="container grid" :class="$style.hero">
      <div :class="$style['hero-primary']">
        <span :class="$style.badge">
          {{ UIElements.dashboard.activeDayStreak(streakDays) }}
        </span>
        <h1 :class="$style.title">
          {{ UIElements.dashboard.greeting(studentName) }}
        </h1>
        <p :class="$style.subtitle">
          {{ UIElements.dashboard.headline }}
        </p>

        <div :class="$style['hero-stats']">
          <div>
            <span :class="$style['hero-stats__label']">XP</span>
            <span :class="$style['hero-stats__value']">
              {{ UIElements.dashboard.xpLabel(totalXp) }}
            </span>
          </div>
          <div>
            <span :class="$style['hero-stats__label']">Solved today</span>
            <span :class="$style['hero-stats__value']">
              {{ solvedToday }}
            </span>
          </div>
          <div>
            <span :class="$style['hero-stats__label']">Review queue</span>
            <span :class="$style['hero-stats__value']">
              {{ reviewQueue }}
            </span>
          </div>
        </div>

        <div :class="$style['hero-actions']">
          <NuxtLink :class="$style['hero-cta']" to="/courses/current">
            {{ UIElements.dashboard.continueCta }}
          </NuxtLink>

          <button type="button" :class="$style['hero-secondary']" @click="onLogout">
            {{ UIElements.auth.logoutCta }}
          </button>
        </div>
      </div>

      <div :class="$style['insight-card']">
        <div>
          <span :class="$style['insight-card__label']">
            {{ UIElements.dashboard.insights.weeklyGoal }}
          </span>
          <strong :class="$style['insight-card__value']">
            {{ weeklyGoalPercent }}%
          </strong>
          <p :class="$style['insight-card__note']">
            {{ weeklyGoal.completed }} / {{ weeklyGoal.total }} modules
          </p>
          <span
            :class="$style['progress-ring']"
            role="progressbar"
            :aria-valuenow="weeklyGoalPercent"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <span :style="{ '--progress': weeklyGoalPercent / 100 }"></span>
          </span>
        </div>

        <div>
          <span :class="$style['insight-card__label']">
            {{ UIElements.dashboard.insights.solvedToday(solvedToday) }}
          </span>
          <span :class="$style['pill']">Keep the streak alive!</span>
        </div>

        <div>
          <span :class="$style['insight-card__label']">
            {{ UIElements.dashboard.insights.reviewQueue(reviewQueue) }}
          </span>
          <NuxtLink to="/review" :class="$style.link">
            Review now
          </NuxtLink>
        </div>

        <NuxtLink to="/leaderboard" :class="$style['insight-card__cta']">
          View Leaderboard
          <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M13.5 1L18 6L13.5 11"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path d="M2 6H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </NuxtLink>
      </div>
    </div>

    <section :class="$style.courses">
      <div class="container grid">
        <header :class="$style['courses-header']">
          <h2>{{ UIElements.dashboard.coursesTitle }}</h2>
          <p>
            Choose a course to inspect your module roadmap and jump into the next challenge.
          </p>
        </header>

        <ul :class="$style['course-grid']">
          <li
            v-for="course in courses"
            :key="course.id"
            :class="[
              $style['course-card'],
              course.id === selectedCourseId && $style['course-card--is-active'],
            ]"
          >
            <button
              type="button"
              :class="$style['course-card__link']"
              @click="onSelectCourse(course.id)"
            >
              <div :class="$style['course-card__top']">
                <div :class="$style['course-card__labels']">
                  <span>{{ course.category }}</span>
                  <span>{{ UIElements.dashboard.difficultyLabels[course.difficulty] }}</span>
                </div>
                <h3 :class="$style['course-card__title']">
                  {{ course.title }}
                </h3>
              </div>

              <div :class="$style['course-card__progress']">
                <div :class="$style['course-card__progress-stats']">
                  <strong>
                    {{ UIElements.dashboard.courseProgressLabel(course.completedModules, course.totalModules) }}
                  </strong>
                  <span>{{ UIElements.dashboard.xpLabel(course.progress * 10) }}</span>
                </div>
                <div :class="$style['course-card__progress-track']">
                  <span :style="{ '--progress': course.progress / 100 }"></span>
                </div>
              </div>

              <div :class="$style['course-card__next']">
                <div :class="$style['course-card__next-copy']">
                  <span>{{ UIElements.dashboard.nextUpLabel }}</span>
                  <strong>{{ course.nextTopic }}</strong>
                </div>
                <span :class="$style['course-card__eta']">{{ course.eta }}</span>
              </div>

              <div :class="$style['course-card__tags']">
                <span v-for="tag in course.tags" :key="tag">{{ tag }}</span>
              </div>

              <div :class="$style['course-card__cta']">
                <span>{{ UIElements.dashboard.courseAction }}</span>
                <svg width="28" height="12" viewBox="0 0 28 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M20.5 1L26 6L20.5 11"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path d="M1 6H25.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </div>
            </button>
          </li>
        </ul>
      </div>
    </section>

    <section :class="$style['course-detail']" v-if="selectedCourse">
      <div class="container grid">
        <header :class="$style['course-detail__header']">
          <h2>{{ selectedCourse.title }}</h2>
          <NuxtLink
            :class="$style['hero-cta']"
            :to="`/courses/${selectedCourse.id}`"
          >
            {{ UIElements.dashboard.courseAction }}
          </NuxtLink>
        </header>

        <ul :class="$style['topics-list']">
          <li v-for="topic in selectedCourse.topics" :key="topic.id">
            <div :class="$style['topic-header']">
              <div>
                <span :class="$style['topic-status']">
                  {{ topicStatusLabel(topic.status) }}
                </span>
                <h3>{{ topic.title }}</h3>
              </div>
              <span :class="[$style['pill'], $style['pill--language']]">
                {{ UIElements.dashboard.codePreviewLabel(topic.language) }}
              </span>
            </div>
            <p :class="$style['topic-description']">
              {{ topic.description }}
            </p>
            <pre :class="$style['code-block']"><code>{{ topic.code }}</code></pre>
          </li>
        </ul>

        <div
          v-if="selectedCourse.projects && selectedCourse.projects.length"
          :class="$style['projects-panel']"
        >
          <div :class="$style['projects-panel__header']">
            <h3>Portfolio projects</h3>
            <p>
              Shipable builds that reinforce the module concepts and round out your Zapminds portfolio.
            </p>
          </div>

          <ul :class="$style['projects-list']">
            <li v-for="project in selectedCourse.projects" :key="project.id">
              <article :class="$style['project-card']">
                <header>
                  <span :class="$style['project-duration']">{{ project.duration }}</span>
                  <h4>{{ project.title }}</h4>
                  <p>{{ project.summary }}</p>
                </header>

                <div :class="$style['project-meta']">
                  <strong>Stack</strong>
                  <ul>
                    <li v-for="tech in project.techStack" :key="tech">{{ tech }}</li>
                  </ul>
                </div>

                <div :class="$style['project-deliverables']">
                  <strong>Deliverables</strong>
                  <ul>
                    <li v-for="deliverable in project.deliverables" :key="deliverable">
                      {{ deliverable }}
                    </li>
                  </ul>
                </div>
              </article>
            </li>
          </ul>
        </div>
      </div>
    </section>

  </section>
</template>

<style module lang="scss">
.root {
  padding: calc(var(--height-space) * 0.25) 0 var(--height-space) 0;
  display: flex;
  flex-direction: column;
  gap: calc(var(--height-space) * 0.6);
}

.hero {
  align-items: start;
  row-gap: calc(var(--gutter-size) * 3);
}

.hero-primary {
  grid-column: 3 / 15;
  background: color-mix(in srgb, var(--foreground-color) 8%, transparent);
  border-radius: 2rem;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 15%, transparent);
  box-shadow: 0 25px 80px color-mix(in srgb, #000 22%, transparent);

  @media screen and (max-aspect-ratio: 12 / 8) {
    grid-column: 2 / 12;
  }

  @media screen and (orientation: portrait) {
    grid-column: 1 / -1;
  }
}

.badge {
  display: inline-flex;
  align-self: flex-start;
  padding: 0.35rem 1rem;
  border-radius: 999px;
  border: 1px solid currentColor;
  font-family: var(--display-font);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.7rem;
}

.title {
  @include section-title;
  transform: none;
  -webkit-text-stroke: 0;
  text-align: left;
}

.subtitle {
  max-width: 32ch;
  font-size: 1.1rem;
  opacity: 0.85;
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;

  &__label {
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.65;
  }

  &__value {
    display: block;
    font-family: var(--display-font);
    font-size: 1.4rem;
    margin-top: 0.25rem;
  }
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-cta {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1.4rem;
  border-radius: 999px;
  text-decoration: none;
  font-family: var(--display-font);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  background: var(--foreground-color);
  color: var(--background-color);
  transition: transform 0.35s ease(out-cubic),
    box-shadow 0.35s ease(out-cubic);

  &:hover,
  &:focus-visible {
    transform: translate3d(0, -0.2rem, 0);
    box-shadow: 0 18px 45px color-mix(in srgb, var(--foreground-color) 25%, transparent);
  }
}

.hero-secondary {
  border: 1px solid color-mix(in srgb, var(--foreground-color) 25%, transparent);
  border-radius: 999px;
  padding: 0.85rem 1.35rem;
  background: transparent;
  color: inherit;
  font-family: var(--display-font);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: transform 0.35s ease(out-cubic),
    border-color 0.35s ease(out-cubic),
    background-color 0.35s ease(out-cubic);

  &:hover,
  &:focus-visible {
    transform: translate3d(0, -0.15rem, 0);
    border-color: var(--foreground-color);
    background: color-mix(in srgb, var(--foreground-color) 10%, transparent);
  }
}

.insight-card {
  grid-column: 16 / 23;
  display: grid;
  gap: 1.5rem;
  background: color-mix(in srgb, var(--background-color) 92%, transparent);
  border-radius: 1.75rem;
  padding: 2.5rem;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 12%, transparent);
  position: relative;

  @media screen and (max-aspect-ratio: 12 / 8) {
    grid-column: 2 / 12;
  }

  @media screen and (orientation: portrait) {
    grid-column: 1 / -1;
  }

  &__label {
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.7;
  }

  &__value {
    display: block;
    font-family: var(--display-font);
    font-size: 2.4rem;
    line-height: 1;
  }

  &__note {
    margin: 0.25rem 0 0 0;
    font-size: 0.9rem;
    opacity: 0.7;
  }

  &__cta {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    margin-top: 0.5rem;
    padding: 0.65rem 1.2rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--accent-color, #ffd454) 35%, transparent);
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--accent-color, #ffd454) 35%, transparent) 0%,
      color-mix(in srgb, var(--accent-color, #ffd454) 18%, transparent) 100%
    );
    color: var(--foreground-color);
    font-family: var(--display-font);
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-decoration: none;
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;

    svg {
      transition: transform 0.25s ease;
    }

    &:hover,
    &:focus-visible {
      transform: translate3d(0, -0.15rem, 0);
      border-color: color-mix(in srgb, var(--accent-color, #ffd454) 55%, transparent);
      box-shadow: 0 18px 35px color-mix(in srgb, var(--accent-color, #ffd454) 25%, transparent);

      svg {
        transform: translateX(4px);
      }
    }
  }
}

.progress-ring {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 7.25rem;
  height: 7.25rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background:
    radial-gradient(
      circle at center,
      color-mix(in srgb, var(--background-color) 85%, transparent) 58%,
      transparent 60%
    );
  border: 1px solid color-mix(in srgb, var(--foreground-color) 15%, transparent);
  box-shadow: 0 25px 60px color-mix(in srgb, #000 24%, transparent);

  span {
    position: relative;
    width: 5.5rem;
    height: 5.5rem;
    border-radius: 50%;
    --progress: 0;
    background:
      conic-gradient(
        var(--color-palette-3) calc(var(--progress) * 360deg),
        color-mix(in srgb, var(--foreground-color) 10%, transparent)
          calc(var(--progress) * 360deg)
      );
    mask: radial-gradient(circle at center, transparent 58%, black 59%);
    transform: rotate(-90deg);

    &:after {
      content: "";
      position: absolute;
      inset: 18%;
      border-radius: 50%;
      background: color-mix(in srgb, var(--background-color) 94%, transparent);
      box-shadow: inset 0 0 25px color-mix(in srgb, var(--foreground-color) 10%, transparent);
    }
  }
}

.pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 15%, transparent);
  padding: 0.4rem 0.9rem;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.85;

  &--language {
    background: color-mix(in srgb, var(--foreground-color) 8%, transparent);
  }
}

.link {
  color: inherit;
  text-decoration: none;
  position: relative;
  padding-bottom: 0.2rem;

  &:after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    height: 1px;
    width: 100%;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.25s ease(out-cubic);
  }

  &:hover:after,
  &:focus-visible:after {
    transform: scaleX(1);
  }
}

.courses {
  .container {
    row-gap: calc(var(--gutter-size) * 3);
  }
}

.courses-header {
  grid-column: 3 / 13;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media screen and (max-aspect-ratio: 12 / 8) {
    grid-column: 2 / 12;
  }

  @media screen and (orientation: portrait) {
    grid-column: 1 / -1;
  }

  h2 {
    @include section-title;
    transform: none;
    -webkit-text-stroke: 0;
    text-align: left;
  }

  p {
    font-size: 1rem;
    opacity: 0.75;
    margin: 0;
  }
}

.course-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  grid-column: 3 / 23;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: calc(var(--gutter-size) * 2);

  @media screen and (max-aspect-ratio: 12 / 8) {
    grid-column: 2 / 12;
  }

  @media screen and (orientation: portrait) {
    grid-column: 1 / -1;
  }
}

.course-card {
  height: 90%;

  &__link {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.05rem 1.2rem;
    border-radius: 1.6rem;
    border: 1px solid color-mix(in srgb, var(--foreground-color) 12%, transparent);
    appearance: none;
    width: 100%;
    background: radial-gradient(
        circle at 20% -10%,
        color-mix(in srgb, var(--foreground-color) 18%, transparent) 0%,
        transparent 60%
      ),
      color-mix(in srgb, var(--background-color) 96%, transparent);
    color: inherit;
    cursor: pointer;
    text-decoration: none;
    height: 100%;
    position: relative;
    isolation: isolate;
    overflow: hidden;
    transition: transform 0.35s ease(out-cubic), border-color 0.35s ease(out-cubic),
      box-shadow 0.35s ease(out-cubic), background 0.45s ease(out-cubic);

    &:before {
      content: "";
      position: absolute;
      inset: -40% -20% auto;
      height: 80%;
      background: radial-gradient(
        circle,
        color-mix(in srgb, var(--foreground-color) 18%, transparent) 0%,
        transparent 60%
      );
      opacity: 0;
      transition: opacity 0.45s ease(out-cubic);
      z-index: -1;
    }

    &:hover,
    &:focus-visible {
      transform: translate3d(0, -0.2rem, 0);
      border-color: var(--foreground-color);
      box-shadow: 0 24px 55px color-mix(in srgb, var(--foreground-color) 24%, transparent);

      &:before {
        opacity: 0.6;
      }
    }
  }

  &--is-active &__link {
    border-color: var(--foreground-color);
    box-shadow: 0 24px 55px color-mix(in srgb, var(--foreground-color) 28%, transparent);
  }

  &__title {
    font-family: var(--display-font);
    font-size: 1.5rem;
    margin: 0;
    line-height: 1.05;
  }

  &__progress {
    display: grid;
    gap: 0.5rem;
  }

  &__progress-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;

    strong {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    span {
      font-size: 0.75rem;
      opacity: 0.6;
      letter-spacing: 0.08em;
    }
  }

  &__progress-track {
    width: 100%;
    height: 0.35rem;
    background: color-mix(in srgb, var(--foreground-color) 14%, transparent);
    border-radius: 999px;
    overflow: hidden;

    span {
      display: block;
      height: 100%;
      width: calc(var(--progress) * 100%);
      background: linear-gradient(
        90deg,
        var(--foreground-color) 0%,
        color-mix(in srgb, var(--foreground-color) 50%, transparent) 100%
      );
      transition: width 0.45s ease(out-cubic);
    }
  }

  &__top {
    display: grid;
    gap: 1rem;
  }

  &__labels {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;

    span {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      opacity: 0.65;
    }
  }

  &__next {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.8rem;
    border-radius: 0.9rem;
    padding: 0.75rem 0.85rem;
    background: color-mix(in srgb, var(--foreground-color) 10%, transparent);
  }

  &__next-copy {
    display: grid;
    gap: 0.2rem;

    span {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      opacity: 0.7;
    }

    strong {
      font-size: 1rem;
      letter-spacing: 0.05em;
    }
  }

  &__eta {
    font-size: 0.9rem;
    font-family: var(--display-font);
    letter-spacing: 0.12em;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;

    span {
      padding: 0.35rem 0.7rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--foreground-color) 8%, transparent);
      color: var(--foreground-color);
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      opacity: 0.75;
    }
  }

  &__cta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.6rem;
    margin-top: auto;
    padding-top: 0.35rem;
    font-family: var(--display-font);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.8rem;
    opacity: 0.85;

    svg {
      flex-shrink: 0;
    }
  }
}

.course-detail {
  .container {
    row-gap: calc(var(--gutter-size) * 2);
  }

  &__header {
    grid-column: 3 / 23;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    @media screen and (max-aspect-ratio: 12 / 8) {
      grid-column: 2 / 12;
    }

    @media screen and (orientation: portrait) {
      grid-column: 1 / -1;
      flex-direction: column;
      align-items: flex-start;
    }

    h2 {
      @include section-title;
      transform: none;
      -webkit-text-stroke: 0;
      text-align: left;
      margin: 0;
    }
  }
}

.topics-list {
  grid-column: 3 / 23;
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 2rem;

  @media screen and (max-aspect-ratio: 12 / 8) {
    grid-column: 2 / 12;
  }

  @media screen and (orientation: portrait) {
    grid-column: 1 / -1;
  }

  li {
    padding: 2rem;
    border-radius: 1.5rem;
    border: 1px solid color-mix(in srgb, var(--foreground-color) 12%, transparent);
    background: color-mix(in srgb, var(--background-color) 97%, transparent);
    box-shadow: 0 18px 45px color-mix(in srgb, #000 15%, transparent);
  }
}

.projects-panel {
  grid-column: 3 / 23;
  display: grid;
  gap: 1.75rem;
  margin-top: 1rem;
  padding: 2.25rem;
  border-radius: 1.75rem;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 12%, transparent);
  background: color-mix(in srgb, var(--background-color) 95%, transparent);
  box-shadow: 0 22px 55px color-mix(in srgb, #000 18%, transparent);

  @media screen and (max-aspect-ratio: 12 / 8) {
    grid-column: 2 / 12;
  }

  @media screen and (orientation: portrait) {
    grid-column: 1 / -1;
    padding: 1.75rem;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;

    h3 {
      font-family: var(--display-font);
      text-transform: uppercase;
      margin: 0;
      letter-spacing: 0.08em;
    }

    p {
      margin: 0;
      font-size: 0.95rem;
      opacity: 0.75;
      max-width: 52ch;
    }
  }
}

.projects-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1.5rem;

  @media screen and (min-width: 1200px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media screen and (max-width: 1199px) {
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  }
}

.project-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.75rem;
  border-radius: 1.5rem;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 12%, transparent);
  background: color-mix(in srgb, var(--background-color) 98%, transparent);
  position: relative;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at top right,
      color-mix(in srgb, var(--foreground-color) 10%, transparent) 0%,
      transparent 60%
    );
    opacity: 0.6;
    pointer-events: none;
  }

  header {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    h4 {
      margin: 0;
      font-family: var(--display-font);
      font-size: 1.25rem;
      letter-spacing: 0.05em;
    }

    p {
      margin: 0;
      font-size: 0.95rem;
      opacity: 0.8;
      line-height: 1.5;
    }
  }
}

.project-duration {
  align-self: flex-start;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 18%, transparent);
}

.project-meta,
.project-deliverables {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  strong {
    font-family: var(--display-font);
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  ul {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem 0.65rem;
    margin: 0;
    padding: 0;
    font-size: 0.85rem;
    opacity: 0.85;
  }
}

.project-meta ul li {
  border: 1px solid color-mix(in srgb, var(--foreground-color) 20%, transparent);
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
}

.project-deliverables ul {
  flex-direction: column;
  gap: 0.4rem;

  li {
    position: relative;
    padding-left: 1.25rem;

    &:before {
      content: "•";
      position: absolute;
      left: 0;
      color: var(--foreground-color);
    }
  }
}

.topic-header {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;

  h3 {
    font-family: var(--display-font);
    font-size: 1.5rem;
    margin: 0;
  }
}

.topic-status {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.6;
  display: block;
}

.topic-description {
  margin: 1rem 0 1.5rem 0;
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.8;
}

.code-block {
  margin: 0;
  border-radius: 1rem;
  background: color-mix(in srgb, var(--foreground-color) 8%, transparent);
  padding: 1.5rem;
  font-family: "Fira Code", "Source Code Pro", monospace;
  font-size: 0.9rem;
  line-height: 1.65;
  overflow-x: auto;
  border: 1px solid color-mix(in srgb, var(--foreground-color) 15%, transparent);
}

</style>
