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
