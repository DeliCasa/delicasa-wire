# Contract: @delicasa/wire/testing Export

**Version**: v0.4.0
**Type**: npm subpath export (library public API)

## Subpath Export

```jsonc
// package.json exports entry
"./testing": {
  "types": "./src/testing/index.d.ts",
  "default": "./src/testing/index.js"
}
```

## Public API

### Helper Functions

```typescript
/** Generate a sequential correlation ID (e.g., "corr-test-001") */
makeCorrelationId(): string

/** Generate an ISO 8601 timestamp string */
makeTimestamp(date?: Date): string
```

### Camera Factories

```typescript
makeCamera(overrides?: Partial<CameraJson>): JsonValue
makeCameraHealth(overrides?: Partial<CameraHealthJson>): JsonValue
makeListCamerasResponse(overrides?: { cameras?: JsonValue[]; correlationId?: string; totalCount?: number }): JsonValue
makeGetCameraResponse(overrides?: { camera?: JsonValue; correlationId?: string }): JsonValue
makeGetCameraStatusResponse(overrides?: Partial<CameraStatusResponseJson>): JsonValue
makeReconcileCamerasResponse(overrides?: Partial<ReconcileResponseJson>): JsonValue
```

### Capture Factories

```typescript
makeCaptureImageRequest(overrides?: Partial<CaptureRequestJson>): JsonValue
makeCaptureImageResponse(overrides?: Partial<CaptureResponseJson>): JsonValue
```

### Evidence Factories

```typescript
makeEvidenceCapture(overrides?: Partial<EvidenceCaptureJson>): JsonValue
makeEvidencePair(overrides?: Partial<EvidencePairJson>): JsonValue
makeGetEvidencePairResponse(overrides?: { pair?: JsonValue; correlationId?: string }): JsonValue
makeGetSessionEvidenceResponse(overrides?: Partial<SessionEvidenceResponseJson>): JsonValue
```

### Session Factories

```typescript
makeOperationSession(overrides?: Partial<OperationSessionJson>): JsonValue
makeListSessionsResponse(overrides?: { sessions?: JsonValue[]; correlationId?: string; totalCount?: number }): JsonValue
makeGetSessionResponse(overrides?: { session?: JsonValue; correlationId?: string }): JsonValue
```

### Image Factories

```typescript
makeImage(overrides?: Partial<ImageJson>): JsonValue
makeListImagesResponse(overrides?: { images?: JsonValue[]; correlationId?: string; nextPageToken?: string; totalCount?: number }): JsonValue
makeSearchImagesResponse(overrides?: { images?: JsonValue[]; correlationId?: string; totalCount?: number }): JsonValue
makeGetPresignedUrlResponse(overrides?: { url?: string; correlationId?: string; expiresAt?: string }): JsonValue
```

## Contract Rules

1. All factory functions MUST return `JsonValue`-compatible objects
2. All response factories MUST include `correlationId` (auto-generated if not overridden)
3. Timestamp fields MUST use ISO 8601 format (`"2026-03-06T10:30:00Z"`)
4. Enum fields MUST use proto JSON string form (`"CAMERA_STATUS_ONLINE"`, not `1`)
5. Absent optional fields MUST be omitted entirely (not `null` or empty string)
6. int64 fields MUST be encoded as strings (`"245760"`, not `245760`) per proto JSON convention
7. Factory functions MUST NOT import from `gen/` (no dependency on generated code)

## Consumer Usage Example

```typescript
import { makeCamera, makeListCamerasResponse } from "@delicasa/wire/testing";
import { fromJson } from "@bufbuild/protobuf";
import { ListCamerasResponseSchema } from "@delicasa/wire/gen/delicasa/device/v1/camera_service_pb";

// MSW mock handler
const response = makeListCamerasResponse({
  cameras: [
    makeCamera({ status: "CAMERA_STATUS_OFFLINE", deviceId: "cam-test-01" }),
    makeCamera({ status: "CAMERA_STATUS_ONLINE", deviceId: "cam-test-02" }),
  ],
  totalCount: 2,
});

// Verify it round-trips through proto deserialization
const msg = fromJson(ListCamerasResponseSchema, response);
expect(msg.cameras).toHaveLength(2);
```
