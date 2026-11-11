# Trazo

Web pública de Trazo (formulariotrazo.es) y panel privado para gestionar las webs que mantenemos.

- `/` — portada: servicios, precios y contacto.
- `/admin` — panel con contraseña: webs activas, dominios y renovaciones, costes, cobros y saldo pendiente de cada cliente.

## Desarrollo

```bash
cp .env.example .env.local   # rellena ADMIN_PASSWORD_HASH y AUTH_SESSION_SECRET
npm install
npm run dev
```

Comprobaciones: `npm run lint && npm run typecheck && npm test && npm run build`.

## Datos

SQLite (`node:sqlite`) en `TRAZO_DB_PATH`. El esquema se crea solo al arrancar (`lib/db.ts`).
La primera vez también migra las webs del panel antiguo y borra las tablas de propuestas.

Saldo de cada web: `desarrollo + cuota × meses empezados desde el alta − cobros`. La cuota se devenga al inicio de cada mes (`lib/billing.ts`).

## Cambiar la contraseña

```bash
node scripts/hash-password.mjs 'nueva contraseña'
```

Pon el resultado en `ADMIN_PASSWORD_HASH` y reinicia el contenedor. Las sesiones duran 12 horas.
Tras 5 intentos fallidos desde una IP, el acceso se bloquea 15 minutos.

## Producción

Docker en el VPS: la imagen `formulario-trazo:modern-sqlite` se construye desde este repo.
El compose está en `~/docker/formulario-trazo-production` y los datos en el volumen `formulario-trazo-production-trazo-data`.

```bash
docker build -t formulario-trazo:modern-sqlite .
cd ~/docker/formulario-trazo-production && docker compose up -d
```
