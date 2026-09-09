# Puesta en producción y recuperación

## Configuración inicial

1. Crea proyectos Supabase separados para pruebas y producción en una región europea.
2. Aplica `supabase/migrations` y configura Google OAuth con el callback exacto de cada entorno.
3. Tras el primer acceso de la cuenta autorizada, inserta su UUID y correo en `public.admin_users` con la consulta incluida al final de la migración.
4. Configura en Vercel todas las variables de `.env.example`. Las previsualizaciones deben usar exclusivamente Supabase de pruebas.
5. Completa los datos legales y solicita una revisión jurídica de los textos antes de conectar el dominio público.
6. Ejecuta lint, tipos, pruebas unitarias, Playwright y build. Aplica después la migración, despliega, realiza un envío de prueba y comprueba HTTPS.

## Copias

Activa las copias gestionadas de Supabase y configura una exportación cifrada diaria fuera del proyecto de producción. La exportación debe incluir esquema, datos y un registro externo de las eliminaciones realizadas desde el último backup. Restringe las credenciales de copia a personal técnico autorizado.

Objetivos iniciales: RPO de 24 horas y RTO de 4 horas. Cada trimestre restaura la copia más reciente en un proyecto aislado, ejecuta una consulta de integridad y recorre el formulario y el dashboard con datos de prueba.

## Restauración

1. Restaura siempre en un entorno aislado, nunca directamente encima de producción.
2. Verifica recuentos, relaciones, políticas RLS y acceso con una cuenta de prueba.
3. Reaplica el registro externo de eliminaciones para no recuperar respuestas borradas.
4. Cambia la aplicación al entorno restaurado solo después del guion de aceptación.
5. Revoca credenciales temporales y documenta fecha, alcance y resultado.

## Reversión

Una versión de aplicación puede volver al despliegue estable anterior de Vercel. Las migraciones se diseñan de forma aditiva: revertir la aplicación no revierte la base de datos. Si una migración necesita una retirada destructiva, se hará en una versión posterior y después de verificar las copias.

## Cambio de administrador

Verifica primero la nueva identidad de Google. En una transacción SQL, añade el nuevo UUID a `admin_users`, desactiva el anterior y cambia `ADMIN_EMAIL`. Después revoca las sesiones del usuario anterior en Supabase Auth y prueba el acceso nuevo antes de retirar las credenciales de emergencia.

## Traslado futuro a Docker

Ensaya primero la exportación y restauración en un servidor de pruebas. Fija las mismas versiones, configura almacenamiento persistente, proxy inverso, HTTPS, SMTP, Google OAuth, claves JWT y copias externas. Mantén el despliegue anterior disponible durante la ventana de cambio y no cambies DNS hasta verificar datos, acceso y envíos.
