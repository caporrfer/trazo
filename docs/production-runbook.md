# Producción

## Despliegue

1. `npm run lint && npm run typecheck && npm test && npm run build`
2. Etiqueta la imagen actual para poder volver atrás: `docker tag formulario-trazo:modern-sqlite formulario-trazo:prev`
3. Copia la base de datos: `docker cp formulario-trazo-production-app-1:/data/trazo.sqlite ~/docker/backups/trazo-$(date +%F).sqlite`
4. `docker build -t formulario-trazo:modern-sqlite .`
5. `cd ~/docker/formulario-trazo-production && docker compose up -d`

## Reversión

`docker tag formulario-trazo:prev formulario-trazo:modern-sqlite && docker compose up -d`.
Si la versión nueva migró el esquema, restaura también la copia del paso 3 en el volumen.
