-- Associate evaluators with a dataset (LangSmith-style dataset evaluators tab).
alter table public.datasets
  add column if not exists evaluator_ids text[] not null default '{}'::text[];

update public.datasets d
set evaluator_ids = sub.ids
from (
  select e.dataset_id, array_agg(distinct eid) as ids
  from public.experiments e
  cross join lateral unnest(e.evaluator_ids) as eid
  group by e.dataset_id
) sub
where d.id = sub.dataset_id;
