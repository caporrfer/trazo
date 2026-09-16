import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const url = "/propuesta/restaurante-paco";
const legacyUrl = `${url}/demo-seguro-trazo-2026`;

test("la portada presenta la nueva identidad", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Creación de páginas web" }),
  ).toBeVisible();
  await expect(page.getByLabel("Trazo, inicio").first()).toBeVisible();
  await expect(page.locator(".landing-page footer")).toBeVisible();
  await expect(page.locator("body > .site-footer")).toBeHidden();
  await expect(page.getByText(/Tu propuesta empieza/)).toHaveCount(0);
});

test("el admin muestra la sección de dominios y la ficha de mantenimiento", async ({ page }) => {
  await page.goto("/admin/dominios");
  await expect(page.getByRole("heading", { name: "Dominios" })).toBeVisible();
  await expect(page.getByText("Webs gestionadas")).toBeVisible();
  await page.getByRole("link", { name: /Restaurante Paco/ }).click();
  await expect(page.getByRole("heading", { name: "Restaurante Paco" })).toBeVisible();
  await expect(page.getByText("Registrar cobro de mantenimiento")).toBeVisible();
  await expect(page.getByText("Factura o renovación · restaurante-paco.es")).toBeVisible();
});

test("la propuesta abre directamente en la primera pregunta", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  await expect(
    page.getByRole("heading", { name: "¿Has podido ver el borrador?" }),
  ).toBeVisible();
  await expect(
    page.getByText("Una propuesta preparada para vosotros"),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Ver la propuesta web" }),
  ).toBeVisible();
  await expect(page.getByText("Restaurante Paco", { exact: true })).toBeVisible();
  const proposalButton = await page
    .getByRole("link", { name: "Ver la propuesta web" })
    .boundingBox();
  const businessName = await page
    .getByText("Restaurante Paco", { exact: true })
    .boundingBox();
  expect(proposalButton?.width).toBeGreaterThan(350);
  expect(
    Math.abs(
      (businessName?.x || 0) + (businessName?.width || 0) / 2 - 195,
    ),
  ).toBeLessThan(4);
  const question = await page
    .getByRole("heading", { name: "¿Has podido ver el borrador?" })
    .boundingBox();
  expect(question?.y).toBeLessThan(430);
});

test("los enlaces antiguos redirigen y los inválidos no", async ({
  request,
}) => {
  const proposal = await request.get(legacyUrl, { maxRedirects: 0 });
  expect(proposal.status()).toBe(308);
  expect(new URL(proposal.headers().location).pathname).toBe(url);

  const confirmation = await request.get(`${legacyUrl}/gracias`, {
    maxRedirects: 0,
  });
  expect(confirmation.status()).toBe(308);
  expect(new URL(confirmation.headers().location).pathname).toBe(
    `${url}/gracias`,
  );

  const invalid = await request.get(`${url}/token-invalido`, {
    maxRedirects: 0,
  });
  expect(invalid.status()).toBe(404);
});

