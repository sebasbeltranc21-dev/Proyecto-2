-- Original fictional case. UUIDs are generated here and resolved by stable keys.
-- The official answer is stored only in mm_private, never in catalog metadata.
do $$
declare c uuid; responsible uuid;
begin
 insert into public.mm_cases(slug,title,intro,theme,stages) values
 ('expreso-medianoche','El Expreso Medianoche',
 'A las 23:40, el Expreso Medianoche se detiene en el túnel de Valdén. La iluminación de emergencia sigue encendida y nadie ha resultado herido. El maquinista encuentra una orden de parada que no emitió: alguien manipuló el relé auxiliar. Cinco personas tenían motivos para retrasar el viaje. Reconstruid sus movimientos antes de que llegue el equipo de rescate.',
 'train',
 '[{"title":"El tren detenido","story":"La lluvia golpea las ventanas. Explorad el salón, el restaurante y el vagón de servicio. Cada investigador recibe una parte del expediente; compartid lo necesario y ordenad vuestras hipótesis en la cronología."},{"title":"Tras la puerta de cabina","story":"El maquinista entrega el registro técnico y se abre el coche de equipajes. Los relojes estaban sincronizados: cruzad la hora de la orden, los accesos y las coartadas."},{"title":"La acusación","story":"El equipo de rescate pide una conclusión. Cada investigador tiene un único voto definitivo. Una acusación con más votos que las demás decide por el equipo; un empate deja el caso abierto."},{"title":"La reconstrucción","story":"Con el tren a salvo, el expediente revela quién provocó la parada y qué pruebas lo demuestran."}]') returning id into c;
 insert into public.mm_case_locations(case_id,key,name,description,stage,position) values
 (c,'lounge','Salón de pasajeros','Ventanas empañadas, billetes y el reloj de a bordo.',0,1),
 (c,'dining','Coche restaurante','Una mesa sin recoger y el último servicio de la noche.',0,2),
 (c,'service','Vagón de servicio','La oficina de intervención y el armario del relé auxiliar.',0,3),
 (c,'luggage','Coche de equipajes','El registro de mantenimiento y las carpetas del personal.',1,4),
 (c,'cab','Cabina','El maquinista custodia los registros de la parada.',1,5);
 insert into public.mm_suspects(case_id,name,description,motive,alibi,portrait) values
 (c,'Elena Cruz','Interventora. Supervisa el servicio y conoce cada vagón.','Se ha anunciado el cierre de la línea nocturna donde lleva veinte años trabajando.','«No salí de mi oficina entre las 23:35 y las 23:45».','conductor') returning id into responsible;
 insert into public.mm_suspects(case_id,name,description,motive,alibi,portrait) values
 (c,'Tomás León','Técnico ferroviario. Viaja fuera de servicio con su maletín.','La compañía rechazó su propuesta de mantenimiento y suspendió su contrato.','«Revisé una rejilla del coche de equipajes desde las 23:34».','mechanic'),
 (c,'Vera Solís','Fotógrafa de viajes. Documenta el último recorrido nocturno.','Una imagen de un incidente podría conseguirle la portada que necesita.','«Hice una secuencia de fotografías desde el salón».','photographer'),
 (c,'Hugo Marín','Cocinero del tren. Acaba de terminar el servicio.','La empresa le debe dos meses de salario.','«Estuve sirviendo a un pasajero en el restaurante».','chef'),
 (c,'Darío Montes','Empresario. Viaja con una cartera de documentos.','Un retraso le permitiría aplazar una firma perjudicial para su empresa.','«Hablaba por teléfono en una mesa del restaurante».','traveler');
 insert into mm_private.solutions(case_id,suspect_id,explanation) values
 (c,responsible,'Elena Cruz provocó deliberadamente la parada para forzar una investigación que aplazara el cierre de la línea. El registro técnico sitúa la orden manual a las 23:37:12 y su ejecución tres minutos después, a las 23:40:12. El armario solo registró el uso de R-2, la llave asignada a Elena; la llave maestra del maquinista no se utilizó. El reflejo de la cámara la identifica junto al armario en ese momento y la grabación de su oficina vacía contradice su coartada. La cámara de equipajes sitúa a Tomás allí durante todo el intervalo relevante. La secuencia de Vera y el testigo del restaurante respaldan las posiciones de Vera, Hugo y Darío. El informe de cierre explica el motivo, pero la orden, la llave y la coartada falsa son las pruebas decisivas.');
 insert into mm_private.clues(case_id,title,body,stage,private,position,location_id)
 select c,v.title,v.body,v.stage,v.private,v.position,l.id from (values
 ('01 · El reloj de a bordo','La parada quedó registrada a las 23:40:12. El reloj del salón, las cámaras y el registro técnico usan la misma hora sincronizada.',0,false,1,'lounge'),
 ('02 · El precinto de servicio','El armario del relé auxiliar no presenta señales de fuerza. El mecanismo conserva su precinto exterior y registra cada llave utilizada.',0,false,2,'service'),
 ('03 · Un trayecto sin salidas','Desde las 23:30 no hubo paradas ni aperturas de puertas exteriores. La manipulación tuvo que hacerse desde dentro del tren.',0,false,3,'dining'),
 ('La cámara del pasillo','A las 23:36 una persona con abrigo de personal entra en el pasillo del relé. La imagen frontal está oscura; el cristal de una puerta refleja parte de la escena.',0,true,4,'service'),
 ('La foto del túnel','La secuencia automática de Vera, de 23:35 a 23:42, la muestra reflejada junto a la ventana del salón. El pasillo de servicio queda fuera de su alcance.',0,true,5,'lounge'),
 ('La comanda de Hugo','El terminal del restaurante registra comandas atendidas por Hugo a las 23:36 y las 23:38. Esas marcas por sí solas no cubren todo el intervalo.',0,true,6,'dining'),
 ('La llamada de Darío','La grabación autorizada de su reunión telefónica es continua de 23:34 a 23:43. Se oyen su voz, cubiertos y al cocinero sirviendo su mesa.',0,true,7,'dining'),
 ('04 · La orden diferida','El registro técnico conserva una orden manual introducida a las 23:37:12 desde el relé del vagón de servicio. El retraso de ejecución era de tres minutos: la parada ocurrió a las 23:40:12.',1,false,8,'cab'),
 ('05 · La llave R-2','El armario registró únicamente la llave R-2 a las 23:37. La hoja de entrega la asigna a Elena Cruz. La llave maestra permaneció en cabina y no figura en el registro.',1,false,9,'service'),
 ('06 · Una oficina vacía','La cámara interior de la oficina de intervención, alimentada por batería, no muestra a nadie entre las 23:35 y las 23:43. Elena había declarado permanecer allí.',1,false,10,'cab'),
 ('El reflejo del cristal','Al ampliar el reflejo del pasillo se distinguen el rostro de Elena y su placa de interventora junto al armario del relé a las 23:37. No se ve a otra persona abrirlo.',1,true,11,'service'),
 ('El registro de Tomás','La grabación continua del coche de equipajes sitúa a Tomás ante la rejilla de ventilación desde las 23:34 hasta las 23:42, incluido el momento de la orden.',1,true,12,'luggage'),
 ('El testigo del restaurante','Una pasajera confirma que Hugo sirvió su mesa y la de Darío sin abandonar el restaurante entre las 23:35 y las 23:41. Darío permaneció hablando por teléfono.',1,true,13,'dining'),
 ('El informe doblado','En la carpeta de Elena aparece el anuncio del cierre de la línea. Tiene una nota manuscrita: «Un incidente obliga a revisar la decisión». Explica un posible motivo; no demuestra por sí solo la manipulación.',1,true,14,'luggage')
 ) v(title,body,stage,private,position,location_key)
 join public.mm_case_locations l on l.case_id=c and l.key=v.location_key;
end $$;
