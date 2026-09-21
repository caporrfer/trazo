# Formulario Trazo

Aplicación nueva para gestionar propuestas web personalizadas, recoger la opinión de negocios locales y organizar el seguimiento desde un dashboard privado.

## Desarrollo local

Requiere Node.js 22 LTS.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Con `TRAZO_DEMO_MODE=true` se habilitan una propuesta y un dashboard de demostración. Este modo se desactiva automáticamente en compilaciones de producción.

Propuesta local: `http://localhost:3000/propuesta/restaurante-paco`

Dashboard local: `http://localhost:3000/admin`

## Servidor propio

La aplicación utiliza PostgreSQL y un directorio privado local para las facturas. No necesita Supabase ni otro servicio de datos gestionado. Copia `.env.example` a `.env`, define `POSTGRES_PASSWORD`, `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAIL`, `RATE_LIMIT_SECRET` y `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, y arranca con `docker compose up -d --build`.

Registra en Google Cloud el callback `https://tu-dominio/auth/callback`. Las sesiones y permisos se guardan en PostgreSQL; la cuenta se crea al primer acceso con el correo indicado en `ADMIN_EMAIL`.

En Docker, `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` debe ser una clave estable y compartida por todas las réplicas. Si cambia, las acciones generadas por una versión anterior dejan de ser válidas.

## Verificación

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

El guion manual está en `docs/acceptance-checklist.md`.
El procedimiento de producción, copias, recuperación y cambio de administrador está en `docs/production-runbook.md`.

## Docker

La misma aplicación se empaqueta con la salida `standalone` de Next.js:

```bash
docker compose up --build
```

El procedimiento de actualización, copias, restauración e importación de datos está en [`docs/server-update.md`](docs/server-update.md).

## Producción

Antes de publicar, configura `NEXT_PUBLIC_APP_URL=https://formulariotrazo.es`, completa los datos legales, cambia `RATE_LIMIT_SECRET`, verifica copias externas y ejecuta el guion de aceptación.
