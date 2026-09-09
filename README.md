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

## Supabase

1. Crea un proyecto europeo para cada entorno.
2. Aplica las migraciones de `supabase/migrations`.
3. Configura Google OAuth y añade las URL de callback de cada entorno.
4. Inicia sesión una vez y añade ese usuario a `public.admin_users` usando la consulta comentada al final de la migración.
5. Configura las variables de `.env.example` en Vercel.

La clave `SUPABASE_SERVICE_ROLE_KEY` solo puede existir en el servidor. Nunca debe usar el prefijo `NEXT_PUBLIC_`.

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

La migración futura del backend gestionado a Supabase autoalojado debe ensayarse con una copia antes del cambio de DNS. Hay que volver a configurar Google, secretos, SMTP y claves JWT, y solicitar un nuevo inicio de sesión.

## Producción

Antes de publicar, configura `NEXT_PUBLIC_APP_URL=https://formulariotrazo.es`, completa los datos legales, cambia `RATE_LIMIT_SECRET`, verifica copias externas y ejecuta el guion de aceptación. Las previsualizaciones deben utilizar un proyecto Supabase de pruebas y nunca las credenciales de producción.
