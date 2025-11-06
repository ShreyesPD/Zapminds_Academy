// Academy Platform TypeScript Types

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
export type SubmissionStatus = 'pending' | 'accepted' | 'wrong_answer' | 'runtime_error' | 'timeout';
export type ChallengeProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  difficulty: Difficulty | null;
  estimated_time: number | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  course_id: string | null;
  title: string;
  description: string;
  slug: string;
  difficulty: ChallengeDifficulty | null;
  starter_code: Record<string, string> | null; // { language: code }
  test_cases: TestCase[];
  solution_code: Record<string, string> | null; // { language: code }
  points: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface TestCase {
  input: string | string[]; // Can be string or array of strings
  expected_output: string;
  is_hidden: boolean;
  description?: string;
}

export interface Submission {
  id: string;
  user_id: string;
  challenge_id: string;
  code: string;
  language: string;
  status: SubmissionStatus;
  test_results: TestResult[] | null;
  execution_time: number | null;
  memory_used: number | null;
  submitted_at: string;
}

export interface TestResult {
  test_case_index: number;
  passed: boolean;
  input: string | string[];
  expected_output: string;
  actual_output: string | null;
  error_message: string | null;
  execution_time: number | null;
  memory_used: number | null;
}

export interface UserProgress {
  id: string;
  user_id: string;
  total_points: number;
  challenges_completed: number;
  courses_completed: number;
  current_streak: number;
  longest_streak: number;
  last_activity_at: string | null;
  updated_at: string;
}

export interface UserChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  status: ChallengeProgressStatus;
  best_submission_id: string | null;
  completed_at: string | null;
}

export interface CodeExecutionResult {
  success: boolean;
  status: SubmissionStatus;
  test_results: TestResult[];
  execution_time: number | null;
  memory_used: number | null;
  error_message: string | null;
  stdout: string | null;
  stderr: string | null;
}

export interface LeaderboardEntry {
  user_id: string;
  email: string;
  designation: string | null;
  total_points: number;
  challenges_completed: number;
  current_streak: number;
  rank: number;
}

export interface CourseWithProgress extends Course {
  progress?: {
    challenges_completed: number;
    total_challenges: number;
    percentage: number;
  };
}

export interface ChallengeWithProgress extends Challenge {
  progress?: {
    status: ChallengeProgressStatus;
    best_submission_id: string | null;
    completed_at: string | null;
  };
}

