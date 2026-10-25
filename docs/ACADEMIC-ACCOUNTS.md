# Cuentas ficticias desde la aplicación

## Crear tu cuenta y recuperar tus datos

1. En la web, entra en **Mi expediente → Crear cuenta ficticia**.
2. Inventa un correo terminado en `@example.com`, como `detective123@example.com`.
   La parte anterior a `@` debe tener entre 2 y 48 caracteres: letras sin tildes,
   números, punto, guion o guion bajo, empezando por letra o número.
3. Elige una contraseña exclusiva de práctica de entre 8 y 128 caracteres y
   repítela. Pulsa **Crear mi cuenta y entrar**. No necesitas recibir correos ni
   crear la cuenta manualmente en un panel.
4. Guarda un alias inventado en el perfil. Las partidas, historial y puntuación
   se asocian a tu identidad de Supabase Auth.
5. Para volver, usa **Iniciar sesión** con el mismo correo y contraseña desde
   cualquier navegador o dispositivo. No crees una segunda cuenta para recuperar
   el progreso. Al no existir un buzón real, no se recuperan contraseñas por correo.

Cada jugador crea una cuenta distinta. Los correos anteriores son ejemplos, no
credenciales compartidas. Los perfiles y mensajes deben contener solo datos
inventados. Las cuentas guardadas anteriormente permanecen sin modificaciones.

## Implementación y límites

`register-fictional` es una Edge Function de Supabase. Valida el correo ficticio y
la longitud de contraseña, reclama un cupo persistente y crea un usuario nuevo con
`email_confirm: true` mediante la API administrativa de Auth. No envía invitaciones,
no modifica cuentas existentes y no recibe roles ni metadatos del cliente. Si el
correo ya existe, el usuario debe iniciar sesión o elegir otro.

El navegador solo envía la clave publicable. La función verifica esa clave; por eso
su configuración usa `verify_jwt = false`, ya que aún no existe una sesión al
registrarse. Los secretos administrativos se leen únicamente del entorno alojado
por Supabase y nunca se devuelven en la respuesta. Se permiten el origen de
producción y localhost para desarrollo. Para otro dominio se debe revisar y
actualizar la lista de orígenes de la función antes de desplegar allí.

La función `mm_claim_registration` usa `SECURITY INVOKER` y está concedida solo a
`service_role`. Su tabla está en `mm_private`, protegida con RLS y sin acceso desde
`anon` ni `authenticated`. Los límites son 100 intentos globales por hora y 3 por
correo ficticio por hora; los registros caducados se limpian al registrar. Solo se
guarda un hash del correo inventado y contadores, nunca contraseñas en esa tabla.
No se cambian las tablas de partidas, casos, puntos ni el chat en vivo.

## Configurar un proyecto nuevo

Aplica las ocho migraciones y despliega `supabase/functions/register-fictional/index.ts`.
Consulta primero `npx supabase functions deploy --help`; luego:

```bash
npx supabase functions deploy register-fictional
```

El archivo `supabase/config.toml` contiene la configuración de la función. El
proyecto debe tener habilitado el acceso Email con contraseña. La confirmación
global de correos puede permanecer activa. No copies claves administrativas a
variables públicas del frontend ni a GitHub.

## Verificación alojada opcional

El script `scripts/verify-fictional-registration.mjs` necesita las variables públicas
habituales y autorización explícita mediante `VERIFY_FICTIONAL_ACCOUNTS=true`.
Crea dos identidades temporales ficticias, prueba registro, duplicados, reconexión,
chat Realtime y una partida de dos minutos; finalmente comprueba que una sesión
nueva recupera perfil, historial y 150 puntos. Cierra sus sesiones y deja en
`/tmp/mm-fictional-verification.json` los IDs exactos de sus fixtures para su
limpieza acotada. No imprime contraseñas ni tokens. No lo ejecutes en CI sin
configurar expresamente un proyecto de prueba.
