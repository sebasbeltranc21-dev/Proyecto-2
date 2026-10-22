# Arquitectura del MVP

## Recorrido de una acción

El formulario llama a `POST /api/action`. El servidor comprueba el origen, valida con Zod y verifica la sesión con `auth.getUser()`. Usa el JWT del usuario y la clave publicable para ejecutar `mm_action`; no necesita `service_role`. PostgreSQL vuelve a comprobar la identidad, pertenencia y condiciones de cada acción. Las RPC también se pueden invocar directamente desde el SDK: la seguridad no depende de la ruta Next.js.

`mm_action` es una función invoker que llama a un dispatcher con privilegios acotados en `mm_private`, un esquema que **no debe exponerse** en Data API. Los escritores internos son definer porque el cliente no tiene permisos directos de escritura. Tienen `search_path=''`, objetos cualificados y comprobaciones explícitas de identidad. Las funciones internas de cierre y avance no se conceden a `authenticated`; tampoco se concede la acción interna que omitiría el límite de invitaciones.

## Modelo

| Tabla                     | Propósito / lectura permitida                                   |
| ------------------------- | --------------------------------------------------------------- |
| `mm_profiles`             | Identidad visible: propietario y personas de sus salas          |
| `mm_cases`, `mm_suspects` | Catálogo de casos y sospechosos, sin solución                   |
| `mm_rooms`                | Código, anfitrión, configuración; solo integrantes              |
| `mm_participants`         | Una fila por sala y usuario; preparación y último contacto      |
| `mm_games`                | Reloj y fase autoritativos; solo integrantes                    |
| `mm_evidence`             | Evidencias públicas y privadas; fase desbloqueada y propietario |
| `mm_messages`             | Chat de integrantes; texto escapado por React                   |
| `mm_votes`                | Un voto inmutable por usuario/partida; lectura del voto propio  |
| `mm_results`              | Resultado y puntuación; escritura exclusiva de cierre           |
| `mm_private.solutions`    | Culpable y explicación fijos; sin acceso Data API               |
| `mm_private.clues`        | Plantillas de pistas; sin acceso Data API                       |
| `mm_private.join_limits`  | Hasta 20 intentos por usuario y minuto; sin acceso del cliente  |

Todas las tablas tienen RLS. Las operaciones sin política ni GRANT se deniegan. No hay vistas que puedan saltarse RLS. El ranking devuelve solo nombre, emblema y totales a personas autenticadas: esos datos son visibles entre investigadores. El correo y la identidad de Auth no se publican en el ranking.

## Concurrencia y reconexión

Cada mutación bloquea la fila de sala con `FOR UPDATE`. Empezar la partida, aceptar un voto y cerrar por plazo se serializan. La PK de votos `(game_id,user_id)` y de resultados impide duplicaciones. El voto se acepta únicamente en fase 2 antes del plazo del servidor; se avanza el reloj antes de validarlo.

El usuario conserva su ID mediante Supabase Auth; `join` es idempotente para ese ID. Un contacto cada cinco segundos mantiene `last_seen`; a partir de 45 segundos se muestra como desconectado. Otro integrante puede asumir el anfitrión tras ese plazo. Al iniciar se congela el grupo de participantes conectados. Quienes ya estaban en la sala, pero no estaban conectados al comenzar, pueden volver como observadores; no reciben voto ni pistas privadas. Una sala permite una partida; se crea otra para volver a jugar.

Los eventos Postgres Changes actualizan la vista mediante una consulta autorizada. Las tablas publicadas no contienen la solución. Si Realtime falla, se muestra y se consulta el estado cada cinco segundos. El reloj visual se ajusta con la hora devuelta por PostgreSQL.

No se necesita un proceso de Node permanente. Si todos salen, la base conserva los plazos absolutos; al regresar, `tick` recorre las fases vencidas y liquida la partida. El cierre no se materializa mientras nadie consulte la sala; nunca se amplía el tiempo ni se aceptan votos fuera de plazo. Para exigir cierre material aun sin clientes, una siguiente versión puede programar un trabajador autenticado; el MVP no lo simula.

## Reglas

Dos fases de investigación (1–15 minutos cada una) y una votación (1–5 minutos). Una mayoría relativa única decide la acusación del equipo. Un empate o cero votos es fallo colectivo. Una respuesta correcta da 100 puntos individuales; resolver colectivamente suma 50 a cada participante. Los resultados se insertan una sola vez. No hay roles secretos.

## Extensión

`mm_cases` incluye un campo `mode`; los casos tienen sospechosos, etapas, solución y pistas propios. Para añadir un caso: crear una migración con sus datos y después ampliar el selector y validación de creación de sala. Hoy se selecciona explícitamente `ultima-luz`. No activar otros modos hasta implementar y probar sus permisos. Los roles secretos futuros deben vivir en tablas privadas, no dentro del estado público.

## Límites conocidos

Un único caso inicial, sin subida de fotografías ni recuperación de contraseña en la interfaz. Los avatares son cuatro emblemas originales basados en iconos Lucide (licencia ISC). La ilustración del museo es un SVG original del proyecto. Las salas no tienen expulsión ni abandono definitivo en el MVP; los usuarios conservan su puesto para reconectar y se muestran inactivos. El anfitrión puede abrir hasta cinco salas no finalizadas por día; los cupos llenos no se reciclan automáticamente. El historial muestra 20 resultados y las 10 salas más recientes; el chat consulta los 100 últimos mensajes. Las cuentas invitadas pierden acceso al cerrar sesión o borrar los datos del navegador. El caso es fijo: quien repite o lee las migraciones del repositorio puede conocer la respuesta. Antes de una publicación amplia, valorar rotación de casos, límites de uso y política de conservación de datos.
