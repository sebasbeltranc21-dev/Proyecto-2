# El secreto de la cúpula · piloto chibi

Caso 005 del Planetario Nácar: cuatro sospechosos ilustrados, cinco zonas y dieciséis pistas (ocho públicas y ocho privadas). El reparto y la resolución usan las funciones autorizadas existentes. La cinemática solo se monta tras el cierre y usa el culpable del informe del servidor.

La cinemática combina dos fondos y personajes transparentes en cuatro escenas: reunión bajo la cúpula, presentación del expediente, salida a la terraza y cierre. Incluye desenlace de acierto y error, pausa, avance manual, omisión y movimiento reducido. Es animación 2D de capas y cámara; no es vídeo ni animación facial por fotogramas.

## Arte

Creado con ImageGen integrado, usando Álex y Vera como referencias de estilo de personajes y el faro como referencia de escenarios. Optimizado a WebP; los cuatro personajes conservan transparencia.

- `public/cases/dome/lia.webp`
- `public/cases/dome/nico.webp`
- `public/cases/dome/emi.webp`
- `public/cases/dome/gael.webp`
- `public/cases/dome/cover.webp`
- `public/cases/dome/terrace.webp`

## Prompts finales

### lia

Use case: stylized-concept. Asset type: a single full-body transparent-background character sprite for an original anime detective web game. Reference images of Alex and Vera are STYLE ONLY, not identity: match their polished adorable chibi anime design, oversized head (about 45% total height), small compact body, large expressive detailed eyes, delicate crisp dark-brown line art, rich 2D cel shading, warm skin, ornamental clothing, exactly one character centered with whole body and shoes visible, generous transparent margins, front three-quarter pose facing slightly toward the viewer, calm neutral friendly expression, relaxed hands. No text, names, labels, logo, border, platform, backdrop or shadow rectangle. New character identity: Lía Ravel, young adult female planetarium curator, short wavy plum-colored bob, violet eyes, tiny cream star hair clip, ivory blouse and elegant dark-purple velvet waistcoat, mauve knee-length skirt, short capelet with gold star embroidery, brown boots. Holds a closed little visitor booklet without lettering. Clearly distinct from reference detective identities.

### nico

Use case: stylized-concept. Asset type: a single full-body transparent-background character sprite for an original anime detective web game. Reference images of Alex and Vera are STYLE ONLY, not identity: match their polished adorable chibi anime design, oversized head (about 45% total height), small compact body, large expressive detailed eyes, delicate crisp dark-brown line art, rich 2D cel shading, warm skin, ornamental clothing, exactly one character centered with whole body and shoes visible, generous transparent margins, front three-quarter pose facing slightly toward the viewer, calm neutral friendly expression, relaxed hands. No text, names, labels, logo, border, platform, backdrop or shadow rectangle. New character identity: Nico Ferrer, young adult male mechanical instrument technician, tousled auburn hair, amber eyes, small round brass goggles resting on his head, cream rolled-sleeve shirt, rust-orange waistcoat, navy short work coat, dark trousers, brown boots, compact tool belt with a small spanner. Both hands relaxed; NOT guilty-looking, no secret object or accusatory symbols.

### emi

Use case: stylized-concept. Asset type: a single full-body transparent-background character sprite for an original anime detective web game. Reference images of Alex and Vera are STYLE ONLY, not identity: match their polished adorable chibi anime design, oversized head (about 45% total height), small compact body, large expressive detailed eyes, delicate crisp dark-brown line art, rich 2D cel shading, warm skin, ornamental clothing, exactly one character centered with whole body and shoes visible, generous transparent margins, front three-quarter pose facing slightly toward the viewer, calm neutral friendly expression, relaxed hands. No text, names, labels, logo, border, platform, backdrop or shadow rectangle. New character identity: Emi Salvat, young adult female observatory garden caretaker, long softly braided teal hair over one shoulder, green eyes, round delicate glasses, cream shirt, sage-green short hooded cape, dark-green skirt and apron with subtle embroidered leaves, brown ankle boots. Holds a tiny potted moonflower. Friendly scholarly appearance, not detective clothes.

### gael

Use case: stylized-concept. Asset type: a single full-body transparent-background character sprite for an original anime detective web game. Reference images of Alex and Vera are STYLE ONLY, not identity: match their polished adorable chibi anime design, oversized head (about 45% total height), small compact body, large expressive detailed eyes, delicate crisp dark-brown line art, rich 2D cel shading, warm skin, ornamental clothing, exactly one character centered with whole body and shoes visible, generous transparent margins, front three-quarter pose facing slightly toward the viewer, calm neutral friendly expression, relaxed hands. No text, names, labels, logo, border, platform, backdrop or shadow rectangle. New character identity: Gael Soler, young adult male astronomical illustrator, fluffy silver-blue short hair, blue eyes, navy beret with a tiny gold crescent pin, long midnight-blue coat with cream lapels and gold celestial embroidery, pale blue shirt, charcoal trousers and brown boots. A slim rolled star chart tucked under one arm, other hand relaxed. No writing or symbols identifying guilt.

### cover

Use case: stylized-concept. Asset: wide 16:9 background for an original cozy chibi anime detective game. Lighthouse reference image is STYLE ONLY. Entirely new location: the inside of a charming hilltop planetarium called Nácar, a grand circular room under a glass and brass observatory dome at violet midnight. Focal prop near left-center: a compact ornate brass mechanical star projector with an EMPTY round disk cradle and open small lid, NOT a lighthouse lens. Scattered tiny projected star lights on the vaulted walls, deep navy and purple with warm amber lamps, round velvet seats, wooden desk with star charts, a curved stair to a moonlit rooftop garden through an arched side doorway. Beautiful hand-drawn anime environment, slightly rounded chibi-scale props, crisp outlines, painterly cel shading, detailed and readable. No people, text, labels, logos, watermarks, UI, culprit clues or recovered disk. Fully opaque.

### terrace

Use case: stylized-concept. Asset: wide 16:9 cinematic background for an original cozy chibi anime mystery game. Lighthouse reference is STYLE ONLY. New scene: the moonlit rooftop garden terrace outside the same hilltop brass-and-glass domed planetarium Nácar. The observatory dome and warmly lit arched doorway are behind on the left; ornate low stone railing curves around right overlooking a distant purple-blue city, gentle night sky full of stars and crescent moon. A small wooden table with an EMPTY circular velvet display cushion sits near left-middle, pots of white moonflowers and a parked compact garden cart on the sides. Leave the central foreground floor open for animated chibi character sprites. Hand-drawn anime game environment, crisp dark outlines, softly rounded props, cel shading, warm amber lamps, navy/violet/teal palette. No people, text, logos, UI, identifying clues, disk or secret solution. Fully opaque.

## Verificación

La suite local comprueba las pistas privadas, el consentimiento para compartir, el voto y el cierre. Las pruebas de cinemática comprueban que no se revela al responsable antes del cierre, los desenlaces de acierto y error, la pausa, la omisión y el movimiento reducido. `tests/remote-observatory-smoke.sql` permite comprobar el flujo alojado con identidades temporales y rollback.
