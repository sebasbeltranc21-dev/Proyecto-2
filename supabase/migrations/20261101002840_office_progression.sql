-- Read-only personal progression from existing authoritative game records.
create or replace function mm_private.progression() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare uid uuid:=auth.uid(); completed int; wins int; played int; shared int; rank_index int; milestones jsonb;
begin
 if uid is null then raise exception 'MM:Inicia sesión.'; end if;
 select count(*),count(*) filter(where g.success) into completed,wins from public.mm_results r join public.mm_games g on g.id=r.game_id where r.user_id=uid and g.stage=3;
 select count(*) into played from public.mm_participants p join public.mm_games g on g.room_id=p.room_id where p.user_id=uid and p.in_game;
 select count(distinct (game_id,evidence_id)) into shared from public.mm_timeline where user_id=uid;
 rank_index:=case when completed>=15 and wins>=8 then 4 when completed>=8 and wins>=3 then 3 when completed>=3 and wins>=1 then 2 when completed>=1 then 1 else 0 end;
 with finishes as (select g.finished_at,g.case_id,g.success,row_number() over(order by g.finished_at,g.id) n from public.mm_results r join public.mm_games g on g.id=r.game_id where r.user_id=uid and g.stage=3), victories as (select finished_at,row_number() over(order by finished_at,case_id) n from finishes where success), distinct_cases as (select min(finished_at) t from finishes group by case_id), ranked_cases as (select t,row_number() over(order by t) n from distinct_cases)
 select jsonb_build_object('first_case',(select finished_at from finishes where n=1),'first_win',(select finished_at from victories where n=1),'three_cases',(select finished_at from finishes where n=3),'three_wins',(select finished_at from victories where n=3),'all_scenes',(select t from ranked_cases where n=3)) into milestones;
 return jsonb_build_object('completed',completed,'wins',wins,'played',played,'shared_clues',shared,'rank_index',rank_index,'achievements',milestones);
end $$;
revoke all on function mm_private.progression() from public,anon,authenticated;

create or replace function mm_private.home() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'MM:Inicia sesión.'; end if;
 return jsonb_build_object(
 'progression',mm_private.progression(),
 'cases',(select coalesce(jsonb_agg(jsonb_build_object('slug',c.slug,'title',c.title,'intro',c.intro,'theme',c.theme,'suspect_count',(select count(*) from public.mm_suspects s where s.case_id=c.id)) order by c.slug),'[]') from public.mm_cases c where c.mode='cooperative' and exists(select 1 from mm_private.solutions sol where sol.case_id=c.id)),
 'profile',(select to_jsonb(p) from public.mm_profiles p where id=auth.uid()),
 'rooms',(select coalesce(jsonb_agg(r order by created_at desc),'[]') from (select r.code,r.status,r.created_at,c.title from public.mm_rooms r join public.mm_cases c on c.id=r.case_id join public.mm_participants p on p.room_id=r.id where p.user_id=auth.uid() order by r.created_at desc limit 10) r),
 'history',(select coalesce(jsonb_agg(h order by finished_at desc),'[]') from (select r.points,r.correct,g.finished_at,c.title,ro.code from public.mm_results r join public.mm_games g on g.id=r.game_id join public.mm_cases c on c.id=g.case_id join public.mm_rooms ro on ro.id=g.room_id where r.user_id=auth.uid() order by g.finished_at desc limit 20) h),
 'stats',(select jsonb_build_object('games',count(*),'correct',count(*) filter(where correct),'points',coalesce(sum(points),0)) from public.mm_results where user_id=auth.uid()),
 'leaderboard',(select coalesce(jsonb_agg(l order by points desc,name),'[]') from (select p.name,p.avatar,sum(r.points) points,count(*) games from public.mm_results r join public.mm_profiles p on p.id=r.user_id group by p.id order by points desc,p.name limit 10) l)
 );
end $$;
