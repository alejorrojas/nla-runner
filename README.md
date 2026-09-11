# NLASmith

LangSmith-shaped experiment UI for Neuronpedia NLAs. Paste OpenAI + Neuronpedia keys in **Settings** (browser `sessionStorage` only).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Seed dataset is the Reddit prior prompts; seed judge is `mentions_reddit`.

Run an experiment on a dataset, pick NLA source + token policy + evaluators, then Compare two runs (or click a run name for its charts).

## Persistence

On Vercel set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`)
- `SUPABASE_URL` (same project URL; server-only)
- `SUPABASE_SECRET_KEY` (`sb_secret_...`)

Do not use the legacy `anon` / `service_role` JWTs. The lab store is Postgres on **nla-runner** (`vamfikbkcewmlzkqxtrs`): `datasets`, `dataset_examples`, `evaluators`, `experiments`, `experiment_rows`. RLS is on with no anon policies. Server routes use the secret key (bypasses RLS). The publishable key is the public client credential.

Without those env vars, local `npm run dev` still uses `data/store.json`.
