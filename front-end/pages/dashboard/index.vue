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
    progress: 40,
    completedModules: 4,
    totalModules: 10,
    nextTopic: "Iteration Patterns",
    eta: "18 min",
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
    progress: 58,
    completedModules: 15,
    totalModules: 26,
    nextTopic: "Model Explainability Playbook",
    eta: "18 min",
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
    completedModules: 11,
    totalModules: 25,
    nextTopic: "Diffusion Models Primer",
    eta: "22 min",
    topics: [
      {
        id: "dl-lightning",
        title: "Training Loops with Lightning",
        description:
          "Standardize experiments using PyTorch Lightning modules and callbacks.",
        status: "completed",
        language: "Python",
        code: `class Classifier(pl.LightningModule):
    def __init__(self, model, lr: float = 3e-4):
        super().__init__()
        self.model = model
        self.lr = lr

    def training_step(self, batch, _):
        x, y = batch
        logits = self.model(x)
        loss = F.cross_entropy(logits, y)
        self.log("train_loss", loss)
        return loss`,
      },
      {
        id: "dl-mixed-precision",
        title: "Mixed Precision Mastery",
        description:
          "Accelerate training with gradient scaling and monitor stability using AMP.",
        status: "in-progress",
        language: "Python",
        code: `scaler = torch.cuda.amp.GradScaler()

for inputs, labels in dataloader:
    optimizer.zero_grad()
    with torch.cuda.amp.autocast():
        outputs = model(inputs)
        loss = criterion(outputs, labels)
    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()`,
      },
      {
        id: "dl-checkpoints",
        title: "Checkpointing & Tracking",
        description:
          "Streamline runs with weight decay schedules and reproducibility envelopes.",
        status: "locked",
        language: "Python",
        code: `from torch.utils.data import random_split

def split_dataset(dataset, seed: int = 42):
    torch.manual_seed(seed)
    train_len = int(len(dataset) * 0.8)
    return random_split(dataset, [train_len, len(dataset) - train_len])`,
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
    completedModules: 16,
    totalModules: 26,
    nextTopic: "Guardrail Policies",
    eta: "14 min",
    topics: [
      {
        id: "llm-evals",
        title: "Building LLM Evaluation Suites",
        description:
          "Construct custom rubric-based evaluators, synthetic test cases, and regression dashboards.",
        status: "completed",
        language: "TypeScript",
        code: `import { evaluate } from "@openai/evals"

export const rubric = {
  name: "zapminds-critique",
  prompt: "Score the response 1-5 on accuracy and actionability.",
};

const result = await evaluate({
  model: "gpt-4o-mini",
  data: "./datasets/support.jsonl",
  rubric
});`,
      },
      {
        id: "llm-tools",
        title: "Structured Tool Invocation",
        description:
          "Build agent runtimes that enforce JSON schema outputs, retries, and circuit breakers.",
        status: "in-progress",
        language: "TypeScript",
        code: `type WeatherTool = {
  city: string;
  unit: "celsius" | "fahrenheit";
};

const response = await openai.responses.create({
  model: "gpt-4.1",
  response_format: { type: "json_schema", json_schema: schema },
  tools: [weatherTool],
  tool_choice: "auto",
});`,
      },
      {
        id: "llm-memory",
        title: "Conversation Memory Architecture",
        description:
          "Persist hybrid memory graphs mixing vector similarity, key moments, and reflections.",
        status: "locked",
        language: "TypeScript",
        code: `const memory = await ragStore.multiVector.upsert({
  id: session.id,
  embeddings: {
    semantic: embed(response.message),
    intent: embedIntent(response.intent)
  },
  metadata: response.metadata,
});`,
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
    completedModules: 13,
    totalModules: 25,
    nextTopic: "Adaptive Chunk Sizes",
    eta: "16 min",
    topics: [
      {
        id: "rag-chunking",
        title: "Adaptive Chunking Strategies",
        description:
          "Compare semantic, structural, and hierarchical chunking with instrumentation.",
        status: "completed",
        language: "TypeScript",
        code: `import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 800,
  chunkOverlap: 120,
  separators: ["\n\n", "\n", ".", " "],
});

const docs = await splitter.createDocuments(rawDocs);`,
      },
      {
        id: "rag-hybrid-search",
        title: "Hybrid Retrieval Engines",
        description:
          "Blend dense, sparse, and metadata filtering inside a routing orchestrator.",
        status: "in-progress",
        language: "TypeScript",
        code: `const search = await retriever.hybrid({
  query,
  dense: { k: 6 },
  sparse: { k: 4 },
  filters: { course: ["python", "ml"] },
});`,
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
    completedModules: 12,
    totalModules: 24,
    nextTopic: "Capability Negotiation",
    eta: "19 min",
    topics: [
      {
        id: "mcp-providers",
        title: "Designing MCP Providers",
        description:
          "Build providers that describe capabilities, auth models, and streaming semantics.",
        status: "completed",
        language: "TypeScript",
        code: `const provider: MCPProvider = {
  name: "zapminds-code",
  version: "0.1.0",
  capabilities: ["fs/read", "fs/write", "search"],
  auth: { type: "api_key" },
};`,
      },
      {
        id: "mcp-routing",
        title: "Capability Routing Graphs",
        description:
          "Compose providers together and route calls based on latency, policy, and data gravity.",
        status: "in-progress",
        language: "TypeScript",
        code: `const router = new CapabilityRouter({
  providers: [docsProvider, codeProvider],
  strategy: "latency-first",
  policies: [{ capability: "search", allow: ["docsProvider"] }],
});`,
      },
      {
        id: "mcp-security",
        title: "Security & Observability",
        description:
          "Implement capability-level access control, request tracing, and audit trails.",
        status: "locked",
        language: "TypeScript",
        code: `router.on("request", (event) => {
  audit.log({
    capability: event.capability,
    actor: event.actor,
    durationMs: event.duration,
    payloadHash: sha256(event.payload),
  });
});`,
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
    completedModules: 9,
    totalModules: 23,
    nextTopic: "Adaptive Goal Re-planning",
    eta: "21 min",
    topics: [
      {
        id: "agent-planners",
        title: "Task Decomposition & Planning",
        description:
          "Compare tree-of-thought, reflexion, and hierarchical planning architectures.",
        status: "completed",
        language: "TypeScript",
        code: `const plan = await planner.generate({
  goal: "Ship onboarding flow",
  prompts: templates.taskDecomposition,
  toolkit: ["jira", "github", "figma"],
});`,
      },
      {
        id: "agent-swarms",
        title: "Multi-agent Collaboration",
        description:
          "Coordinate specialist agents with blackboard patterns, arbitration, and credit assignment.",
        status: "in-progress",
        language: "TypeScript",
        code: `const swarm = new AgentSwarm({ agents: [designer, engineer, analyst] });
swarm.subscribe("progress", (event) => {
  timeline.push(event);
});`,
      },
      {
        id: "agent-guardrails",
        title: "Runtime Safety & Monitoring",
        description:
          "Instrument agents with guardrails, kill-switches, and realtime drift detection.",
        status: "locked",
        language: "TypeScript",
        code: `monitor.on("action", (action) => {
  if (!policy.isAllowed(action)) {
    action.cancel("Policy violation");
  }
});`,
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

const leaderboard = [
  {
    name: "Ananya S.",
    rank: 1,
    xp: 2140,
    streak: 12,
  },
  {
    name: "Rohan K.",
    rank: 2,
    xp: 1985,
    streak: 9,
  },
  {
    name: "Neha P.",
    rank: 3,
    xp: 1902,
    streak: 7,
  },
  {
    name: "Arjun M.",
    rank: 4,
    xp: 1760,
    streak: 5,
  },
  {
    name: "Sara V.",
    rank: 5,
    xp: 1715,
    streak: 4,
  },
];

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
            <button type="button" @click="onSelectCourse(course.id)">
              <div :class="$style['course-card__meta']">
                <span :class="$style['course-card__category']">
                  {{ course.category }}
                </span>
                <span :class="$style['course-card__difficulty']">
                  {{ UIElements.dashboard.difficultyLabels[course.difficulty] }}
                </span>
              </div>
              <h3 :class="$style['course-card__title']">{{ course.title }}</h3>
              <p :class="$style['course-card__subtitle']">
                {{ UIElements.dashboard.courseProgressLabel(course.completedModules, course.totalModules) }}
              </p>
              <div :class="$style['course-card__progress']">
                <span :style="{ '--progress': course.progress / 100 }"></span>
              </div>
              <div :class="$style['course-card__footer']">
                <div>
                  <span>{{ UIElements.dashboard.nextUpLabel }}</span>
                  <strong>{{ course.nextTopic }}</strong>
                </div>
                <span :class="$style['course-card__eta']">{{ course.eta }}</span>
              </div>
              <ul :class="$style['course-card__tags']">
                <li v-for="tag in course.tags" :key="tag">{{ tag }}</li>
              </ul>
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

    <section :class="$style.leaderboard">
      <div class="container grid">
        <header :class="$style['leaderboard-header']">
          <h2>{{ UIElements.dashboard.leaderboardTitle }}</h2>
          <p>{{ UIElements.dashboard.leaderboardUpdated }}</p>
          <NuxtLink to="/leaderboard" :class="$style.link">
            {{ UIElements.dashboard.leaderboardCta }}
          </NuxtLink>
        </header>

        <ul :class="$style['leaderboard-list']">
          <li v-for="player in leaderboard" :key="player.rank">
            <div :class="$style['leaderboard-rank']">#{{ player.rank }}</div>
            <div>
              <span :class="$style['leaderboard-name']">{{ player.name }}</span>
              <span :class="$style['leaderboard-streak']">
                {{ UIElements.dashboard.activeDayStreak(player.streak) }}
              </span>
            </div>
            <span :class="$style['leaderboard-xp']">
              {{ UIElements.dashboard.xpLabel(player.xp) }}
            </span>
          </li>
        </ul>
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
  gap: var(--gutter-size);

  @media screen and (max-aspect-ratio: 12 / 8) {
    grid-column: 2 / 12;
  }

  @media screen and (orientation: portrait) {
    grid-column: 1 / -1;
  }
}

.course-card {
  height: 100%;

  button {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.75rem;
    border-radius: 1.5rem;
    border: 1px solid color-mix(in srgb, var(--foreground-color) 12%, transparent);
    background: color-mix(in srgb, var(--background-color) 96%, transparent);
    color: var(--foreground-color);
    cursor: pointer;
    text-align: left;
    transition: transform 0.35s ease(out-cubic),
      border-color 0.35s ease(out-cubic),
      box-shadow 0.35s ease(out-cubic);

    &:hover,
    &:focus-visible {
      transform: translate3d(0, -0.2rem, 0);
      border-color: var(--foreground-color);
      box-shadow: 0 18px 45px color-mix(in srgb, var(--foreground-color) 20%, transparent);
    }
  }

  &--is-active button {
    border-color: var(--foreground-color);
    box-shadow: 0 18px 45px color-mix(in srgb, var(--foreground-color) 25%, transparent);
  }

  &__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--foreground-color);
    opacity: 0.75;
  }

  &__title {
    font-family: var(--display-font);
    font-size: 1.4rem;
    margin: 0;
  }

  &__subtitle {
    margin: 0;
    font-size: 0.9rem;
    color: var(--foreground-color);
    opacity: 0.7;
  }

  &__progress {
    width: 100%;
    height: 0.4rem;
    background: color-mix(in srgb, var(--foreground-color) 8%, transparent);
    border-radius: 999px;
    overflow: hidden;

    span {
      display: block;
      height: 100%;
      width: calc(var(--progress) * 100%);
      background: var(--foreground-color);
      transition: width 0.45s ease(out-cubic);
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    font-size: 0.85rem;

    span {
      display: block;
      color: var(--foreground-color);
      opacity: 0.65;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    strong {
      display: block;
      margin-top: 0.15rem;
      font-size: 1rem;
      color: var(--foreground-color);
      opacity: 0.95;
    }
  }

  &__eta {
    font-size: 0.9rem;
    font-family: var(--display-font);
    text-transform: uppercase;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      padding: 0.4rem 0.8rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--foreground-color) 10%, transparent);
      color: var(--foreground-color);
      font-size: 0.75rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.8;
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

.leaderboard {
  .container {
    row-gap: calc(var(--gutter-size) * 2);
  }
}

.leaderboard-header {
  grid-column: 3 / 11;
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
    margin: 0;
  }

  p {
    font-size: 0.95rem;
    opacity: 0.7;
    margin: 0;
  }
}

.leaderboard-list {
  grid-column: 11 / 23;
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 1rem;

  @media screen and (max-aspect-ratio: 12 / 8) {
    grid-column: 2 / 12;
  }

  @media screen and (orientation: portrait) {
    grid-column: 1 / -1;
  }

  li {
    display: grid;
    grid-template-columns: 3rem 1fr auto;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem 1.75rem;
    border-radius: 1.25rem;
    border: 1px solid color-mix(in srgb, var(--foreground-color) 12%, transparent);
    background: color-mix(in srgb, var(--background-color) 96%, transparent);
  }
}

.leaderboard-rank {
  font-family: var(--display-font);
  font-size: 1.4rem;
}

.leaderboard-name {
  font-family: var(--display-font);
  font-size: 1.1rem;
  display: block;
}

.leaderboard-streak {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.6;
}

.leaderboard-xp {
  font-family: var(--display-font);
  text-transform: uppercase;
  font-size: 0.95rem;
}
</style>
