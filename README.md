# MODO MISTERIO

Juego web cooperativo de investigación para 2–8 personas. Un equipo entra a una sala privada, recibe pistas públicas y privadas, debate en el chat y vota para resolver un misterio con solución fija.

**Estado al 23 de octubre de 2026:** las migraciones están aplicadas al proyecto Supabase **Proyecto 2**. La base alojada pasó una prueba transaccional de salas, RLS, pistas, chat, votos y puntuación; las identidades de Auth se emularon y todas las filas de prueba se revirtieron. Email está habilitado y exige confirmación. La web está publicada en <https://proyecto-2-rho.vercel.app>, con estado Ready confirmado en el panel y respuesta HTTP 200 verificada. El usuario confirmó inicio de sesión y creación de sala. La conexión de administración de Vercel sigue devolviendo 403 para el equipo `sebastian-beltran`. Falta completar la validación de una partida con dos navegadores y entrega de eventos Realtime. [Detalle de integración](docs/INTEGRATION.md).

La inspección inicial encontró el repositorio vacío y ninguna base accesible. Al habilitar Supabase se comprobó que no había tablas del juego antes de aplicar las migraciones. La aplicación sigue mostrando «Conexión pendiente» cuando faltan sus variables de entorno.

## Implementación

- Next.js App Router, TypeScript y Tailwind CSS, versiones exactas y lockfile.
- Supabase Auth: correo/contraseña, confirmación, cierre de sesión e invitados opcionales.
- Perfiles con emblemas, salas privadas con código, anfitrión y preparación. Al unirse por código, un usuario nuevo puede escribir su nombre y guardar el perfil desde el mismo formulario.
- Caso original «La última luz del museo»: cuatro sospechosos, doce evidencias, investigación, chat, votación y solución fija.
- Pistas privadas por identidad; Supabase Realtime y recuperación por consultas periódicas.
- Votos inmutables, cierre transaccional, puntos, historial, estadísticas y clasificación.
- Migraciones con RLS y funciones para acciones críticas. No se necesita `service_role`.
- Diseño adaptable, ilustración SVG original, confirmaciones, errores y estados vacíos.

Los modos competitivo y traidor son futuros. Hoy solo se ofrece investigación cooperativa. [Arquitectura y límites](docs/ARCHITECTURE.md).

## Ejecutar en tu PC

Necesitas Node.js 22 o superior, npm y un proyecto Supabase.

```bash
git clone https://github.com/sebasbeltranc21-dev/Proyecto-2.git
cd Proyecto-2
npm ci
```

Copia `.env.example` como `.env.local`. En PowerShell:

```powershell
Copy-Item .env.example .env.local
```

En macOS/Linux: `cp .env.example .env.local`.

Completa la URL y la clave **publicable** desde Supabase / Project Settings / API Keys:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICABLE
NEXT_PUBLIC_ALLOW_GUESTS=false
```

No uses `service_role` ni una clave secreta. Después de configurar la base de datos:

```bash
npm run dev
```

Abre <http://localhost:3000>. Tras cambiar variables públicas, reinicia el servidor; en producción, recompila.

## Configurar Supabase

1. Crea o selecciona el proyecto destinado a MODO MISTERIO. Verifica la organización y el ID. No reutilices una base con tablas `mm_*` sin revisar colisiones e historial.
2. El repositorio incluye una versión fijada de Supabase CLI. Consulta la ayuda y autentícate:

   ```bash
   npx supabase --help
   npx supabase login
   npx supabase link --help
   npx supabase db push --help
   ```

3. Enlaza el ID real y revisa los cambios antes de aplicarlos. En el proyecto conectado actual las cuatro migraciones ya están aplicadas; no vuelvas a ejecutarlas desde SQL Editor:

   ```bash
   npx supabase link --project-ref ID_REAL_DEL_PROYECTO
   npx supabase db push --dry-run
   npx supabase db push
   ```

   Las cuatro migraciones crean esquema, caso, restricciones e índices; no eliminan datos. No ejecutes `db reset` sobre una base remota. Alternativa: ejecutar los cuatro SQL en orden desde SQL Editor y registrar su aplicación. No mezcles ambos métodos sin reconciliar el historial.

4. En Auth habilita Email y confirmación de correo. Configura **Site URL** y autoriza `http://localhost:3000/auth/callback` y tu URL exacta de producción con `/auth/callback`. Para producción y pruebas fiables configura SMTP.
5. Invitados opcionales: habilita **Anonymous Sign-Ins** en Supabase y establece `NEXT_PUBLIC_ALLOW_GUESTS=true`. Configura límites de Auth adecuados. El MVP no incluye widget CAPTCHA: si lo haces obligatorio en Auth, deja invitados desactivados hasta incorporar el widget y enviar su token.
6. En Data API expón `public`; **nunca `mm_private`**. Las migraciones conceden lectura y ejecución explícitas, bloqueando escrituras directas. No agregues políticas permisivas globales.
7. En Database / Replication comprueba que `supabase_realtime` incluye `mm_rooms`, `mm_participants`, `mm_games`, `mm_messages`, `mm_evidence` y `mm_results`. La migración los agrega si existe la publicación. Si no existía, habilítala para esas tablas desde el panel.
8. Ejecuta los asesores de seguridad y rendimiento de Supabase. Ya se ejecutaron sobre Proyecto 2; el detalle está en `docs/INTEGRATION.md`. Las pruebas locales no reemplazan esta revisión ni la comprobación de Auth/Realtime alojados.

