-- Fourth original case. Only extend the theme constraint; existing rooms,
-- permissions, clue dealing and settlement functions remain unchanged.
alter table public.mm_cases drop constraint mm_cases_theme_check;
alter table public.mm_cases add constraint mm_cases_theme_check
 check(theme in ('museum','train','theater','lighthouse'));

do $$
declare c uuid; responsible uuid;
begin
 insert into public.mm_cases(slug,title,intro,theme,stages) values
 ('senal-medianoche','La señal de medianoche',
 'Durante la exhibición del centenario del Faro Bruma, la lente histórica Aurora desaparece de su soporte. La descubren ausente a las 23:12, justo cuando una prueba programada apaga la iluminación de la galería. La baliza moderna continúa funcionando y nadie está en peligro. Cuatro personas trabajaban en el edificio. La tormenta ha suspendido las salidas del muelle: reconstruid lo ocurrido antes de que se autorice el próximo embarque.',
 'lighthouse',
 '[{"title":"La galería a oscuras","story":"El soporte de la lente está vacío. Explorad la linterna, el taller y la sala de radio. Una hora de descubrimiento no siempre es la hora del robo: compartid las pistas y separad los hechos de las suposiciones."},{"title":"La memoria del faro","story":"Se abren el archivo de mantenimiento y el muelle cubierto. El sensor del soporte conservó sus datos durante la prueba de luces. Contrastad la hora real de la retirada con los accesos, las coartadas y el recorrido de los embalajes."},{"title":"La acusación","story":"La autoridad del puerto necesita una conclusión antes del próximo embarque. Cada investigador emite un voto definitivo; una acusación única por mayoría decide por el equipo y un empate deja el caso sin resolver."},{"title":"La señal de medianoche","story":"El informe revela quién retiró la lente y por qué una coartada verdadera parecía descartar a esa persona."}]') returning id into c;

 insert into public.mm_case_locations(case_id,key,name,description,stage,position) values
 (c,'lantern','La linterna','La galería acristalada y el soporte vacío de Aurora.',0,1),
 (c,'workshop','Taller del farero','Herramientas, material de exposición y registro de visitas.',0,2),
 (c,'radio','Sala de radio','La calibración nocturna y las comunicaciones del puerto.',0,3),
 (c,'archive','Archivo de mantenimiento','La memoria del sensor y la entrega de credenciales.',1,4),
 (c,'dock','Muelle cubierto','Embalajes retenidos por la tormenta y cámaras de carga.',1,5);

 insert into public.mm_suspects(case_id,name,description,motive,alibi,portrait) values
 (c,'Damián Soto','Transportista de la exposición. Recoge los embalajes vacíos y prepara el próximo embarque.','Una deuda vencida y una oferta de un comprador de instrumentos antiguos le darían motivos para llevarse Aurora.','«A las 23:12 ya estaba en el muelle. No pude tocar la lente durante el apagón».','traveler') returning id into responsible;
 insert into public.mm_suspects(case_id,name,description,motive,alibi,portrait) values
 (c,'Mateo Roca','Farero. Custodia la colección histórica y dirige las visitas.','Se opone al traslado de Aurora a una colección de la capital.','«Estuve enseñando el taller a dos visitantes desde las 23:04 hasta las 23:10».','conductor'),
 (c,'Celia Vela','Técnica de radio. Coordina la prueba de iluminación con el puerto.','Temía que se le atribuyeran los fallos recientes del equipo de exposición.','«Permanecí ante la consola calibrando la radio entre las 23:03 y las 23:11».','mechanic'),
 (c,'Iris Alba','Astrónoma invitada. Observa la tormenta desde la terraza de la linterna.','Su observatorio perdió la financiación para adquirir una lente semejante.','«Observé desde la terraza entre las 23:04 y las 23:10; no entré en la galería».','photographer');

 insert into mm_private.solutions(case_id,suspect_id,explanation) values
 (c,responsible,'Damián Soto retiró Aurora a las 23:07:18 y la ocultó en el embalaje F-9, declarado vacío. La prueba de luces de las 23:12 era un procedimiento programado: marca el descubrimiento, no el momento del robo. El sensor del soporte, independiente del circuito de iluminación y sincronizado con el control portuario, registra la pérdida de 1,8 kg a las 23:07:18. La única apertura de la galería en ese intervalo fue con D-4, la credencial entregada a Damián, sin préstamos ni uso de la maestra. La grabación continua lo identifica entrando con F-9, retirando la lente y cerrando el embalaje antes de trasladarlo al muelle; no hay intercambios. Aurora se recupera dentro de F-9, bajo el precinto individual que Damián firmó a las 23:08. Los registros continuos mantienen a Mateo, Celia e Iris en sus respectivos puestos durante el intervalo real. La cámara del muelle confirma la coartada de Damián a las 23:12, pero llegó allí a las 23:09, después de ocultar la lente. La oferta de compra explica el motivo; el sensor, el acceso, la grabación y el contenido precintado demuestran la autoría.');

 insert into mm_private.clues(case_id,title,body,stage,private,position,location_id)
 select c,v.title,v.body,v.stage,v.private,v.position,l.id from (values
 ('01 · El soporte vacío','Aurora estaba montada a las 23:00. A las 23:12, durante una prueba de luces, descubren que falta. El soporte no tiene señales de fuerza. Nadie comprobó su contenido entre esas dos horas.',0,false,1,'lantern'),
 ('02 · Una prueba anunciada','El programa de la exhibición fija una prueba de iluminación a las 23:12 durante noventa segundos. Solo afecta a las lámparas de la galería; la baliza moderna y los equipos con batería siguen funcionando.',0,false,2,'radio'),
 ('03 · Un reloj común','El control de acceso, las cámaras y el sensor del soporte se sincronizan con el reloj del puerto. El sensor guarda la hora de cada cambio de peso en una memoria independiente.',0,false,3,'workshop'),
 ('04 · El muelle retenido','La tormenta suspende las salidas desde las 23:00. Los embalajes permanecen en el muelle cubierto. La lente no ha podido abandonar el recinto por barco.',0,false,4,'workshop'),
 ('Un bulto antes del apagón','Una fotografía tomada desde la escalera a las 23:08 muestra a una persona con un embalaje negro saliendo de la galería. El rostro queda fuera del encuadre; no basta para identificarla.',0,true,5,'lantern'),
 ('El recibo de recogida','Damián declaró vacío el embalaje F-9 a las 23:06 y firmó su precinto individual a las 23:08. El recibo no contiene una comprobación de peso.',0,true,6,'workshop'),
 ('Las cajas del observatorio','Iris pidió transportar material al observatorio. Su pedido enumera dos cajas azules con etiquetas O-1 y O-2; no menciona la lente Aurora ni un embalaje F-9.',0,true,7,'lantern'),
 ('La oferta del coleccionista','Una oferta dirigida a Damián promete dinero por Aurora y exige conservar su número de serie. El documento aporta un motivo posible, pero por sí solo no demuestra que aceptara ni que retirara la lente.',0,true,8,'radio'),
 ('05 · La hora de la retirada','La memoria del soporte registra una pérdida de 1,8 kg a las 23:07:18: coincide con la masa certificada de Aurora. No hay otro cambio de peso hasta el hallazgo. La lente salió cinco minutos antes de la prueba de luces.',1,false,9,'archive'),
 ('06 · La credencial D-4','Entre las 23:04 y las 23:10 la galería registra una sola apertura: D-4 a las 23:06:42. La hoja de entrega y devolución asigna D-4 a Damián, sin préstamos. La credencial maestra permaneció precintada y no se utilizó.',1,false,10,'archive'),
 ('07 · Aurora recuperada','La inspección abre F-9 en el muelle y encuentra Aurora intacta; coincide el número de serie. El precinto individual firmado por Damián a las 23:08 seguía intacto. O-1 y O-2 contienen los instrumentos declarados de Iris.',1,false,11,'dock'),
 ('08 · Una coartada verdadera','La cámara del muelle sitúa a Damián junto a F-9 desde las 23:09 hasta las 23:14. Es cierto que estaba allí a las 23:12. Esa grabación no lo sitúa en el muelle a las 23:07:18.',1,false,12,'dock'),
 ('La batería del sensor','El diagnóstico confirma alimentación continua y memoria sin reinicios de 23:00 a 23:15. Una señal de comprobación del puerto coincide segundo a segundo con su registro: la retirada de las 23:07:18 no es un error de reloj.',1,true,13,'archive'),
 ('De la galería al embalaje','La grabación interior identifica a Damián con D-4 y F-9. Sin cortes, lo muestra retirar Aurora a las 23:07:18, guardarla en F-9 y precintarlo a las 23:08. La cámara del pasillo sigue el mismo embalaje hasta el muelle, sin intercambios.',1,true,14,'dock'),
 ('La calibración de Celia','La cámara de radio muestra a Celia ante la consola de 23:03 a 23:11. Responde a las comprobaciones en directo del puerto y la puerta queda visible. No sale durante ese intervalo.',1,true,15,'radio'),
 ('Dos puestos a la vista','La cámara del taller mantiene a Mateo con dos visitantes de 23:04 a 23:10. La cámara de la terraza muestra a Iris durante ese mismo intervalo; el acceso a la galería queda visible y no lo cruza. Ambas coartadas cubren las 23:07:18.',1,true,16,'lantern')
 )v(title,body,stage,private,position,location_key)
 join public.mm_case_locations l on l.case_id=c and l.key=v.location_key;
end $$;
