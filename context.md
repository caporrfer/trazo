# Contexto técnico de Trazo

Mapa del proyecto para futuras modificaciones. La web está en **formulariotrazo.es** y tiene dos partes:

- **Portada pública (`/`)**: explica qué hacemos (webs informativas, tiendas online, SEO, informes mensuales), los precios y cómo contactar.
- **Panel privado (`/admin`)**: muestra las webs de clientes que mantenemos, con sus dominios, costes, cobros y lo que debe cada cliente. **Es de solo lectura**: no tiene formularios ni botones de edición. Los datos se actualizan desde el servidor con `scripts/db.mjs` (ver más abajo), normalmente pidiéndoselo a Claude.

> Historia: hasta noviembre de 2026 esto era una herramienta de propuestas con login de Google: se generaban propuestas, el cliente respondía un formulario y se guardaba en Supabase y después en SQLite. Todo eso se eliminó el 11/11/2026. No lo recuperes.

> **El repositorio de GitHub es público.** No subas contraseñas, importes de clientes ni datos privados. Los datos reales solo viven en la base de datos del servidor.

## Tecnología y comandos

- Next.js 16 (App Router, Turbopack), React 19, TypeScript, `zod` y `lucide-react`. Esta versión de Next tiene cambios importantes: consulta `node_modules/next/dist/docs/` (ver `AGENTS.md`).
- Base de datos: SQLite con `node:sqlite` (Node 22), en un único fichero en `TRAZO_DB_PATH`. No hay ORM.
- CSS propio, sin Tailwind:
  - `app/globals.css`: estilos globales.
  - `app/page.module.css`: portada.
  - `app/admin/acceso/Login.module.css`: login.
  - `components/admin/Admin.module.css`: panel.
- Desarrollo: `npm run dev`, con un `.env.local` que tenga `ADMIN_PASSWORD_HASH`, `AUTH_SESSION_SECRET` y `TRAZO_DB_PATH` (ver `.env.example`).
- Verificación antes de publicar: `npm run lint && npm run typecheck && npm test && npm run build`.

## Estética

- Paleta en `:root` de `globals.css`:
  - Verde `--green #174c3b` y `--green-dark`.
  - Coral `--coral` (en los antetítulos se usa `#b9664a`).
  - Papel `--paper #f8f6f0` y superficie `--surface`.
- Titulares y cifras grandes en Georgia (serif). El resto del texto usa la fuente del sistema.
- La portada y el login usan como fondo `public/trazo-hero.webp` (`trazo-hero-mobile.webp` en móvil), con un velo radial claro encima.
- El panel tiene:
  - una cabecera fija translúcida con pestañas tipo píldora (`AdminNav`) y un botón de salir con icono;
  - tarjetas de indicadores con una franja de color a la izquierda (roja si hay deuda, verde si está bien);
  - paneles blancos de esquinas redondeadas y tablas sobrias.

## Estructura

- `app/page.tsx`: portada. Secciones en orden: hero, `#servicios`, `#precios` (dos planes y lo que incluye el mantenimiento), cómo trabajamos y `#contacto`. Textos, precios, `PHONE_*` y `WHATSAPP` están en constantes al principio del fichero.
- `app/privacidad` y `app/aviso-legal`: textos legales. El titular sale de las variables `TRAZO_LEGAL_*`.
- `app/admin/acceso`: login. Contiene `page.tsx`, `LoginForm.tsx` (con `useActionState` y botón para ver la contraseña), `actions.ts` y `Login.module.css`.
- `app/admin/(protected)/`: todo lo que exige sesión. El `layout.tsx` llama a `requireAdmin()`.
  - `page.tsx`: resumen con pendiente de cobro, total cobrado, ingresos y margen al mes, quién debe, renovaciones de dominio a 60 días y últimos cobros.
  - `webs/page.tsx`: tarjetas con todas las webs. `webs/[id]`: ficha con saldo, datos, dominios, cobros y costes.
  - `cobros/`: historial con filtro por web (enlaces `?web=<id>`) y total recaudado por mes, con barras.
  - `costes/`: costes generales y por web, dominios y margen.
  - `actions.ts`: solo `logoutAction`. **No añadas acciones de escritura**: el panel es de solo lectura a propósito.
- `components/admin/`: `AdminNav` y `ui.tsx` (`PageHead`, `Stat`, `Panel`, `Empty`, `Badge`).
- `lib/db.ts`: conexión, esquema, migraciones, datos iniciales y consultas de lectura.
- `lib/billing.ts`: cálculos de dinero y formato. Son funciones puras y tienen tests.
- `lib/domains.ts`: fechas de aniversario y estado de renovación.
- `lib/auth.ts`: contraseña, sesión y límite de intentos.
- `scripts/db.mjs`: lectura y escritura de la base de datos desde la terminal. Va incluido en la imagen Docker.
- `scripts/hash-password.mjs`: genera el hash de la contraseña.

## Modelo de datos (`lib/db.ts`)

