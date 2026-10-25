-- Only the registration Edge Function's server role can claim a slot.
create table mm_private.registration_limits (
  bucket text primary key check (length(bucket) between 1 and 80),
  window_start timestamptz not null default now(),
  attempts integer not null default 1 check (attempts > 0)
);
alter table mm_private.registration_limits enable row level security;
create index registration_limits_window_idx on mm_private.registration_limits(window_start);
revoke all on mm_private.registration_limits from public, anon, authenticated;
grant usage on schema mm_private to service_role;
grant select, insert, update, delete on mm_private.registration_limits to service_role;

create function public.mm_claim_registration(p_bucket text, p_limit integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare accepted boolean;
begin
  if p_limit not between 1 and 100 or length(p_bucket) not between 1 and 80 then
    return false;
  end if;
  delete from mm_private.registration_limits where window_start < now() - interval '1 day';
  insert into mm_private.registration_limits as limits(bucket) values (p_bucket)
  on conflict(bucket) do update set
    attempts = case when limits.window_start <= now() - interval '1 hour' then 1 else limits.attempts + 1 end,
    window_start = case when limits.window_start <= now() - interval '1 hour' then now() else limits.window_start end
  where limits.window_start <= now() - interval '1 hour' or limits.attempts < p_limit
  returning true into accepted;
  return coalesce(accepted, false);
end;
$$;
revoke all on function public.mm_claim_registration(text, integer) from public, anon, authenticated;
grant execute on function public.mm_claim_registration(text, integer) to service_role;
