-- Additive exploration metadata and a deliberately shared investigation board.
-- Existing game content, ownership, deadlines and points remain intact.
alter table public.mm_cases add column theme text not null default 'museum' check(theme in ('museum','train'));
alter table public.mm_suspects add column portrait text not null default 'unknown';
create table public.mm_case_locations (
 id uuid primary key default gen_random_uuid(),
 case_id uuid not null references public.mm_cases,
 key text not null, name text not null, description text not null,
 stage int not null check(stage in (0,1)), position int not null,
 unique(case_id,key), unique(case_id,id)
);
alter table public.mm_case_locations enable row level security;
revoke all on public.mm_case_locations from public,anon,authenticated;
grant select on public.mm_case_locations to authenticated;
create policy location_catalog on public.mm_case_locations for select to authenticated using(true);
alter table mm_private.clues add column location_id uuid;
alter table mm_private.clues add foreign key(case_id,location_id) references public.mm_case_locations(case_id,id);
alter table public.mm_evidence add column location_id uuid references public.mm_case_locations;
create index mm_clues_location on mm_private.clues(location_id);
create index mm_evidence_location on public.mm_evidence(location_id);

insert into public.mm_case_locations(case_id,key,name,description,stage,position)
select c.id,v.key,v.name,v.description,v.stage,v.position from public.mm_cases c cross join (values
 ('gallery','Sala del zafiro','La vitrina y el registro de la noche del robo.',0,1),
 ('lab','Laboratorio','Cámaras, restauración y materiales del taller.',0,2),
 ('hall','Vestíbulo y terraza','Testimonios y movimientos de los invitados.',0,3),
 ('archive','Archivo de seguridad','Informes de accesos y revisión técnica.',1,4)
) v(key,name,description,stage,position) where c.slug='ultima-luz';
update public.mm_suspects s set portrait=v.portrait from public.mm_cases c,
 (values ('Clara Vidal','restorer'),('Bruno Salas','guard'),('Inés Duarte','reporter'),('Mateo Ríos','collector')) v(name,portrait)
 where s.case_id=c.id and c.slug='ultima-luz' and s.name=v.name;
update mm_private.clues q set location_id=l.id from public.mm_case_locations l,public.mm_cases c
 where c.slug='ultima-luz' and q.case_id=c.id and l.case_id=c.id and l.key=case
 when q.title ilike '%cámara%' or q.title ilike '%barniz%' or q.title ilike '%embalaje%' or q.title ilike '%coartada%' then 'lab'
 when q.title ilike '%audio%' or q.title ilike '%llamada%' then 'hall'
 when q.stage=1 or q.title ilike '%técnico%' then 'archive'
 else 'gallery' end;
-- The technician's first-phase testimony must remain explorable in phase one.
update mm_private.clues q set location_id=l.id from public.mm_case_locations l
 where l.case_id=q.case_id and l.key='hall' and q.title='El técnico de guardia';
update public.mm_evidence e set location_id=q.location_id from mm_private.clues q,public.mm_games g
 where e.game_id=g.id and g.case_id=q.case_id and e.title=q.title;

create table public.mm_timeline (
 id uuid primary key default gen_random_uuid(),
 game_id uuid not null references public.mm_games,
 room_id uuid not null references public.mm_rooms,
 user_id uuid not null references public.mm_profiles,
 evidence_id uuid not null references public.mm_evidence,
 minute int not null check(minute between 0 and 1439),
 title text not null, body text not null, shared_private boolean not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(game_id,evidence_id), foreign key(game_id,room_id) references public.mm_games(id,room_id)
);
create index mm_timeline_room_minute on public.mm_timeline(room_id,minute,created_at);
create index mm_timeline_user on public.mm_timeline(user_id);
create index mm_timeline_evidence on public.mm_timeline(evidence_id);
alter table public.mm_timeline enable row level security;
revoke all on public.mm_timeline from public,anon,authenticated;
grant select on public.mm_timeline to authenticated;
create policy timeline_member on public.mm_timeline for select to authenticated using(mm_private.member(room_id));

