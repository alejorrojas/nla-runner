alter table public.profiles
  add column if not exists full_name text;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(btrim(coalesce(new.raw_user_meta_data->>'full_name', '')), '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name);
  return new;
end;
$$;

update public.profiles p
set full_name = nullif(btrim(coalesce(u.raw_user_meta_data->>'full_name', '')), '')
from auth.users u
where u.id = p.id
  and p.full_name is null
  and coalesce(u.raw_user_meta_data->>'full_name', '') <> '';
