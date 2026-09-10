# NLA Eval

LangSmith-shaped experiment UI for Neuronpedia NLAs. Paste OpenAI + Neuronpedia keys in **Settings** (browser `sessionStorage` only).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Seed dataset is the Reddit prior prompts; seed judge is `mentions_reddit`.

Run an experiment on a dataset, pick NLA source + token policy + evaluators, then Compare two runs.

On Vercel the JSON store lives in `/tmp` (ephemeral). Keys still stay in the browser.
