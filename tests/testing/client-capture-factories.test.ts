/**
 * Client Capture Factory Tests — round-trip deserialization via fromJson().
 */
import { fromJson, type JsonValue } from "@bufbuild/protobuf";
import { describe, expect, it, beforeEach } from "vitest";

import {
  RequestCaptureRequestSchema,
  RequestCaptureResponseSchema,
  GetCaptureStatusRequestSchema,
  GetCaptureStatusResponseSchema,
} from "../../gen/ts/delicasa/v1/capture_service_pb.js";

import {
  makeRequestCaptureRequest,
  makeRequestCaptureResponse,
  makeGetCaptureStatusRequest,
  makeGetCaptureStatusResponse,
  resetCorrelationCounter,
} from "../../src/testing/index.js";

beforeEach(() => {
  resetCorrelationCounter();
});

describe("Client Capture Factories", () => {
  describe("makeRequestCaptureRequest", () => {
    it("creates a valid default request that round-trips", () => {
      const json = makeRequestCaptureRequest();
      const msg = fromJson(RequestCaptureRequestSchema, json as JsonValue);
      expect(msg.correlationId).toBeTruthy();
      expect(msg.controllerId).toBe("ctrl-test-001");
      expect(msg.captureTag).toBe("CAPTURE_TAG_BEFORE_OPEN");
      expect(msg.idempotencyKey).toBeTruthy();
    });

    it("applies overrides", () => {
      const json = makeRequestCaptureRequest({
        controllerId: "ctrl-custom",
        captureTag: "CAPTURE_TAG_AFTER_CLOSE",
        sessionId: "session-custom",
      });
      const msg = fromJson(RequestCaptureRequestSchema, json as JsonValue);
      expect(msg.controllerId).toBe("ctrl-custom");
      expect(msg.captureTag).toBe("CAPTURE_TAG_AFTER_CLOSE");
      expect(msg.sessionId).toBe("session-custom");
    });
  });

  describe("makeRequestCaptureResponse", () => {
    it("creates a valid default COMPLETED response that round-trips", () => {
      const json = makeRequestCaptureResponse();
      const msg = fromJson(RequestCaptureResponseSchema, json as JsonValue);
      expect(msg.correlationId).toBeTruthy();
      expect(msg.requestId).toBeTruthy();
      expect(msg.status).toBe(2); // CAPTURE_REQUEST_STATUS_COMPLETED
      expect(msg.evidenceId).toBeTruthy();
      expect(msg.objectKey).toBeTruthy();
      expect(msg.capturedAt).toBeDefined();
      expect(msg.uploadStatus).toBe(1); // CLIENT_UPLOAD_STATUS_UPLOADED
      expect(msg.cached).toBe(false);
    });

    it("applies overrides", () => {
      const json = makeRequestCaptureResponse({
        status: "CAPTURE_REQUEST_STATUS_ACCEPTED",
        cached: true,
      });
      const msg = fromJson(RequestCaptureResponseSchema, json as JsonValue);
      expect(msg.status).toBe(1); // ACCEPTED
      expect(msg.cached).toBe(true);
    });

    it("omits capturedAt when set to undefined", () => {
      const json = makeRequestCaptureResponse({
        capturedAt: undefined,
      });
      expect(json).not.toHaveProperty("capturedAt");
      // Should still round-trip (capturedAt is optional in proto)
      const msg = fromJson(RequestCaptureResponseSchema, json as JsonValue);
      expect(msg.capturedAt).toBeUndefined();
    });
  });

  describe("makeGetCaptureStatusRequest", () => {
    it("creates a valid default request that round-trips", () => {
      const json = makeGetCaptureStatusRequest();
      const msg = fromJson(GetCaptureStatusRequestSchema, json as JsonValue);
      expect(msg.correlationId).toBeTruthy();
      expect(msg.requestId).toBe("req-test-001");
    });

    it("applies overrides", () => {
      const json = makeGetCaptureStatusRequest({
        requestId: "req-custom-999",
      });
      const msg = fromJson(GetCaptureStatusRequestSchema, json as JsonValue);
      expect(msg.requestId).toBe("req-custom-999");
    });
  });

  describe("makeGetCaptureStatusResponse", () => {
    it("creates a valid default COMPLETED response that round-trips", () => {
      const json = makeGetCaptureStatusResponse();
      const msg = fromJson(GetCaptureStatusResponseSchema, json as JsonValue);
      expect(msg.correlationId).toBeTruthy();
      expect(msg.requestId).toBeTruthy();
      expect(msg.status).toBe(2); // COMPLETED
      expect(msg.evidenceId).toBeTruthy();
      expect(msg.objectKey).toBeTruthy();
    });

    it("applies overrides for ACCEPTED status", () => {
      const json = makeGetCaptureStatusResponse({
        status: "CAPTURE_REQUEST_STATUS_ACCEPTED",
      });
      const msg = fromJson(GetCaptureStatusResponseSchema, json as JsonValue);
      expect(msg.status).toBe(1); // ACCEPTED
    });
  });
});
