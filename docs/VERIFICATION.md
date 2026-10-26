# Actualización de integración — 23 de octubre de 2026

## Ambiente nocturno animado — 26 de octubre de 2026

- Capa decorativa global de oficina: ventana con lluvia, luces de ciudad, sombras de persianas, lámpara y motas en la luz. Animaciones CSS de transformación y opacidad; menos gotas y sin motas en móvil. Sin nuevas dependencias, peticiones de red ni temporizadores JavaScript para animar.
- La capa está detrás del contenido, tiene `pointer-events: none` y queda fuera del árbol accesible. El control **Pausar ambiente / Activar ambiente** se encuentra en el pie de página y solo afecta a esta decoración. La preferencia se conserva en `localStorage`; los datos de juego siguen en Supabase.
- `useSyncExternalStore` sincroniza la preferencia del navegador y del sistema, con render inicial estático. Movimiento reducido desactiva las animaciones; la vista muestra **Ambiente estático**. El control sigue funcionando en memoria si el almacenamiento está bloqueado.
- 52 pruebas existentes aprobadas; lint y compilación aprobados tras ajustar la suscripción a preferencias. La revisión de navegador del commit comprueba además la interfaz pública; la comprobación visual y de pausa se realiza en la web publicada.

## Interfaz de investigación y creación de salas — 26 de octubre de 2026

- Se retiró el control «Permitir invitados» del formulario. La creación envía `allowGuests: false`; se conserva el contrato de la API y no se modifican salas existentes ni migraciones.
- Portada con tablero ilustrado, fotografías, hilos, notas y sello de agencia; acceso con cubierta de credencial; panel con accesos a perfil, casos e invitación; sala con progreso visual de preparación a informe y cabecera de canal del equipo. Las fases y cifras usan los datos existentes, sin generar estadísticas ni pistas ficticias de partida.
- Componentes decorativos ligeros en SVG/CSS, excluidos del árbol accesible. Enlaces del panel operables con teclado, estado actual de la fase con `aria-current`, diseños para móvil y respeto de movimiento reducido. Sin nuevas dependencias.
- **52 pruebas locales, ESLint y compilación de producción aprobados.** La prueba existente de crear sala comprueba además la ausencia del control retirado y el envío del caso correcto con invitados desactivados.
- El navegador local automatizado sigue limitado por la descarga inválida de Chromium. El workflow habitual revisa accesibilidad y desbordamiento en 1440 y 390 px; el resultado debe consultarse para el commit publicado. La revisión de la interfaz alojada es separada de las pruebas de lógica y base de datos.
- No se cambian registro ficticio, chat/Reatime, persistencia, votos, resultados, personajes ni cinemáticas.

## Registro ficticio desde la app — 24 de octubre de 2026

- El usuario crea su propia cuenta desde **Crear cuenta ficticia**, con correo `@example.com`, contraseña y confirmación de contraseña. La Edge Function `register-fictional` confirma solo estas cuentas sin enviar correos; después la app inicia una sesión Auth normal.
- Función desplegada en Proyecto 2 y octava migración aplicada. Verificación alojada de permisos: `anon` y `authenticated` no pueden ejecutar `mm_claim_registration`; `service_role` sí. La tabla de límites está en `mm_private`, con RLS y acceso exclusivo del servidor. Los asesores solo añaden la información esperada de RLS sin políticas en esa tabla privada; permanece el aviso previo de protección de contraseñas comprometidas documentado en Integración.
- **52 pruebas locales aprobadas**, ESLint y compilación de producción aprobados. Cubren registro y login, rechazo de dominios personales, contraseñas distintas, duplicados, ausencia de sesión, límites persistentes, CORS y no divulgación de claves/metadatos. La revisión local de navegador sigue limitada por la descarga de Chromium; el workflow de GitHub comprueba las páginas públicas por separado.
- **Prueba alojada con dos cuentas ficticias reales de Auth:** creación desde el mismo endpoint que usa la app, duplicado rechazado, contraseña original conservada y perfil recuperado después de cerrar sesión. El mensaje del primer usuario llegó al segundo por Realtime y siguió guardado en su snapshot. Se recorrieron las fases reales de un minuto del museo, ambos votaron y obtuvieron 150 puntos. Una sesión nueva recuperó el mismo ID, perfil, partida terminada, historial y 150 puntos. Es una prueba de integración API/Auth/Realtime, no una partida operada por dos personas en navegador.
- Las sesiones de prueba se cierran al terminar. La limpieza se limita a los IDs y sala que creó el script; no modifica cuentas o partidas anteriores del usuario. [Uso del registro y prueba reproducible](ACADEMIC-ACCOUNTS.md).

