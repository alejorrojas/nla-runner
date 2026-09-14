-- Per-user workspaces plus a catalog starter experiment.
-- Catalog rows (is_catalog) are copied into a user workspace on first login.

alter table public.datasets
  add column if not exists owner_id uuid references auth.users (id) on delete cascade,
  add column if not exists is_catalog boolean not null default false;

alter table public.evaluators
  add column if not exists owner_id uuid references auth.users (id) on delete cascade,
  add column if not exists is_catalog boolean not null default false;

alter table public.experiments
  add column if not exists owner_id uuid references auth.users (id) on delete cascade,
  add column if not exists is_catalog boolean not null default false,
  add column if not exists is_starter boolean not null default false;

create index if not exists datasets_owner_id_idx on public.datasets (owner_id);
create index if not exists evaluators_owner_id_idx on public.evaluators (owner_id);
create index if not exists experiments_owner_id_idx on public.experiments (owner_id);

update public.datasets
set is_catalog = true
where id = 'ds-reddit-pilot';

update public.evaluators
set is_catalog = true
where id = 'ev-reddit';

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  seeded_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "datasets_select_own" on public.datasets;
drop policy if exists "datasets_insert_own" on public.datasets;
drop policy if exists "datasets_update_own" on public.datasets;
drop policy if exists "datasets_delete_own" on public.datasets;
create policy "datasets_select_own"
  on public.datasets for select to authenticated
  using (owner_id = auth.uid());
create policy "datasets_insert_own"
  on public.datasets for insert to authenticated
  with check (owner_id = auth.uid() and not is_catalog);
create policy "datasets_update_own"
  on public.datasets for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and not is_catalog);
create policy "datasets_delete_own"
  on public.datasets for delete to authenticated
  using (owner_id = auth.uid());

drop policy if exists "examples_select_own" on public.dataset_examples;
drop policy if exists "examples_write_own" on public.dataset_examples;
drop policy if exists "examples_update_own" on public.dataset_examples;
drop policy if exists "examples_delete_own" on public.dataset_examples;
create policy "examples_select_own"
  on public.dataset_examples for select to authenticated
  using (
    exists (
      select 1 from public.datasets d
      where d.id = dataset_id and d.owner_id = auth.uid()
    )
  );
create policy "examples_insert_own"
  on public.dataset_examples for insert to authenticated
  with check (
    exists (
      select 1 from public.datasets d
      where d.id = dataset_id and d.owner_id = auth.uid()
    )
  );
create policy "examples_update_own"
  on public.dataset_examples for update to authenticated
  using (
    exists (
      select 1 from public.datasets d
      where d.id = dataset_id and d.owner_id = auth.uid()
    )
  );
create policy "examples_delete_own"
  on public.dataset_examples for delete to authenticated
  using (
    exists (
      select 1 from public.datasets d
      where d.id = dataset_id and d.owner_id = auth.uid()
    )
  );

drop policy if exists "evaluators_select_own" on public.evaluators;
drop policy if exists "evaluators_insert_own" on public.evaluators;
drop policy if exists "evaluators_update_own" on public.evaluators;
drop policy if exists "evaluators_delete_own" on public.evaluators;
create policy "evaluators_select_own"
  on public.evaluators for select to authenticated
  using (owner_id = auth.uid());
create policy "evaluators_insert_own"
  on public.evaluators for insert to authenticated
  with check (owner_id = auth.uid() and not is_catalog);
create policy "evaluators_update_own"
  on public.evaluators for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and not is_catalog);
create policy "evaluators_delete_own"
  on public.evaluators for delete to authenticated
  using (owner_id = auth.uid());

drop policy if exists "experiments_select_own" on public.experiments;
drop policy if exists "experiments_insert_own" on public.experiments;
drop policy if exists "experiments_update_own" on public.experiments;
drop policy if exists "experiments_delete_own" on public.experiments;
create policy "experiments_select_own"
  on public.experiments for select to authenticated
  using (owner_id = auth.uid());
create policy "experiments_insert_own"
  on public.experiments for insert to authenticated
  with check (owner_id = auth.uid() and not is_catalog);
create policy "experiments_update_own"
  on public.experiments for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and not is_catalog);
create policy "experiments_delete_own"
  on public.experiments for delete to authenticated
  using (owner_id = auth.uid());

drop policy if exists "rows_select_own" on public.experiment_rows;
drop policy if exists "rows_insert_own" on public.experiment_rows;
drop policy if exists "rows_update_own" on public.experiment_rows;
drop policy if exists "rows_delete_own" on public.experiment_rows;
create policy "rows_select_own"
  on public.experiment_rows for select to authenticated
  using (
    exists (
      select 1 from public.experiments e
      where e.id = experiment_id and e.owner_id = auth.uid()
    )
  );
create policy "rows_insert_own"
  on public.experiment_rows for insert to authenticated
  with check (
    exists (
      select 1 from public.experiments e
      where e.id = experiment_id and e.owner_id = auth.uid()
    )
  );
create policy "rows_update_own"
  on public.experiment_rows for update to authenticated
  using (
    exists (
      select 1 from public.experiments e
      where e.id = experiment_id and e.owner_id = auth.uid()
    )
  );
create policy "rows_delete_own"
  on public.experiment_rows for delete to authenticated
  using (
    exists (
      select 1 from public.experiments e
      where e.id = experiment_id and e.owner_id = auth.uid()
    )
  );
