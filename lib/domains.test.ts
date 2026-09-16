import { describe, expect, it } from "vitest";
import { anniversaryDate, activeMetrics, periodsFor, renewalStatus } from "./domains";

describe("domain calendar calculations", () => {
  it("keeps the original anniversary and clamps short months", () => {
    expect(anniversaryDate("2026-01-31", 1)).toBe("2026-02-28");
    expect(anniversaryDate("2026-01-31", 2)).toBe("2026-03-31");
  });
  it("builds contiguous payment periods", () => {
    expect(periodsFor("2026-09-16", 2)).toEqual([
      { periodStart: "2026-09-16", periodEnd: "2026-10-16" },
      { periodStart: "2026-10-16", periodEnd: "2026-11-16" },
    ]);
  });
  it("counts complete months and remaining days", () => {
    expect(activeMetrics({ activatedOn: "2026-01-16" }, new Date("2026-04-20T10:00:00Z"))).toMatchObject({ activeDays: 94, completeMonths: 3, remainingDays: 4 });
  });
  it("labels renewal windows", () => {
    expect(renewalStatus("2026-09-16", new Date("2026-09-01T12:00:00Z"))).toBe("soon");
    expect(renewalStatus("2026-08-01", new Date("2026-09-01T12:00:00Z"))).toBe("overdue");
  });
});
