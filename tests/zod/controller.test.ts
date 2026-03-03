import { describe, expect, it } from "vitest";
import {
  ControllerDomain,
  parseOrThrow,
  safeParse,
} from "../../src/zod/index.js";

describe("ControllerDomain", () => {
  const valid = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    displayName: "DC-001",
    status: "online" as const,
  };

  it("accepts valid controller without location", () => {
    expect(parseOrThrow(ControllerDomain, valid)).toEqual(valid);
  });

  it("accepts valid controller with location", () => {
    const withLocation = {
      ...valid,
      location: { address: "Rua Augusta 100", latitude: -23.55, longitude: -46.63 },
    };
    expect(parseOrThrow(ControllerDomain, withLocation)).toEqual(withLocation);
  });

  it("rejects invalid UUID", () => {
    const result = safeParse(ControllerDomain, { ...valid, id: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = safeParse(ControllerDomain, { ...valid, status: "broken" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid statuses", () => {
    for (const status of ["online", "offline", "maintenance"] as const) {
      expect(safeParse(ControllerDomain, { ...valid, status }).success).toBe(
        true,
      );
    }
  });

  it("rejects empty displayName", () => {
    const result = safeParse(ControllerDomain, {
      ...valid,
      displayName: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects displayName exceeding 50 chars", () => {
    const result = safeParse(ControllerDomain, {
      ...valid,
      displayName: "A".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("accepts displayName at exactly 50 chars", () => {
    const result = safeParse(ControllerDomain, {
      ...valid,
      displayName: "A".repeat(50),
    });
    expect(result.success).toBe(true);
  });
});
