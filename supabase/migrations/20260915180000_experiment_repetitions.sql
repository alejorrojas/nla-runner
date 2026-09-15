-- Repetitions per experiment, and a row per (example, repetition).
-- Neuronpedia NLA is budgeted against 120 explain / 240 completion per hour.

alter table public.experiments
  add column if not exists repetitions integer not null default 1;

alter table public.experiments
  drop constraint if exists experiments_repetitions_check;

alter table public.experiments
  add constraint experiments_repetitions_check
  check (repetitions >= 1);

alter table public.experiment_rows
  add column if not exists repetition integer not null default 1;

alter table public.experiment_rows
  drop constraint if exists experiment_rows_pkey;

alter table public.experiment_rows
  add primary key (experiment_id, example_id, repetition);