test("envía una opinión sin datos personales", async ({ page }) => {
  await page.goto(url);
  await page.getByLabel("Sí, lo he revisado").check();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByLabel("Me gusta tal como está planteada").check();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByLabel("Solo quiero enviar mi opinión").check();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await expect(
    page.getByRole("heading", { name: "Revisa tus respuestas" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(
    page.getByRole("heading", { name: /Gracias por contarnos/ }),
  ).toBeVisible();
});

test("la primera pantalla no tiene infracciones automáticas", async ({
  page,
}) => {
  await page.goto(url);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("recupera el borrador tras recargar", async ({ page }) => {
  await page.goto(url);
  await page.getByLabel("Lo he visto por encima").check();
  await page.reload();
  await expect(page.getByLabel("Lo he visto por encima")).toBeChecked();
});

test("pide solo el contacto necesario cuando hace falta ayuda con la demo", async ({
  page,
}) => {
  await page.goto(url);
  await page.getByLabel("Todavía no").check();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page
    .getByRole("button", { name: "Necesito ayuda para abrirla" })
    .click();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await expect(
    page.getByRole("heading", { name: "¿Con quién estamos hablando?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByLabel("Correo electrónico").check();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await expect(
    page.getByText("Escribe el dato de contacto correspondiente.", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByLabel("Correo electrónico", { exact: true })
    .last()
    .fill("negocio@example.com");
  await page.getByRole("button", { name: /Continuar/ }).click();
  await expect(
    page.getByRole("heading", { name: "Revisa tus respuestas" }),
  ).toBeVisible();
  await expect(
    page.getByText("Estas son las opciones disponibles"),
  ).toHaveCount(0);
});

test("el rechazo evita tarifas, dominio y contacto", async ({ page }) => {
  await page.goto(url);
  await page.getByLabel("Sí, lo he revisado").check();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByLabel("Ahora mismo no necesitamos una web").check();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await expect(
    page.getByRole("heading", {
      name: "¿Podrías indicarnos el motivo principal?",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await expect(
    page.getByRole("heading", { name: "Revisa tus respuestas" }),
  ).toBeVisible();
  await expect(page.getByText("Opción que te interesa")).toHaveCount(0);
  await expect(page.getByText("Contacto", { exact: true })).toHaveCount(0);
});

test("funciona a 320 px sin desplazamiento horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto(url);
  const sizes = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(sizes.content).toBeLessThanOrEqual(sizes.viewport);
  await expect(page.getByRole("button", { name: /Continuar/ })).toBeVisible();
});

test("el dashboard local y la vista previa privada están operativos", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Resumen" })).toBeVisible();
  await expect(page.getByText("Propuestas creadas")).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.goto("/admin/propuestas/11111111-1111-4111-8111-111111111111");
  await expect(
    page.getByRole("heading", { name: "Restaurante Paco" }),
  ).toBeVisible();
  await expect(page.getByText("Contacto interno conocido")).toHaveCount(0);
  await page.goto("/admin/propuestas/nueva");
  await expect(page.getByLabel("URL de la demo")).toHaveAttribute(
    "type",
    "text",
  );
  await page.goto("/admin/vista-previa/11111111-1111-4111-8111-111111111111");
  await expect(
    page.getByText(/no se guardará ninguna respuesta/i),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Propuesta web para Restaurante Paco" }),
  ).toBeVisible();
});

test("el resumen móvil conserva dos indicadores por fila y la información", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin");
  const indicators = page.locator('section[aria-label="Indicadores"] > div');
  const first = await indicators.nth(0).boundingBox();
  const second = await indicators.nth(1).boundingBox();
  const third = await indicators.nth(2).boundingBox();
  expect(Math.abs((first?.y || 0) - (second?.y || 0))).toBeLessThan(3);
  expect(third?.y).toBeGreaterThan((first?.y || 0) + 40);
  await expect(page.getByRole("link", { name: "Propuestas" })).toBeVisible();
  await expect(page.getByText("Próximo contacto")).toBeVisible();
});

test("los filtros avanzados se despliegan en móvil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/respuestas");
  const intent = page.getByRole("combobox", { name: "Intención" });
  await expect(intent).not.toBeVisible();
  await page.getByText("Más filtros", { exact: true }).click();
  await expect(intent).toBeVisible();
});

test("los filtros de fecha se apilan sin solaparse en móvil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/respuestas");
  await page.getByText("Más filtros", { exact: true }).click();

  const from = page.locator('input[name="from"]');
  const to = page.locator('input[name="to"]');
  await expect(from).toBeVisible();
  await expect(to).toBeVisible();

  const fromBox = await from.boundingBox();
  const toBox = await to.boundingBox();
  expect(fromBox).not.toBeNull();
  expect(toBox).not.toBeNull();
  expect(toBox!.y).toBeGreaterThanOrEqual(fromBox!.y + fromBox!.height);

  const sizes = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(sizes.content).toBeLessThanOrEqual(sizes.viewport);
});

test("los filtros avanzados se adaptan al ancho real del panel", async ({ page }) => {
  await page.setViewportSize({ width: 1541, height: 900 });
  await page.goto("/admin/respuestas?intent=information");

  const actionButtons = page.locator("form button");
  const searchButton = await actionButtons.nth(0).boundingBox();
  const applyButton = await actionButtons.nth(1).boundingBox();
  expect(searchButton).not.toBeNull();
  expect(applyButton).not.toBeNull();
  expect(applyButton!.width).toBe(searchButton!.width);

  const controls = page.locator("details input, details select, details button");
  const boxes = await controls.evaluateAll((elements) =>
    elements
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom };
      })
      .filter((rect) => rect.right > rect.x && rect.bottom > rect.y),
  );

  for (let index = 0; index < boxes.length; index += 1) {
    for (let next = index + 1; next < boxes.length; next += 1) {
      const first = boxes[index];
      const second = boxes[next];
      const separated =
        first.right <= second.x ||
        second.right <= first.x ||
        first.bottom <= second.y ||
        second.bottom <= first.y;
      expect(separated).toBe(true);
    }
  }
});

test("los filtros de propuestas mantienen una cuadrícula equilibrada", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile");
  await page.setViewportSize({ width: 1541, height: 900 });
  await page.goto("/admin/propuestas?stage=draft");

  const actionButtons = page.locator("form button");
  const searchButton = await actionButtons.nth(0).boundingBox();
  const applyButton = await actionButtons.nth(1).boundingBox();
  expect(searchButton).not.toBeNull();
  expect(applyButton).not.toBeNull();
  expect(applyButton!.width).toBe(searchButton!.width);

  const stage = await page.locator('select[name="stage"]').boundingBox();
  const status = await page.locator('select[name="status"]').boundingBox();
  expect(stage).not.toBeNull();
  expect(status).not.toBeNull();
  expect(status!.y).toBe(stage!.y);
  expect(status!.width).toBe(stage!.width);
});

test("el recorrido comercial completo mantiene la accesibilidad automática", async ({
  page,
}) => {
  await page.goto(url);
  await page.getByLabel("Sí, lo he revisado").check();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByLabel("Me gusta, pero cambiaría algunas cosas").check();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByLabel("Diseño o colores").check();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByLabel("Quiero más información").check();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByLabel("No lo tengo claro; necesito asesoramiento").check();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await expect(
    page.getByLabel(/Me interesa Web \+ actualizaciones/),
  ).toBeChecked();
  await page.getByLabel(/Me interesa Web \+ actualizaciones/).check();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByLabel("No tenemos dominio y necesitamos ayuda").check();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByLabel("Correo electrónico").check();
  await page
    .getByLabel("Correo electrónico", { exact: true })
    .last()
    .fill("hola@ejemplo.es");
  await page.getByRole("button", { name: /Continuar/ }).click();
  await expect(
    page.getByRole("heading", { name: "Revisa tus respuestas" }),
  ).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("reintentar el mismo envío no crea una segunda respuesta", async ({
  request,
}) => {
  const requestId = crypto.randomUUID();
  const body = {
    requestId,
    formVersion: 1,
    company: "",
    answers: {
      viewed: "reviewed",
      impression: "like",
      changes: [],
      desiredDomains: [],
      intent: "opinion",
    },
  };
  const first = await request.post(
    "/api/propuestas/restaurante-paco/respuestas",
    { data: body },
  );
  const second = await request.post(
    `/api/propuestas/restaurante-paco/demo-seguro-trazo-2026/respuestas`,
    { data: body },
  );
  expect(first.status()).toBe(201);
  expect(second.status()).toBe(200);
  expect(await second.json()).toMatchObject({ duplicate: true });
});

test("editar un apartado vuelve al resumen cuando el recorrido sigue completo", async ({
  page,
}) => {
  await page.goto(url);
  await page.getByLabel("Sí, lo he revisado").check();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByLabel("Me gusta tal como está planteada").check();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByLabel("Solo quiero enviar mi opinión").check();
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.getByLabel("Nombre (opcional)").fill("Ana");
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page
    .getByRole("button", { name: "Editar Persona que responde" })
    .click();
  await page.getByLabel("Nombre (opcional)").fill("Elena");
  await page.getByRole("button", { name: /Volver al resumen/ }).click();
  await expect(
    page.getByRole("heading", { name: "Revisa tus respuestas" }),
  ).toBeVisible();
  await expect(page.getByText("Elena", { exact: true })).toBeVisible();
});
