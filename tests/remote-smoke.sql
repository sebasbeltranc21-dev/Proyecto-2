-- Integration check for an isolated MODO MISTERIO database.
-- All fixture users and game rows are rolled back. No email or session is created.
-- Auth identity is emulated at the database boundary; this does not test Auth HTTP or Realtime delivery.
begin;
insert into auth.users(id,aud,role) values
 ('90000000-0000-4000-8000-000000000001','authenticated','authenticated'),
 ('90000000-0000-4000-8000-000000000002','authenticated','authenticated'),
 ('90000000-0000-4000-8000-000000000003','authenticated','authenticated');
select set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":false}',true);
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000001',true);
set local role authenticated;
select public.mm_action('{"action":"profile","name":"Prueba anfitrión","avatar":"lupa"}');
select set_config('mm_test.code',(public.mm_action('{"action":"create","minutes":1,"voteMinutes":1,"allowGuests":false}')->>'code'),true);
select public.mm_action(jsonb_build_object('action','ready','code',current_setting('mm_test.code'),'ready',true));
select set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000002","role":"authenticated","is_anonymous":false}',true);
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000002',true);
select public.mm_action('{"action":"profile","name":"Prueba jugador","avatar":"huella"}');
select public.mm_action(jsonb_build_object('action','join','code',current_setting('mm_test.code')));
select public.mm_action(jsonb_build_object('action','ready','code',current_setting('mm_test.code'),'ready',true));
select set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":false}',true);
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000001',true);
select public.mm_action(jsonb_build_object('action','start','code',current_setting('mm_test.code')));
do $$ declare s jsonb; begin
 s:=public.mm_snapshot(current_setting('mm_test.code'));
 if (s->'game'->>'stage')::int<>0 or jsonb_array_length(s->'participants')<>2 then raise exception 'TEST FAILED: start'; end if;
 if s->'solution'<>'null'::jsonb then raise exception 'TEST FAILED: solution leaked'; end if;
 if (select count(*) from public.mm_evidence where user_id is not null)<>2 then raise exception 'TEST FAILED: own clues'; end if;
 if exists(select 1 from public.mm_evidence where user_id is not null and user_id<>auth.uid()) then raise exception 'TEST FAILED: foreign clues'; end if;
 begin perform 1 from mm_private.solutions; raise exception 'TEST FAILED: solution permission'; exception when insufficient_privilege then null; end;
 begin update public.mm_games set stage=3; raise exception 'TEST FAILED: direct state update'; exception when insufficient_privilege then null; end;
end $$;
select public.mm_action(jsonb_build_object('action','chat','code',current_setting('mm_test.code'),'text','Probando la integración real de PostgreSQL.'));
select set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000002","role":"authenticated","is_anonymous":false}',true);
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000002',true);
select public.mm_action(jsonb_build_object('action','join','code',current_setting('mm_test.code')));
do $$ declare s jsonb; begin
 s:=public.mm_snapshot(current_setting('mm_test.code'));
 if jsonb_array_length(s->'participants')<>2 or jsonb_array_length(s->'messages')<>1 then raise exception 'TEST FAILED: chat/reconnect'; end if;
 if exists(select 1 from public.mm_evidence where user_id is not null and user_id<>auth.uid()) then raise exception 'TEST FAILED: player private clues'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000003","role":"authenticated","is_anonymous":false}',true);
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000003',true);
do $$ begin
 if exists(select 1 from public.mm_rooms where code=current_setting('mm_test.code')) then raise exception 'TEST FAILED: outsider room'; end if;
 begin perform public.mm_snapshot(current_setting('mm_test.code')); raise exception 'TEST FAILED: outsider snapshot'; exception when raise_exception then if sqlerrm not like 'MM:%' then raise; end if; end;
end $$;
reset role;
update public.mm_games set stage=2,phase_ends_at=now()+interval '1 minute' where room_id=(select id from public.mm_rooms where code=current_setting('mm_test.code'));
select set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":false}',true);
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000001',true);
set local role authenticated;
select public.mm_action(jsonb_build_object('action','vote','code',current_setting('mm_test.code'),'suspect','20000000-0000-4000-8000-000000000001'));
do $$ declare r jsonb; begin
 r:=public.mm_action(jsonb_build_object('action','vote','code',current_setting('mm_test.code'),'suspect','20000000-0000-4000-8000-000000000001'));
 if coalesce(r->>'error','') not like 'MM:%ya está registrado%' then raise exception 'TEST FAILED: duplicate vote'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000002","role":"authenticated","is_anonymous":false}',true);
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000002',true);
select public.mm_action(jsonb_build_object('action','vote','code',current_setting('mm_test.code'),'suspect','20000000-0000-4000-8000-000000000001'));
select public.mm_action(jsonb_build_object('action','tick','code',current_setting('mm_test.code')));
do $$ declare s jsonb; begin
 s:=public.mm_snapshot(current_setting('mm_test.code'));
 if (s->'game'->>'stage')::int<>3 or not (s->'game'->>'success')::boolean then raise exception 'TEST FAILED: finish'; end if;
 if s->'solution'->>'suspect_id'<>'20000000-0000-4000-8000-000000000001' then raise exception 'TEST FAILED: official answer'; end if;
 if jsonb_array_length(s->'results')<>2 or exists(select 1 from jsonb_array_elements(s->'results') r where (r->>'points')::int<>150) then raise exception 'TEST FAILED: points'; end if;
end $$;
rollback;
select jsonb_build_object('passed',true,'boundary','hosted PostgreSQL with emulated Auth identity','scenarios',array['room/start','private clues/RLS','chat','reconnect','outsider denial','immutable votes','official solution and points'],'fixtures','rolled back') as verification;
