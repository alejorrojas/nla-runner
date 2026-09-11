-- NLA Eval lab tables. Applied to juani / nla-runner (vamfikbkcewmlzkqxtrs).
-- RLS on, no anon policies: Next.js uses SUPABASE_SECRET_KEY (sb_secret_...).

create table if not exists public.datasets (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.dataset_examples (
  id text not null,
  dataset_id text not null references public.datasets (id) on delete cascade,
  prompt text not null default '',
  reference text,
  position integer not null default 0,
  primary key (dataset_id, id)
);

create table if not exists public.evaluators (
  id text primary key,
  name text not null,
  openai_model text not null,
  prompt text not null,
  mapping jsonb not null default '{}'::jsonb,
  feedback jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.experiments (
  id text primary key,
  dataset_id text not null references public.datasets (id) on delete cascade,
  name text not null,
  source_id text not null,
  token_policy text not null,
  evaluator_ids text[] not null default '{}',
  status text not null default 'idle',
  error text,
  created_at timestamptz not null default now(),
  constraint experiments_token_policy_check
    check (token_policy in ('last_user', 'first_assistant', 'both')),
  constraint experiments_status_check
    check (status in ('idle', 'running', 'done', 'error'))
);

create table if not exists public.experiment_rows (
  experiment_id text not null references public.experiments (id) on delete cascade,
  example_id text not null,
  position integer not null default 0,
  prompt text not null default '',
  completion text not null default '',
  probes jsonb not null default '[]'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  comments jsonb not null default '{}'::jsonb,
  error text,
  primary key (experiment_id, example_id)
);
