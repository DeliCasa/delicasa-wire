# Migration Guide: @delicasa/wire v0.3.0 → v0.4.0

**Date**: 2026-03-06

## Breaking Changes

None. v0.4.0 is a backwards-compatible minor release.

## New Features

### 1. Test Fixture Factory Functions (`./testing` export)

v0.4.0 adds a new `./testing` subpath export with typed factory functions for building valid proto JSON fixtures in consumer tests.

**Usage**:

```typescript
import {
  makeCamera,
  makeListCamerasResponse,
  makeCaptureImageResponse,
  makeEvidencePair,
  makeOperationSession,
  makeImage,
} from "@delicasa/wire/testing";

// Default fixture
const camera = makeCamera();

// With overrides
const customCamera = makeCamera({
  deviceId: "my-cam-01",
  label: "Kitchen Camera",
});

// Response-level factory
const response = makeListCamerasResponse({ cameras: [camera, customCamera] });
```

All factory functions return plain objects compatible with `fromJson()` from `@bufbuild/protobuf`:

```typescript
import { fromJson } from "@bufbuild/protobuf";
import { CameraSchema } from "@delicasa/wire/gen/delicasa/device/v1/camera_pb";
import { makeCamera } from "@delicasa/wire/testing";

const json = makeCamera({ deviceId: "test-cam" });
const proto = fromJson(CameraSchema, json as any); // round-trip validated
```

**Available factories**:

| Factory | Returns |
|---------|---------|
| `makeCamera()` | Camera entity |
| `makeCameraHealth()` | CameraHealth entity |
| `makeListCamerasResponse()` | ListCamerasResponse |
| `makeGetCameraResponse()` | GetCameraResponse |
| `makeGetCameraStatusResponse()` | GetCameraStatusResponse |
| `makeReconcileCamerasResponse()` | ReconcileCamerasResponse |
| `makeCaptureImageRequest()` | CaptureImageRequest |
| `makeCaptureImageResponse()` | CaptureImageResponse |
| `makeEvidenceCapture()` | EvidenceCapture entity |
| `makeEvidencePair()` | EvidencePair entity |
| `makeGetEvidencePairResponse()` | GetEvidencePairResponse |
| `makeGetSessionEvidenceResponse()` | GetSessionEvidenceResponse |
| `makeOperationSession()` | OperationSession entity |
| `makeListSessionsResponse()` | ListSessionsResponse |
| `makeGetSessionResponse()` | GetSessionResponse |
| `makeImage()` | Image entity |
| `makeListImagesResponse()` | ListImagesResponse |
| `makeSearchImagesResponse()` | SearchImagesResponse |
| `makeGetPresignedUrlResponse()` | GetPresignedUrlResponse |

**Helpers**:

| Helper | Purpose |
|--------|---------|
| `makeCorrelationId()` | Generates sequential `corr-test-001`, `corr-test-002`, ... |
| `resetCorrelationCounter()` | Resets counter (call in `beforeEach`) |
| `makeTimestamp()` | Returns ISO 8601 timestamp (defaults to `2026-03-06T10:00:00.000Z`) |
| `mergeDefaults()` | Shallow merge with proto JSON semantics (undefined = omit key) |

### 2. Published Fixture JSON Files (`./fixtures/*` export)

Golden vector fixture files are now importable directly from the package:

```typescript
import cameraFixtures from "@delicasa/wire/fixtures/camera-service";
import captureFixtures from "@delicasa/wire/fixtures/capture-service";
import evidenceFixtures from "@delicasa/wire/fixtures/evidence-service";
import sessionFixtures from "@delicasa/wire/fixtures/session-service";
import imageFixtures from "@delicasa/wire/fixtures/image-service";
```

These are canonical proto JSON payloads suitable for MSW mocks, snapshot testing, and format compliance validation.

### 3. New Documentation

| Document | Purpose |
|----------|---------|
| [MQTT_PROTO_MAPPING.md](./MQTT_PROTO_MAPPING.md) | Field-by-field mapping from 4-phase MQTT capture protocol to `CaptureImageResponse` proto |
| [ADR-001-ESP32-STAYS-MQTT.md](./ADR-001-ESP32-STAYS-MQTT.md) | Architecture decision record: ESP32 stays on MQTT (non-negotiable) |

## Upgrade Steps

1. Update dependency:
   ```jsonc
   // package.json
   "@delicasa/wire": "0.4.0"
   ```

2. Run `pnpm install`

3. (Optional) Start using factory functions in tests:
   ```typescript
   import { makeCamera } from "@delicasa/wire/testing";
   ```

4. (Optional) Replace hand-crafted fixture JSON with published fixtures:
   ```typescript
   import fixtures from "@delicasa/wire/fixtures/camera-service";
   ```

No code changes required — all existing imports continue to work.

## tsconfig Requirement

Subpath exports (`./testing`, `./fixtures/*`) require `"moduleResolution": "bundler"` or `"node16"` in your tsconfig. This was already a requirement since v0.2.0.
