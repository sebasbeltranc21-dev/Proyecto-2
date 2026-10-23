-- Cover composite foreign keys reported by the hosted performance advisor.
create index mm_clues_case_location on mm_private.clues(case_id,location_id);
create index mm_timeline_game_room on public.mm_timeline(game_id,room_id);
