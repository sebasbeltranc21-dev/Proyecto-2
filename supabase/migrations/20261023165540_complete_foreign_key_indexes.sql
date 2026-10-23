-- Complete foreign-key coverage reported by the hosted Supabase advisor.
create index mm_solutions_case_suspect on mm_private.solutions(case_id,suspect_id);
create index mm_evidence_game_room on public.mm_evidence(game_id,room_id);
create index mm_evidence_user on public.mm_evidence(user_id);
create index mm_games_team_suspect on public.mm_games(team_suspect);
create index mm_results_game_room on public.mm_results(game_id,room_id);
create index mm_votes_game_room on public.mm_votes(game_id,room_id);
create index mm_votes_user on public.mm_votes(user_id);
