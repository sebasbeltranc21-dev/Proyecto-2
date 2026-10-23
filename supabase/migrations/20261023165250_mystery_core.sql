-- Additive namespaced schema. Never expose mm_private through the Data API.
create schema mm_private;
revoke all on schema mm_private from public;
grant usage on schema mm_private to authenticated;

create table public.mm_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 2 and 24),
 avatar text not null default 'lupa' check (avatar in ('lupa','huella','llave','luna'))
);
create table public.mm_cases (
 id uuid primary key default gen_random_uuid(), slug text unique not null,
 title text not null, intro text not null, stages jsonb not null,
 mode text not null default 'cooperative' check (mode in ('cooperative','competitive','traitor'))
);
create table public.mm_suspects (
 id uuid primary key default gen_random_uuid(), case_id uuid not null references public.mm_cases,
 name text not null, description text not null, motive text not null, alibi text not null,
 unique(case_id,id)
);
create table mm_private.solutions (
 case_id uuid primary key references public.mm_cases, suspect_id uuid not null,
 explanation text not null, foreign key(case_id,suspect_id) references public.mm_suspects(case_id,id)
);
create table mm_private.clues (
 id uuid primary key default gen_random_uuid(), case_id uuid not null references public.mm_cases,
 title text not null, body text not null, stage int not null check(stage in (0,1)),
 private boolean not null default false, position int not null
);
create table public.mm_rooms (
 id uuid primary key default gen_random_uuid(), code text unique not null check(code ~ '^[A-F0-9]{8}$'),
 host_id uuid not null references public.mm_profiles, case_id uuid not null references public.mm_cases,
 allow_guests boolean not null default false, minutes int not null check(minutes between 1 and 15),
 vote_minutes int not null check(vote_minutes between 1 and 5),
 status text not null default 'lobby' check(status in ('lobby','active','finished')),
 created_at timestamptz not null default now()
);
create table public.mm_participants (
 room_id uuid not null references public.mm_rooms, user_id uuid not null references public.mm_profiles,
 ready boolean not null default false, in_game boolean not null default false,
 joined_at timestamptz not null default now(), last_seen timestamptz not null default now(),
 primary key(room_id,user_id)
);
create index mm_participants_user on public.mm_participants(user_id);
create table public.mm_games (
 id uuid primary key default gen_random_uuid(), room_id uuid unique not null references public.mm_rooms,
 case_id uuid not null references public.mm_cases, stage int not null default 0 check(stage between 0 and 3),
 phase_ends_at timestamptz not null, started_at timestamptz not null default now(), finished_at timestamptz,
 team_suspect uuid references public.mm_suspects, success boolean,
 unique(id,room_id)
);
create table public.mm_evidence (
 id uuid primary key default gen_random_uuid(), game_id uuid not null references public.mm_games,
 room_id uuid not null references public.mm_rooms, user_id uuid references public.mm_profiles,
 title text not null, body text not null, stage int not null,
 foreign key(game_id,room_id) references public.mm_games(id,room_id)
);
create index mm_evidence_room on public.mm_evidence(room_id);
create table public.mm_messages (
 id uuid primary key default gen_random_uuid(), room_id uuid not null references public.mm_rooms,
 user_id uuid not null references public.mm_profiles, body text not null check(char_length(body) between 1 and 500),
 sent_at timestamptz not null default now()
);
create index mm_messages_room_time on public.mm_messages(room_id,sent_at);
create table public.mm_votes (
 game_id uuid not null references public.mm_games, room_id uuid not null references public.mm_rooms,
 user_id uuid not null references public.mm_profiles, suspect_id uuid not null references public.mm_suspects,
 voted_at timestamptz not null default now(), primary key(game_id,user_id),
 foreign key(room_id,user_id) references public.mm_participants,
 foreign key(game_id,room_id) references public.mm_games(id,room_id)
);
create table public.mm_results (
 game_id uuid not null references public.mm_games, room_id uuid not null references public.mm_rooms,
 user_id uuid not null references public.mm_profiles, correct boolean not null, points int not null check(points in (0,50,100,150)),
 primary key(game_id,user_id), foreign key(game_id,room_id) references public.mm_games(id,room_id)
);
create index mm_results_user on public.mm_results(user_id);

