-- Pin search_path on the output/completion sync trigger (advisor 0011).

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
