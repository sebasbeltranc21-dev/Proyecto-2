-- Transactional hosted check. All identities, profiles, rooms and results are rolled back.
begin;
select set_config('mm_test.a',gen_random_uuid()::text,true),set_config('mm_test.b',gen_random_uuid()::text,true);
insert into auth.users(id) values(current_setting('mm_test.a')::uuid),(current_setting('mm_test.b')::uuid);
select set_config('request.jwt.claim.sub',current_setting('mm_test.a'),true);
set local role authenticated;
select public.mm_action('{"action":"profile","name":"Prueba teatro A","avatar":"lupa"}');
select set_config('mm_test.code',public.mm_action('{"action":"create","caseSlug":"ultimo-acto","minutes":1,"voteMinutes":1,"allowGuests":false}')->>'code',true);
select set_config('request.jwt.claim.sub',current_setting('mm_test.b'),true);
select public.mm_action('{"action":"profile","name":"Prueba teatro B","avatar":"camara"}');
select public.mm_action(jsonb_build_object('action','join','code',current_setting('mm_test.code')));
select public.mm_action(jsonb_build_object('action','ready','code',current_setting('mm_test.code'),'ready',true));
select set_config('request.jwt.claim.sub',current_setting('mm_test.a'),true);
select public.mm_action(jsonb_build_object('action','ready','code',current_setting('mm_test.code'),'ready',true));
select public.mm_action(jsonb_build_object('action','start','code',current_setting('mm_test.code')));
do $$ declare s jsonb; begin
 s:=public.mm_snapshot(current_setting('mm_test.code'));
 if s->'case'->>'theme'<>'theater' or jsonb_array_length(s->'suspects')<>4 or jsonb_array_length(s->'case'->'locations')<>5 then raise exception 'Theater catalog failed'; end if;
 if s->'solution'<>'null'::jsonb or s->'results'<>'[]'::jsonb then raise exception 'Premature reveal'; end if;
 perform set_config('mm_test.right',(select value->>'id' from jsonb_array_elements(s->'suspects') where value->>'name'='Mara Vidal'),true);
 perform set_config('mm_test.other',(select value->>'id' from jsonb_array_elements(s->'suspects') where value->>'name'='Iván Ríos'),true);
end $$;
reset role;
update public.mm_games set stage=2,phase_ends_at=now()+interval '1 minute' where room_id=(select id from public.mm_rooms where code=current_setting('mm_test.code'));
set local role authenticated;
select public.mm_action(jsonb_build_object('action','vote','code',current_setting('mm_test.code'),'suspect',current_setting('mm_test.right')));
select set_config('request.jwt.claim.sub',current_setting('mm_test.b'),true);
do $$ declare s jsonb; n int; begin
 s:=public.mm_snapshot(current_setting('mm_test.code'));
 select count(*) into n from public.mm_votes;
 if s->'results'<>'[]'::jsonb or s->'solution'<>'null'::jsonb or n<>0 then raise exception 'Other ballot leaked before closure'; end if;
end $$;
select public.mm_action(jsonb_build_object('action','vote','code',current_setting('mm_test.code'),'suspect',current_setting('mm_test.other')));
select set_config('mm_test.final_b',(public.mm_snapshot(current_setting('mm_test.code'))->'results')::text,true);
select set_config('request.jwt.claim.sub',current_setting('mm_test.a'),true);
do $$ declare s jsonb; begin
 s:=public.mm_snapshot(current_setting('mm_test.code'));
 if s->'game'->>'stage'<>'3' or s->'solution'->>'suspect_id'<>current_setting('mm_test.right') then raise exception 'Closure or culprit failed'; end if;
 if (s->'results')::text<>current_setting('mm_test.final_b') or jsonb_array_length(s->'results')<>2 then raise exception 'Members see different ballots'; end if;
 if not exists(select 1 from jsonb_array_elements(s->'results') r where r->>'user_id'=current_setting('mm_test.a') and r->>'suspect_id'=current_setting('mm_test.right')) then raise exception 'Wrong revealed vote A'; end if;
 if not exists(select 1 from jsonb_array_elements(s->'results') r where r->>'user_id'=current_setting('mm_test.b') and r->>'suspect_id'=current_setting('mm_test.other')) then raise exception 'Wrong revealed vote B'; end if;
end $$;
select 'PASS: theater creation, secret voting, same final ballots and official culprit for both identities; transaction rolled back' as verification;
rollback;
