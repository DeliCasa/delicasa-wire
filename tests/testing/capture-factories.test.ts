/**
 * Round-trip deserialization tests for CaptureService factory functions.
 *
 * Each test calls a factory, passes the result through `fromJson()`,
 * and asserts the deserialized proto message has the expected field values.
 */
import { describe, expect, it, beforeEach } from "vitest";
import { fromJson, type JsonValue } from "@bufbuild/protobuf";
import { resetCorrelationCounter } from "../../src/testing/helpers.js";
import {
  makeCaptureImageRequest,
  makeCaptureImageResponse,
} from "../../src/testing/factories/capture.js";
import {
  CaptureImageRequestSchema,
  CaptureImageResponseSchema,
  UploadStatus,
} from "../../gen/ts/delicasa/device/v1/capture_service_pb.js";

describe("CaptureService factories", () => {
  beforeEach(() => {
    resetCorrelationCounter();
  });

  it("makeCaptureImageRequest() — default fields", () => {
    const json = makeCaptureImageRequest();
    const msg = fromJson(CaptureImageRequestSchema, json as JsonValue);

    expect(msg.correlationId).toBe("corr-test-001");
    expect(msg.cameraId).toBe("cam-test-001");
    expect(msg.idempotencyKey).toBe("idem-test-001");
  });

  it("makeCaptureImageRequest({ cameraId: 'custom-cam' }) — override cameraId", () => {
    const json = makeCaptureImageRequest({ cameraId: "custom-cam" });
    const msg = fromJson(CaptureImageRequestSchema, json as JsonValue);

    expect(msg.correlationId).toBe("corr-test-001");
    expect(msg.cameraId).toBe("custom-cam");
    expect(msg.idempotencyKey).toBe("idem-test-001");
  });

  it("makeCaptureImageResponse() — default fields", () => {
    const json = makeCaptureImageResponse();
    const msg = fromJson(CaptureImageResponseSchema, json as JsonValue);

    expect(msg.correlationId).toBe("corr-test-001");
    expect(msg.evidenceId).toBe("ev-test-001");
    expect(msg.cameraId).toBe("cam-test-001");
    expect(msg.cached).toBe(false);
    expect(msg.uploadStatus).toBe(UploadStatus.UPLOADED);
    expect(msg.objectKey).toBe("captures/ev-test-001.jpg");
    expect(msg.contentType).toBe("image/jpeg");
    expect(msg.imageSizeBytes).toBe(BigInt(245760));
    expect(msg.capturedAt).toBeDefined();
  });

  it("makeCaptureImageResponse({ cached: true }) — override cached", () => {
    const json = makeCaptureImageResponse({ cached: true });
    const msg = fromJson(CaptureImageResponseSchema, json as JsonValue);

    expect(msg.cached).toBe(true);
    expect(msg.evidenceId).toBe("ev-test-001");
  });

  it("makeCaptureImageResponse({ capturedAt: undefined }) — absent timestamp", () => {
    const json = makeCaptureImageResponse({ capturedAt: undefined });
    const msg = fromJson(CaptureImageResponseSchema, json as JsonValue);

    expect(msg.capturedAt).toBeUndefined();
    expect(msg.evidenceId).toBe("ev-test-001");
    expect(msg.uploadStatus).toBe(UploadStatus.UPLOADED);
  });
});
