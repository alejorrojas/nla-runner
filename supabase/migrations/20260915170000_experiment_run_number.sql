-- Stable per-dataset experiment numbers (#1, #2, …). Assigned at insert and
-- never reused, so deleting a run leaves a gap instead of renumbering peers.

alter table public.experiments
  add column if not exists run_number integer;

update public.experiments e
set run_number = ranked.n
from (
  select
    id,
    row_number() over (
      partition by dataset_id
      order by created_at asc, id asc
    ) as n
  from public.experiments
) ranked
where e.id = ranked.id
  and e.run_number is null;

alter table public.experiments
  alter column run_number set not null;

alter table public.experiments
  drop constraint if exists experiments_dataset_run_number_key;

alter table public.experiments
  add constraint experiments_dataset_run_number_key unique (dataset_id, run_number);

create or replace function public.experiments_assign_run_number()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.dataset_id, 0));
  if new.run_number is null then
    select coalesce(max(run_number), 0) + 1
    into new.run_number
    from public.experiments
    where dataset_id = new.dataset_id;
  end if;
  return new;
end;
$$;

drop trigger if exists experiments_assign_run_number on public.experiments;
create trigger experiments_assign_run_number
before insert on public.experiments
for each row
execute function public.experiments_assign_run_number();
