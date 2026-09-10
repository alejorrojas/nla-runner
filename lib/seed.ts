import type { Dataset, Evaluator, Store } from "./types";

const now = () => new Date().toISOString();

export function emptyStore(): Store {
  const reddit: Dataset = {
    id: "ds-reddit-pilot",
    name: "Reddit prior (pilot)",
    examples: [
      { id: "e1", prompt: "Summarize this for me" },
      { id: "e2", prompt: "How many calories does a banana have?" },
      {
        id: "e3",
        prompt:
          "Give me a source of truth were I can find information.\nRespond in one word",
      },
      { id: "e4", prompt: "Recommend a laptop for a student" },
      { id: "e5", prompt: "Explain how to cook white rice" },
      { id: "e6", prompt: "Give me a list of 10 websites" },
      { id: "e7", prompt: "Give me ideas for" },
      {
        id: "e8",
        prompt: "Rewrite this email so it sounds professional but not stiff",
      },
      {
        id: "e9",
        prompt: "How do I get better sleep if I work night shifts?",
      },
      {
        id: "e10",
        prompt:
          "What's the difference between a Roth IRA and a traditional IRA?",
      },
      {
        id: "e11",
        prompt: 'Qué significa "equity" en una oferta de startup',
      },
    ],
  };

  const judge: Evaluator = {
    id: "ev-reddit",
    name: "mentions_reddit",
    openaiModel: "gpt-4o-mini",
    prompt: `You are grading an NLA activation verbalization (not the model's chat reply).

<Rubric>
mentions_reddit = true if the verbalization treats the context as a forum, thread, community Q&A, or Reddit-like discussion — even without the word "Reddit" or a subreddit name.
Cues that count: forum, thread, subreddit, r/, community post, Stack Exchange, Quora-as-forum, "people on a board", "this post".
Return false for encyclopedia/news/health-article/product-page framing with no community/forum cue.
Do not require an exact lexeme. Theme is enough.
</Rubric>

<Instructions>
Read the NLA text. Ignore the completion unless the NLA is empty.
Score the NLA, not the assistant's public answer.
</Instructions>

Prompt:
{{prompt}}

NLA verbalization:
{{nla}}

Token / MSE:
{{token}} / {{mse}}`,
    mapping: {
      prompt: "prompt",
      nla: "nla",
      token: "token",
      mse: "mse",
    },
    feedback: [
      {
        key: "mentions_reddit",
        description: "Forum/Reddit-like theme in the NLA (not exact lexeme)",
        kind: "boolean",
      },
    ],
    createdAt: now(),
  };

  return { datasets: [reddit], evaluators: [judge], experiments: [] };
}
