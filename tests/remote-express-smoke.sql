-- Hosted PostgreSQL verification. Emulates three Auth identities, never email or sessions.
-- All fixture users and rows are rolled back. Run the complete script as one request.
begin;
insert into auth.users(id,aud,role) values
 ('92000000-0000-4000-8000-000000000001','authenticated','authenticated'),
 ('92000000-0000-4000-8000-000000000002','authenticated','authenticated'),
 ('92000000-0000-4000-8000-000000000003','authenticated','authenticated');
select set_config('request.jwt.claims','{"sub":"92000000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":false}',true);
select set_config('request.jwt.claim.sub','92000000-0000-4000-8000-000000000001',true);
set local role authenticated;
select public.mm_action('{"action":"profile","name":"Prueba Expreso A","avatar":"lupa"}');
select set_config('mm_test.express',(public.mm_action('{"action":"create","caseSlug":"expreso-medianoche","minutes":1,"voteMinutes":1,"allowGuests":false}')->>'code'),true);
select public.mm_action(jsonb_build_object('action','ready','code',current_setting('mm_test.express'),'ready',true));
select set_config('request.jwt.claims','{"sub":"92000000-0000-4000-8000-000000000002","role":"authenticated","is_anonymous":false}',true);
select set_config('request.jwt.claim.sub','92000000-0000-4000-8000-000000000002',true);
select public.mm_action('{"action":"profile","name":"Prueba Expreso B","avatar":"huella"}');
select public.mm_action(jsonb_build_object('action','join','code',current_setting('mm_test.express')));
select public.mm_action(jsonb_build_object('action','ready','code',current_setting('mm_test.express'),'ready',true));
select set_config('request.jwt.claims','{"sub":"92000000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":false}',true);
select set_config('request.jwt.claim.sub','92000000-0000-4000-8000-000000000001',true);
select public.mm_action(jsonb_build_object('action','start','code',current_setting('mm_test.express')));
do $$ declare s jsonb; e jsonb; result jsonb; begin
 s:=public.mm_snapshot(current_setting('mm_test.express'));
 if s->'case'->>'slug'<>'expreso-medianoche' or jsonb_array_length(s->'suspects')<>5 or jsonb_array_length(s->'case'->'locations')<>5 then raise exception 'TEST FAILED: case catalog'; end if;
 if jsonb_array_length(s->'evidence')<>5 or s->'solution'<>'null'::jsonb then raise exception 'TEST FAILED: first phase visibility'; end if;
 select value into e from jsonb_array_elements(s->'evidence') where value->>'user_id'=auth.uid()::text limit 1;
 perform set_config('mm_test.private',e->>'id',true);
 result:=public.mm_action(jsonb_build_object('action','timeline_pin','code',current_setting('mm_test.express'),'evidence',e->>'id','minute',1416));
 if coalesce(result->>'error','') not like 'MM:Confirma%' then raise exception 'TEST FAILED: missing consent'; end if;
 result:=public.mm_action(jsonb_build_object('action','timeline_pin','code',current_setting('mm_test.express'),'evidence',e->>'id','minute',1416,'sharePrivate',true,'body','FORGED'));
 if result ? 'error' then raise exception 'TEST FAILED: pin %',result; end if;
 s:=public.mm_snapshot(current_setting('mm_test.express'));
 if jsonb_array_length(s->'timeline')<>1 or s->'timeline'->0->>'body'<>e->>'body' or not (s->'timeline'->0->>'shared_private')::boolean then raise exception 'TEST FAILED: canonical shared copy'; end if;
 perform set_config('mm_test.entry',s->'timeline'->0->>'id',true);
 begin update public.mm_timeline set minute=0; raise exception 'TEST FAILED: direct write'; exception when insufficient_privilege then null; end;
 begin perform mm_private.timeline_action('{}'::jsonb); raise exception 'TEST FAILED: internal RPC'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"92000000-0000-4000-8000-000000000002","role":"authenticated","is_anonymous":false}',true);