Las pruebas transaccionales anteriores se ejecutaron con las siete migraciones iniciales; ahora hay ocho migraciones aplicadas en Supabase. El recorrido de salas, RLS, pistas privadas, chat, reconexión, votos y puntuación pasó contra PostgreSQL alojado, usando identidades temporales dentro de una transacción revertida. No equivale a probar el registro por correo ni el transporte Realtime entre navegadores. [Detalle y estado de Vercel](INTEGRATION.md).

## Oficina de detectives y presentación final

El panel incluye un escritorio SVG original con lámpara, lupa y documentos decorativos; el catálogo usa carpetas con fotografías de los dos escenarios y selección nativa por radio. La credencial muestra el perfil guardado y el archivo mantiene los estados reales de salas, estadísticas, historial y clasificación. Los accesos por ancla llevan al catálogo y a la invitación; se ocultan si no hay datos disponibles. La portada incorpora una nota de la central, la sala una cabecera de expediente y pestañas de carpeta, y el informe final un sello derivado del éxito oficial. No se han añadido dificultades, victorias ni datos de actividad ficticios al producto.

Verificación: 35 pruebas locales, ESLint y compilación de producción con TypeScript aprobados. Una caché de compilación dañada se archivó fuera del repositorio; la compilación limpia pasó. Los componentes reales se revisaron en un harness temporal rotulado con datos ficticios y transporte simulado. Se comprobaron selección y cambio de caso, teclado, accesos por ancla, invitación de un usuario nuevo, error recuperable, pestañas de sala, informe final y portada. Sin desbordamiento horizontal en escritorio ni en iframes de 390 y 800 px; sin errores de consola de la aplicación. Se aumentó el contraste de los metadatos sobre las carpetas y se ajustaron los emblemas para la columna de tablet. El harness no se publica; esta revisión no certifica otra partida autenticada entre dos usuarios ni un nuevo recorrido de Supabase Realtime.

## Rediseño de personajes

Los nueve sospechosos, el investigador y los agentes comparten un nuevo sistema de ilustración SVG de estilo cómic. Los personajes conservan su identidad pública y se distinguen por facciones, cabello, tonos de piel, vestuario y accesorios de su profesión. El cuerpo completo integra brazos, manos, pantalones y zapatos; la pose de custodia alinea las manos con las esposas. La identificación usa una expresión de alerta y la custodia una expresión preocupada. El retrato de expediente y el personaje de escena utilizan la misma figura; los tipos desconocidos conservan una figura neutra. No se añaden imágenes externas, dependencias, soluciones ni pistas al módulo visual.

Verificación: las 35 pruebas existentes, ESLint y la compilación de producción con TypeScript aprobadas. Galería de las once identidades y figura neutra revisada en navegador; finales de museo y tren revisados con los componentes reales en un harness temporal de datos ficticios rotulado. Comprobados encuadre de cuerpo completo y ausencia de desbordamiento horizontal en iframes de 390 y 800 px, además de escritorio; sin errores de consola de la aplicación. Se ajustaron las proporciones para que las cabezas no se recorten en tablet y la posición del expediente junto a la mano del investigador. El harness no se publica y esta revisión visual no equivale a ejecutar otra partida autenticada entre dos personas.

