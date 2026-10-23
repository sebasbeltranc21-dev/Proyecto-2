# Actualización de integración — 23 de octubre de 2026

Supabase ya está conectado y las cuatro migraciones están aplicadas. El recorrido de salas, RLS, pistas privadas, chat, reconexión, votos y puntuación pasó contra PostgreSQL alojado, usando identidades temporales dentro de una transacción revertida. No equivale a probar el registro por correo ni el transporte Realtime entre navegadores. [Detalle y estado de Vercel](INTEGRATION.md).

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
