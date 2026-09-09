import { describe, expect, it } from "vitest";
import { buildSteps, sanitizeForFlow } from "./flow";
import type { FormAnswers } from "./types";

const base: FormAnswers = { changes: [], desiredDomains: [] };

describe("flujo condicional", () => {
  it("empieza preguntando si se ha visto el borrador", () => {
    expect(buildSteps(base)).toEqual(["viewed"]);
  });

  it("permite pedir ayuda sin valorar ni ver tarifas", () => {
    expect(
      buildSteps({ ...base, viewed: "not_yet", intent: "demo_help" }),
    ).toEqual(["viewed", "demoHelp", "person", "contact", "review"]);
  });

  it("ofrece salida rápida cuando no se necesita una web", () => {
    expect(
      buildSteps({
        ...base,
        viewed: "reviewed",
        impression: "no_need",
        intent: "decline",
      }),
    ).toEqual(["viewed", "impression", "decline", "review"]);
  });

  it("pide cambios cuando se quiere otro enfoque", () => {
    const steps = buildSteps({
      ...base,
      viewed: "reviewed",
      impression: "no_fit",
      fitClarification: "new_approach",
      intent: "changes",
    });
    expect(steps).toContain("changes");
    expect(steps).toContain("pricing");
  });

  it("no muestra dominio si todavía no elige tarifa", () => {
    const steps = buildSteps({
      ...base,
      viewed: "reviewed",
      impression: "like",
      intent: "information",
      plan: "not_yet",
    });
    expect(steps).not.toContain("domain");
  });

  it("elimina respuestas que dejan de ser relevantes", () => {
    const sanitized = sanitizeForFlow({
      ...base,
      viewed: "reviewed",
      impression: "like",
      intent: "opinion",
      plan: "updates",
      contactMethod: "email",
      contactValue: "hola@ejemplo.es",
      domainStatus: "wanted",
      desiredDomains: ["ejemplo.es"],
    });
    expect(sanitized.plan).toBeUndefined();
    expect(sanitized.contactValue).toBeUndefined();
    expect(sanitized.desiredDomains).toEqual([]);
  });

  it("elimina cualquier dato personal inyectado en un rechazo", () => {
    const sanitized = sanitizeForFlow({
      ...base,
      viewed: "reviewed",
      impression: "no_need",
      intent: "decline",
      respondentName: "No debería guardarse",
      contactMethod: "email",
      contactValue: "privado@ejemplo.es",
    });
    expect(sanitized.respondentName).toBeUndefined();
    expect(sanitized.contactValue).toBeUndefined();
  });
});
