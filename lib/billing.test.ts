import { describe, expect, it } from "vitest";
import { monthlyEquivalentCents, monthsBilled, nextChargeOn, parseEuros, siteBalance } from "./billing";

const at = (iso: string) => new Date(`${iso}T12:00:00`);

describe("monthsBilled", () => {
  it("counts the first month on the start date", () => {
    expect(monthsBilled({ startedOn: "2026-11-11" }, at("2026-11-11"))).toBe(1);
    expect(monthsBilled({ startedOn: "2026-11-11" }, at("2026-12-10"))).toBe(1);
    expect(monthsBilled({ startedOn: "2026-11-11" }, at("2026-12-11"))).toBe(2);
  });
  it("is zero before the start or without a start date", () => {
    expect(monthsBilled({ startedOn: "2026-12-01" }, at("2026-11-11"))).toBe(0);
    expect(monthsBilled({}, at("2026-11-11"))).toBe(0);
  });
  it("stops at the end date", () => {
    expect(monthsBilled({ startedOn: "2026-01-15", endedOn: "2026-03-15" }, at("2026-11-11"))).toBe(2);
  });
});

describe("siteBalance", () => {
  it("hosting-only site that starts today owes its first month", () => {
    expect(siteBalance({ startedOn: "2026-11-11", monthlyCents: 3900, setupCents: 0 }, 0, at("2026-11-11"))).toEqual({ months: 1, accruedCents: 3900, paidCents: 0, pendingCents: 3900 });
  });
  it("adds the development fee and subtracts payments", () => {
    const balance = siteBalance({ startedOn: "2026-06-01", monthlyCents: 2900, setupCents: 30000 }, 5800, at("2026-11-11"));
    expect(balance.months).toBe(6);
    expect(balance.accruedCents).toBe(30000 + 6 * 2900);
    expect(balance.pendingCents).toBe(30000 + 4 * 2900);
  });
  it("does not accrue anything without a start date", () => {
    expect(siteBalance({ monthlyCents: 2900, setupCents: 19000 }, 0).accruedCents).toBe(0);
  });
});

describe("helpers", () => {
  it("computes the next charge date", () => {
    expect(nextChargeOn({ startedOn: "2026-11-11" }, at("2026-11-20"))).toBe("2026-12-11");
  });
  it("parses euro amounts in Spanish and plain formats", () => {
    expect(parseEuros("29")).toBe(2900);
    expect(parseEuros("29,90")).toBe(2990);
    expect(parseEuros("1.234,5")).toBe(123450);
    expect(parseEuros("12.99")).toBe(1299);
    expect(parseEuros("abc")).toBeNaN();
  });
  it("spreads yearly costs over months", () => {
    expect(monthlyEquivalentCents(1200, "anual")).toBe(100);
    expect(monthlyEquivalentCents(500, "unico")).toBe(0);
  });
});
