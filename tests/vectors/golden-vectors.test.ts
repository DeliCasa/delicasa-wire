/**
 * Golden Test Vectors — Proto JSON Canonical Fixtures
 *
 * These tests validate that JSON fixtures in tests/vectors/fixtures/
 * deserialize correctly against generated protobuf types.
 *
 * Conventions enforced:
 * - Enum values use proto JSON string form (e.g., "CAMERA_STATUS_ONLINE")
 * - Absent Timestamp fields are omitted entirely (never empty string)
 * - All request/response messages include correlationId
 */
import { describe, expect, it } from "vitest";
import { fromJson, type JsonValue } from "@bufbuild/protobuf";

// Device service schemas
import {
  ListCamerasResponseSchema,
  GetCameraResponseSchema,
  GetCameraStatusResponseSchema,
  ReconcileCamerasResponseSchema,
} from "../../gen/ts/delicasa/device/v1/camera_service_pb.js";
import {
  CaptureImageRequestSchema,
  CaptureImageResponseSchema,
} from "../../gen/ts/delicasa/device/v1/capture_service_pb.js";
import {
  GetEvidencePairResponseSchema,
  GetSessionEvidenceResponseSchema,
} from "../../gen/ts/delicasa/device/v1/evidence_service_pb.js";
import {
  ListSessionsResponseSchema,
  GetSessionResponseSchema,
} from "../../gen/ts/delicasa/device/v1/session_service_pb.js";

// Client service schemas
import {
  ListImagesResponseSchema,
  SearchImagesResponseSchema,
  GetPresignedUrlResponseSchema,
} from "../../gen/ts/delicasa/v1/image_service_pb.js";

// Load fixtures — cast to Record<string, JsonValue> to satisfy fromJson's type constraint.
// JSON imports with absent keys get inferred as `undefined` which doesn't match JsonValue.
import _cameraFixtures from "./fixtures/camera-service.json";
import _captureFixtures from "./fixtures/capture-service.json";
import _evidenceFixtures from "./fixtures/evidence-service.json";
import _sessionFixtures from "./fixtures/session-service.json";
import _imageFixtures from "./fixtures/image-service.json";

const cameraFixtures = _cameraFixtures as Record<string, JsonValue>;
const captureFixtures = _captureFixtures as Record<string, JsonValue>;
const evidenceFixtures = _evidenceFixtures as Record<string, JsonValue>;
const sessionFixtures = _sessionFixtures as Record<string, JsonValue>;
const imageFixtures = _imageFixtures as Record<string, JsonValue>;

describe("Golden Vectors: CameraService", () => {
  it("deserializes ListCamerasResponse", () => {
    const msg = fromJson(ListCamerasResponseSchema, cameraFixtures.ListCamerasResponse);
    expect(msg.correlationId).toBe("corr-cam-list-001");
    expect(msg.cameras).toHaveLength(4);
    expect(msg.totalCount).toBe(4);
  });

  // Edge case: all 8 CameraStatus enum values round-trip correctly
  it("deserializes all CameraStatus enum values", () => {
    const msg = fromJson(ListCamerasResponseSchema, cameraFixtures.ListCamerasResponse_allStatuses);
    expect(msg.cameras).toHaveLength(8);
    // Verify every camera deserialized (enum string → enum value → accessible)
    for (const cam of msg.cameras) {
      expect(cam.deviceId).toBeTruthy();
    }
  });

  it("deserializes GetCameraResponse", () => {
    const msg = fromJson(GetCameraResponseSchema, cameraFixtures.GetCameraResponse);
    expect(msg.correlationId).toBe("corr-cam-get-001");
    expect(msg.camera).toBeDefined();
    expect(msg.camera!.deviceId).toBe("esp32-cam-01");
  });

  it("deserializes GetCameraStatusResponse", () => {
    const msg = fromJson(GetCameraStatusResponseSchema, cameraFixtures.GetCameraStatusResponse);
    expect(msg.correlationId).toBe("corr-cam-status-001");
    expect(msg.ready).toBe(true);
  });

  it("deserializes ReconcileCamerasResponse", () => {
    const msg = fromJson(ReconcileCamerasResponseSchema, cameraFixtures.ReconcileCamerasResponse);
    expect(msg.correlationId).toBe("corr-cam-reconcile-001");
    expect(msg.reconciledCount).toBe(2);
    expect(msg.reconciledDeviceIds).toHaveLength(2);
  });

  it("handles camera with absent optional health (offline camera)", () => {
    // Second camera in ListCamerasResponse has no health, no lastSeen
    const msg = fromJson(ListCamerasResponseSchema, cameraFixtures.ListCamerasResponse);
    const offlineCam = msg.cameras[1];
    expect(offlineCam).toBeDefined();
    expect(offlineCam!.health).toBeUndefined();
    // CONVENTION: absent Timestamp fields are undefined, not empty string or epoch zero
    expect(offlineCam!.lastSeen).toBeUndefined();
  });

  it("deserializes camera with minimal health (no optional fields)", () => {
    const msg = fromJson(GetCameraResponseSchema, cameraFixtures.GetCameraResponse_minimalHealth);
    const cam = msg.camera!;
    expect(cam.health).toBeDefined();
    expect(cam.health!.wifiRssi).toBe(-80);
    // Optional health fields omitted — should be absent
    expect(cam.health!.firmwareVersion).toBe("");
    expect(cam.health!.lastCapture).toBeUndefined();
  });

  it("deserializes not-ready camera status", () => {
    const msg = fromJson(GetCameraStatusResponseSchema, cameraFixtures.GetCameraStatusResponse_notReady);
    expect(msg.ready).toBe(false);
    // CONVENTION: absent Timestamp (lastSeen omitted) is undefined
    expect(msg.lastSeen).toBeUndefined();
  });
});