create function mm_private.timeline_action(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); r public.mm_rooms; g public.mm_games; item public.mm_evidence; entry public.mm_timeline; proposed_minute int;
begin
 if uid is null then raise exception 'MM:Inicia sesión.'; end if;
 if coalesce(payload->>'code','') !~ '^[A-F0-9]{8}$' then raise exception 'MM:Código inválido.'; end if;
 select * into r from public.mm_rooms where code=payload->>'code' for update;
 if not found or not mm_private.member(r.id) then raise exception 'MM:No perteneces a la sala.'; end if;
 perform mm_private.advance(r.id);
 select * into g from public.mm_games where room_id=r.id;
 if g.id is null or g.stage>=2 then raise exception 'MM:La cronología solo se edita durante la investigación.'; end if;
 if not exists(select 1 from public.mm_participants where room_id=r.id and user_id=uid and in_game) then raise exception 'MM:Solo los investigadores activos pueden editar la cronología.'; end if;
 update public.mm_participants set last_seen=now() where room_id=r.id and user_id=uid;
 if payload->>'action'='timeline_pin' then
 proposed_minute:=(payload->>'minute')::int;
 if proposed_minute is null or proposed_minute not between 0 and 1439 then raise exception 'MM:Indica una hora válida.'; end if;
 select * into item from public.mm_evidence e where e.id=(payload->>'evidence')::uuid and e.game_id=g.id and e.stage<=g.stage and (e.user_id is null or e.user_id=uid);
 if not found then raise exception 'MM:No puedes compartir esa evidencia.'; end if;
 if item.user_id is not null and not coalesce((payload->>'sharePrivate')::boolean,false) then raise exception 'MM:Confirma que quieres compartir el contenido de tu pista privada.'; end if;
 select * into entry from public.mm_timeline where game_id=g.id and evidence_id=item.id;
 if found then
 if entry.user_id<>uid then raise exception 'MM:Esa pista ya está en la cronología. Solo quien la añadió puede cambiar su hora.'; end if;
 update public.mm_timeline set minute=proposed_minute,updated_at=now() where id=entry.id;
 else
 insert into public.mm_timeline(game_id,room_id,user_id,evidence_id,minute,title,body,shared_private)
 values(g.id,r.id,uid,item.id,proposed_minute,item.title,item.body,item.user_id is not null);
 end if;
 elsif payload->>'action'='timeline_remove' then
 select * into entry from public.mm_timeline where id=(payload->>'entry')::uuid and game_id=g.id;
 if not found then return '{}'::jsonb; end if;
 if entry.user_id<>uid then raise exception 'MM:Solo puedes retirar las pistas que añadiste tú.'; end if;
 delete from public.mm_timeline where id=entry.id;
 else raise exception 'MM:Acción desconocida.';
 end if;
 return '{}'::jsonb;
end $$;
revoke all on function mm_private.timeline_action(jsonb) from public,anon,authenticated;

