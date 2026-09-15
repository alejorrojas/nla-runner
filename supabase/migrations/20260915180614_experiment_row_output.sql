-- Persist the model chat reply as `output` (judge variable {{output}}).
-- Keep `completion` in sync for older rows and readers.

alter table public.experiment_rows
  add column if not exists output text not null default '';

update public.experiment_rows
set output = completion
where output = '' and completion <> '';

comment on column public.experiment_rows.output is
  'Model chat reply for this prompt. Exposed to judges as {{output}}.';

create or replace function public.experiment_rows_sync_output()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(btrim(new.output), '') = ''
     and coalesce(btrim(new.completion), '') <> '' then
    new.output := new.completion;
  elsif coalesce(btrim(new.completion), '') = ''
     and coalesce(btrim(new.output), '') <> '' then
    new.completion := new.output;
  elsif new.output is distinct from new.completion
     and coalesce(btrim(new.output), '') <> '' then
    new.completion := new.output;
  end if;
  new.output := coalesce(new.output, '');
  new.completion := coalesce(new.completion, '');
  return new;
end;
$$;

drop trigger if exists experiment_rows_sync_output on public.experiment_rows;
create trigger experiment_rows_sync_output
  before insert or update on public.experiment_rows
  for each row
  execute function public.experiment_rows_sync_output();