Para Supabase local necesitas Docker: consulta `npx supabase start --help`. El caso está en las migraciones, sin `seed.sql` adicional. Los invitados permanecen desactivados por defecto.

## Desplegar en Vercel

1. Importa `sebasbeltranc21-dev/Proyecto-2` en la cuenta/equipo correcto.
2. Framework **Next.js**, raíz del repositorio, Node **22.x**, instalación `npm ci`, compilación `npm run build`, salida automática.
3. Añade las tres variables anteriores a Preview o Production según corresponda.
4. Aplica las migraciones al proyecto Supabase previsto y configura las redirecciones de Auth para el dominio de Vercel.
5. Despliega y comprueba el estado **Ready** y la URL devuelta. Repite el recorrido completo con dos cuentas independientes antes de anunciar el juego como operativo.

No hace falta `vercel.json`. GitHub Pages no ejecuta este backend. El workflow de GitHub Actions comprueba el proyecto sin secretos; no despliega ni aplica migraciones.

## Pruebas

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm test` ejecuta las migraciones reales en PostgreSQL embebido (PGlite), emulando solo las funciones mínimas de identidad de Auth y cambiando entre roles `anon` y `authenticated`. Prueba RLS, pertenencia, pistas privadas/futuras, plazos, votos, puntos, límites de códigos y reconexión. También valida entradas y origen HTTP.

Playwright carga `.env.local` si existe y comprueba rutas públicas, navegación, configuración ausente, accesibilidad automatizada y desbordamiento en 1440 y 390 px. Sin Supabase, verifica el acceso desactivado y la respuesta 503 explícita. Next.js puede responder HTTP 200 al mostrar `notFound()` en una ruta dinámica que ya comenzó a transmitir: se comprueba su pantalla de recuperación y el 404 de una ruta inexistente.

La prueba multijugador necesita dos cuentas **verificadas y de pruebas**, con contraseña de pruebas compartida. Inyecta `E2E_HOST_EMAIL`, `E2E_PLAYER_EMAIL`, `E2E_PASSWORD` y opcionalmente `E2E_BASE_URL` en el proceso; nunca guardes estas credenciales en GitHub. No uses cuentas personales. Espera dos minutos mientras avanzan las fases y utiliza servidor y Supabase reales. La prueba de registro requiere `E2E_ALLOW_REGISTRATION=true` en un proyecto aislado con email y confirmación habilitados; comprueba el aviso de confirmación, no la entrega del correo. Ambas se omiten explícitamente sin configuración.

`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` permite usar un Chromium compatible ya instalado. No compartas trazas ni estados de navegador con sesiones privadas. [Informe de verificación](docs/VERIFICATION.md).

## Estructura

| Ruta                   | Contenido                                 |
| ---------------------- | ----------------------------------------- |
| `src/app/`             | Páginas y API                             |
| `src/components/`      | Acceso, panel y sala                      |
| `src/lib/`             | Clientes Supabase, tipos y validación     |
| `src/proxy.ts`         | Renovación de sesión sin caché compartida |
| `supabase/migrations/` | Esquema, caso y seguridad                 |
| `public/museum.svg`    | Ilustración original                      |
| `tests/`, `tests/e2e/` | Pruebas de datos, validación y navegador  |

[Arquitectura y reglas](docs/ARCHITECTURE.md) · [Verificación](docs/VERIFICATION.md)
