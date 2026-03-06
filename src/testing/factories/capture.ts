/**
 * Proto JSON test fixture factories for CaptureService messages.
 *
 * Returns plain objects compatible with `fromJson()` from `@bufbuild/protobuf`.
 * No generated code imports — consumers cast to `JsonValue` themselves.
 */

import {
  makeCorrelationId,
  makeTimestamp,
  mergeDefaults,
} from "../helpers.js";

// ---------------------------------------------------------------------------
// CaptureImageRequest
// ---------------------------------------------------------------------------

export function makeCaptureImageRequest(
  overrides?: Partial<{
    correlationId: string;
    cameraId: string;
    idempotencyKey: string;
  }>,
) {
  return mergeDefaults(
    {
      correlationId: makeCorrelationId(),
      cameraId: "cam-test-001",
      idempotencyKey: "idem-test-001",
    },
    overrides,
  );
}

// ---------------------------------------------------------------------------
// CaptureImageResponse
// ---------------------------------------------------------------------------

export function makeCaptureImageResponse(
  overrides?: Partial<{
    correlationId: string;
    evidenceId: string;
    cameraId: string;
    capturedAt: string;
    contentType: string;
    imageSizeBytes: string;
    objectKey: string;
    uploadStatus: string;
    cached: boolean;
  }>,
) {
  return mergeDefaults(
    {
      correlationId: makeCorrelationId(),
      evidenceId: "ev-test-001",
      cameraId: "cam-test-001",
      capturedAt: makeTimestamp(),
      contentType: "image/jpeg",
      imageSizeBytes: "245760",
      objectKey: "captures/ev-test-001.jpg",
      uploadStatus: "UPLOAD_STATUS_UPLOADED",
      cached: false,
    },
    overrides,
  );
}
