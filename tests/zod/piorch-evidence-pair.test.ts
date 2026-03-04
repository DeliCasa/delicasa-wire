import { describe, expect, it } from "vitest";
import {
  PairCaptureSchema,
  PiOrchEvidencePairLivenessProofSchema,
  PiOrchEvidencePairSchema,
  safeParse,
  parseOrThrow,
} from "../../src/zod/index.js";

const validBefore = {
  evidence_id: "ev-before",
  capture_tag: "BEFORE_OPEN" as const,
  status: "captured" as const,
  image_size_bytes: 45000,
};

const validAfter = {
  evidence_id: "ev-after",
  capture_tag: "AFTER_CLOSE" as const,
  status: "captured" as const,
  image_size_bytes: 42000,
};

const validPair = {
  contract_version: "v1" as const,
  session_id: "sess-001",
  container_id: "cont-001",
  pair_status: "complete" as const,
  before: validBefore,
  after: validAfter,
  queried_at: "2026-03-03T12:00:00Z",
};

describe("PairCaptureSchema", () => {
  it("accepts valid capture with required fields", () => {
    expect(parseOrThrow(PairCaptureSchema, validBefore)).toEqual(validBefore);
  });

  it("accepts capture with all optional fields", () => {
    const full = {
      ...validBefore,
      missing_reason: "camera offline",
      failure_detail: "timeout after 30s",
      device_id: "esp-001",
      container_id: "cont-1",
      session_id: "sess-1",
      captured_at: "2026-03-03T12:00:00Z",
      content_type: "image/jpeg",
      image_data: "base64...",
      object_key: "evidence/img.jpg",
      upload_status: "uploaded" as const,
    };
    expect(safeParse(PairCaptureSchema, full).success).toBe(true);
  });

  it("accepts all pair capture statuses", () => {
    for (const status of ["captured", "failed", "timeout", "pending"] as const) {
      expect(
        safeParse(PairCaptureSchema, { ...validBefore, status }).success,
      ).toBe(true);
    }
  });

  it("rejects invalid capture tag", () => {
    expect(
      safeParse(PairCaptureSchema, {
        ...validBefore,
        capture_tag: "AFTER_OPEN",
      }).success,
    ).toBe(false);
  });

  it("rejects negative image_size_bytes", () => {
    expect(
      safeParse(PairCaptureSchema, {
        ...validBefore,
        image_size_bytes: -1,
      }).success,
    ).toBe(false);
  });

  it("accepts zero image_size_bytes", () => {
    expect(
      safeParse(PairCaptureSchema, {
        ...validBefore,
        image_size_bytes: 0,
      }).success,
    ).toBe(true);
  });
});

describe("PiOrchEvidencePairLivenessProofSchema", () => {
  it("accepts valid liveness proof", () => {
    const proof = {
      method: "uptime_advance" as const,
      capture_ready: true,
      probe_1_uptime_s: 100,
      probe_2_uptime_s: 130,
      delta_s: 30,
    };
    expect(parseOrThrow(PiOrchEvidencePairLivenessProofSchema, proof)).toEqual(proof);
  });

  it("accepts minimal liveness proof", () => {
    expect(
      safeParse(PiOrchEvidencePairLivenessProofSchema, {
        method: "probe_responded",
        capture_ready: false,
      }).success,
    ).toBe(true);
  });

  it("rejects wifi_rssi above 0", () => {
    expect(
      safeParse(PiOrchEvidencePairLivenessProofSchema, {
        method: "uptime_advance",
        capture_ready: true,
        wifi_rssi: 10,
      }).success,
    ).toBe(false);
  });
});

describe("PiOrchEvidencePairSchema", () => {
  it("accepts complete pair", () => {
    expect(parseOrThrow(PiOrchEvidencePairSchema, validPair)).toEqual(validPair);
  });

  it("accepts incomplete pair with retry", () => {
    const incomplete = {
      ...validPair,
      pair_status: "incomplete" as const,
      retry_after_seconds: 10,
    };
    expect(safeParse(PiOrchEvidencePairSchema, incomplete).success).toBe(true);
  });

  it("accepts missing pair", () => {
    expect(
      safeParse(PiOrchEvidencePairSchema, {
        ...validPair,
        pair_status: "missing",
      }).success,
    ).toBe(true);
  });

  it("accepts pair with liveness proof", () => {
    const withProof = {
      ...validPair,
      liveness_proof: {
        method: "uptime_advance" as const,
        capture_ready: true,
        probe_1_uptime_s: 100,
        probe_2_uptime_s: 130,
        delta_s: 30,
      },
    };
    expect(safeParse(PiOrchEvidencePairSchema, withProof).success).toBe(true);
  });

  it("rejects invalid contract_version", () => {
    expect(
      safeParse(PiOrchEvidencePairSchema, {
        ...validPair,
        contract_version: "v2",
      }).success,
    ).toBe(false);
  });

  it("accepts retry_after_seconds of 0", () => {
    expect(
      safeParse(PiOrchEvidencePairSchema, {
        ...validPair,
        retry_after_seconds: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing session_id", () => {
    const { session_id, ...rest } = validPair;
    expect(safeParse(PiOrchEvidencePairSchema, rest).success).toBe(false);
  });
});
