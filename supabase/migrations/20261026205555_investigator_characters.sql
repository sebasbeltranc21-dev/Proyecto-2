-- Keep all four saved keys and add the fifth investigator.
alter table public.mm_profiles drop constraint mm_profiles_avatar_check;
alter table public.mm_profiles add constraint mm_profiles_avatar_check check (avatar in ('lupa','huella','llave','luna','camara'));
do $migration$
declare definition text;
begin
  select pg_get_functiondef('mm_private.action(jsonb)'::regprocedure) into definition;
  if position($old$('lupa','huella','llave','luna')$old$ in definition)=0 then
    raise exception 'Expected avatar validator not found';
  end if;
  execute replace(definition, $old$('lupa','huella','llave','luna')$old$, $new$('lupa','huella','llave','luna','camara')$new$);
end $migration$;
