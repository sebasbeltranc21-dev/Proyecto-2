# Integración — 23 de octubre de 2026

## Destinos comprobados

- Repositorio: `sebasbeltranc21-dev/Proyecto-2`, rama `main`.
- Supabase: **Proyecto 2**, referencia `tlmgyzfsebceahhgfsar`, región `us-east-2`, PostgreSQL 17. Proyecto saludable.
- Vercel: proyecto `proyecto-2`, ID `prj_qICEwZRpQ0g1o1EMfBzfklgnhwgz`, equipo `sebastian-beltran`. La lectura de configuración devuelve 403 por falta de autorización de ese equipo. No se han cambiado variables ni iniciado despliegues en Vercel.

## Migraciones aplicadas

Se inspeccionaron las tablas y el historial antes de cambiar la base: ambos estaban vacíos. Las migraciones se aplicaron mediante la conexión Supabase y los archivos se renombraron para reflejar las versiones reales registradas por el servicio. Su SQL original se conserva; la cuarta migración completa los índices sugeridos por el asesor alojado.

| Versión remota / archivo                          | Contenido                                               |
| ------------------------------------------------- | ------------------------------------------------------- |
| `20261023165250_mystery_core.sql`                 | Tablas, funciones, permisos, RLS y publicación Realtime |
| `20261023165305_museum_case.sql`                  | Caso fijo, sospechosos, solución y doce pistas          |
| `20261023165310_harden_room_access.sql`           | Límite de invitaciones e índices iniciales              |
| `20261023165540_complete_foreign_key_indexes.sql` | Índices de las claves foráneas restantes                |

Al actualizar un checkout antiguo, obtener estos archivos antes de ejecutar `supabase db push`. No volver a aplicar los archivos con las versiones del 22 de octubre. El historial remoto debe mostrar las cuatro versiones de esta tabla; no es necesario repararlo ni ejecutar `db reset`.

## Comprobaciones realizadas

- Trece tablas con RLS activado: diez públicas y tres privadas.
- Un caso, cuatro sospechosos y doce pistas.
- Las seis tablas previstas pertenecen a `supabase_realtime`.
- `tests/remote-smoke.sql` pasó en PostgreSQL alojado. Crea tres usuarios temporales dentro de una transacción, emula su identidad en el límite SQL y comprueba creación/inicio de sala, aislamiento de evidencias, chat, reconexión, denegación a terceros, voto único, solución oficial y 150 puntos por jugador correcto. La transacción se revierte y se confirmó que quedaron **cero usuarios de prueba**.
- Auth HTTP: configuración disponible (200), Email habilitado, registro permitido y confirmación de correo obligatoria.
- La RPC `mm_home` por REST sin sesión fue rechazada con 401.
- Solicitar el esquema `mm_private` por REST devolvió 406 (`PGRST106`): no está expuesto en Data API.
- No se creó ni envió correo a una cuenta de pruebas. El script SQL no prueba Supabase Auth HTTP ni la entrega de eventos WebSocket.
- La configuración local usa únicamente URL y clave publicable en `.env.local`, ignorado por Git. No se leyó ni usó `service_role`.

## Regresión local con la configuración conectada

`npm test`: 12 pruebas aprobadas. ESLint, TypeScript y compilación de producción correctos. Playwright: 3 pruebas públicas aprobadas en Chromium Headless Shell (móvil, escritorio y navegación/404); se omitieron las dos que requieren cuentas reales y la de configuración ausente, porque ahora existe `.env.local`. La prueba transaccional alojada y las comprobaciones HTTP anteriores complementan estos resultados, sin sustituir la prueba Auth/Realtime entre dos navegadores.

## Asesores

Seguridad: solo tres avisos informativos `rls_enabled_no_policy` para las tablas de `mm_private`. Es intencional: el cliente no tiene permisos sobre esas tablas ni políticas que le concedan filas; las funciones internas autorizadas acceden como propietario. No se deben añadir políticas públicas para eliminar el aviso. [Referencia del asesor](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

Rendimiento: se corrigieron los siete avisos de claves foráneas sin índice. Solo quedaron avisos informativos de índices aún no utilizados, esperables en una base recién creada; se conservan los índices para sus consultas previstas. [Referencia](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).

## Bloqueo y continuación

Vercel respondió que la conexión no está autorizada para el equipo `sebastian-beltran`. El servicio solicita autorización de acceso a ese equipo; la herramienta para generar ese enlace no está expuesta en esta sesión. No se intentó usar otra identidad o credenciales para eludir el bloqueo.

Tras autorizar el equipo:

1. Leer la configuración del proyecto y sus variables existentes.
2. Configurar la URL y clave publicable de Supabase en el entorno previsto de Vercel, manteniendo invitados desactivados hasta probarlos.
3. Revisar los redirects de Auth para la URL final; no se han cambiado en este paso.
4. Desplegar el commit verificado y comprobar estado Ready y URL.
5. Probar registro/confirmación de correo y dos sesiones reales, incluida entrega de eventos Realtime, recarga, chat, votación y resultados.

Actualización posterior: el panel mostró Ready para la rama `main` y se verificó HTTP 200 en <https://proyecto-2-rho.vercel.app>. El usuario confirmó inicio de sesión y creación de una sala. Se corrigió el requisito de perfil guardado en el formulario de invitación y se añadieron cinco pruebas del componente. La autorización administrativa de Vercel y la validación de una partida completa entre dos navegadores siguen pendientes.
