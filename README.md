# TRAZO

Web de diseño y desarrollo profesional en español. Presenta el estudio, su proceso, la primera propuesta visual gratuita y dos proyectos propios. La interfaz combina chocolate (`#3B241C`) y celeste (`#BFE7F5`), con Manrope y DM Serif Display alojadas en el propio proyecto.

## Páginas

- `/`: presentación, estudio, proceso, adaptación a cada empresa, borrador gratis, proyectos, preguntas y cierre.
- `/empezar/`: aviso de cuestionario pendiente. No recoge datos ni admite solicitudes. Todos los enlaces para solicitar un borrador conducen a esta página.

La oferta es una **primera propuesta visual gratuita y sin compromiso**. No incluye una web definitiva ni promete una versión navegable completa.

## Construcción y comprobaciones

Requiere Node.js 22.13 o posterior y npm. La base es React, TypeScript y Vinext, con exportación estática.

```sh
npm ci
npm run typecheck
npm run build
npm run check:export
```

El resultado público se genera en `dist/client`. `vercel.json` selecciona ese directorio e incluye URLs con barra final. Esta entrega no realiza ningún despliegue ni arranca una previsualización local. Las verificaciones de exportación comprueban los HTML y sus recursos; no sustituyen una prueba visual en navegador.

## Actualizar contenidos

- `lib/content.ts` contiene navegación, pasos, necesidades, proyectos y preguntas frecuentes.
- `app/globals.css` contiene el tema, las composiciones adaptables y las animaciones.
- `app/empezar/page.tsx` es el punto donde incorporar un cuestionario en una futura fase. Al habilitarlo, actualizar también los avisos, el proceso y la pregunta frecuente sobre disponibilidad.

El menú móvil usa el componente Sheet de Base UI y las preguntas usan Accordion. El contenido principal parte visible: los efectos al desplazarse son una mejora opcional mediante IntersectionObserver. Se respeta `prefers-reduced-motion`; las preguntas cuentan con una alternativa nativa cuando JavaScript está desactivado.

## Recursos

Las imágenes de los proyectos proceden de sus webs, confirmadas por el propietario como trabajos de TRAZO, y se han convertido a JPEG para reducir su tamaño:

- Russes Gastrobar: https://caporrfer.github.io/russes_gastrobar/images/interior-bar.png
- Restaurante Miramar: https://caporrfer.github.io/restaurantemiramar/img/hero-beach.png

Manrope procede del repositorio Google Fonts y DM Serif Display de Google Fonts. Sus licencias SIL Open Font License se incluyen en `public/fonts` junto a los archivos tipográficos. No se cargan imágenes ni fuentes de servicios externos durante la visita.

No hay backend, cuentas, almacenamiento de solicitudes ni analítica.
