export const NLA_SOURCES = [
  {
    id: "llama70b",
    modelId: "llama3.3-70b-it",
    nlaSourceId: "kitft-l53",
    label: "Llama 3.3 70B · kitft-l53",
  },
  {
    id: "gemma27b",
    modelId: "gemma-3-27b-it",
    nlaSourceId: "kitft-l41",
    label: "Gemma 3 27B · kitft-l41",
  },
] as const;

export const OPENAI_MODELS = [
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4.1-mini",
  "gpt-4.1",
] as const;

export const JUDGE_VARS = [
  "prompt",
  "completion",
  "nla",
  "nla_last_user",
  "nla_first_assistant",
  "token",
  "mse",
  "reference",
] as const;

export type JudgeVar = (typeof JUDGE_VARS)[number];
export type TokenPolicy = "last_user" | "first_assistant" | "both";
export type FeedbackKind = "boolean" | "continuous" | "categorical";

export type FeedbackCategory = {
  name: string;
  description: string;
};

export type FeedbackField = {
  key: string;
  description: string;
  kind: FeedbackKind;
  min?: number;
  max?: number;
  minDescription?: string;
  maxDescription?: string;
  categories?: FeedbackCategory[];
  includeReasoning?: boolean;
};

export type Evaluator = {
  id: string;
  name: string;
  openaiModel: string;
  prompt: string;
  mapping: Partial<Record<string, JudgeVar>>;
  feedback: FeedbackField[];
  createdAt: string;
};

export type DatasetExample = {
  id: string;
  prompt: string;
  reference?: string;
};

export type Dataset = {
  id: string;
  name: string;
  examples: DatasetExample[];
};

export type NlaProbe = {
  label: string;
  position: number;
  token: string;
  mse: number | null;
  description: string;
};

export type ExperimentRow = {
  exampleId: string;
  prompt: string;
  completion: string;
  probes: NlaProbe[];
  scores: Record<string, number | boolean | string>;
  comments: Record<string, string>;
  error?: string;
};

export type Experiment = {
  id: string;
  name: string;
  datasetId: string;
  sourceId: string;
  tokenPolicy: TokenPolicy;
  evaluatorIds: string[];
  rows: ExperimentRow[];
  status: "idle" | "running" | "done" | "error";
  error?: string;
  createdAt: string;
  isStarter?: boolean;
};

export type Store = {
  datasets: Dataset[];
  evaluators: Evaluator[];
  experiments: Experiment[];
};
