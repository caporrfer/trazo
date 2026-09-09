import { describe, expect, it } from "vitest";
import { submissionSchema } from "./validation";

const payload = {
  requestId: "11111111-1111-4111-8111-111111111111",
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

describe("validación de envíos", () => {
  it("permite enviar una opinión sin datos personales", () => {
    expect(submissionSchema.safeParse(payload).success).toBe(true);
  });

  it("exige el dato de contacto al solicitar seguimiento", () => {
    const result = submissionSchema.safeParse({
      ...payload,
      answers: {
        ...payload.answers,
        intent: "information",
        contactMethod: "email",
      },
    });
    expect(result.success).toBe(false);
  });

  it("rechaza correos incorrectos", () => {
    const result = submissionSchema.safeParse({
      ...payload,
      answers: {
        ...payload.answers,
        intent: "talk",
        contactMethod: "email",
        contactValue: "correo incorrecto",
      },
    });
    expect(result.success).toBe(false);
  });

  it("acepta trasladar sin contacto personal", () => {
    const result = submissionSchema.safeParse({
      ...payload,
      answers: { ...payload.answers, intent: "share" },
    });
    expect(result.success).toBe(true);
  });

  it("rechaza usar el recorrido de ayuda después de haber visto la demo", () => {
    const result = submissionSchema.safeParse({
      ...payload,
      answers: {
        ...payload.answers,
        intent: "demo_help",
        contactMethod: "email",
        contactValue: "hola@ejemplo.es",
      },
    });
    expect(result.success).toBe(false);
  });

  it("rechaza introducir campos de cambio fuera del catálogo", () => {
    const result = submissionSchema.safeParse({
      ...payload,
      answers: { ...payload.answers, changes: ["campo-inventado"] },
    });
    expect(result.success).toBe(false);
  });
});
