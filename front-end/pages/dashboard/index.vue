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
}

const courses = reactive<Course[]>([
  {
    id: "dsa-foundations",
    title: "Data Structures Foundations",
    difficulty: "beginner",
    category: "Algorithms",
    tags: ["Arrays", "Two Pointers", "Hash Maps"],
    progress: 68,
    completedModules: 17,
    totalModules: 25,
    nextTopic: "Sliding Window Primer",
    eta: "12 min",
    topics: [
      {
        id: "two-sum",
        title: "Two Sum Warmup",
        description:
          "Use a hash map to find the two indices that sum to the target in linear time.",
        status: "completed",
        language: "TypeScript",
        code: `function twoSum(nums: number[], target: number): [number, number] | [] {
  const seen = new Map<number, number>();

  for (let i = 0; i < nums.length; i += 1) {
    const complement = target - nums[i];

    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }

    seen.set(nums[i], i);
  }

  return [];
}`,
      },
      {
        id: "move-zeroes",
        title: "Move Zeroes",
        description:
          "Shift all non-zero values forward while preserving the order. Keep it in-place.",
        status: "in-progress",
        language: "JavaScript",
        code: `const moveZeroes = (nums) => {
  let insert = 0;

  for (let i = 0; i < nums.length; i += 1) {
    if (nums[i] !== 0) {
      [nums[insert], nums[i]] = [nums[i], nums[insert]];
      insert += 1;
    }
  }

  return nums;
};`,
      },
      {
        id: "sliding-window",
        title: "Maximum Subarray Sum",
        description:
          "Classic sliding window to keep a running sum and maximize contiguous segments.",
        status: "locked",
        language: "Python",
        code: `def max_subarray(nums: list[int]) -> int:
    best = current = nums[0]

    for value in nums[1:]:
        current = max(value, current + value)
        best = max(best, current)

    return best`,
      },
    ],
  },
  {
    id: "graph-theory",
    title: "Graph Theory Lab",
    difficulty: "intermediate",
    category: "Graphs",
    tags: ["BFS", "DFS", "Topological Sort"],
    progress: 42,
    completedModules: 11,
    totalModules: 26,
    nextTopic: "Detect Cycle in Directed Graph",
    eta: "18 min",
    topics: [
      {
        id: "bfs-levels",
        title: "Breadth First Levels",
        description:
          "Traverse level by level using a queue. Track distance from source.",
        status: "completed",
        language: "Python",
        code: `from collections import deque

def bfs_levels(graph: dict[int, list[int]], source: int) -> dict[int, int]:
    queue = deque([source])
    distance = {source: 0}

    while queue:
        node = queue.popleft()

        for neighbor in graph[node]:
            if neighbor not in distance:
                distance[neighbor] = distance[node] + 1
                queue.append(neighbor)

    return distance`,
      },
      {
        id: "topo-sort",
        title: "Topological Sort",
        description:
          "Process nodes with zero in-degree using Kahn's algorithm for DAG scheduling.",
        status: "in-progress",
        language: "TypeScript",
        code: `export function topoSort(edges: number[][], nodes: number): number[] {
  const inDegree = Array(nodes).fill(0);
  const adjList: number[][] = Array.from({ length: nodes }, () => []);

  edges.forEach(([from, to]) => {
    adjList[from].push(to);
    inDegree[to] += 1;
  });

  const queue: number[] = [];
  inDegree.forEach((value, index) => {
    if (value === 0) queue.push(index);
  });

  const order: number[] = [];

  while (queue.length) {
    const node = queue.shift()!;
    order.push(node);

    adjList[node].forEach((neighbor) => {
      inDegree[neighbor] -= 1;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    });
  }

  return order;
}`,
      },
      {
        id: "cycle-detection",
        title: "Directed Cycle Detection",
        description:
          "Use DFS with colors (white/gray/black) to detect cycles in O(V+E).",
        status: "locked",
        language: "Java",
        code: `boolean hasCycle(int node, int[] colors, List<List<Integer>> graph) {
    colors[node] = 1;

    for (int neighbor : graph.get(node)) {
        if (colors[neighbor] == 1) return true;
        if (colors[neighbor] == 0 && hasCycle(neighbor, colors, graph)) {
            return true;
        }
    }

    colors[node] = 2;
    return false;
}`,
      },
    ],
  },
  {
    id: "system-design",
    title: "System Design Playbook",
    difficulty: "advanced",
    category: "Architecture",
    tags: ["Scalability", "Caching", "Messaging"],
    progress: 24,
    completedModules: 6,
    totalModules: 25,
    nextTopic: "Design a Rate Limiter",
    eta: "25 min",
    topics: [
      {
        id: "design-urls",
        title: "URL Shortener Deep Dive",
        description:
          "Design considerations around hashing, consistency and collision avoidance.",
        status: "completed",
        language: "Markdown",
        code: `## Key Takeaways
- Base62 encoding of ids keeps URLs compact.
- Use a central metadata store for analytics.
- Apply caching to keep read latency below 50ms.`,
      },
      {
        id: "newsfeed",
        title: "Newsfeed Aggregator",
        description:
          "Balance fan-out writes vs. fan-out reads for high throughput systems.",
        status: "in-progress",
        language: "Pseudo-code",
        code: `while (true):
    event = activity_queue.pop()
    followers = fanout_service.get_followers(event.user)
    for follower in followers:
        feed_store.push(follower, event.payload)`,
      },
      {
        id: "rate-limiter",
        title: "Token Bucket Implementation",
        description:
          "Ensure burst capacity while keeping sustained rate limits enforced per client.",
        status: "locked",
        language: "Go",
        code: `type Bucket struct {
    Tokens      int
    Capacity    int
    RefillRate  int
    LastUpdated time.Time
}

func (b *Bucket) Allow(now time.Time) bool {
    elapsed := now.Sub(b.LastUpdated).Seconds()
    refill := int(elapsed * float64(b.RefillRate))
    if refill > 0 {
        b.Tokens = min(b.Capacity, b.Tokens+refill)
        b.LastUpdated = now
    }

    if b.Tokens == 0 {
        return false
    }

    b.Tokens--
    return true
}`,
      },
    ],
  },
  {
    id: "ai-ml",
    title: "Applied Machine Learning",
    difficulty: "intermediate",
    category: "AI/ML",
    tags: ["Model Training", "Evaluation", "MLOps"],
    progress: 56,
    completedModules: 14,
    totalModules: 25,
    nextTopic: "Vector Search Tuning",
    eta: "16 min",
    topics: [
      {
        id: "pipeline",
        title: "Experiment Pipeline",
        description:
          "Set up reproducible training with tracked metrics and artifacts.",
        status: "completed",
        language: "Python",
        code: `from sklearn.model_selection import train_test_split

def create_pipeline(estimator, params):
    X_train, X_test, y_train, y_test = train_test_split(
        params["X"],
        params["y"],
        test_size=0.2,
        random_state=params.get("seed", 42),
    )

    estimator.fit(X_train, y_train)
    return estimator.score(X_test, y_test)`,
      },
      {
        id: "monitoring",
        title: "Model Monitoring Hooks",
        description:
          "Stream drift metrics to dashboards and trigger alerts when thresholds break.",
        status: "in-progress",
        language: "Python",
        code: `class DriftMonitor:
    def __init__(self, detector, threshold: float):
        self.detector = detector
        self.threshold = threshold

    def check(self, batch):
        score = self.detector.compare(batch)
        if score > self.threshold:
            publish_alert("Distribution drift detected", score)
        return score`,
      },
      {
        id: "vector-search",
        title: "Vector Search Tuning",
        description:
          "Optimize ANN index parameters and recall for semantic search workloads.",
        status: "locked",
        language: "Python",
        code: `def build_index(embeddings, ef_construction=400, m=16):
    index = hnswlib.Index(space="cosine", dim=len(embeddings[0]))
    index.init_index(max_elements=len(embeddings), ef_construction=ef_construction, M=m)
    index.add_items(embeddings)
    return index`,
      },
    ],
  },
  {
    id: "frontend-mastery",
    title: "Frontend Performance Mastery",
    difficulty: "advanced",
    category: "Web",
    tags: ["Performance", "Tooling", "Rendering"],
    progress: 34,
    completedModules: 9,
    totalModules: 26,
    nextTopic: "Islands Architecture Primer",
    eta: "20 min",
    topics: [
      {
        id: "critical-path",
        title: "Critical Rendering Path",
        description:
          "Identify and trim render-blocking resources to improve Largest Contentful Paint.",
        status: "completed",
        language: "Markdown",
        code: `**Checklist**
- Inline critical CSS
- Preload hero media
- Lazy hydrate non-critical widgets`,
      },
      {
        id: "profiling",
        title: "Runtime Profiling",
        description:
          "Use the Performance panel to isolate long tasks and freeze frames.",
        status: "in-progress",
        language: "JavaScript",
        code: `const measureLongTasks = () => {
  const observer = new PerformanceObserver((entryList) => {
    entryList.getEntries().forEach((entry) => {
      console.log("Long task:", entry);
    });
  });

  observer.observe({ entryTypes: ["longtask"] });
};`,
      },
      {
        id: "edge-rendering",
        title: "Edge Rendering Strategy",
        description:
          "Hybrid rendering with edge functions and smart caching for sub-second TTFB.",
        status: "locked",
        language: "TypeScript",
        code: `export default defineEventHandler(async (event) => {
  const cacheKey = buildCacheKey(event);
  const cached = await edgeCache.get(cacheKey);

  if (cached) return cached;

  const payload = await renderToString(event);
  await edgeCache.set(cacheKey, payload, { ttl: 30 });

  return payload;
});`,
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
          <NuxtLink :class="$style['hero-cta']" to="/courses/current">
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