-- Membership lookup is private to avoid recursive participant RLS.
create function mm_private.member(rid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.mm_participants where room_id=rid and user_id=auth.uid());
$$;
create function mm_private.visible_evidence(gid uuid, st int) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.mm_games g where g.id=gid and g.stage>=st and mm_private.member(g.room_id));
$$;
-- Every table has RLS. Direct writes are denied: all mutation goes through checked functions.
do $$ declare t text; begin
 foreach t in array array['mm_profiles','mm_cases','mm_suspects','mm_rooms','mm_participants','mm_games','mm_evidence','mm_messages','mm_votes','mm_results'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 execute format('grant select on public.%I to authenticated',t);
 end loop;
end $$;
alter table mm_private.solutions enable row level security;
alter table mm_private.clues enable row level security;
revoke all on all tables in schema mm_private from public,anon,authenticated;
create policy own_or_room_profile on public.mm_profiles for select to authenticated using (
 id=(select auth.uid()) or exists(select 1 from public.mm_participants p where p.user_id=id and mm_private.member(p.room_id))
);
create policy case_catalog on public.mm_cases for select to authenticated using (true);
create policy suspect_catalog on public.mm_suspects for select to authenticated using (true);
create policy room_member on public.mm_rooms for select to authenticated using (mm_private.member(id));
create policy participant_member on public.mm_participants for select to authenticated using (mm_private.member(room_id));
create policy game_member on public.mm_games for select to authenticated using (mm_private.member(room_id));
create policy evidence_owner on public.mm_evidence for select to authenticated using (
 (user_id is null or user_id=(select auth.uid())) and mm_private.visible_evidence(game_id,stage)
);
create policy chat_member on public.mm_messages for select to authenticated using (mm_private.member(room_id));
create policy own_vote on public.mm_votes for select to authenticated using (user_id=(select auth.uid()) and mm_private.member(room_id));
create policy result_member on public.mm_results for select to authenticated using (mm_private.member(room_id));

-- Room row locks serialize every mutation, including final vote versus timer closure.
create function mm_private.finish(gid uuid) returns void language plpgsql security definer set search_path='' as $$
declare g public.mm_games; winner uuid; right_id uuid; best int; tied int; won boolean;
begin
 if auth.uid() is null then raise exception 'MM:Inicia sesión.'; end if;
 select * into g from public.mm_games where id=gid;
 if not mm_private.member(g.room_id) then raise exception 'MM:No perteneces a la sala.'; end if;
 if g.stage=3 then return; end if;
 select suspect_id into right_id from mm_private.solutions where case_id=g.case_id;
 select max(n) into best from (select count(*) n from public.mm_votes where game_id=gid group by suspect_id) a;
 select count(*) into tied from (select suspect_id from public.mm_votes where game_id=gid group by suspect_id having count(*)=best) a;
 if tied=1 then select suspect_id into winner from public.mm_votes where game_id=gid group by suspect_id order by count(*) desc limit 1; end if;
 won:=coalesce(winner=right_id,false);
 update public.mm_games set stage=3,finished_at=now(),team_suspect=winner,success=won where id=gid;
 update public.mm_rooms set status='finished' where id=g.room_id;
 insert into public.mm_results(game_id,room_id,user_id,correct,points)
 select gid,g.room_id,p.user_id,coalesce(v.suspect_id=right_id,false),
 (case when v.suspect_id=right_id then 100 else 0 end)+(case when won then 50 else 0 end)
 from public.mm_participants p left join public.mm_votes v on v.game_id=gid and v.user_id=p.user_id
 where p.room_id=g.room_id and p.in_game on conflict do nothing;
end $$;
create function mm_private.advance(rid uuid) returns void language plpgsql security definer set search_path='' as $$
declare g public.mm_games; r public.mm_rooms;
begin
 if auth.uid() is null or not mm_private.member(rid) then raise exception 'MM:No perteneces a la sala.'; end if;
 select * into r from public.mm_rooms where id=rid for update;
 select * into g from public.mm_games where room_id=rid;
 if not found then return; end if;
 while g.stage<3 and g.phase_ends_at<=now() loop
 if g.stage=2 then perform mm_private.finish(g.id); return; end if;
 g.stage:=g.stage+1;
 g.phase_ends_at:=g.phase_ends_at+make_interval(mins=>case when g.stage=2 then r.vote_minutes else r.minutes end);
 update public.mm_games set stage=g.stage,phase_ends_at=g.phase_ends_at where id=g.id;
 end loop;
end $$;

create function mm_private.action(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); op text:=payload->>'action'; r public.mm_rooms; g public.mm_games;
 c uuid; code text; n int; i int:=0; clue record; players uuid[]; sid uuid; anonymous boolean;
begin
 if uid is null then raise exception 'MM:Inicia sesión.'; end if;
 select coalesce((auth.jwt()->>'is_anonymous')::boolean,false) into anonymous;
 if op='profile' then
 if char_length(trim(payload->>'name')) not between 2 and 24 or (payload->>'avatar') not in ('lupa','huella','llave','luna') or payload->>'name' is null or payload->>'avatar' is null then raise exception 'MM:Perfil inválido.'; end if;
 insert into public.mm_profiles(id,name,avatar) values(uid,trim(payload->>'name'),payload->>'avatar') on conflict(id) do update set name=excluded.name,avatar=excluded.avatar;
 return '{}'::jsonb;
 end if;
 if not exists(select 1 from public.mm_profiles where id=uid) then raise exception 'MM:Guarda primero tu perfil.'; end if;
 if op='create' then
 if (payload->>'minutes')::int not between 1 and 15 or (payload->>'voteMinutes')::int not between 1 and 5 then raise exception 'MM:Duración inválida.'; end if;
 -- Per-user advisory lock protects room quota against concurrent create calls.
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 if (select count(*) from public.mm_rooms where host_id=uid and status<>'finished' and created_at>now()-interval '24 hours')>=5 then raise exception 'MM:Ya tienes cinco salas recientes abiertas.'; end if;
 if anonymous and not coalesce((payload->>'allowGuests')::boolean,false) then raise exception 'MM:Los invitados solo pueden crear salas que admitan invitados.'; end if;
 select id into c from public.mm_cases where slug='ultima-luz';
 if c is null then raise exception 'MM:Falta cargar el caso inicial.'; end if;
 loop
 code:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
 begin
 insert into public.mm_rooms(code,host_id,case_id,allow_guests,minutes,vote_minutes) values(code,uid,c,(payload->>'allowGuests')::boolean,(payload->>'minutes')::int,(payload->>'voteMinutes')::int) returning * into r;
 exit;
 exception when unique_violation then null;
 end;
 end loop;
 insert into public.mm_participants(room_id,user_id) values(r.id,uid);
 return jsonb_build_object('code',code);
 end if;
 if coalesce(payload->>'code','') !~ '^[A-F0-9]{8}$' then raise exception 'MM:Código inválido.'; end if;
 select * into r from public.mm_rooms where mm_rooms.code=payload->>'code' for update;
 if not found then raise exception 'MM:No se encontró esa sala.'; end if;
 if op='join' then
 if anonymous and not r.allow_guests then raise exception 'MM:Esta sala requiere una cuenta.'; end if;
 if exists(select 1 from public.mm_participants where room_id=r.id and user_id=uid) then
 update public.mm_participants set last_seen=now() where room_id=r.id and user_id=uid;
 return jsonb_build_object('code',r.code);
 end if;
 if r.status<>'lobby' then raise exception 'MM:La partida ya comenzó.'; end if;
 if (select count(*) from public.mm_participants where room_id=r.id)>=8 then raise exception 'MM:La sala está llena.'; end if;
 insert into public.mm_participants(room_id,user_id) values(r.id,uid);
 return jsonb_build_object('code',r.code);
 end if;
 if not mm_private.member(r.id) then raise exception 'MM:No perteneces a la sala.'; end if;
 update public.mm_participants set last_seen=now() where room_id=r.id and user_id=uid;
 perform mm_private.advance(r.id);
 select * into g from public.mm_games where room_id=r.id;
 if op='tick' then return '{}'::jsonb; end if;
 if op='claim' then
 if exists(select 1 from public.mm_participants where room_id=r.id and user_id=r.host_id and last_seen>now()-interval '45 seconds') then raise exception 'MM:El anfitrión sigue conectado.'; end if;
 update public.mm_rooms set host_id=uid where id=r.id;
 return '{}'::jsonb;
 end if;
 if op='ready' then
 if r.status<>'lobby' then raise exception 'MM:La partida ya comenzó.'; end if;
 update public.mm_participants set ready=(payload->>'ready')::boolean where room_id=r.id and user_id=uid;
 elsif op='start' then
 if r.host_id<>uid then raise exception 'MM:Solo el anfitrión puede iniciar.'; end if;
 if r.status<>'lobby' then raise exception 'MM:La partida ya comenzó.'; end if;
 select array_agg(user_id order by joined_at,user_id),count(*) into players,n from public.mm_participants where room_id=r.id and last_seen>now()-interval '45 seconds';
 if n<2 then raise exception 'MM:Se necesitan dos jugadores conectados.'; end if;
 if exists(select 1 from public.mm_participants where room_id=r.id and user_id=any(players) and not ready) then raise exception 'MM:Todos deben marcarse como listos.'; end if;
 update public.mm_participants set in_game=true where room_id=r.id and user_id=any(players);
 insert into public.mm_games(room_id,case_id,phase_ends_at) values(r.id,r.case_id,now()+make_interval(mins=>r.minutes)) returning * into g;
 update public.mm_rooms set status='active' where id=r.id;
 for clue in select * from mm_private.clues where case_id=r.case_id order by position loop
 insert into public.mm_evidence(game_id,room_id,user_id,title,body,stage) values(g.id,r.id,case when clue.private then players[(i % n)+1] else null end,clue.title,clue.body,clue.stage);
 if clue.private then i:=i+1; end if;
 end loop;
 elsif op='chat' then
 if g.stage=3 then raise exception 'MM:La partida terminó.'; end if;
 if char_length(trim(payload->>'text')) not between 1 and 500 or payload->>'text' is null then raise exception 'MM:Escribe entre 1 y 500 caracteres.'; end if;
 if exists(select 1 from public.mm_messages where room_id=r.id and user_id=uid and sent_at>now()-interval '1 second') then raise exception 'MM:Espera un segundo entre mensajes.'; end if;
 insert into public.mm_messages(room_id,user_id,body) values(r.id,uid,trim(payload->>'text'));
 elsif op='vote' then
 if g.id is null or g.stage<>2 then raise exception 'MM:La votación no está abierta.'; end if;
 if not exists(select 1 from public.mm_participants where room_id=r.id and user_id=uid and in_game) then raise exception 'MM:No participas en esta partida.'; end if;
 sid:=(payload->>'suspect')::uuid;
 if not exists(select 1 from public.mm_suspects where id=sid and case_id=r.case_id) then raise exception 'MM:Sospechoso inválido.'; end if;
 if exists(select 1 from public.mm_votes where game_id=g.id and user_id=uid) then raise exception 'MM:Tu voto ya está registrado.'; end if;
 insert into public.mm_votes(game_id,room_id,user_id,suspect_id) values(g.id,r.id,uid,sid);
 if (select count(*) from public.mm_votes where game_id=g.id)=(select count(*) from public.mm_participants where room_id=r.id and in_game) then perform mm_private.finish(g.id); end if;
 else raise exception 'MM:Acción desconocida.';
 end if;
 return '{}'::jsonb;
end $$;

create function mm_private.snapshot(code text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare r public.mm_rooms; g public.mm_games; answer jsonb;
begin
 if auth.uid() is null then raise exception 'MM:Inicia sesión.'; end if;
 select * into r from public.mm_rooms where mm_rooms.code=snapshot.code;
 if not found or not mm_private.member(r.id) then raise exception 'MM:No perteneces a esta sala. Únete desde el panel.'; end if;
 select * into g from public.mm_games where room_id=r.id;
 if g.stage=3 then select jsonb_build_object('suspect_id',suspect_id,'explanation',explanation) into answer from mm_private.solutions where case_id=g.case_id; end if;
 return jsonb_build_object(
 'room',to_jsonb(r),'game',case when g.id is null then null else to_jsonb(g) end,
 'case',(select to_jsonb(c) from public.mm_cases c where id=r.case_id),
 'participants',(select coalesce(jsonb_agg(to_jsonb(p)||jsonb_build_object('name',pr.name,'avatar',pr.avatar) order by p.joined_at),'[]') from public.mm_participants p join public.mm_profiles pr on pr.id=p.user_id where p.room_id=r.id),
 'suspects',(select coalesce(jsonb_agg(s order by s.name),'[]') from public.mm_suspects s where case_id=r.case_id),
 'evidence',(select coalesce(jsonb_agg(e order by e.stage,e.title),'[]') from public.mm_evidence e where game_id=g.id and e.stage<=g.stage and (e.user_id is null or e.user_id=auth.uid())),
 'messages',(select coalesce(jsonb_agg(m order by m.sent_at),'[]') from (select m.*,pr.name from public.mm_messages m join public.mm_profiles pr on pr.id=m.user_id where m.room_id=r.id order by m.sent_at desc limit 100) m),
 'my_vote',(select suspect_id from public.mm_votes where game_id=g.id and user_id=auth.uid()),
 'vote_count',(select count(*) from public.mm_votes where game_id=g.id),
 'results',(select coalesce(jsonb_agg(to_jsonb(res)||jsonb_build_object('name',pr.name) order by points desc,pr.name),'[]') from public.mm_results res join public.mm_profiles pr on pr.id=res.user_id where game_id=g.id),
 'solution',answer,'server_now',now()
 );
end $$;
create function mm_private.home() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'MM:Inicia sesión.'; end if;
 return jsonb_build_object(
 'profile',(select to_jsonb(p) from public.mm_profiles p where id=auth.uid()),
 'rooms',(select coalesce(jsonb_agg(r order by created_at desc),'[]') from (select r.code,r.status,r.created_at from public.mm_rooms r join public.mm_participants p on p.room_id=r.id where p.user_id=auth.uid() order by r.created_at desc limit 10) r),
 'history',(select coalesce(jsonb_agg(h order by finished_at desc),'[]') from (select r.points,r.correct,g.finished_at,c.title,ro.code from public.mm_results r join public.mm_games g on g.id=r.game_id join public.mm_cases c on c.id=g.case_id join public.mm_rooms ro on ro.id=g.room_id where r.user_id=auth.uid() order by g.finished_at desc limit 20) h),
 'stats',(select jsonb_build_object('games',count(*),'correct',count(*) filter(where correct),'points',coalesce(sum(points),0)) from public.mm_results where user_id=auth.uid()),
 'leaderboard',(select coalesce(jsonb_agg(l order by points desc,name),'[]') from (select p.name,p.avatar,sum(r.points) points,count(*) games from public.mm_results r join public.mm_profiles p on p.id=r.user_id group by p.id order by points desc,p.name limit 10) l)
 );
end $$;

-- Public entry points are invokers; privilege and membership checks live in the private schema.
create function public.mm_action(payload jsonb) returns jsonb language sql security invoker set search_path='' as $$ select mm_private.action(payload); $$;
create function public.mm_snapshot(code text) returns jsonb language sql stable security invoker set search_path='' as $$ select mm_private.snapshot(code); $$;
create function public.mm_home() returns jsonb language sql stable security invoker set search_path='' as $$ select mm_private.home(); $$;
revoke all on all functions in schema mm_private from public,anon,authenticated;
grant execute on function mm_private.member(uuid), mm_private.visible_evidence(uuid,int), mm_private.action(jsonb), mm_private.snapshot(text), mm_private.home() to authenticated;
revoke all on function public.mm_action(jsonb), public.mm_snapshot(text), public.mm_home() from public,anon;
grant execute on function public.mm_action(jsonb), public.mm_snapshot(text), public.mm_home() to authenticated;

-- Subscribe only to tables without solution text. Realtime still applies SELECT RLS.
do $$ declare t text; begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') then
 foreach t in array array['mm_rooms','mm_participants','mm_games','mm_messages','mm_evidence','mm_results'] loop
 execute format('alter publication supabase_realtime add table public.%I',t);
 end loop;
 end if;
end $$;
