-- Pilot case with public chibi portrait keys. Answers and undealt clues stay private.
alter table public.mm_cases drop constraint mm_cases_theme_check;
alter table public.mm_cases add constraint mm_cases_theme_check check(theme in ('museum','train','theater','lighthouse','observatory'));
do $$
declare c uuid; responsible uuid;
begin
 insert into public.mm_cases(slug,title,intro,theme,stages) values
 ('secreto-cupula','El secreto de la cúpula','El Planetario Nácar prepara su Noche de los Deseos. A las 20:30, durante la revisión previa al espectáculo, la conservadora descubre que falta el disco estelar original del proyector mecánico. Las luces de seguridad funcionan y nadie ha resultado herido. Cuatro personas trabajan entre la cúpula y el jardín de la azotea. El disco de ensayo sigue en su caja: no es una confusión de inventario. Reunid las pistas antes de que lleguen los visitantes.','observatory',
 '[{"title":"La noche sin estrellas","story":"El soporte del disco está vacío. Explorad la cúpula, el taller y el jardín. Los retratos del expediente presentan a cuatro personas con motivos distintos; la apariencia y el motivo no demuestran la autoría."},{"title":"El mecanismo recuerda","story":"Se abren el archivo de control y la terraza. Llegan los registros completos del cierre y del tránsito de maletines. Contrastad las declaraciones con las horas y con el disco encontrado."},{"title":"Vuestra conclusión","story":"La dirección necesita una acusación fundada. Cada investigador dispone de un único voto definitivo. La mayoría única decide la conclusión del equipo; un empate deja el caso abierto."},{"title":"Bajo la cúpula","story":"La reconstrucción revela quién retiró el disco, dónde lo ocultó y qué coartada no encajaba."}]') returning id into c;
 insert into public.mm_case_locations(case_id,key,name,description,stage,position) values
 (c,'dome','La cúpula','El proyector mecánico, las butacas y el soporte vacío.',0,1),
 (c,'workshop','Taller de mecanismos','Bancos de trabajo y maletines de instrumentos.',0,2),
 (c,'garden','Jardín lunar','Macetas de flores nocturnas y el carro de jardinería.',0,3),
 (c,'archive','Archivo de control','El registro de accesos y la entrega de llaves.',1,4),
 (c,'terrace','Terraza de observación','Cámaras del pasillo y las mesas de dibujo.',1,5);
 insert into public.mm_suspects(case_id,name,description,motive,alibi,portrait) values
 (c,'Nico Ferrer','Técnico de instrumentos. Ajusta los mecanismos del proyector.','La dirección iba a sustituir su taller por mantenimiento externo; un fallo del espectáculo permitiría reabrir la decisión.','«No me separé del banco del taller entre las 20:10 y las 20:22».','dome-nico') returning id into responsible;
 insert into public.mm_suspects(case_id,name,description,motive,alibi,portrait) values
 (c,'Lía Ravel','Conservadora. Custodia la colección y recibe a los visitantes.','La exposición usa una versión del cielo que ella había recomendado corregir.','«Grabé la bienvenida en la recepción de la cúpula de 20:10 a 20:24».','dome-lia'),
 (c,'Emi Salvat','Cuidadora del jardín lunar. Prepara las flores de la azotea.','La ampliación del planetario amenaza el espacio de su jardín.','«Atendí una visita al invernadero de 20:11 a 20:23».','dome-emi'),
 (c,'Gael Soler','Ilustrador astronómico. Dibuja las cartas de la sesión.','Su nombre no aparece en el cartel de la Noche de los Deseos.','«Dibujé en la terraza desde las 20:09 hasta las 20:25».','dome-gael');
 insert into mm_private.solutions(case_id,suspect_id,explanation) values
 (c,responsible,'Nico Ferrer retiró el disco original para simular una avería y conseguir que la dirección reconsiderara la sustitución de su taller. El cierre del proyector registra una apertura con N-2 a las 20:16:04 y el sensor registra la retirada del disco a las 20:16:19. N-2 es la llave personal entregada a Nico; no hubo préstamos ni uso de la maestra. La cámara interior lo identifica colocando el disco en el maletín T-6 y el pasillo sigue ese mismo maletín hasta su banco, sin intercambios. El disco con el número de serie NC-01 se recupera en T-6, bajo el precinto individual firmado por Nico a las 20:20. Su coartada era falsa: lo que parecía una persona sentada en la toma parcial del taller era su abrigo sobre el respaldo. La grabación completa muestra el banco desocupado de 20:14 a 20:19. Lía aparece en la grabación continua de recepción, Emi en el invernadero con una visitante y Gael en la terraza durante todo el intervalo de la retirada. El disco de ensayo NC-00 nunca salió de su caja. Los motivos de los demás son contexto; el acceso, la identificación y el disco recuperado son las pruebas decisivas.');
 insert into mm_private.clues(case_id,title,body,stage,private,position,location_id)
 select c,v.title,v.body,v.stage,v.private,v.position,l.id from (values
 ('01 · El soporte vacío','Lía comprobó el disco original a las 20:05. A las 20:30 el soporte del proyector estaba vacío. El cierre no presenta daños; el disco original lleva el número NC-01.',0,false,1,'dome'),
 ('02 · Dos discos distintos','El disco de ensayo NC-00 permanece en su caja transparente, precintada desde las 19:50. La pieza ausente es NC-01, no una copia confundida durante los preparativos.',0,false,2,'workshop'),
 ('03 · Relojes de la agencia','Cámaras, cierre y sensor del proyector comparten la hora sincronizada del archivo. No hay desfase entre sus registros.',0,false,3,'dome'),
 ('04 · La azotea cerrada','Entre las 20:05 y las 20:30 no se abrió ninguna salida del edificio. Los maletines y el carro del jardín siguen dentro del recinto.',0,false,4,'garden'),
 ('Una figura en el taller','La primera toma del banco muestra un volumen con el abrigo de Nico sobre la silla. El encuadre corta la cabeza y las piernas: no permite afirmar que haya una persona sentada.',0,true,5,'workshop'),
 ('El carro de las flores','Emi trasladó su carro verde al jardín a las 20:12. La caja superior parece redonda y podría alojar una pieza del tamaño de un disco. La imagen no muestra su contenido.',0,true,6,'garden'),
 ('La bienvenida de Lía','El archivo conserva una grabación de bienvenida de 20:10 a 20:24. El primer extracto solo contiene audio; por sí solo no sitúa a Lía en recepción.',0,true,7,'dome'),
 ('El cartel sin firma','Gael pidió que se reconociera su trabajo en el cartel. Su boceto lleva una queja. Es un motivo posible, pero no demuestra que tocara el proyector.',0,true,8,'terrace'),
 ('05 · La llave N-2','El cierre registra una única apertura en el intervalo: N-2 a las 20:16:04. El registro de entrega asigna esa llave a Nico. No constan préstamos y la maestra permaneció precintada.',1,false,9,'archive'),
 ('06 · La retirada registrada','El sensor del soporte registra la retirada de NC-01 a las 20:16:19. La alimentación y el reloj no sufrieron interrupciones. El mecanismo no puede expulsar el disco por sí solo.',1,false,10,'archive'),
 ('07 · El disco recuperado','La inspección del taller recupera NC-01 dentro del maletín T-6, bajo el precinto individual que Nico firmó a las 20:20. El precinto no estaba roto. El carro de Emi contiene platos de maceta, no el disco.',1,false,11,'workshop'),
 ('08 · Un banco desocupado','La grabación completa del taller muestra el banco desocupado de 20:14 a 20:19. La supuesta figura era el abrigo colocado sobre el respaldo. Esa toma contradice la declaración de permanencia continua de Nico.',1,false,12,'workshop'),
 ('El maletín bajo la cúpula','La cámara interior identifica claramente a Nico con la llave N-2. A las 20:16:19 retira el disco y lo guarda en T-6. La secuencia del pasillo sigue el maletín hasta su banco, sin cortes ni intercambios.',1,true,13,'terrace'),
 ('La recepción en directo','El vídeo completo de recepción muestra a Lía de 20:10 a 20:24, respondiendo a dos visitantes. La salida queda a la vista y no la cruza durante la retirada.',1,true,14,'dome'),
 ('El invernadero y la terraza','La cámara del invernadero mantiene a Emi con una visitante de 20:11 a 20:23. El vídeo continuo de la terraza muestra a Gael dibujando de 20:09 a 20:25. Ambos cubren las 20:16:19.',1,true,15,'garden'),
 ('La nota del mantenimiento','En la carpeta de Nico hay un aviso de sustitución del taller y una nota: «Si el estreno falla, revisarán el contrato». Aporta contexto al motivo; no sustituye las pruebas del cierre, la cámara y el disco.',1,true,16,'archive')
 )v(title,body,stage,private,position,location_key) join public.mm_case_locations l on l.case_id=c and l.key=v.location_key;
end $$;
