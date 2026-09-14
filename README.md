# NLASmith

LangSmith-shaped experiment UI for Neuronpedia NLAs.

- Marketing: [nlasmith.com](https://nlasmith.com)
- App: [app.nlasmith.com](https://app.nlasmith.com) (login required)

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing. The lab (`/lab`, `/datasets`, …) requires a Supabase login. The first session copies a starter workspace: the **Reddit prior (pilot)** dataset, `mentions_reddit` judge, and the catalog run **Forum prior · Llama 3.3 70B · last user**.

OpenAI + Neuronpedia keys stay in **Settings** (`sessionStorage`). They are only needed to launch new runs.

## Persistence

On Vercel set:

- `NEXT_PUBLIC_SITE_URL=https://nlasmith.com`
- `NEXT_PUBLIC_APP_URL=https://app.nlasmith.com`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`)
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` (`sb_secret_...`)

Point the Vercel project to both `nlasmith.com` and `app.nlasmith.com`. In Supabase Auth, set the site URL to `https://app.nlasmith.com` and allow redirects:

- `https://app.nlasmith.com/auth/callback`
- `http://localhost:3000/auth/callback`

Tables live on project **nla-runner** (`vamfikbkcewmlzkqxtrs`). Rows are scoped by `owner_id`. Catalog rows (`is_catalog`) are copied into each new user.

Seed / refresh the shared starter run (needs API keys):

```bash
npm run seed:forum
```

Without Supabase env vars, local `npm run dev` still falls back to `data/store.json`.
