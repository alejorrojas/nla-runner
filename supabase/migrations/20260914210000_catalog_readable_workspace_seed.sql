-- Let signed-in users read catalog rows so first login can copy a starter workspace
-- without a service-role key. Writes stay owner-only.

drop policy if exists "datasets_select_own" on public.datasets;
create policy "datasets_select_own" on public.datasets
  for select to authenticated
  using (is_catalog or owner_id = (select auth.uid()));

drop policy if exists "evaluators_select_own" on public.evaluators;
create policy "evaluators_select_own" on public.evaluators
  for select to authenticated
  using (is_catalog or owner_id = (select auth.uid()));

drop policy if exists "experiments_select_own" on public.experiments;
create policy "experiments_select_own" on public.experiments
  for select to authenticated
  using (is_catalog or owner_id = (select auth.uid()));

drop policy if exists "examples_select_own" on public.dataset_examples;
create policy "examples_select_own" on public.dataset_examples
  for select to authenticated
  using (
    exists (
      select 1 from public.datasets d
      where d.id = dataset_id
        and (d.is_catalog or d.owner_id = (select auth.uid()))
    )
  );

drop policy if exists "rows_select_own" on public.experiment_rows;
create policy "rows_select_own" on public.experiment_rows
  for select to authenticated
  using (
    exists (
      select 1 from public.experiments e
      where e.id = experiment_id
        and (e.is_catalog or e.owner_id = (select auth.uid()))
    )
  );

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
