# Contexto técnico de Trazo

Mapa del proyecto para futuras modificaciones. La web está en **formulariotrazo.es** y tiene dos partes:

- **Portada pública (`/`)**: explica qué hacemos (webs informativas, tiendas online, SEO e informes mensuales), los precios y cómo contactar.
- **Panel privado (`/admin`)**: lo usamos para gestionar las webs de clientes que mantenemos: dominios, costes, cobros y lo que nos debe cada cliente.

> Historia: hasta noviembre de 2026 esto era una herramienta de propuestas con login de Google. Se generaban propuestas, el cliente respondía un formulario y se guardaba en Supabase y después en SQLite. Todo eso se eliminó el 11/11/2026. No lo recuperes: si hace falta algo parecido, se diseña de nuevo.

## Tecnología y comandos

- Next.js 16 (App Router, Turbopack), React 19, TypeScript, `zod` y `lucide-react`. Esta versión de Next tiene cambios: consulta `node_modules/next/dist/docs/` (ver `AGENTS.md`).
- Base de datos: SQLite con `node:sqlite` (Node 22), en un único fichero en `TRAZO_DB_PATH`. No hay ORM.
- CSS propio: `app/globals.css` para lo global, `app/page.module.css` para la portada y `components/admin/Admin.module.css` para el panel. No se usa Tailwind.
- Desarrollo: `npm run dev`. Necesita `.env.local` con `ADMIN_PASSWORD_HASH`, `AUTH_SESSION_SECRET` y `TRAZO_DB_PATH` (ver `.env.example`).
- Verificación antes de publicar: `npm run lint && npm run typecheck && npm test && npm run build`.

## Estructura

- `app/page.tsx`: portada. Las secciones son hero, `#servicios`, `#precios` (dos planes y lo que incluye el mantenimiento), cómo trabajamos y `#contacto`. Todo el texto y los precios están en constantes al principio del fichero, incluidos `PHONE_*` y `WHATSAPP`.
- `app/privacidad` y `app/aviso-legal`: textos legales. Los datos del titular salen de `TRAZO_LEGAL_NAME`, `TRAZO_TAX_ID`, `TRAZO_ADDRESS` y `TRAZO_PRIVACY_EMAIL`. La portada no tiene formularios ni cookies de seguimiento.
- `app/admin/acceso`: login con contraseña. Contiene `page.tsx`, `LoginForm.tsx` (que usa `useActionState`) y `actions.ts`.
- `app/admin/(protected)/`: todo lo que exige sesión. El `layout.tsx` llama a `requireAdmin()`.
  - `page.tsx`: resumen con indicadores (webs activas, ingresos al mes, total cobrado, pendiente, costes y margen), webs con deuda y renovaciones de dominio en los próximos 60 días.
  - `webs/`: lista, alta (`nueva`) y ficha (`[id]`). En la ficha se registran los cobros y se gestionan los dominios, los costes propios, los datos de la web y el archivado o borrado.
  - `cobros/`: registro de pagos, historial con filtro por web y total recaudado por mes.
  - `costes/`: costes generales (VPS…) y de cada web, con el coste anual de los dominios prorrateado.
  - `actions.ts`: todas las server actions del panel. Cada una llama a `requireAdmin()` y valida con `zod`. Los errores de validación vuelven a la página como `?error=...`, que muestra `components/admin/Flash.tsx`.
- `components/admin/`: `AdminNav`, `SiteForm`, `PaymentForm`, `CostForm`, `ConfirmButton` (borrado en dos clics) y `Flash`.
- `lib/db.ts`: conexión, esquema, migraciones, datos iniciales y todas las consultas.
- `lib/billing.ts`: cálculos de dinero y formato. Son funciones puras y tienen tests.
- `lib/domains.ts`: fechas de aniversario y estado de renovación de los dominios.
- `lib/auth.ts`: contraseña, sesión y límite de intentos.
- `scripts/hash-password.mjs`: genera el hash de la contraseña del panel.

## Modelo de datos (`lib/db.ts`)

- `sites`: webs de clientes.
  - Campos: nombre, dominio, url, `kind` (`informativa`, `tienda` o `hosting`), `started_on`, `ended_on`, `monthly_cents`, `setup_cents` (desarrollo), `hosting` (dónde está alojada), notas y `archived`.
