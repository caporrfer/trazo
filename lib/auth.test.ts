import { randomBytes, scryptSync } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { decodeSession, encodeSession, loginBlocked, recordFailure, verifyPassword } from "./auth";

beforeAll(() => {
  process.env.AUTH_SESSION_SECRET = "x".repeat(48);
});

function hash(password: string) {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString("base64url")}$${scryptSync(password, salt, 64).toString("base64url")}`;
}

describe("password", () => {
  const stored = hash("contraseña-de-prueba-larga");
  it("accepts the right password and rejects others", () => {
    expect(verifyPassword("contraseña-de-prueba-larga", stored)).toBe(true);
    expect(verifyPassword("CONTRASEÑA-DE-PRUEBA-LARGA", stored)).toBe(false);
    expect(verifyPassword("contraseña-de-prueba-larga", undefined)).toBe(false);
    expect(verifyPassword("contraseña-de-prueba-larga", "plano")).toBe(false);
  });
});

describe("session", () => {
  it("round-trips and rejects tampering or expiry", () => {
    const token = encodeSession();
    expect(decodeSession(token)).toEqual({ sub: "admin" });
    expect(decodeSession(`${token}x`)).toBeNull();
    expect(decodeSession(token, Date.now() + 13 * 3600 * 1000)).toBeNull();
  });
});

describe("rate limit", () => {
  it("blocks an IP after five failures", () => {
    const now = Date.now();
    for (let i = 0; i < 5; i += 1) recordFailure("1.2.3.4", now);
    expect(loginBlocked("1.2.3.4", now)).toBe(true);
    expect(loginBlocked("5.6.7.8", now)).toBe(false);
    expect(loginBlocked("1.2.3.4", now + 16 * 60 * 1000)).toBe(false);
  });
});