## Cinemáticas de cierre

Los dos casos incluyen cuatro escenas ilustradas de 14 segundos. La victoria representa la detención del responsable oficial; una acusación errónea, empate o ausencia de votos conserva el caso abierto y revela la verdad al final, sin representar una detención. Se puede pausar, avanzar, omitir o repetir. La preferencia de movimiento reducido activa una historieta estática y la pestaña oculta pausa el reloj. No se modifican funciones SQL, dependencias ni datos existentes.

- **35 pruebas locales aprobadas:** las 27 anteriores y ocho comprobaciones del componente de cierre. Cubren ambos temas, requisito de cierre/solución oficial, desenlaces, temporización ante nuevos snapshots, pausa, visibilidad, omisión, repetición, aislamiento por usuario/partida, movimiento reducido y almacenamiento bloqueado.
- **ESLint y compilación de producción con TypeScript:** aprobados.
- **Navegador:** componente real y estilos del proyecto en un harness temporal, rotulado explícitamente con datos ficticios ajenos a las soluciones reales. Revisados museo, detención del tren a 390 px, fallo sin agentes, pausa con avance, omisión y repetición. Sin desbordamiento horizontal a 390 px y sin errores de consola de la aplicación. Se corrigió la aparición de personajes al avanzar en pausa y se limitó la animación de escolta a la victoria.
- **Límite:** no se ejecutó una partida autenticada nueva con dos personas para comprobar este cierre. La prueba E2E existente ahora omite la cinemática antes de comprobar los resultados, pero requiere cuentas de pruebas y continúa siendo optativa. El harness y sus datos no se publican.

## Segundo caso, mapa y cronología

Implementación: «El Expreso Medianoche» (5 sospechosos, 14 pistas y solución fija), selector de caso, 5 vagones con apertura por fase, 5 retratos nuevos, escena del tren, evidencias ampliables y cronología persistente de hipótesis. El museo conserva sus 4 sospechosos y 12 pistas y ahora tiene su propio mapa. Compartir el texto completo de una pista privada exige confirmación del propietario. Solo quien añadió una tarjeta puede mover su hora o retirarla, durante la investigación.

Verificaciones de esta ampliación:

- **27 pruebas locales:** 14 de PostgreSQL, 6 de Dashboard, 4 del área de evidencias y 3 de validación/origen. Comprueban también la compatibilidad del museo, privacidad, copia canónica de pistas, pertenencia, autoría y cierre de edición por fase.
- **Compilación y ESLint:** aprobados. Se corrigió una opción de selector no válida en los tipos de React Testing Library detectada por TypeScript.
- **Base alojada:** scripts transaccionales del museo y del tren aprobados, con identidades Auth emuladas y rollback. No quedaron usuarios de prueba ni se alteraron los recuentos de partidas existentes.
- **Asesores:** RLS confirmado en las tablas nuevas; corregidos los dos índices compuestos sugeridos. La advertencia preexistente de protección de contraseñas comprometidas está documentada en [Integración](INTEGRATION.md).
- **Navegador:** componentes reales en harness temporal con fixtures SQL locales y transporte de UI simulado, identificado en pantalla. Se comprobaron filtro por vagón, bloqueo/desbloqueo por fase, 5 retratos, diálogo nativo, confirmación de compartir, orden de la cronología y Escape. Sin desbordamiento a 1363 px y dentro de iframe de 390 px; diálogo móvil de 339 px sin desbordamiento interno. El control nativo de hora se comprobó con teclado; el `fill` del conector de navegador no emitía el cambio de React, por lo que se usaron las teclas del control, sin modificar la aplicación para la automatización.
- **Límite:** no se ha ejecutado una partida nueva del tren con dos sesiones Supabase Auth reales. Los E2E se ampliaron para ambos casos, incluido compartir una pista y verificar el estado de conexión Realtime, y se omiten si faltan cuentas de pruebas. El harness y sus datos no se publican.

