import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Inspect production artifacts without a web server or browser.
const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(project, 'dist/client');
const base = 'https://trazo.invalid';
const routes = ['/', '/empezar/'];
const expectedProjects = new Set([
  'https://caporrfer.github.io/russes_gastrobar/',
  'https://caporrfer.github.io/restaurantemiramar/',
]);
const visitedProjects = new Set();
const cssFiles = new Set();
let checkedLinks = 0;
let checkedResources = 0;

function fileFor(pathname) {
  const file = join(output, decodeURIComponent(pathname));
  return pathname.endsWith('/') ? join(file, 'index.html') : file;
}

function markup(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
}

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(
      ([, key, double, single]) => [key, double ?? single],
    ),
  );
}

function exists(file, label) {
  assert.ok(
    existsSync(file) && statSync(file).isFile(),
    `Falta ${label}: ${file}`,
  );
}

for (const route of routes) {
  const file = fileFor(route);
  exists(file, 'la página');
  const html = readFileSync(file, 'utf8');
  const document = markup(html);
  assert.match(document, /<html[^>]+lang="es"/, `${route}: idioma español`);
  assert.equal(
    (document.match(/<h1\b/g) ?? []).length,
    1,
    `${route}: un único H1`,
  );
  assert.match(
    document,
    /<title>[^<]*TRAZO[^<]*<\/title>/,
    `${route}: título propio`,
  );
  assert.match(
    document,
    /<meta[^>]+name="description"[^>]+content="[^"]+"/,
    `${route}: descripción`,
  );
  assert.doesNotMatch(
    document,
    /Untitled site|Building your site|Your site is taking shape/,
    'Sin contenido de la plantilla',
  );
  const ids = [...document.matchAll(/\bid="([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.equal(ids.length, new Set(ids).size, `${route}: IDs únicos`);
  assert.match(
    document,
    /<main[^>]*id="contenido"[^>]*tabindex="-1"/i,
    'El salto al contenido tiene destino enfocable',
  );

  for (const [tag] of document.matchAll(/<a\b[^>]*>/g)) {
    const attrs = attributes(tag);
    assert.ok(attrs.href, `Enlace sin destino en ${route}`);
    const url = new URL(
      attrs.href.replaceAll('&amp;', '&'),
      new URL(route, base),
    );
    assert.equal(
      url.protocol,
      'https:',
      `Protocolo de enlace inesperado: ${attrs.href}`,
    );
    if (tag.includes('data-draft-cta'))
      assert.equal(
        attrs.href,
        '/empezar/',
        'Todos los CTA llevan al cuestionario pendiente',
      );
    if (url.origin === base) {
      const targetFile = fileFor(url.pathname);
      exists(targetFile, 'el destino del enlace');
      if (url.hash) {
        const target = markup(readFileSync(targetFile, 'utf8'));
        assert.ok(
          target.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),
          `Ancla inexistente: ${attrs.href}`,
        );
      }
    } else {
      assert.ok(
        expectedProjects.has(url.href),
        `Enlace externo inesperado: ${url.href}`,
      );
      visitedProjects.add(url.href);
      assert.equal(attrs.target, '_blank', 'Los proyectos abren otra pestaña');
      assert.ok(
        attrs.rel?.includes('noopener') && attrs.rel.includes('noreferrer'),
        'Los proyectos aíslan la pestaña externa',
      );
    }
    checkedLinks++;
  }

  for (const [tag] of html.matchAll(/<(?:img|script|link)\b[^>]*>/g)) {
    const attrs = attributes(tag);
    const resource = attrs.src ?? attrs.href;
    if (!resource) continue;
    const url = new URL(resource, new URL(route, base));
    assert.equal(url.origin, base, `Recurso externo inesperado: ${resource}`);
    const asset = fileFor(url.pathname);
    exists(asset, 'el recurso');
    if (attrs.rel === 'stylesheet') cssFiles.add(asset);
    if (tag.startsWith('<img')) {
      assert.ok(attrs.alt?.trim(), 'Imagen con descripción alternativa');
      assert.ok(
        Number(attrs.width) > 0 && Number(attrs.height) > 0,
        'Imagen con espacio reservado',
      );
      assert.equal(
        attrs.loading,
        'lazy',
        'Las imágenes de proyectos se cargan de forma diferida',
      );
    }
    checkedResources++;
  }

  if (route === '/') {
    const heading = document
      .match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1]
      .replace(/<svg\b[\s\S]*?<\/svg>/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    assert.equal(
      heading,
      'Hacemos que tu negocio marque la diferencia.',
      'Titular acordado',
    );
    assert.ok(
      (document.match(/data-draft-cta/g) ?? []).length >= 5,
      'Llamadas repartidas por la página',
    );
    assert.equal(
      (document.match(/data-slot="accordion-trigger"/g) ?? []).length,
      6,
      'Seis preguntas frecuentes',
    );
    assert.match(
      document,
      /<noscript>[\s\S]*<details/,
      'Preguntas disponibles sin JavaScript',
    );
    for (const [tag] of document.matchAll(
      /<button\b[^>]*data-slot="accordion-trigger"[^>]*>/g,
    )) {
      const attrs = attributes(tag);
      if (attrs['aria-expanded'] === 'true' || attrs['aria-controls']) {
        assert.ok(
          ids.includes(attrs['aria-controls']),
          'Cada pregunta abierta controla un panel existente',
        );
      }
      assert.ok(
        ['true', 'false'].includes(attrs['aria-expanded']),
        'Estado accesible del acordeón',
      );
    }
    for (const [tag] of document.matchAll(
      /<div\b[^>]*data-slot="accordion-content"[^>]*>/g,
    )) {
      const attrs = attributes(tag);
      assert.ok(
        ids.includes(attrs['aria-labelledby']),
        'Cada panel está identificado por su pregunta',
      );
    }
  } else {
    assert.match(
      document,
      /Estamos preparando/,
      'Cuestionario anunciado como pendiente',
    );
    assert.match(
      document,
      /Todavía no admite solicitudes/,
      'Disponibilidad explícita',
    );
    assert.doesNotMatch(
      document,
      /<(?:form|input|textarea)\b/i,
      'No se recogen datos ni se simulan envíos',
    );
  }
}

assert.equal(visitedProjects.size, 2, 'Ambos proyectos están enlazados');
assert.ok(cssFiles.size > 0, 'Estilos de producción disponibles');
for (const cssFile of cssFiles) {
  const css = readFileSync(cssFile, 'utf8');
  assert.match(
    css,
    /prefers-reduced-motion/,
    'Alternativa de movimiento reducido',
  );
  for (const [, raw] of css.matchAll(/url\(([^)]+)\)/g)) {
    const resource = raw.replace(/^['"]|['"]$/g, '');
    if (resource.startsWith('data:') || resource.startsWith('#')) continue;
    assert.ok(
      resource.startsWith('/'),
      `Recurso CSS debe ser local: ${resource}`,
    );
    exists(fileFor(resource), 'el recurso CSS');
    checkedResources++;
  }
}

console.log(
  `Exportación correcta: ${routes.length} páginas, ${checkedLinks} enlaces y ${checkedResources} referencias a recursos.`,
);
console.log(
  'CTA, proyectos, metadatos, cuestionario pendiente y estructura accesible verificados sin servidor ni navegador.',
);
