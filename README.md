# NLA Eval

LangSmith-shaped experiment UI for Neuronpedia NLAs. Paste OpenAI + Neuronpedia keys in **Settings** (browser `sessionStorage` only).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Seed dataset is the Reddit prior prompts; seed judge is `mentions_reddit`.

Run an experiment on a dataset, pick NLA source + token policy + evaluators, then Compare two runs (or click a run name for its charts).

## Persistence

On Vercel set:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The JSON lab store lives in `public.nla_eval_store` (service role only; no anon policies). Without those env vars, local `npm run dev` still uses `data/store.json`.