## Personajes y evidencias ilustradas

El usuario confirmó haber jugado una partida y solicitó ilustraciones. Se añadieron cuatro retratos originales y dibujos para las doce evidencias del caso, además de un dibujo neutro para títulos desconocidos. Se muestran en el briefing, las fichas de sospechosos, las tarjetas de pistas y el expediente final. El retrato del responsable solo se selecciona a partir de la solución que entrega el servidor al terminar.

Los dibujos usan SVG y CSS, sin dependencias nuevas ni peticiones de imágenes externas. Las animaciones duran entre 1,6 y 3,2 segundos, se ejecutan una vez al aparecer y se desactivan con `prefers-reduced-motion`. Los dibujos son decorativos: los nombres, textos y avisos de privacidad siguen siendo la información accesible. Solo se ilustran las evidencias presentes en el snapshot autorizado; no se incorporaron textos de pistas ni soluciones al módulo visual.

Verificación local: ESLint, compilación de producción con TypeScript y las 17 pruebas existentes aprobadas. Se revisaron los componentes reales renderizados estáticamente con los estilos del proyecto en el navegador de revisión: escritorio de 1363 px y un iframe de 390 px, sin desbordamiento horizontal. Esta galería temporal solo contiene títulos y texto de revisión, no se incluye en la aplicación ni sustituye una nueva prueba autenticada del juego. El supervisor de preview no acepta los argumentos de Next.js; se usó su servidor estático admitido para revisar las ilustraciones sin modificar el arranque de la aplicación.

## Corrección del formulario de invitación

El botón de entrada exigía un perfil guardado sin explicar el requisito junto al código. Ahora permanece disponible para usuarios autenticados nuevos; el formulario solicita su nombre, valida el código y guarda el perfil antes de solicitar la entrada. Los perfiles existentes no se sobrescriben. Los errores se presentan dentro del formulario y un fallo de entrada conserva el código para reintentar.

Se añadieron cinco pruebas del componente Dashboard con React Testing Library y JSDOM: entrada con perfil nuevo, entrada con perfil existente, nombre vacío, fallo de guardado y reintento tras guardar el perfil. Estas pruebas simulan el transporte API y la navegación; no equivalen a una partida real entre navegadores. Total local: 17 pruebas aprobadas. No se cambiaron permisos ni funciones SQL.

Los siguientes resultados describen la verificación inicial del 22 de octubre, antes de conectar los servicios.

# Verificación — 22 de octubre de 2026

## Resultado local

| Comprobación               | Resultado y alcance                                                         |
| -------------------------- | --------------------------------------------------------------------------- |
| `npm run build`            | Correcto: Next.js 16.4.2, rutas App Router y Proxy compilados               |
| `npm run typecheck`        | Correcto: sin errores TypeScript                                            |
| `npm run lint`             | Correcto: sin errores ni advertencias de ESLint                             |
| `npm test`                 | 12 pruebas aprobadas: migraciones PostgreSQL, RLS, acciones y validación    |
| `npm run test:e2e`         | 4 pruebas aprobadas; 2 omitidas por falta de Supabase/cuentas de pruebas    |
| Navegador                  | Chromium Headless Shell 141 mediante Playwright; 1440×1000 y 390×844        |
| Accesibilidad automática   | Sin incidencias WCAG 2 A/AA detectadas por axe en inicio y acceso           |
| Dependencias de producción | `npm audit --omit=dev --audit-level=high`: cero vulnerabilidades reportadas |

Las pruebas locales no certifican producción. La auditoría automática de accesibilidad no sustituye una revisión manual con tecnologías de asistencia.

## Escenarios de datos ejecutados

Las tres migraciones se ejecutaron completas en PostgreSQL embebido PGlite. La identidad de Auth se emula en el entorno de pruebas; las funciones, consultas, restricciones, permisos y RLS son las del repositorio.

