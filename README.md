# MODO MISTERIO

Juego web cooperativo de investigación para 2–8 personas. Un equipo entra a una sala privada, recibe pistas públicas y privadas, debate en el chat y vota para resolver un misterio con solución fija.

**Estado al 24 de octubre de 2026:** dos casos disponibles, ocho migraciones aplicadas y registro ficticio desde la app mediante una Edge Function de Supabase. La web está publicada en <https://proyecto-2-rho.vercel.app>. La integración alojada comprobó dos cuentas nuevas, chat Realtime y persistencia de perfil, historial y 150 puntos del museo después de volver a iniciar sesión. La partida del tren con dos personas en navegador sigue pendiente. Los cambios se publican mediante la conexión GitHub existente con Vercel. [Verificación](docs/VERIFICATION.md).

La inspección inicial encontró el repositorio vacío y ninguna base accesible. Al habilitar Supabase se comprobó que no había tablas del juego antes de aplicar las migraciones. La aplicación sigue mostrando «Conexión pendiente» cuando faltan sus variables de entorno.

## Implementación

- Next.js App Router, TypeScript y Tailwind CSS, versiones exactas y lockfile.
- Supabase Auth: creación de cuentas ficticias desde la app con un correo terminado en `@example.com` y contraseña de práctica. Confirmación automática sin enviar correos, inicio y cierre de sesión, y recuperación del mismo perfil e historial desde otro navegador.
- Perfiles con emblemas, salas privadas con código, anfitrión y preparación. Al unirse por código, un usuario nuevo puede escribir su nombre y guardar el perfil desde el mismo formulario.
- Selector de dos casos originales con solución fija: «La última luz del museo» (4 sospechosos, 12 pistas) y «El Expreso Medianoche» (5 sospechosos, 14 pistas).
- Mapas por zonas y vagones, aperturas por fase y evidencias ampliables. Pistas privadas por identidad; Supabase Realtime y recuperación por consultas periódicas.
- Cronología compartida: cada investigador elige la hora de su hipótesis. Compartir una pista privada requiere confirmación expresa de su contenido completo. Solo su autor cambia la hora o retira la tarjeta durante la investigación.
- Votos inmutables, cierre transaccional, puntos, historial, estadísticas y clasificación.
- Cinemáticas finales originales de museo y tren: cuatro escenas (14 segundos), detención del responsable cuando el equipo resuelve el caso y desenlace distinto ante fallo o empate. Controles de pausa, avance, omisión y repetición; con movimiento reducido se leen como una historieta estática.
- Migraciones con RLS y funciones para acciones críticas. El navegador usa solo la clave publicable; `register-fictional` usa una clave administrativa disponible únicamente en el entorno de Edge Functions para crear cuentas nuevas.
- Diseño adaptable con dos escenarios originales y nueve personajes SVG de estilo cómic: facciones, peinados, ropa y accesorios por profesión. Los mismos personajes aparecen de cuerpo completo en las cinemáticas, con manos, poses y expresiones; investigador y agentes tienen diseños propios. Dibujos de las evidencias y animaciones breves, con soporte para movimiento reducido; confirmaciones, errores y estados vacíos.
- Identidad visual de agencia: tablero ilustrado con hilos y notas en la portada, sellos y credencial de acceso, guía de preparación y fases del expediente. El formulario de crear sala ya no ofrece «Permitir invitados» y envía `allowGuests: false`.
- Interfaz de oficina de detectives: escritorio ilustrado, carpetas seleccionables con fotografías de los escenarios, credencial, archivo personal, pestañas de expediente e informe final sellado según el resultado oficial. Los accesos del escritorio llevan a los formularios reales y los estados del archivo proceden de la base de datos.

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

