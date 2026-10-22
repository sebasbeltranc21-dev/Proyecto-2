-- Persist invite-code rate limits even when an attempted join is rejected.
create table mm_private.join_limits (
 user_id uuid primary key references auth.users(id) on delete cascade,
 window_start timestamptz not null default now(), attempts int not null default 0
);
alter table mm_private.join_limits enable row level security;
revoke all on mm_private.join_limits from public,anon,authenticated;

create function mm_private.dispatch(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare n int;
begin
 if auth.uid() is null then raise exception 'MM:Inicia sesión.'; end if;
 if payload->>'action'='join' then
 insert into mm_private.join_limits(user_id,attempts) values(auth.uid(),1)
 on conflict(user_id) do update set
 attempts=case when join_limits.window_start<now()-interval '1 minute' then 1 else join_limits.attempts+1 end,
 window_start=case when join_limits.window_start<now()-interval '1 minute' then now() else join_limits.window_start end
 returning attempts into n;
 if n>20 then return jsonb_build_object('error','MM:Demasiados intentos. Espera un minuto antes de probar otro código.'); end if;
 end if;
 begin
 return mm_private.action(payload);
 exception when raise_exception then
 return jsonb_build_object('error',sqlerrm);
 end;
end $$;
revoke all on function mm_private.dispatch(jsonb) from public,anon;
grant execute on function mm_private.dispatch(jsonb) to authenticated;
-- Only dispatch is reachable from the public API; other internal actions cannot bypass its limits.
revoke execute on function mm_private.action(jsonb) from authenticated;
create or replace function public.mm_action(payload jsonb) returns jsonb language sql security invoker set search_path='' as $$ select mm_private.dispatch(payload); $$;

create index mm_rooms_host_recent on public.mm_rooms(host_id,status,created_at);
create index mm_rooms_case on public.mm_rooms(case_id);
create index mm_games_case on public.mm_games(case_id);
create index mm_evidence_game_stage_owner on public.mm_evidence(game_id,stage,user_id);
create index mm_messages_user_time on public.mm_messages(user_id,sent_at);
create index mm_votes_room_user on public.mm_votes(room_id,user_id);
create index mm_votes_suspect on public.mm_votes(suspect_id);
create index mm_results_room on public.mm_results(room_id);
create index mm_clues_case on mm_private.clues(case_id,position);