1. Un tercero no lee salas, mensajes, soluciones ni funciones internas de cierre.
2. El rol `anon` no ejecuta RPCs y una cuenta invitada no entra en una sala que exige cuenta.
3. Solo el anfitrión inicia, con al menos dos participantes conectados y todos listos. Repetir la entrada no duplica participantes.
4. Las pistas privadas se limitan al propietario y las futuras quedan ocultas incluso al consultar directamente la tabla.
5. No se aceptan votos fuera de fase ni votos duplicados. Las escrituras directas a juegos, votos y resultados están denegadas.
6. Los puntos y el cierre son idempotentes; se comprueba victoria, empate, ausencia de votos y vencimiento tras inactividad.
7. El chat valida texto y limita frecuencia. La reconexión conserva mensajes y participantes; no admite nuevos jugadores tras empezar.
8. Los intentos de invitación fallidos cuentan para el límite de veinte por minuto; la acción interna no permite omitirlo.
9. El relevo de anfitrión solo es posible tras ausencia; el usuario original puede reconectar sin duplicarse.
10. Se rechazan salas llenas, sospechosos de otro caso y alteraciones directas de puntos.
11. Zod normaliza códigos y rechaza acciones/duraciones/entradas inválidas.
12. La protección de origen acepta peticiones propias locales/alojadas y rechaza orígenes ajenos, nulos o malformados.

## Navegador ejecutado

- Inicio en móvil y escritorio sin desbordamiento horizontal, sin excepciones JavaScript y con navegación funcional.
- Imagen del escenario visible y revisión visual de ambas capturas.
- Auditoría axe de inicio en ambos tamaños y del formulario de acceso.
- Sin configuración: acceso desactivado, aviso explícito y API 503. Un origen ajeno recibe 403.
- Código de sala inválido muestra una salida recuperable. Una URL inexistente devuelve 404.

Se corrigieron el contraste de los números de las instrucciones y una comparación de origen que rechazaba la dirección local al depender del origen interno de Next.js. Una caché de compilación intermedia dañada se archivó fuera del repositorio y la compilación limpia pasó. El Chromium de escritorio no pudo arrancar por restricciones del entorno; se utilizó Headless Shell, sin modificar permisos del equipo.

## Pendiente de infraestructura real

La conexión de Supabase devolvió `projects: []`. Vercel devolvió cero proyectos asociados y ninguna URL de despliegue. No se crearon proyectos ni se aplicaron migraciones remotas.

| Frontera                                 | Estado                                                                                  |
| ---------------------------------------- | --------------------------------------------------------------------------------------- |
| Formulario → API Next.js                 | Validación y falta de configuración verificadas; acciones positivas requieren Auth real |
| RPC → PostgreSQL                         | Lógica y permisos ejecutados localmente; pendiente repetir en Supabase alojado          |
| Registro y confirmación de correo        | Prueba preparada; omitida por falta de proyecto/cuentas/SMTP                            |
| Dos navegadores → Supabase Auth/Realtime | Prueba preparada; omitida por falta de proyecto/cuentas                                 |
| Concurrencia real de varias conexiones   | Bloqueos y restricciones implementados; sin prueba de carga remota                      |
| Asesores Supabase                        | Pendientes: no existe un proyecto remoto disponible                                     |
| GitHub Actions                           | Workflow preparado; su resultado remoto no se atribuye a las pruebas locales            |
| Vercel                                   | Preparación documentada; no hay despliegue confirmado                                   |

## Comprobación tras conectar los servicios

Usar un proyecto aislado y dos cuentas verificadas. Aplicar las migraciones tras revisar el proyecto y el dry run. Configurar Auth, redirecciones y Realtime. Inyectar las variables E2E descritas en el README y ejecutar la prueba multijugador. Confirmar entrega del correo, dos sesiones independientes, sincronización, pistas privadas, chat, recarga/reconexión, votos, cierre y resultados persistidos. Probar un tercer usuario sin pertenencia y ejecutar los asesores de Supabase. Solo después publicar la URL Ready de Vercel como juego operativo.
