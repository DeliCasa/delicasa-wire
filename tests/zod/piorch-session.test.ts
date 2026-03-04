import { describe, expect, it } from "vitest";
import {
  PiOrchSessionSchema,
  PiOrchSessionListResponseSchema,
  STALE_THRESHOLD_SECONDS,
  safeParse,
  parseOrThrow,
} from "../../src/zod/index.js";

const validSession = {
  session_id: "sess-001",
  status: "active" as const,
  started_at: "2026-03-03T12:00:00Z",
  elapsed_seconds: 120,
};

describe("PiOrchSessionSchema", () => {
  it("accepts valid session", () => {
    expect(parseOrThrow(PiOrchSessionSchema, validSession)).toEqual(validSession);
  });

  it("accepts all session statuses", () => {
    for (const status of ["active", "complete", "partial", "failed"] as const) {
      expect(
        safeParse(PiOrchSessionSchema, { ...validSession, status }).success,
      ).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    expect(
      safeParse(PiOrchSessionSchema, { ...validSession, status: "pending" }).success,
    ).toBe(false);
  });

  it("accepts session with optional container_id", () => {
    expect(
      safeParse(PiOrchSessionSchema, {
        ...validSession,
        container_id: "cont-1",
      }).success,
    ).toBe(true);
  });

  it("accepts session without container_id", () => {
    expect(safeParse(PiOrchSessionSchema, validSession).success).toBe(true);
  });

  it("rejects invalid datetime for started_at", () => {
    expect(
      safeParse(PiOrchSessionSchema, {
        ...validSession,
        started_at: "not-a-date",
      }).success,
    ).toBe(false);
  });

  it("accepts negative elapsed_seconds (clock skew)", () => {
    expect(
      safeParse(PiOrchSessionSchema, {
        ...validSession,
        elapsed_seconds: -5,
      }).success,
    ).toBe(true);
  });
});

describe("PiOrchSessionListResponseSchema", () => {
  it("accepts array of sessions", () => {
    const list = [validSession, { ...validSession, session_id: "sess-002" }];
    expect(parseOrThrow(PiOrchSessionListResponseSchema, list)).toEqual(list);
  });

  it("accepts empty array", () => {
    expect(safeParse(PiOrchSessionListResponseSchema, []).success).toBe(true);
  });
});

describe("STALE_THRESHOLD_SECONDS", () => {
  it("equals 300", () => {
    expect(STALE_THRESHOLD_SECONDS).toBe(300);
  });

  it("can be used to detect stale sessions", () => {
    const staleSession = { ...validSession, elapsed_seconds: 450 };
    const parsed = parseOrThrow(PiOrchSessionSchema, staleSession);
    expect(parsed.elapsed_seconds > STALE_THRESHOLD_SECONDS).toBe(true);
  });
});
