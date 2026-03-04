import { describe, expect, it } from "vitest";
import {
  MqttCaptureAckSchema,
  MqttCaptureInfoSchema,
  MqttCaptureChunkSchema,
  MqttCaptureCompleteSchema,
  MqttCaptureResponseSchema,
  safeParse,
  parseOrThrow,
} from "../../src/zod/index.js";

describe("MqttCaptureAckSchema", () => {
  const valid = {
    request_id: "req-001",
    device_id: "esp-aabbccddeeff",
    action: "capture" as const,
    status: "in_progress" as const,
    timestamp: "2026-03-03T12:00:00Z",
  };

  it("accepts valid ack", () => {
    expect(parseOrThrow(MqttCaptureAckSchema, valid)).toEqual(valid);
  });

  it("accepts ack with optional fields", () => {
    const full = {
      ...valid,
      correlation_id: "corr-001",
      session_id: "sess-001",
      phase: "before_open",
    };
    expect(safeParse(MqttCaptureAckSchema, full).success).toBe(true);
  });

  it("accepts ack without optional fields", () => {
    expect(safeParse(MqttCaptureAckSchema, valid).success).toBe(true);
  });

  it("rejects wrong action", () => {
    expect(
      safeParse(MqttCaptureAckSchema, { ...valid, action: "restart" }).success,
    ).toBe(false);
  });

  it("rejects wrong status", () => {
    expect(
      safeParse(MqttCaptureAckSchema, { ...valid, status: "complete" }).success,
    ).toBe(false);
  });

  it("rejects missing device_id", () => {
    const { device_id, ...rest } = valid;
    expect(safeParse(MqttCaptureAckSchema, rest).success).toBe(false);
  });
});

describe("MqttCaptureInfoSchema", () => {
  const valid = {
    request_id: "req-001",
    device_id: "esp-aabbccddeeff",
    success: true,
    image_size: 45000,
    content_type: "image/jpeg",
    total_size: 45000,
    total_chunks: 12,
    timestamp: "2026-03-03T12:00:00Z",
    timings: { capture_ms: 180, validate_ms: 5, encode_ms: 95 },
  };

  it("accepts valid info", () => {
    expect(parseOrThrow(MqttCaptureInfoSchema, valid)).toEqual(valid);
  });

  it("accepts info with optional fields", () => {
    const full = {
      ...valid,
      correlation_id: "corr-001",
      session_id: "sess-001",
      phase: "after_close",
    };
    expect(safeParse(MqttCaptureInfoSchema, full).success).toBe(true);
  });

  it("rejects zero total_chunks", () => {
    expect(
      safeParse(MqttCaptureInfoSchema, { ...valid, total_chunks: 0 }).success,
    ).toBe(false);
  });

  it("rejects negative image_size", () => {
    expect(
      safeParse(MqttCaptureInfoSchema, { ...valid, image_size: -1 }).success,
    ).toBe(false);
  });

  it("rejects missing timings", () => {
    const { timings, ...rest } = valid;
    expect(safeParse(MqttCaptureInfoSchema, rest).success).toBe(false);
  });
});

describe("MqttCaptureChunkSchema", () => {
  it("accepts valid chunk", () => {
    const chunk = { request_id: "req-001", chunk_index: 0, chunk_data: "base64=" };
    expect(parseOrThrow(MqttCaptureChunkSchema, chunk)).toEqual(chunk);
  });

  it("accepts chunk with high index", () => {
    expect(
      safeParse(MqttCaptureChunkSchema, {
        request_id: "r",
        chunk_index: 99,
        chunk_data: "data",
      }).success,
    ).toBe(true);
  });

  it("rejects negative chunk_index", () => {
    expect(
      safeParse(MqttCaptureChunkSchema, {
        request_id: "r",
        chunk_index: -1,
        chunk_data: "data",
      }).success,
    ).toBe(false);
  });

  it("rejects empty chunk_data", () => {
    expect(
      safeParse(MqttCaptureChunkSchema, {
        request_id: "r",
        chunk_index: 0,
        chunk_data: "",
      }).success,
    ).toBe(false);
  });
});

describe("MqttCaptureCompleteSchema", () => {
  const valid = {
    request_id: "req-001",
    success: true,
    chunks_sent: 12,
    device_id: "esp-aabbccddeeff",
    status: "complete" as const,
    total_chunks: 12,
    timestamp: "2026-03-03T12:00:00Z",
    timings: {
      total_ms: 1200,
      capture_ms: 180,
      validate_ms: 5,
      encode_ms: 95,
      publish_ms: 920,
    },
  };

  it("accepts valid complete", () => {
    expect(parseOrThrow(MqttCaptureCompleteSchema, valid)).toEqual(valid);
  });

  it("accepts complete with optional fields", () => {
    expect(
      safeParse(MqttCaptureCompleteSchema, {
        ...valid,
        correlation_id: "c",
        session_id: "s",
        phase: "before_open",
      }).success,
    ).toBe(true);
  });

  it("rejects missing timings.publish_ms", () => {
    const badTimings = { total_ms: 0, capture_ms: 0, validate_ms: 0, encode_ms: 0 };
    expect(
      safeParse(MqttCaptureCompleteSchema, { ...valid, timings: badTimings }).success,
    ).toBe(false);
  });
});

describe("MqttCaptureResponseSchema", () => {
  it("accepts success response", () => {
    const success = {
      request_id: "req-001",
      device_id: "esp-aabbccddeeff",
      success: true as const,
      status: "complete" as const,
      timestamp: "2026-03-03T12:00:00Z",
    };
    const result = parseOrThrow(MqttCaptureResponseSchema, success);
    expect(result.success).toBe(true);
  });

  it("accepts failure response with diagnostics", () => {
    const failure = {
      request_id: "req-001",
      success: false as const,
      device_id: "esp-aabbccddeeff",
      status: "error" as const,
      timestamp: "2026-03-03T12:00:00Z",
      error: "Camera busy",
      error_code: "CAPTURE_BUSY",
      error_category: "busy",
      retry_after_ms: 2000,
      diagnostics: {
        free_heap_bytes: 30000,
        camera_error_code: -1,
        consecutive_failures: 2,
      },
    };
    const result = parseOrThrow(MqttCaptureResponseSchema, failure);
    expect(result.success).toBe(false);
  });

  it("accepts failure without retry_after_ms", () => {
    const failure = {
      request_id: "req-001",
      success: false as const,
      status: "error" as const,
      timestamp: "2026-03-03T12:00:00Z",
      error: "Internal error",
      error_code: "INTERNAL",
      error_category: "internal",
    };
    expect(safeParse(MqttCaptureResponseSchema, failure).success).toBe(true);
  });

  it("accepts failure with timings", () => {
    expect(
      safeParse(MqttCaptureResponseSchema, {
        request_id: "r",
        success: false,
        status: "error",
        timestamp: "2026-03-03T12:00:00Z",
        error: "e",
        error_code: "c",
        error_category: "cat",
        timings: { total_ms: 0, capture_ms: 0, validate_ms: 0 },
      }).success,
    ).toBe(true);
  });
});
