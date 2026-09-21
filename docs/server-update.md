# Actualizar Trazo en el servidor

El servidor debe tener Docker, Docker Compose v2 y un checkout del repositorio. El despliegue siempre se hace desde `main`.

## Primera instalación

```bash
git clone https://github.com/caporrfer/trazo.git /srv/trazo
cd /srv/trazo
cp .env.example .env
chmod 600 .env
# Edita .env: POSTGRES_PASSWORD, DATABASE_URL, GOOGLE_CLIENT_ID,
# GOOGLE_CLIENT_SECRET, ADMIN_EMAIL, RATE_LIMIT_SECRET y la clave de Next.
docker compose up -d --build
```

Configura el proxy HTTPS para enviar el dominio a `127.0.0.1:3000` y registra `https://DOMINIO/auth/callback` en Google Cloud. `TRAZO_DEMO_MODE` debe ser `false`.

## Actualizar a la versión de main

```bash
cd /srv/trazo
docker compose exec db pg_dump -U trazo -d trazo -Fc -f /tmp/trazo-before-update.dump
tar -C . -czf /var/backups/trazo-files-$(date +%Y%m%d-%H%M).tgz data
git fetch origin
git checkout main
git pull --ff-only origin main
docker compose up -d --build
docker compose ps
curl --fail --silent https://DOMINIO/robots.txt >/dev/null
```

La aplicación aplica `db/schema.sql` al iniciar y es idempotente. No borres los volúmenes `trazo-db` ni `trazo-files`: contienen la base de datos y las facturas.

## Copias y restauración

Haz diariamente una copia de `pg_dump -Fc` y del volumen `data`. Para restaurar, detén `app`, recrea una base vacía, ejecuta `pg_restore`, restaura `data` y vuelve a levantar Compose. Conserva al menos 14 copias y prueba una restauración mensual.

Si una actualización falla, ejecuta `git checkout <commit-anterior>` y `docker compose up -d --build`; las copias se usan solo si la migración de datos fue incompleta.