select set_config('request.jwt.claim.sub','92000000-0000-4000-8000-000000000002',true);
do $$ declare s jsonb; result jsonb; begin
 s:=public.mm_snapshot(current_setting('mm_test.express'));
 if exists(select 1 from jsonb_array_elements(s->'evidence') e where e->>'id'=current_setting('mm_test.private')) then raise exception 'TEST FAILED: foreign original clue'; end if;
 if jsonb_array_length(s->'timeline')<>1 then raise exception 'TEST FAILED: shared board visibility'; end if;
 result:=public.mm_action(jsonb_build_object('action','timeline_pin','code',current_setting('mm_test.express'),'evidence',current_setting('mm_test.private'),'minute',1417,'sharePrivate',true));
 if coalesce(result->>'error','') not like 'MM:No puedes compartir%' then raise exception 'TEST FAILED: foreign private pin'; end if;
 result:=public.mm_action(jsonb_build_object('action','timeline_remove','code',current_setting('mm_test.express'),'entry',current_setting('mm_test.entry')));
 if coalesce(result->>'error','') not like 'MM:Solo puedes retirar%' then raise exception 'TEST FAILED: foreign removal'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"92000000-0000-4000-8000-000000000003","role":"authenticated","is_anonymous":false}',true);
select set_config('request.jwt.claim.sub','92000000-0000-4000-8000-000000000003',true);
do $$ begin
 if exists(select 1 from public.mm_timeline where id=current_setting('mm_test.entry')::uuid) then raise exception 'TEST FAILED: outsider board read'; end if;
 begin perform public.mm_snapshot(current_setting('mm_test.express')); raise exception 'TEST FAILED: outsider snapshot'; exception when raise_exception then if sqlerrm not like 'MM:%' then raise; end if; end;
end $$;
reset role;
update public.mm_games set phase_ends_at=now()-interval '1 second' where room_id=(select id from public.mm_rooms where code=current_setting('mm_test.express'));
select set_config('request.jwt.claims','{"sub":"92000000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":false}',true);
select set_config('request.jwt.claim.sub','92000000-0000-4000-8000-000000000001',true);
set local role authenticated;
select public.mm_action(jsonb_build_object('action','tick','code',current_setting('mm_test.express')));
do $$ declare s jsonb; begin
 s:=public.mm_snapshot(current_setting('mm_test.express'));
 if (s->'game'->>'stage')::int<>1 or jsonb_array_length(s->'evidence')<>10 then raise exception 'TEST FAILED: second phase'; end if;
 perform set_config('mm_test.responsible',e->>'id',true) from jsonb_array_elements(s->'suspects') e where e->>'name'='Elena Cruz';
end $$;
reset role;
update public.mm_games set phase_ends_at=now()-interval '1 second' where room_id=(select id from public.mm_rooms where code=current_setting('mm_test.express'));
set local role authenticated;
select public.mm_action(jsonb_build_object('action','tick','code',current_setting('mm_test.express')));
do $$ declare result jsonb; begin
 result:=public.mm_action(jsonb_build_object('action','timeline_remove','code',current_setting('mm_test.express'),'entry',current_setting('mm_test.entry')));
 if coalesce(result->>'error','') not like 'MM:La cronología solo se edita%' then raise exception 'TEST FAILED: board phase lock'; end if;
end $$;
select public.mm_action(jsonb_build_object('action','vote','code',current_setting('mm_test.express'),'suspect',current_setting('mm_test.responsible')));
select set_config('request.jwt.claims','{"sub":"92000000-0000-4000-8000-000000000002","role":"authenticated","is_anonymous":false}',true);
select set_config('request.jwt.claim.sub','92000000-0000-4000-8000-000000000002',true);
select public.mm_action(jsonb_build_object('action','vote','code',current_setting('mm_test.express'),'suspect',current_setting('mm_test.responsible')));
do $$ declare s jsonb; begin
 s:=public.mm_snapshot(current_setting('mm_test.express'));
 if (s->'game'->>'stage')::int<>3 or not (s->'game'->>'success')::boolean then raise exception 'TEST FAILED: train finish'; end if;
 if s->'solution'->>'suspect_id'<>current_setting('mm_test.responsible') or jsonb_array_length(s->'results')<>2 or exists(select 1 from jsonb_array_elements(s->'results') e where (e->>'points')::int<>150) then raise exception 'TEST FAILED: official answer and points'; end if;
 if jsonb_array_length(s->'timeline')<>1 then raise exception 'TEST FAILED: board persisted through closure'; end if;
end $$;
rollback;
select jsonb_build_object('passed',true,'boundary','hosted PostgreSQL; emulated Auth identities','case','expreso-medianoche','scenarios',array['case selection','phase unlock','private original isolation','explicit sharing','canonical copied content','author ownership','outsider RLS','direct/internal write denial','board phase lock','fixed answer and points'],'fixtures','rolled back') as verification;
