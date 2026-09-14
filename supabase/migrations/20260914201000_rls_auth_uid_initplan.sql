-- Wrap auth.uid() in SELECT so RLS is not re-evaluated per row.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = (select auth.uid()));

drop policy if exists "datasets_select_own" on public.datasets;
drop policy if exists "datasets_insert_own" on public.datasets;
drop policy if exists "datasets_update_own" on public.datasets;
drop policy if exists "datasets_delete_own" on public.datasets;
create policy "datasets_select_own" on public.datasets for select to authenticated using (owner_id = (select auth.uid()));
create policy "datasets_insert_own" on public.datasets for insert to authenticated with check (owner_id = (select auth.uid()) and not is_catalog);
create policy "datasets_update_own" on public.datasets for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()) and not is_catalog);
create policy "datasets_delete_own" on public.datasets for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists "examples_select_own" on public.dataset_examples;
drop policy if exists "examples_insert_own" on public.dataset_examples;
drop policy if exists "examples_update_own" on public.dataset_examples;
drop policy if exists "examples_delete_own" on public.dataset_examples;
create policy "examples_select_own" on public.dataset_examples for select to authenticated using (exists (select 1 from public.datasets d where d.id = dataset_id and d.owner_id = (select auth.uid())));
create policy "examples_insert_own" on public.dataset_examples for insert to authenticated with check (exists (select 1 from public.datasets d where d.id = dataset_id and d.owner_id = (select auth.uid())));
create policy "examples_update_own" on public.dataset_examples for update to authenticated using (exists (select 1 from public.datasets d where d.id = dataset_id and d.owner_id = (select auth.uid())));
create policy "examples_delete_own" on public.dataset_examples for delete to authenticated using (exists (select 1 from public.datasets d where d.id = dataset_id and d.owner_id = (select auth.uid())));

drop policy if exists "evaluators_select_own" on public.evaluators;
drop policy if exists "evaluators_insert_own" on public.evaluators;
drop policy if exists "evaluators_update_own" on public.evaluators;
drop policy if exists "evaluators_delete_own" on public.evaluators;
create policy "evaluators_select_own" on public.evaluators for select to authenticated using (owner_id = (select auth.uid()));
create policy "evaluators_insert_own" on public.evaluators for insert to authenticated with check (owner_id = (select auth.uid()) and not is_catalog);
create policy "evaluators_update_own" on public.evaluators for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()) and not is_catalog);
create policy "evaluators_delete_own" on public.evaluators for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists "experiments_select_own" on public.experiments;
drop policy if exists "experiments_insert_own" on public.experiments;
drop policy if exists "experiments_update_own" on public.experiments;
drop policy if exists "experiments_delete_own" on public.experiments;
create policy "experiments_select_own" on public.experiments for select to authenticated using (owner_id = (select auth.uid()));
create policy "experiments_insert_own" on public.experiments for insert to authenticated with check (owner_id = (select auth.uid()) and not is_catalog);
create policy "experiments_update_own" on public.experiments for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()) and not is_catalog);
create policy "experiments_delete_own" on public.experiments for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists "rows_select_own" on public.experiment_rows;
drop policy if exists "rows_insert_own" on public.experiment_rows;
drop policy if exists "rows_update_own" on public.experiment_rows;
drop policy if exists "rows_delete_own" on public.experiment_rows;
create policy "rows_select_own" on public.experiment_rows for select to authenticated using (exists (select 1 from public.experiments e where e.id = experiment_id and e.owner_id = (select auth.uid())));
create policy "rows_insert_own" on public.experiment_rows for insert to authenticated with check (exists (select 1 from public.experiments e where e.id = experiment_id and e.owner_id = (select auth.uid())));
create policy "rows_update_own" on public.experiment_rows for update to authenticated using (exists (select 1 from public.experiments e where e.id = experiment_id and e.owner_id = (select auth.uid())));
create policy "rows_delete_own" on public.experiment_rows for delete to authenticated using (exists (select 1 from public.experiments e where e.id = experiment_id and e.owner_id = (select auth.uid())));
