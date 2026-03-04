import { describe, expect, it } from "vitest";
import {
  PiOrchContainerActionRequestSchema,
  BridgeEvidenceCaptureSchema,
  PiOrchContainerActionResponseSchema,
  safeParse,
  parseOrThrow,
} from "../../src/zod/index.js";

const validCapture = {
  camera_id: "cam-1",
  captured_at: "2026-03-03T12:00:00Z",
  content_type: "image/jpeg",
  capture_reason: "BEFORE_OPEN" as const,
  capture_tag: "BEFORE_OPEN" as const,
  status: "captured" as const,
  evidence_id: "ev-001",
};

describe("PiOrchContainerActionRequestSchema", () => {
  it("accepts valid open request", () => {
    const req = { action: "open", correlation_id: "abc-123" };
    expect(parseOrThrow(PiOrchContainerActionRequestSchema, req)).toEqual(req);
  });

  it("accepts valid close request", () => {
    const req = { action: "close", correlation_id: "xyz-456" };
    expect(safeParse(PiOrchContainerActionRequestSchema, req).success).toBe(true);
  });

  it("rejects missing correlation_id", () => {
    expect(
      safeParse(PiOrchContainerActionRequestSchema, { action: "open" }).success,
    ).toBe(false);
  });

  it("rejects invalid action", () => {
    expect(
      safeParse(PiOrchContainerActionRequestSchema, {
        action: "unlock",
        correlation_id: "x",
      }).success,
    ).toBe(false);
  });
});

describe("BridgeEvidenceCaptureSchema", () => {
  it("accepts valid capture with required fields only", () => {
    expect(parseOrThrow(BridgeEvidenceCaptureSchema, validCapture)).toEqual(
      validCapture,
    );
  });

  it("accepts capture with all optional fields", () => {
    const full = {
      ...validCapture,
      image_data: "base64data",
      device_id: "esp-aabbccddeeff",
      container_id: "cont-1",
      session_id: "sess-1",
      object_key: "evidence/2026/img.jpg",
      upload_status: "uploaded" as const,
      error_message: "some warning",
    };
    expect(safeParse(BridgeEvidenceCaptureSchema, full).success).toBe(true);
  });

  it("accepts all capture tags", () => {
    for (const tag of ["BEFORE_OPEN", "AFTER_OPEN", "BEFORE_CLOSE", "AFTER_CLOSE"] as const) {
      expect(
        safeParse(BridgeEvidenceCaptureSchema, {
          ...validCapture,
          capture_reason: tag,
          capture_tag: tag,
        }).success,
      ).toBe(true);
    }
  });

  it("accepts all capture statuses", () => {
    for (const status of ["captured", "failed", "timeout"] as const) {
      expect(
        safeParse(BridgeEvidenceCaptureSchema, { ...validCapture, status }).success,
      ).toBe(true);
    }
  });

  it("accepts all upload statuses", () => {
    for (const upload_status of ["uploaded", "failed", "unverified"] as const) {
      expect(
        safeParse(BridgeEvidenceCaptureSchema, { ...validCapture, upload_status }).success,
      ).toBe(true);
    }
  });

  it("rejects missing camera_id", () => {
    const { camera_id, ...rest } = validCapture;
    expect(safeParse(BridgeEvidenceCaptureSchema, rest).success).toBe(false);
  });

  it("rejects invalid capture tag", () => {
    expect(
      safeParse(BridgeEvidenceCaptureSchema, {
        ...validCapture,
        capture_tag: "DURING",
      }).success,
    ).toBe(false);
  });
});

describe("PiOrchContainerActionResponseSchema", () => {
  const successResponse = {
    status: "success" as const,
    action_id: "piorch_123_abc",
    container_id: "cont-1",
    before_captures: [validCapture],
    after_captures: [],
  };

  const errorResponse = {
    status: "error" as const,
    error: {
      error_code: "CONTAINER_BUSY" as const,
      retryable: true,
      retry_after: 5,
    },
  };

  it("accepts success response with captures", () => {
    const result = parseOrThrow(PiOrchContainerActionResponseSchema, successResponse);
    expect(result.status).toBe("success");
  });

  it("accepts success response with session_id", () => {
    const result = safeParse(PiOrchContainerActionResponseSchema, {
      ...successResponse,
      session_id: "sess-abc",
    });
    expect(result.success).toBe(true);
  });

  it("accepts error response", () => {
    const result = parseOrThrow(PiOrchContainerActionResponseSchema, errorResponse);
    expect(result.status).toBe("error");
  });

  it("accepts error without retry_after", () => {
    const result = safeParse(PiOrchContainerActionResponseSchema, {
      status: "error",
      error: { error_code: "CONTAINER_NOT_FOUND", retryable: false },
    });
    expect(result.success).toBe(true);
  });

  it("accepts all error codes", () => {
    const codes = [
      "CONTAINER_NOT_FOUND", "CONTAINER_BUSY", "ACTUATION_FAILED",
      "CAPTURE_FAILED", "SERVICE_UNAVAILABLE", "TIMEOUT",
      "NETWORK_ERROR", "INVALID_RESPONSE", "NO_ONLINE_CAMERAS",
      "INTERNAL_ERROR",
    ] as const;
    for (const error_code of codes) {
      expect(
        safeParse(PiOrchContainerActionResponseSchema, {
          status: "error",
          error: { error_code, retryable: false },
        }).success,
      ).toBe(true);
    }
  });

  it("rejects missing status", () => {
    expect(
      safeParse(PiOrchContainerActionResponseSchema, {
        action_id: "x",
        container_id: "c",
        before_captures: [],
        after_captures: [],
      }).success,
    ).toBe(false);
  });

  it("rejects invalid status value", () => {
    expect(
      safeParse(PiOrchContainerActionResponseSchema, {
        status: "pending",
      }).success,
    ).toBe(false);
  });
});