- `domains`: uno o varios por web, con registrador, `renews_on`, `yearly_cents` y `auto_renew`.
- `costs`: lo que nos cuesta cada cosa. Tiene `site_id` (NULL si es un coste general, como el VPS compartido) y `period` (`mensual`, `anual` o `unico`).
- `payments`: cobros recibidos, con concepto `desarrollo`, `mantenimiento` u `otro`.
- `meta`: marcas internas. `seed_v1` evita que los datos iniciales se vuelvan a crear.

El dinero se guarda siempre **en céntimos (enteros)**. En los formularios se escribe en euros, con coma o con punto, y `parseEuros` hace la conversión.

**Saldo de una web** (`siteBalance`): `desarrollo + cuota × meses empezados desde el alta − total cobrado`.
- La cuota se devenga al inicio de cada periodo, contando el mismo día de cada mes (`anniversaryDate`). El día del alta ya cuenta como un mes.
- Una web sin fecha de alta no devenga nada.
- Si hay fecha de baja, no se generan periodos a partir de ese día.

**Migración del sistema antiguo**:
- Al arrancar, si existen las tablas `managed_websites` o `proposals`, se pasan las webs, los dominios y los pagos al modelo nuevo y se borran las tablas antiguas.
- Ya se ejecutó en producción el 11/11/2026. La copia previa está en `~/docker/backups/formulario-trazo-data-20261111T*`.

## Autenticación

- Hay una sola contraseña de administrador. En `ADMIN_PASSWORD_HASH` se guarda su hash en formato `scrypt$<sal>$<hash>`, nunca la contraseña en claro. Nunca la escribas en el repo, tampoco en tests.
- Para cambiarla: `node scripts/hash-password.mjs 'nueva contraseña'`, poner el resultado en `.env.internal` **entre comillas simples** (por los `$`) y ejecutar `docker compose up -d`.
- Sesión: cookie `trazo_session` firmada con HMAC usando `AUTH_SESSION_SECRET`, con `httpOnly`, `secure` y `SameSite=Strict`. Dura 12 horas.
- Límite de intentos, guardado en memoria (se reinicia al reiniciar el contenedor):
  - Se bloquea durante 15 minutos con 5 fallos de la misma IP o 30 fallos en total.
  - La IP se lee de `cf-connecting-ip` o `x-forwarded-for`.

## Despliegue (VPS)

- Imagen Docker `formulario-trazo:modern-sqlite`, construida desde este repo (`Dockerfile`, salida `standalone`).
- Compose en `~/docker/formulario-trazo-production/` (`compose.yaml` y `.env.internal`). Los datos están en el volumen `formulario-trazo-production-trazo-data`, montado en `/data/trazo.sqlite`.
- El tráfico entra por el túnel `cloudflared`. En el mismo VPS están `ibhola-web` y `cerezo-pilates-web`, detrás del Caddy de `~/docker/ibhola`.
- Pasos para desplegar: ver `docs/production-runbook.md`. Resumen: etiquetar la imagen actual, copiar `/data`, `docker build` y `docker compose up -d`.
- Para volver atrás: la imagen `formulario-trazo:pre-dashboard` y el fichero `.env.internal.pre-dashboard` corresponden a la versión de propuestas.

## Clientes actuales (noviembre de 2026)

- **ibholahuelva.es** (Ibhola): web informativa con 300 € de desarrollo, alta el 16/09/2026, alojada en este VPS.
  - La cuota en el panel antiguo era de 39 €/mes, pero según lo hablado debería ser 29 €. Pendiente de confirmar.
- **cerezopilates.es** (Cerezo Pilates): solo hosting, 39 €/mes desde el 11/11/2026, alojada en este VPS.
- Faltan por completar en el panel los registradores, las fechas de renovación de los dominios y los costes (VPS, dominios).

## Precios publicados

- Web informativa: 190 € de desarrollo y 29 €/mes de mantenimiento.
- Tienda online: 490 € de desarrollo y 39 €/mes de mantenimiento.
- El mantenimiento incluye dominio, hosting, actualizaciones, seguimiento SEO e informe mensual.
- Contacto: 634 470 824, por teléfono y WhatsApp.
