import { describe, expect, it } from "vitest";
import {
  PurchaseSessionDomain,
  parseOrThrow,
  safeParse,
} from "../../src/zod/index.js";

describe("PurchaseSessionDomain", () => {
  const valid = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    controllerId: "660e8400-e29b-41d4-a716-446655440000",
    status: "active" as const,
    items: [
      { productId: "prod-1", quantity: 2, containerId: "cont-1" },
    ],
    startedAt: "2026-03-03T12:00:00Z",
  };

  it("accepts valid session without completedAt", () => {
    expect(parseOrThrow(PurchaseSessionDomain, valid)).toEqual(valid);
  });

  it("accepts valid session with completedAt", () => {
    const completed = {
      ...valid,
      status: "completed" as const,
      completedAt: "2026-03-03T12:30:00Z",
    };
    expect(parseOrThrow(PurchaseSessionDomain, completed)).toEqual(completed);
  });

  it("accepts empty items array", () => {
    const result = safeParse(PurchaseSessionDomain, { ...valid, items: [] });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = safeParse(PurchaseSessionDomain, {
      ...valid,
      status: "pending",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid statuses", () => {
    for (const status of [
      "active",
      "completed",
      "expired",
      "cancelled",
    ] as const) {
      expect(
        safeParse(PurchaseSessionDomain, { ...valid, status }).success,
      ).toBe(true);
    }
  });

  it("rejects invalid UUID for id", () => {
    const result = safeParse(PurchaseSessionDomain, {
      ...valid,
      id: "not-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid UUID for controllerId", () => {
    const result = safeParse(PurchaseSessionDomain, {
      ...valid,
      controllerId: "bad",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid datetime format for startedAt", () => {
    const result = safeParse(PurchaseSessionDomain, {
      ...valid,
      startedAt: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid datetime format for completedAt", () => {
    const result = safeParse(PurchaseSessionDomain, {
      ...valid,
      completedAt: "2026-13-45",
    });
    expect(result.success).toBe(false);
  });
});
