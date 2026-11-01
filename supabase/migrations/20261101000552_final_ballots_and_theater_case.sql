-- Reveal individual ballots only after settlement; existing membership checks remain.
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
 'results',case when g.stage=3 then (select coalesce(jsonb_agg(to_jsonb(res)||jsonb_build_object('name',pr.name,'suspect_id',v.suspect_id) order by res.points desc,pr.name,res.user_id),'[]') from public.mm_results res join public.mm_profiles pr on pr.id=res.user_id left join public.mm_votes v on v.game_id=res.game_id and v.user_id=res.user_id where res.game_id=g.id) else '[]'::jsonb end,
 'timeline',(select coalesce(jsonb_agg(to_jsonb(t)||jsonb_build_object('name',pr.name) order by t.minute,t.created_at,t.id),'[]') from public.mm_timeline t join public.mm_profiles pr on pr.id=t.user_id where t.game_id=g.id),
 'solution',answer,'server_now',now()
 );
end $$;

-- Add a third original cooperative case; resolve all generated IDs by stable keys.
alter table public.mm_cases drop constraint mm_cases_theme_check;
alter table public.mm_cases add constraint mm_cases_theme_check check(theme in ('museum','train','theater'));
do $$
declare c uuid; responsible uuid;
begin
 insert into public.mm_cases(slug,title,intro,theme,stages) values
 ('ultimo-acto','El último acto','A las 19:50, minutos antes del estreno en el Teatro Bellavista, desaparece la única partitura anotada de la compositora. Nadie ha resultado herido. La caja del archivo no fue forzada y las puertas exteriores permanecieron cerradas. Cuatro integrantes del teatro tenían acceso al edificio. Reconstruid el recorrido de la partitura antes de que se levante el telón.','theater',
 '[{"title":"Antes del estreno","story":"La caja de la partitura está vacía. Explorad el escenario, los camerinos y el archivo. Los relojes del teatro están sincronizados; compartid las pistas privadas que ayuden a reconstruir la noche."},{"title":"Detrás del telón","story":"Se abren la cabina y el almacén. Llegan los registros completos de acceso y las grabaciones continuas: contrastad las coartadas con el recorrido de un carro de utilería."},{"title":"La acusación","story":"La directora pide una conclusión antes de cancelar el estreno. Cada investigador dispone de un voto definitivo. Un empate deja al equipo sin acusación única."},{"title":"El último acto","story":"El expediente reúne los votos y revela quién ocultó la partitura y cómo lo hizo."}]') returning id into c;
 insert into public.mm_case_locations(case_id,key,name,description,stage,position) values
 (c,'stage','Escenario','Atriles, telón y marcas del ensayo.',0,1),(c,'dressing','Camerinos','Preparativos del reparto y llamadas de vestuario.',0,2),(c,'archive','Archivo musical','La caja cerrada y su lector de acceso.',0,3),(c,'booth','Cabina de sonido','Grabaciones continuas y consola de ensayo.',1,4),(c,'storage','Almacén de utilería','Carros numerados y cajas del montaje.',1,5);
 insert into public.mm_suspects(case_id,name,description,motive,alibi,portrait) values
 (c,'Mara Vidal','Regidora. Coordina entradas y traslados de utilería.','La dirección iba a suprimir su puesto después del estreno.','«Estuve en la cabina de sonido entre las 19:35 y las 19:50».','collector') returning id into responsible;
 insert into public.mm_suspects(case_id,name,description,motive,alibi,portrait) values
 (c,'Iván Ríos','Pianista. Preparó el ensayo musical.','Discrepaba con los últimos cambios de la partitura.','«Ensayé en el piano del escenario sin interrumpir la sesión».','traveler'),
 (c,'Celia Mora','Vestuarista. Ajusta los trajes del reparto.','La producción redujo el presupuesto de su taller.','«Estuve probando el vestuario con dos intérpretes».','restorer'),
 (c,'Óscar Luna','Técnico de sonido. Supervisa las grabaciones.','No recibió el crédito prometido por su trabajo.','«Supervisé la consola de sonido durante todo el ensayo».','mechanic');
 insert into mm_private.solutions(case_id,suspect_id,explanation) values
 (c,responsible,'Mara Vidal ocultó la partitura para forzar un aplazamiento y negociar la continuidad de su puesto. El archivo registra una apertura a las 19:42 con M-3, su tarjeta personal; la tarjeta de emergencia no se utilizó y no consta ningún préstamo. La cámara interior identifica su rostro y la credencial M-3 mientras retira la carpeta. Otra grabación la sigue sin cortes hasta el carro U-7 del almacén, donde aparece la partitura intacta. Su coartada era falsa: la cabina solo muestra a Óscar. Las grabaciones y los testigos mantienen a Iván en el escenario y a Celia en los camerinos durante todo el intervalo. El motivo aporta contexto; el acceso, la identificación y el recorrido continuo son las pruebas decisivas.');
 insert into mm_private.clues(case_id,title,body,stage,private,position,location_id)
 select c,v.title,v.body,v.stage,v.private,v.position,l.id from (values
 ('01 · La caja intacta','La compositora guardó la carpeta a las 19:30. A las 19:50 estaba vacía. La cerradura no tiene marcas de fuerza; el lector registra cada tarjeta.',0,false,1,'archive'),
 ('02 · Un teatro cerrado','Entre las 19:30 y las 19:50 no se abrió ninguna puerta exterior. La carpeta debe seguir dentro del teatro.',0,false,2,'stage'),
 ('03 · Los relojes sincronizados','Cámaras, lector del archivo y grabadora de ensayo utilizan la misma hora. No hay desfase entre sus registros.',0,false,3,'archive'),
 ('Un carro en el pasillo','A las 19:44 un carro de utilería con una rueda roja pasa del archivo hacia el almacén. La primera imagen no muestra el rostro de quien lo lleva.',0,true,4,'archive'),
 ('El ensayo de Iván','La grabación del piano mantiene música continua entre las 19:36 y las 19:48. El audio por sí solo no identifica quién está tocando.',0,true,5,'stage'),
 ('La prueba de vestuario','Dos intérpretes recuerdan a Celia ajustando sus trajes desde las 19:35 hasta las 19:49. Ninguno la vio salir.',0,true,6,'dressing'),
 ('La nota de producción','Una carta anuncia a Mara la supresión de su puesto. Su anotación dice: «Si se aplaza el estreno, habrá tiempo para negociar». Es un motivo posible, no una prueba de autoría.',0,true,7,'dressing'),
 ('04 · La tarjeta M-3','El archivo registra una sola apertura en el intervalo: M-3 a las 19:42. El registro de entrega asigna M-3 a Mara. No hubo préstamos ni uso de la tarjeta de emergencia.',1,false,8,'archive'),
 ('05 · La cabina grabada','La cámara de la cabina muestra únicamente a Óscar, frente a la consola, de 19:35 a 19:50. Mara no aparece, pese a su declaración.',1,false,9,'booth'),
 ('06 · La partitura recuperada','El carro U-7 del almacén, identificable por su rueda roja, contiene la carpeta original bajo una tela. Las anotaciones de la compositora permiten reconocerla.',1,false,10,'storage'),
 ('El rostro en el archivo','La cámara interior identifica claramente a Mara con la credencial M-3 a las 19:42. Se la ve retirar la carpeta de la caja y colocarla en el carro U-7.',1,true,11,'archive'),
 ('Un recorrido sin cortes','La grabación continua sigue a Mara con U-7 desde el archivo hasta el almacén, de 19:42 a 19:46. Nadie intercambia la carpeta ni toma el carro.',1,true,12,'storage'),
 ('El piano y el rostro','La cámara frontal del escenario, sincronizada con el audio, muestra a Iván tocando sin levantarse entre las 19:36 y las 19:48.',1,true,13,'stage'),
 ('El espejo del camerino','Una grabación continua del espejo confirma a Celia junto a los dos intérpretes desde las 19:35 hasta las 19:49. La salida queda visible y nadie la cruza.',1,true,14,'dressing')
 )v(title,body,stage,private,position,location_key) join public.mm_case_locations l on l.case_id=c and l.key=v.location_key;
end $$;