- `sites`: webs de clientes. Campos:
  - `id`, `name`, `domain`, `url`;
  - `kind`: `informativa`, `tienda` o `hosting`;
  - `started_on`, `ended_on`;
  - `monthly_cents`, `setup_cents` (desarrollo);
  - `hosting` (dónde está alojada), `notes`, `archived`.
- `domains`: `site_id`, `name`, `registrar`, `renews_on`, `yearly_cents`, `auto_renew`, `notes`.
- `costs`: `site_id` (NULL si es un coste general, como el VPS), `concept`, `provider`, `amount_cents`, `period` (`mensual`, `anual` o `unico`), `notes`.
- `payments`: `site_id`, `paid_on`, `amount_cents`, `concept` (`desarrollo`, `mantenimiento` u `otro`), `notes`.
- `meta`: marcas internas. `seed_v1` evita que se vuelvan a crear los datos iniciales.

Convenciones de datos:
- Todas las tablas tienen `id TEXT` y `created_at` (las webs también `updated_at`).
- Las fechas se guardan como `AAAA-MM-DD`.
- El dinero se guarda **en céntimos (enteros)**.

**Saldo de una web** (`siteBalance`): `desarrollo + cuota × meses empezados desde el alta − total cobrado`.
- La cuota se devenga al inicio de cada periodo, el mismo día de cada mes (`anniversaryDate`). El día del alta ya cuenta como un mes.
- Una web sin fecha de alta no devenga nada.
- Si hay fecha de baja, no se generan periodos desde ese día.

## Actualizar los datos (solo desde el servidor)

```bash
# Consultar (abre la base en solo lectura y devuelve JSON)
docker exec formulario-trazo-production-app-1 node scripts/db.mjs query "SELECT id, name, domain FROM sites"

# Modificar: todo el SQL en una transacción; si algo falla, no se aplica nada
docker exec -i formulario-trazo-production-app-1 node scripts/db.mjs exec <<'SQL'
INSERT INTO payments (id, site_id, paid_on, amount_cents, concept, notes, created_at)
  SELECT lower(hex(randomblob(16))), id, '2026-11-11', 3900, 'mantenimiento', 'Bizum', datetime('now')
  FROM sites WHERE domain = 'cerezopilates.es';
SQL
```

- Las filas se identifican por `domain` (sitios) o por `id` (sacado con `query`).
- Antes de cambios grandes, haz copia: `docker cp formulario-trazo-production-app-1:/data/. ~/docker/backups/formulario-trazo-data-$(date +%Y%m%dT%H%M%S)/`.
- El panel muestra los cambios al instante; no hay que reiniciar nada.

## Autenticación

- Hay una sola contraseña. En `ADMIN_PASSWORD_HASH` se guarda su hash `scrypt$<sal>$<hash>`, nunca la contraseña en claro. **Nunca la escribas en el repo, tampoco en tests.**
- Para cambiarla:
  1. `node scripts/hash-password.mjs 'nueva'`.
  2. Poner el resultado en `~/docker/formulario-trazo-production/.env.internal` **entre comillas simples** (por los `$`).
  3. Ejecutar `docker compose up -d`.
- Sesión: cookie `trazo_session` firmada con HMAC usando `AUTH_SESSION_SECRET`, con `httpOnly`, `secure` y `SameSite=Strict`. Dura 12 horas.
- Límite de intentos, en memoria (se reinicia al reiniciar el contenedor):
  - Se bloquea 15 minutos con 5 fallos de la misma IP o 30 fallos en total.
  - La IP se lee de `cf-connecting-ip` o `x-forwarded-for`.

## Despliegue (VPS)

- Imagen Docker `formulario-trazo:modern-sqlite`, construida desde este repo (`Dockerfile`, salida `standalone` más `scripts/`).
- Compose en `~/docker/formulario-trazo-production/` (`compose.yaml` y `.env.internal`). Volumen `formulario-trazo-production-trazo-data`, montado en `/data` (base en `/data/trazo.sqlite`).
- El tráfico entra por el túnel `cloudflared`. En el mismo VPS están `ibhola-web` y `cerezo-pilates-web`, detrás del Caddy de `~/docker/ibhola`.
- Pasos de despliegue: ver `docs/production-runbook.md`. Resumen: etiquetar la imagen actual, copiar `/data`, `docker build` y `docker compose up -d`.
- Para volver atrás: la imagen `formulario-trazo:pre-dashboard` y el fichero `.env.internal.pre-dashboard` corresponden a la antigua versión de propuestas.

## Clientes

- Las webs que gestionamos ahora son ibholahuelva.es (web informativa) y cerezopilates.es (solo hosting). Las dos están alojadas en este VPS.
- Los importes, fechas y cobros de cada cliente se consultan en el panel o con `scripts/db.mjs query`. No se apuntan aquí porque el repo es público.

## Precios publicados

- Web informativa: 190 € de desarrollo + 29 €/mes.
- Tienda online: 490 € de desarrollo + 39 €/mes.
- El mantenimiento incluye dominio, hosting, actualizaciones, seguimiento SEO e informe mensual.
- Contacto: 634 470 824 (teléfono y WhatsApp).
