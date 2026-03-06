/**
 * Factory functions for delicasa.v1.CaptureService proto JSON fixtures.
 *
 * These produce plain objects compatible with fromJson() from @bufbuild/protobuf.
 * They do NOT import from gen/ — consumers use them for test data construction.
 */
import { makeCorrelationId, makeTimestamp, mergeDefaults } from "../helpers.js";

const REQUEST_CAPTURE_REQUEST_DEFAULTS: Record<string, unknown> = {
  correlationId: "",
  controllerId: "ctrl-test-001",
  captureTag: "CAPTURE_TAG_BEFORE_OPEN",
  idempotencyKey: "idem-test-001",
  sessionId: "session-test-001",
};

const REQUEST_CAPTURE_RESPONSE_DEFAULTS: Record<string, unknown> = {
  correlationId: "",
  requestId: "req-test-001",
  status: "CAPTURE_REQUEST_STATUS_COMPLETED",
  evidenceId: "ev-test-001",
  cameraId: "esp32-cam-01",
  capturedAt: "",
  contentType: "image/jpeg",
  imageSizeBytes: "245760",
  objectKey: "evidence/2026/03/06/ev-before-001.jpg",
  uploadStatus: "CLIENT_UPLOAD_STATUS_UPLOADED",
  cached: false,
};

const GET_CAPTURE_STATUS_REQUEST_DEFAULTS: Record<string, unknown> = {
  correlationId: "",
  requestId: "req-test-001",
};

const GET_CAPTURE_STATUS_RESPONSE_DEFAULTS: Record<string, unknown> = {
  correlationId: "",
  requestId: "req-test-001",
  status: "CAPTURE_REQUEST_STATUS_COMPLETED",
  evidenceId: "ev-test-001",
  cameraId: "esp32-cam-01",
  capturedAt: "",
  contentType: "image/jpeg",
  imageSizeBytes: "245760",
  objectKey: "evidence/2026/03/06/ev-before-001.jpg",
  uploadStatus: "CLIENT_UPLOAD_STATUS_UPLOADED",
};

export function makeRequestCaptureRequest(
  overrides?: Partial<Record<string, unknown>>,
): Record<string, unknown> {
  return mergeDefaults(
    { ...REQUEST_CAPTURE_REQUEST_DEFAULTS, correlationId: makeCorrelationId() },
    overrides,
  );
}

export function makeRequestCaptureResponse(
  overrides?: Partial<Record<string, unknown>>,
): Record<string, unknown> {
  return mergeDefaults(
    {
      ...REQUEST_CAPTURE_RESPONSE_DEFAULTS,
      correlationId: makeCorrelationId(),
      capturedAt: makeTimestamp(),
    },
    overrides,
  );
}

export function makeGetCaptureStatusRequest(
  overrides?: Partial<Record<string, unknown>>,
): Record<string, unknown> {
  return mergeDefaults(
    {
      ...GET_CAPTURE_STATUS_REQUEST_DEFAULTS,
      correlationId: makeCorrelationId(),
    },
    overrides,
  );
}

export function makeGetCaptureStatusResponse(
  overrides?: Partial<Record<string, unknown>>,
): Record<string, unknown> {
  return mergeDefaults(
    {
      ...GET_CAPTURE_STATUS_RESPONSE_DEFAULTS,
      correlationId: makeCorrelationId(),
      capturedAt: makeTimestamp(),
    },
    overrides,
  );
}
