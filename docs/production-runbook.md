# Puesta en producción y recuperación

Trazo se ejecuta en el servidor propio con Docker Compose, PostgreSQL local y un volumen privado para facturas.

## Configuración inicial

1. Copia `.env.example` a `.env`, completa los secretos y desactiva `TRAZO_DEMO_MODE`.
2. Registra `https://DOMINIO/auth/callback` como callback de Google OAuth.
3. Ejecuta `docker compose up -d --build` y comprueba HTTPS, el formulario y el dashboard.
4. Completa los datos legales y solicita una revisión jurídica antes de conectar el dominio público.

## Copias

Exporta diariamente PostgreSQL con `pg_dump -Fc` y el volumen `data`. Guarda las copias fuera del servidor de producción con acceso restringido. Objetivos iniciales: RPO de 24 horas y RTO de 4 horas. Cada trimestre restaura una copia en un entorno aislado y ejecuta el recorrido de aceptación.

## Restauración

Restaura siempre en un entorno aislado, verifica recuentos, relaciones, archivos y acceso, y cambia el tráfico solo después de completar la aceptación. Revoca credenciales temporales y documenta fecha, alcance y resultado.

## Cambio de administrador

Actualiza `ADMIN_EMAIL`, inicia sesión con la nueva cuenta Google y comprueba que se ha creado en `admin_users`. Desactiva el usuario anterior y elimina sus sesiones de PostgreSQL.

## Reversión

Vuelve al commit anterior y reconstruye la imagen con `docker compose up -d --build`. No borres los volúmenes: contienen los datos y facturas.