describe("Golden Vectors: CaptureService", () => {
  it("deserializes CaptureImageRequest", () => {
    const msg = fromJson(CaptureImageRequestSchema, captureFixtures.CaptureImageRequest);
    expect(msg.correlationId).toBe("corr-capture-001");
    expect(msg.cameraId).toBe("esp32-cam-01");
    expect(msg.idempotencyKey).toBe("idem-key-abc123");
  });

  it("deserializes CaptureImageResponse", () => {
    const msg = fromJson(CaptureImageResponseSchema, captureFixtures.CaptureImageResponse);
    expect(msg.correlationId).toBe("corr-capture-001");
    expect(msg.evidenceId).toBe("ev-capture-001");
    expect(msg.cached).toBe(false);
  });

  it("deserializes cached CaptureImageResponse", () => {
    const msg = fromJson(CaptureImageResponseSchema, captureFixtures.CaptureImageResponse_cached);
    expect(msg.cached).toBe(true);
  });
});

describe("Golden Vectors: EvidenceService", () => {
  it("deserializes GetEvidencePairResponse", () => {
    const msg = fromJson(GetEvidencePairResponseSchema, evidenceFixtures.GetEvidencePairResponse);
    expect(msg.correlationId).toBe("corr-evidence-pair-001");
    expect(msg.pair).toBeDefined();
    expect(msg.pair!.sessionId).toBe("session-001");
    expect(msg.pair!.before).toBeDefined();
    expect(msg.pair!.after).toBeDefined();
  });

  it("deserializes GetSessionEvidenceResponse", () => {
    const msg = fromJson(GetSessionEvidenceResponseSchema, evidenceFixtures.GetSessionEvidenceResponse);
    expect(msg.correlationId).toBe("corr-session-ev-001");
    expect(msg.captures).toHaveLength(2);
    expect(msg.totalCaptures).toBe(2);
    expect(msg.successfulCaptures).toBe(2);
    expect(msg.failedCaptures).toBe(0);
  });

  // Edge case: incomplete pair with absent "after" and retry_after_seconds set
  it("deserializes incomplete evidence pair (absent after, retry hint)", () => {
    const msg = fromJson(GetEvidencePairResponseSchema, evidenceFixtures.GetEvidencePairResponse_incomplete);
    expect(msg.pair!.pairStatus).toBe(2); // EVIDENCE_PAIR_STATUS_INCOMPLETE = 2
    expect(msg.pair!.before).toBeDefined();
    // CONVENTION: absent sub-message is undefined
    expect(msg.pair!.after).toBeUndefined();
    expect(msg.pair!.retryAfterSeconds).toBe(5);
  });

  // Edge case: missing pair with both captures absent
  it("deserializes missing evidence pair", () => {
    const msg = fromJson(GetEvidencePairResponseSchema, evidenceFixtures.GetEvidencePairResponse_missing);
    expect(msg.pair!.pairStatus).toBe(3); // EVIDENCE_PAIR_STATUS_MISSING = 3
    expect(msg.pair!.before).toBeUndefined();
    expect(msg.pair!.after).toBeUndefined();
    expect(msg.pair!.retryAfterSeconds).toBe(10);
  });

  // Edge case: session evidence with failed captures (timeout, absent fields)
  it("deserializes session evidence with failures", () => {
    const msg = fromJson(GetSessionEvidenceResponseSchema, evidenceFixtures.GetSessionEvidenceResponse_withFailures);
    expect(msg.successfulCaptures).toBe(1);
    expect(msg.failedCaptures).toBe(1);
    const timedOut = msg.captures[1]!;
    expect(timedOut.status).toBe(3); // CAPTURE_STATUS_TIMEOUT = 3
    // CONVENTION: absent Timestamp (capturedAt omitted on timeout) is undefined
    expect(timedOut.capturedAt).toBeUndefined();
  });
});

