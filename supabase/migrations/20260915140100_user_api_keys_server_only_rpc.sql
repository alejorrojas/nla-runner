create or replace function private.hint_for(secret text)
returns text
language sql
immutable
set search_path = public
as $$
  select left(btrim(secret), 8);
$$;

create or replace function private.user_api_key_hints(p_user_id uuid)
returns table (openai_hint text, neuronpedia_hint text, updated_at timestamptz)
language sql
stable
security definer
set search_path = private
as $$
  select k.openai_hint, k.neuronpedia_hint, k.updated_at
  from private.user_api_keys k
  where k.user_id = p_user_id;
$$;

create or replace function private.save_user_api_keys(
  p_user_id uuid,
  p_openai text default null,
  p_neuronpedia text default null
)
returns table (openai_hint text, neuronpedia_hint text)
language plpgsql
security definer
set search_path = private, vault, public
as $$
declare
  v_row private.user_api_keys%rowtype;
  v_openai text := nullif(btrim(coalesce(p_openai, '')), '');
  v_neuronpedia text := nullif(btrim(coalesce(p_neuronpedia, '')), '');
begin
  if p_user_id is null then
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
  values (p_user_id)
  on conflict (user_id) do nothing;

  select * into v_row from private.user_api_keys where user_id = p_user_id;

  if v_openai is not null then
    v_row.openai_secret_id := private.upsert_named_secret(
      'nlasmith/' || p_user_id::text || '/openai',
      v_openai,
      'OpenAI API key',
      v_row.openai_secret_id
    );
    v_row.openai_hint := private.hint_for(v_openai);
  end if;

  if v_neuronpedia is not null then
    v_row.neuronpedia_secret_id := private.upsert_named_secret(
      'nlasmith/' || p_user_id::text || '/neuronpedia',
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
  where user_id = p_user_id;

  return query
    select k.openai_hint, k.neuronpedia_hint
    from private.user_api_keys k
    where k.user_id = p_user_id;
end;
$$;

drop function if exists public.user_api_key_hints();
drop function if exists public.save_user_api_keys(text, text);

revoke all on function private.user_api_key_hints(uuid) from public, anon, authenticated;
revoke all on function private.save_user_api_keys(uuid, text, text) from public, anon, authenticated;
grant execute on function private.user_api_key_hints(uuid) to service_role;
grant execute on function private.save_user_api_keys(uuid, text, text) to service_role;