3. Enlaza el ID real y revisa los cambios antes de aplicarlos. En el proyecto conectado actual las ocho migraciones ya están aplicadas; no vuelvas a ejecutarlas desde SQL Editor:

   ```bash
   npx supabase link --project-ref ID_REAL_DEL_PROYECTO
   npx supabase db push --dry-run
   npx supabase db push
   ```

   Las ocho migraciones crean esquema, caso, restricciones e índices; no eliminan datos. No ejecutes `db reset` sobre una base remota. Alternativa: ejecutar los ocho SQL en orden desde SQL Editor y registrar su aplicación. No mezcles ambos métodos sin reconciliar el historial.

4. En Auth habilita Email y el acceso con contraseña. Aplica la migración de límites de registro y despliega `register-fictional` con `npx supabase functions deploy register-fictional`. La función verifica la clave publicable, permite solo cuentas nuevas `@example.com`, limita los intentos en PostgreSQL y confirma la cuenta sin enviar correos. El código lee la clave administrativa desde los secretos automáticos de Edge Functions: nunca la copies a Vercel ni a variables `NEXT_PUBLIC_`. [Uso y despliegue](docs/ACADEMIC-ACCOUNTS.md).
5. Mantén `NEXT_PUBLIC_ALLOW_GUESTS=false`. Cada jugador crea su propia cuenta desde **Crear cuenta ficticia** y vuelve con las mismas credenciales. El proyecto puede mantener la confirmación global de correo: la función confirma únicamente estas cuentas ficticias. No se necesitan SMTP ni cambios en las cuentas anteriores.
6. En Data API expón `public`; **nunca `mm_private`**. Las migraciones conceden lectura y ejecución explícitas, bloqueando escrituras directas. No agregues políticas permisivas globales.
7. En Database / Replication comprueba que `supabase_realtime` incluye `mm_rooms`, `mm_participants`, `mm_games`, `mm_messages`, `mm_evidence`, `mm_results` y `mm_timeline`. La migración los agrega si existe la publicación. Si no existía, habilítala para esas tablas desde el panel.
8. Ejecuta los asesores de seguridad y rendimiento de Supabase. Ya se ejecutaron sobre Proyecto 2; el detalle está en `docs/INTEGRATION.md`. Las pruebas locales no reemplazan esta revisión ni la comprobación de Auth/Realtime alojados.

Para Supabase local necesitas Docker: consulta `npx supabase start --help`. Los casos están en las migraciones, sin `seed.sql` adicional. Los invitados permanecen desactivados por defecto.

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

Las pruebas multijugador cubren ambos casos, la confirmación al compartir pistas privadas y la cronología. Necesitan dos cuentas **ficticias creadas y confirmadas por el registro de la app**, con contraseña de pruebas compartida. Inyecta `E2E_HOST_EMAIL`, `E2E_PLAYER_EMAIL`, `E2E_PASSWORD` y opcionalmente `E2E_BASE_URL` en el proceso; nunca guardes estas credenciales en GitHub. No uses cuentas personales. Espera dos minutos mientras avanzan las fases y utiliza servidor y Supabase reales. Las pruebas públicas comprueban el formulario de registro ficticio y la explicación de persistencia, sin disparar envíos de correo. Las pruebas multijugador se omiten explícitamente sin las dos cuentas ficticias creadas y sus variables; no se sustituyen por sesiones inventadas en el navegador.

`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` permite usar un Chromium compatible ya instalado. No compartas trazas ni estados de navegador con sesiones privadas. [Informe de verificación](docs/VERIFICATION.md).

## Estructura

| Ruta                                    | Contenido                                 |
| --------------------------------------- | ----------------------------------------- |
| `src/app/`                              | Páginas y API                             |
| `src/components/`                       | Acceso, panel y sala                      |
| `src/lib/`                              | Clientes Supabase, tipos y validación     |
| `src/proxy.ts`                          | Renovación de sesión sin caché compartida |
| `supabase/migrations/`                  | Esquema, caso y seguridad                 |
| `public/museum.svg`, `public/train.svg` | Escenarios originales                     |
| `tests/`, `tests/e2e/`                  | Pruebas de datos, validación y navegador  |

[Arquitectura y reglas](docs/ARCHITECTURE.md) · [Verificación](docs/VERIFICATION.md)