create or replace function mm_private.action(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
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
 select id into c from public.mm_cases where slug=coalesce(payload->>'caseSlug','ultima-luz') and mode='cooperative' and exists(select 1 from mm_private.solutions sol where sol.case_id=mm_cases.id);
 if c is null then raise exception 'MM:El caso seleccionado no está disponible.'; end if;
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
 insert into public.mm_evidence(game_id,room_id,user_id,title,body,stage,location_id) values(g.id,r.id,case when clue.private then players[(i % n)+1] else null end,clue.title,clue.body,clue.stage,clue.location_id);
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


create or replace function mm_private.snapshot(code text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare r public.mm_rooms; g public.mm_games; answer jsonb;
begin
 if auth.uid() is null then raise exception 'MM:Inicia sesión.'; end if;
 select * into r from public.mm_rooms where mm_rooms.code=snapshot.code;
 if not found or not mm_private.member(r.id) then raise exception 'MM:No perteneces a esta sala. Únete desde el panel.'; end if;
 select * into g from public.mm_games where room_id=r.id;
 if g.stage=3 then select jsonb_build_object('suspect_id',suspect_id,'explanation',explanation) into answer from mm_private.solutions where case_id=g.case_id; end if;
 return jsonb_build_object(
 'room',to_jsonb(r),'game',case when g.id is null then null else to_jsonb(g) end,
 'case',(select to_jsonb(c)||jsonb_build_object('locations',(select coalesce(jsonb_agg(l order by l.position),'[]') from public.mm_case_locations l where l.case_id=c.id)) from public.mm_cases c where id=r.case_id),
 'participants',(select coalesce(jsonb_agg(to_jsonb(p)||jsonb_build_object('name',pr.name,'avatar',pr.avatar) order by p.joined_at),'[]') from public.mm_participants p join public.mm_profiles pr on pr.id=p.user_id where p.room_id=r.id),
 'suspects',(select coalesce(jsonb_agg(s order by s.name),'[]') from public.mm_suspects s where case_id=r.case_id),
 'evidence',(select coalesce(jsonb_agg(e order by e.stage,e.title),'[]') from public.mm_evidence e where game_id=g.id and e.stage<=g.stage and (e.user_id is null or e.user_id=auth.uid())),
 'messages',(select coalesce(jsonb_agg(m order by m.sent_at),'[]') from (select m.*,pr.name from public.mm_messages m join public.mm_profiles pr on pr.id=m.user_id where m.room_id=r.id order by m.sent_at desc limit 100) m),
 'my_vote',(select suspect_id from public.mm_votes where game_id=g.id and user_id=auth.uid()),
 'vote_count',(select count(*) from public.mm_votes where game_id=g.id),
 'results',(select coalesce(jsonb_agg(to_jsonb(res)||jsonb_build_object('name',pr.name) order by points desc,pr.name),'[]') from public.mm_results res join public.mm_profiles pr on pr.id=res.user_id where game_id=g.id),
 'timeline',(select coalesce(jsonb_agg(to_jsonb(t)||jsonb_build_object('name',pr.name) order by t.minute,t.created_at,t.id),'[]') from public.mm_timeline t join public.mm_profiles pr on pr.id=t.user_id where t.game_id=g.id),
 'solution',answer,'server_now',now()
 );
end $$;

create or replace function mm_private.home() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'MM:Inicia sesión.'; end if;
 return jsonb_build_object(
 'cases',(select coalesce(jsonb_agg(jsonb_build_object('slug',c.slug,'title',c.title,'intro',c.intro,'theme',c.theme,'suspect_count',(select count(*) from public.mm_suspects s where s.case_id=c.id)) order by c.slug),'[]') from public.mm_cases c where c.mode='cooperative' and exists(select 1 from mm_private.solutions sol where sol.case_id=c.id)),
 'profile',(select to_jsonb(p) from public.mm_profiles p where id=auth.uid()),
 'rooms',(select coalesce(jsonb_agg(r order by created_at desc),'[]') from (select r.code,r.status,r.created_at,c.title from public.mm_rooms r join public.mm_cases c on c.id=r.case_id join public.mm_participants p on p.room_id=r.id where p.user_id=auth.uid() order by r.created_at desc limit 10) r),
 'history',(select coalesce(jsonb_agg(h order by finished_at desc),'[]') from (select r.points,r.correct,g.finished_at,c.title,ro.code from public.mm_results r join public.mm_games g on g.id=r.game_id join public.mm_cases c on c.id=g.case_id join public.mm_rooms ro on ro.id=g.room_id where r.user_id=auth.uid() order by g.finished_at desc limit 20) h),
 'stats',(select jsonb_build_object('games',count(*),'correct',count(*) filter(where correct),'points',coalesce(sum(points),0)) from public.mm_results where user_id=auth.uid()),
 'leaderboard',(select coalesce(jsonb_agg(l order by points desc,name),'[]') from (select p.name,p.avatar,sum(r.points) points,count(*) games from public.mm_results r join public.mm_profiles p on p.id=r.user_id group by p.id order by points desc,p.name limit 10) l)
 );
end $$;


create or replace function mm_private.dispatch(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
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
 if payload->>'action' in ('timeline_pin','timeline_remove') then return mm_private.timeline_action(payload); end if;
 return mm_private.action(payload);
 exception when raise_exception then
 return jsonb_build_object('error',sqlerrm);
 end;
end $$;

-- Preserve the original permission boundary after replacing internal functions.
revoke all on function mm_private.action(jsonb),mm_private.timeline_action(jsonb) from public,anon,authenticated;
do $$ begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') then
 alter publication supabase_realtime add table public.mm_timeline;
 end if;
end $$;
