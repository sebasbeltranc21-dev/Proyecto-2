-- Hosted verification; temporary identities and every game row roll back.
begin;
select set_config('mm_test.a',gen_random_uuid()::text,true),set_config('mm_test.b',gen_random_uuid()::text,true);
insert into auth.users(id) values(current_setting('mm_test.a')::uuid),(current_setting('mm_test.b')::uuid);
select set_config('request.jwt.claim.sub',current_setting('mm_test.a'),true);
set local role authenticated;
select public.mm_action('{"action":"profile","name":"Prueba cúpula A","avatar":"lupa"}');
select set_config('mm_test.code',public.mm_action('{"action":"create","caseSlug":"secreto-cupula","minutes":1,"voteMinutes":1,"allowGuests":false}')->>'code',true);
select set_config('request.jwt.claim.sub',current_setting('mm_test.b'),true);
select public.mm_action('{"action":"profile","name":"Prueba cúpula B","avatar":"camara"}');
select public.mm_action(jsonb_build_object('action','join','code',current_setting('mm_test.code')));
select public.mm_action(jsonb_build_object('action','ready','code',current_setting('mm_test.code'),'ready',true));
select set_config('request.jwt.claim.sub',current_setting('mm_test.a'),true);
select public.mm_action(jsonb_build_object('action','ready','code',current_setting('mm_test.code'),'ready',true));
select public.mm_action(jsonb_build_object('action','start','code',current_setting('mm_test.code')));
do $$ declare s jsonb; begin
 s:=public.mm_snapshot(current_setting('mm_test.code'));
 if s->'case'->>'theme'<>'observatory' or jsonb_array_length(s->'suspects')<>4 or jsonb_array_length(s->'case'->'locations')<>5 or jsonb_array_length(s->'evidence')<>6 then raise exception 'Lighthouse catalog or initial dealing failed'; end if;
 if s->'solution'<>'null'::jsonb or s->'results'<>'[]'::jsonb then raise exception 'Premature reveal'; end if;
 perform set_config('mm_test.right',(select value->>'id' from jsonb_array_elements(s->'suspects') where value->>'name'='Nico Ferrer'),true);
end $$;
reset role;
update public.mm_games set stage=1 where room_id=(select id from public.mm_rooms where code=current_setting('mm_test.code'));
set local role authenticated;
do $$ declare s jsonb; begin
 s:=public.mm_snapshot(current_setting('mm_test.code'));
 if jsonb_array_length(s->'evidence')<>12 or s->'solution'<>'null'::jsonb then raise exception 'Second phase or secrecy failed'; end if;
 perform set_config('mm_test.a_evidence',(s->'evidence')::text,true);
 perform set_config('mm_test.private',(select value->>'id' from jsonb_array_elements(s->'evidence') where value->>'user_id'=current_setting('mm_test.a') limit 1),true);
 if not (public.mm_action(jsonb_build_object('action','timeline_pin','code',current_setting('mm_test.code'),'evidence',current_setting('mm_test.private'),'minute',1387,'sharePrivate',false)) ? 'error') then raise exception 'Private clue shared without consent'; end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('mm_test.b'),true);
do $$ declare s jsonb; begin
 s:=public.mm_snapshot(current_setting('mm_test.code'));
 if jsonb_array_length(s->'evidence')<>12 or jsonb_array_length(s->'timeline')<>0 then raise exception 'Second player dealing failed'; end if;
 if exists(select 1 from jsonb_array_elements(s->'evidence') e where e->>'user_id'=current_setting('mm_test.a')) then raise exception 'Private evidence leaked'; end if;
 if (select count(distinct e->>'id') from jsonb_array_elements((current_setting('mm_test.a_evidence')::jsonb)||(s->'evidence')) e)<>16 then raise exception 'Incomplete shared case'; end if;
 begin
  perform 1 from mm_private.solutions;
  raise exception 'Private solution table accessible';
 exception when insufficient_privilege then null;
 end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('mm_test.a'),true);
select public.mm_action(jsonb_build_object('action','timeline_pin','code',current_setting('mm_test.code'),'evidence',current_setting('mm_test.private'),'minute',1387,'sharePrivate',true));
select public.mm_action(jsonb_build_object('action','chat','code',current_setting('mm_test.code'),'text','Prueba de cronología del faro.'));
select set_config('request.jwt.claim.sub',current_setting('mm_test.b'),true);
do $$ declare s jsonb; begin
 s:=public.mm_snapshot(current_setting('mm_test.code'));
 if not exists(select 1 from jsonb_array_elements(s->'timeline') e where e->>'evidence_id'=current_setting('mm_test.private') and (e->>'shared_private')::boolean) then raise exception 'Consensual sharing failed'; end if;
 if not exists(select 1 from jsonb_array_elements(s->'messages') e where e->>'body'='Prueba de cronología del faro.') then raise exception 'Chat failed'; end if;
end $$;
reset role;
update public.mm_games set stage=2,phase_ends_at=now()+interval '1 minute' where room_id=(select id from public.mm_rooms where code=current_setting('mm_test.code'));
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('mm_test.a'),true);
select public.mm_action(jsonb_build_object('action','vote','code',current_setting('mm_test.code'),'suspect',current_setting('mm_test.right')));
select set_config('request.jwt.claim.sub',current_setting('mm_test.b'),true);
do $$ declare s jsonb; begin
 s:=public.mm_snapshot(current_setting('mm_test.code'));
 if s->'results'<>'[]'::jsonb or s->'solution'<>'null'::jsonb or (select count(*) from public.mm_votes)<>0 then raise exception 'Vote leaked before closure'; end if;
end $$;
select public.mm_action(jsonb_build_object('action','vote','code',current_setting('mm_test.code'),'suspect',current_setting('mm_test.right')));
select set_config('mm_test.final_b',(public.mm_snapshot(current_setting('mm_test.code'))->'results')::text,true);
select set_config('request.jwt.claim.sub',current_setting('mm_test.a'),true);
do $$ declare s jsonb; begin
 s:=public.mm_snapshot(current_setting('mm_test.code'));
 if s->'game'->>'stage'<>'3' or s->'game'->>'success'<>'true' or s->'solution'->>'suspect_id'<>current_setting('mm_test.right') then raise exception 'Closure or culprit failed'; end if;
 if (s->'results')::text<>current_setting('mm_test.final_b') or jsonb_array_length(s->'results')<>2 then raise exception 'Members see different ballots'; end if;
 if exists(select 1 from jsonb_array_elements(s->'results') r where r->>'suspect_id'<>current_setting('mm_test.right') or r->>'correct'<>'true') then raise exception 'Wrong vote outcome'; end if;
end $$;
select 'PASS: observatory catalog, 16 clues, private dealing, explicit sharing, chat and matching winning results; temporary data rolled back' as verification;
rollback;
