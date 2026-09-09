import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const url = "/propuesta/restaurante-paco/demo-seguro-trazo-2026";

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
  await page.getByRole("button", { name: "Enviar mi opinión" }).click();
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
  await page.goto("/admin/vista-previa/11111111-1111-4111-8111-111111111111");
  await expect(
    page.getByText(/no se guardará ninguna respuesta/i),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Propuesta web para Restaurante Paco" }),
  ).toBeVisible();
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
    `/api/propuestas/restaurante-paco/demo-seguro-trazo-2026/respuestas`,
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
