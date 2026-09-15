-- Encrypted per-user OpenAI + Neuronpedia keys in Vault.
-- Clients only ever see a short prefix; plaintext is never selected by authenticated roles.

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;
grant usage on schema private to postgres;
grant usage on schema private to service_role;

revoke all on table vault.secrets from anon, authenticated, public;
revoke all on table vault.decrypted_secrets from anon, authenticated, public;

create table if not exists private.user_api_keys (
  user_id uuid primary key references auth.users (id) on delete cascade,
  openai_secret_id uuid,
  neuronpedia_secret_id uuid,
  openai_hint text,
  neuronpedia_hint text,
  updated_at timestamptz not null default now()
);

create or replace function private.hint_for(secret text)
returns text
language sql
immutable
as $$
  select left(btrim(secret), 8);
$$;

create or replace function private.upsert_named_secret(
  p_name text,
  p_secret text,
  p_description text,
  p_existing uuid
)
returns uuid
language plpgsql
security definer
set search_path = vault, private, public
as $$
declare
  v_id uuid;
begin
  if p_existing is not null then
    perform vault.update_secret(p_existing, p_secret, p_name, p_description);
    return p_existing;
  end if;

  select s.id into v_id from vault.secrets s where s.name = p_name limit 1;
  if v_id is not null then
    perform vault.update_secret(v_id, p_secret, p_name, p_description);
    return v_id;
  end if;

  return vault.create_secret(p_secret, p_name, p_description);
end;
$$;

create or replace function private.purge_user_vault_secrets()
returns trigger
language plpgsql
security definer
set search_path = vault
as $$
begin
  if old.openai_secret_id is not null then
    delete from vault.secrets where id = old.openai_secret_id;
  end if;
  if old.neuronpedia_secret_id is not null then
    delete from vault.secrets where id = old.neuronpedia_secret_id;
  end if;
  return old;
end;
$$;

drop trigger if exists user_api_keys_purge_vault on private.user_api_keys;
create trigger user_api_keys_purge_vault
  before delete on private.user_api_keys
  for each row execute function private.purge_user_vault_secrets();

create or replace function public.user_api_key_hints()
returns table (openai_hint text, neuronpedia_hint text, updated_at timestamptz)
language sql
stable
security definer
set search_path = private, public
as $$
  select k.openai_hint, k.neuronpedia_hint, k.updated_at
  from private.user_api_keys k
  where k.user_id = auth.uid();
$$;

create or replace function public.save_user_api_keys(
  p_openai text default null,
  p_neuronpedia text default null
)
returns table (openai_hint text, neuronpedia_hint text)
language plpgsql
security definer
set search_path = private, vault, public
as $$
declare
  v_uid uuid := auth.uid();
  v_row private.user_api_keys%rowtype;
  v_openai text := nullif(btrim(coalesce(p_openai, '')), '');
  v_neuronpedia text := nullif(btrim(coalesce(p_neuronpedia, '')), '');
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;
  if v_openai is null and v_neuronpedia is null then
    raise exception 'Provide at least one key';
  end if;
  if v_openai is not null and char_length(v_openai) < 16 then
    raise exception 'OpenAI key looks too short';
  end if;
  if v_neuronpedia is not null and char_length(v_neuronpedia) < 16 then
    raise exception 'Neuronpedia key looks too short';
  end if;

  insert into private.user_api_keys (user_id)
  values (v_uid)
  on conflict (user_id) do nothing;

  select * into v_row from private.user_api_keys where user_id = v_uid;

  if v_openai is not null then
    v_row.openai_secret_id := private.upsert_named_secret(
      'nlasmith/' || v_uid::text || '/openai',
      v_openai,
      'OpenAI API key',
      v_row.openai_secret_id
    );
    v_row.openai_hint := private.hint_for(v_openai);
  end if;

  if v_neuronpedia is not null then
    v_row.neuronpedia_secret_id := private.upsert_named_secret(
      'nlasmith/' || v_uid::text || '/neuronpedia',
      v_neuronpedia,
      'Neuronpedia API key',
      v_row.neuronpedia_secret_id
    );
    v_row.neuronpedia_hint := private.hint_for(v_neuronpedia);
  end if;

  update private.user_api_keys
  set
    openai_secret_id = v_row.openai_secret_id,
    neuronpedia_secret_id = v_row.neuronpedia_secret_id,
    openai_hint = v_row.openai_hint,
    neuronpedia_hint = v_row.neuronpedia_hint,
    updated_at = now()
  where user_id = v_uid;

  return query
    select k.openai_hint, k.neuronpedia_hint
    from private.user_api_keys k
    where k.user_id = v_uid;
end;
$$;

create or replace function private.read_user_api_keys(p_user_id uuid)
returns table (openai text, neuronpedia text)
language sql
stable
security definer
set search_path = vault, private
as $$
  select
    (
      select ds.decrypted_secret
      from vault.decrypted_secrets ds
      where ds.id = k.openai_secret_id
    ) as openai,
    (
      select ds.decrypted_secret
      from vault.decrypted_secrets ds
      where ds.id = k.neuronpedia_secret_id
    ) as neuronpedia
  from private.user_api_keys k
  where k.user_id = p_user_id;
$$;

revoke all on function public.user_api_key_hints() from public, anon;
revoke all on function public.save_user_api_keys(text, text) from public, anon;
revoke all on function private.read_user_api_keys(uuid) from public, anon, authenticated;
revoke all on function private.upsert_named_secret(text, text, text, uuid) from public, anon, authenticated;
revoke all on function private.hint_for(text) from public, anon, authenticated;

grant execute on function public.user_api_key_hints() to authenticated;
grant execute on function public.save_user_api_keys(text, text) to authenticated;
grant execute on function private.read_user_api_keys(uuid) to service_role;
