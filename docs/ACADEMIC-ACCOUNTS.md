# Cuentas y datos ficticios para el Laboratorio 4

El PDF del laboratorio pide usar solo datos inventados, guardar los datos en
Supabase y demostrar persistencia e interacción entre dos usuarios. Su guía propone
crear las cuentas ficticias desde el panel de Supabase. El dominio `example.com`
se usa aquí para los ejemplos; no hace falta disponer de un buzón.

## Preparar dos cuentas

1. En el proyecto **Proyecto 2**, abre **Authentication → Users**.
2. Pulsa **Add user → Create new user**, no **Invite user**.
3. Crea `ana@example.com` y una contraseña exclusiva de práctica. Activa
   **Auto Confirm User** si aparece. Repite con `luis@example.com`.
4. Entrega las credenciales correspondientes a cada participante por separado.
   Los correos de este documento son ejemplos: no implica que esas cuentas ya existan.
5. En la web, entra con una cuenta y guarda un alias inventado, como
   **Detective Lince** o **Agente Búho**. Usa únicamente teorías del caso en el chat.

No hace falta cambiar SMTP ni desactivar la confirmación global para usar usuarios
creados y confirmados por el responsable. Conserva Email y el acceso con contraseña
activados. Para cerrar también el registro directo por API, desactiva
**Allow new users to sign up** y **Anonymous Sign-Ins** desde el panel. La interfaz
no ofrece registro ni nuevos accesos anónimos. Esta edición no cambia esos ajustes
remotos ni puede verificar automáticamente si un texto libre es ficticio.

## Verificar y tomar las cuatro capturas

1. Entra como Ana, guarda su alias y completa una partida: captura el resultado.
2. En otro navegador, entra con las mismas credenciales de Ana y muestra que su
   perfil y resultado siguen en el expediente. No basta la misma sesión de navegador.
3. En dos navegadores o contextos separados, entra como Ana y Luis. Crea una sala
   con Ana y une a Luis usando su código. Ana envía una teoría inventada: captura A.
4. Comprueba que Luis recibe ese mensaje en vivo y responde: captura B. Recarga y
   comprueba que los mensajes guardados siguen visibles. El chat conserva su envío,
   guardado en Supabase, sincronización Realtime y recuperación por consultas.

Para las pruebas automáticas existentes, proporciona `E2E_HOST_EMAIL`,
`E2E_PLAYER_EMAIL`, `E2E_PASSWORD` (una contraseña solo de prueba compartida por
ambas cuentas si ejecutas ese harness) y `E2E_BASE_URL` al proceso. No guardes
contraseñas, sesiones ni claves secretas en el repositorio.

## Datos anteriores y alcance del cambio

La revisión inicial del proyecto alojado encontró tres usuarios de Auth, ninguno
con `@example.com`; eso por sí solo no permite afirmar si sus datos son reales o
inventados. No se modificaron ni borraron esas cuentas, perfiles, mensajes o
partidas. Antes de entregar, el responsable debe revisar los registros anteriores
y anonimizar o retirar cualquier dato personal real. Usar cuentas nuevas no borra
lo que ya estaba guardado. No publiques capturas que muestren datos personales.

La conexión de Supabase disponible permite consultar PostgreSQL, pero no ofrece
administración de usuarios de Auth ni configuración de proveedores. Por eso no se
afirma que las dos cuentas estén creadas, que el registro remoto esté desactivado
o que se haya probado aún una partida autenticada con ellas. No se insertaron
usuarios manualmente en las tablas internas de Auth.

El cambio solo modifica el acceso y las indicaciones para esta práctica. Las
tablas, RLS, puntuación, casos y lógica de chat permanecen sin cambios. La rama
`backup-antes-datos-ficticios` conserva el código anterior.
