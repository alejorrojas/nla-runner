create or replace function public.nla_key_hints(p_user_id uuid)
returns table (openai_hint text, neuronpedia_hint text, updated_at timestamptz)
language sql
stable
security definer
set search_path = private
as $$
  select * from private.user_api_key_hints(p_user_id);
$$;

create or replace function public.nla_save_keys(
  p_user_id uuid,
  p_openai text default null,
  p_neuronpedia text default null
)
returns table (openai_hint text, neuronpedia_hint text)
language sql
security definer
set search_path = private
as $$
  select * from private.save_user_api_keys(p_user_id, p_openai, p_neuronpedia);
$$;

create or replace function public.nla_read_keys(p_user_id uuid)
returns table (openai text, neuronpedia text)
language sql
stable
security definer
set search_path = private
as $$
  select * from private.read_user_api_keys(p_user_id);
$$;

revoke all on function public.nla_key_hints(uuid) from public, anon, authenticated;
revoke all on function public.nla_save_keys(uuid, text, text) from public, anon, authenticated;
revoke all on function public.nla_read_keys(uuid) from public, anon, authenticated;
grant execute on function public.nla_key_hints(uuid) to service_role;
grant execute on function public.nla_save_keys(uuid, text, text) to service_role;
grant execute on function public.nla_read_keys(uuid) to service_role;