describe("Golden Vectors: SessionService", () => {
  it("deserializes ListSessionsResponse", () => {
    const msg = fromJson(ListSessionsResponseSchema, sessionFixtures.ListSessionsResponse);
    expect(msg.correlationId).toBe("corr-session-list-001");
    expect(msg.sessions).toHaveLength(2);
    expect(msg.totalCount).toBe(2);
  });

  it("deserializes GetSessionResponse", () => {
    const msg = fromJson(GetSessionResponseSchema, sessionFixtures.GetSessionResponse);
    expect(msg.correlationId).toBe("corr-session-get-001");
    expect(msg.session).toBeDefined();
    expect(msg.session!.pairComplete).toBe(true);
  });

  it("validates OperationSession diagnostic fields", () => {
    const msg = fromJson(ListSessionsResponseSchema, sessionFixtures.ListSessionsResponse);
    const complete = msg.sessions[0]!;
    expect(complete.totalCaptures).toBe(2);
    expect(complete.successfulCaptures).toBe(2);
    expect(complete.failedCaptures).toBe(0);
    expect(complete.hasBeforeOpen).toBe(true);
    expect(complete.hasAfterClose).toBe(true);
    expect(complete.pairComplete).toBe(true);

    const active = msg.sessions[1]!;
    expect(active.hasAfterClose).toBe(false);
    expect(active.pairComplete).toBe(false);
  });

  // Edge case: all 4 SessionStatus enum values round-trip correctly
  it("deserializes all SessionStatus enum values", () => {
    const msg = fromJson(ListSessionsResponseSchema, sessionFixtures.ListSessionsResponse_allStatuses);
    expect(msg.sessions).toHaveLength(4);
    // Verify each session deserialized without error
    const statuses = msg.sessions.map((s) => s.status);
    // SESSION_STATUS_ACTIVE=1, COMPLETE=2, PARTIAL=3, FAILED=4
    expect(statuses).toEqual([1, 2, 3, 4]);
  });
});

describe("Golden Vectors: ImageService", () => {
  it("deserializes ListImagesResponse", () => {
    const msg = fromJson(ListImagesResponseSchema, imageFixtures.ListImagesResponse);
    expect(msg.correlationId).toBe("corr-img-list-001");
    expect(msg.images).toHaveLength(2);
    expect(msg.nextPageToken).toBe("eyJvZmZzZXQiOjJ9");
    expect(msg.totalCount).toBe(15);
  });

  it("deserializes SearchImagesResponse", () => {
    const msg = fromJson(SearchImagesResponseSchema, imageFixtures.SearchImagesResponse);
    expect(msg.correlationId).toBe("corr-img-search-001");
    expect(msg.images).toHaveLength(1);
    expect(msg.totalCount).toBe(1);
  });

  it("deserializes GetPresignedUrlResponse", () => {
    const msg = fromJson(GetPresignedUrlResponseSchema, imageFixtures.GetPresignedUrlResponse);
    expect(msg.correlationId).toBe("corr-img-presign-001");
    expect(msg.url).toContain("X-Amz-Signature");
    expect(msg.expiresAt).toBeDefined();
  });

  it("validates Image entity fields", () => {
    const msg = fromJson(ListImagesResponseSchema, imageFixtures.ListImagesResponse);
    const img = msg.images[0]!;
    expect(img.id).toBe("img-001");
    expect(img.objectKey).toContain("evidence/");
    expect(img.controllerId).toBe("ctrl-001");
    expect(img.containerId).toBe("container-001");
    expect(img.captureTag).toBe("before_open");
    expect(img.contentType).toBe("image/jpeg");
    expect(img.width).toBe(1600);
    expect(img.height).toBe(1200);
    expect(img.createdAt).toBeDefined();
  });
});
