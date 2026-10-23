# Integración — 23 de octubre de 2026

## Destinos comprobados

- GitHub: `sebasbeltranc21-dev/Proyecto-2`, rama `main`.
- Supabase: **Proyecto 2**, referencia `tlmgyzfsebceahhgfsar`, región `us-east-2`, PostgreSQL 17, saludable.
- Web existente: <https://proyecto-2-rho.vercel.app>. El enlace GitHub/Vercel publica los commits de `main`. La conexión administrativa de Vercel devolvió 403 para el equipo `sebastian-beltran`; no se han cambiado variables, permisos ni credenciales para eludirlo.

## Migraciones aplicadas

Se inspeccionaron tablas e historial antes de cada ampliación. La instalación inicial estaba vacía; al añadir el tren ya existían partidas del museo que se conservaron. Los archivos generados con Supabase CLI se renombraron a las versiones que registró el servicio al aplicarlos.

| Archivo                                           | Contenido                                                                      |
| ------------------------------------------------- | ------------------------------------------------------------------------------ |
| `20261023165250_mystery_core.sql`                 | Esquema, funciones, permisos, RLS y Realtime                                   |
| `20261023165305_museum_case.sql`                  | Caso del museo, 4 sospechosos y 12 pistas                                      |
| `20261023165310_harden_room_access.sql`           | Límite de invitaciones e índices                                               |
| `20261023165540_complete_foreign_key_indexes.sql` | Índices de relaciones originales                                               |
| `20261023190759_investigation_board.sql`          | Ubicaciones, catálogo seleccionable, metadatos visuales, cronología y permisos |
| `20261023190803_midnight_express.sql`             | Caso del tren, 5 sospechosos, 14 pistas y 5 lugares                            |
| `20261023191316_investigation_indexes.sql`        | Índices de las dos relaciones compuestas nuevas                                |

Obtener el historial actual antes de ejecutar `supabase db push --dry-run`. No volver a ejecutar migraciones ya aplicadas ni usar `db reset` sobre la base alojada. La creación sigue admitiendo clientes antiguos sin `caseSlug`, que seleccionan el museo.

## Verificado en la base alojada

- Quince tablas con RLS: doce públicas y tres en `mm_private`. Las nuevas tablas solo conceden lectura; las escrituras de cronología pasan por funciones internas verificadas.
- Dos casos con sus soluciones privadas. Museo: 4 sospechosos, 12 pistas, 4 zonas. Tren: 5 sospechosos, 14 pistas, 5 zonas.
- Siete tablas publicadas en `supabase_realtime`, incluida `mm_timeline`.
- `tests/remote-smoke.sql` pasó de nuevo: sala, inicio, pistas privadas, chat, reconexión, denegación a terceros, voto único y resultados del museo.
- `tests/remote-express-smoke.sql` pasó: selección del tren, cambio de fase, aislamiento del original privado, confirmación antes de compartir, copia del texto oficial, propiedad de la tarjeta, RLS frente a terceros, denegación de escrituras directas y llamadas internas, bloqueo de edición al votar, solución fija y 150 puntos por jugador correcto.
- Ambos scripts emulan identidades de Auth en el límite SQL, crean sus propios usuarios y datos de juego dentro de una transacción y ejecutan `ROLLBACK`. Se confirmó que no quedaban usuarios de esas pruebas. Los recuentos anteriores siguieron siendo 4 salas, 2 partidas, 24 evidencias, 8 mensajes, 4 votos y 4 resultados; las pruebas no generaron tarjetas permanentes.
- Comprobaciones HTTP iniciales: configuración Auth 200, correo habilitado y confirmación obligatoria; `mm_home` sin sesión recibió 401; `mm_private` por REST recibió 406/PGRST106 porque no está expuesto. No se enviaron correos ni se crearon sesiones Auth reales mediante estos scripts.
- Solo se usa la URL y la clave publicable en `.env.local`, ignorado por Git. No se necesita ni se utilizó `service_role`.

## Asesores posteriores a la ampliación

Se corrigieron dos avisos nuevos de claves foráneas sin índice. Rendimiento quedó con avisos informativos de índices todavía no utilizados; no quedan relaciones sin índice según el asesor. [Referencia de índices](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys).

Seguridad mantiene los tres avisos informativos de RLS sin políticas sobre tablas privadas: el cliente no tiene permisos de tabla y solo las funciones internas autorizadas acceden a ellas. No añadir políticas permisivas para silenciarlos. [Referencia](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

El asesor también detectó, antes y después de esta ampliación, `auth_leaked_password_protection` desactivado. Es una configuración pendiente de Auth, ajena a las tablas del juego; no se cambió ni se declara resuelta. [Configuración de contraseñas comprometidas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Verificación de interfaz y límites

Las 27 pruebas locales, ESLint y la compilación con TypeScript pasaron. Se revisaron los componentes reales en un harness temporal de navegador con fixtures obtenidos del SQL local y respuestas de interfaz explícitamente simuladas: filtro de vagones, aperturas por fase, evidencias ampliadas, consentimiento, cronología y cierre con Escape. Anchos de escritorio y un iframe móvil de 390 px; el contenido no produjo desplazamiento horizontal. Este harness no está en el repositorio ni en el despliegue.

El usuario confirmó jugar el museo. No se atribuye a las pruebas SQL ni a la revisión visual una partida autenticada del tren entre dos navegadores. Los E2E preparados recorren ambos casos y comprueban la conexión Realtime y la pista compartida; requieren dos cuentas de pruebas verificadas descritas en el README. La entrega de correos y las credenciales administrativas de Vercel siguen fuera de estas verificaciones.
