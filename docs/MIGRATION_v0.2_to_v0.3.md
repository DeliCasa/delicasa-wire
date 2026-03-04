# Migration Guide: @delicasa/wire v0.2.0 → v0.3.0

**Date**: 2026-03-04

## Breaking Changes

### 1. UploadStatus Enum Moved

**What changed**: The `UploadStatus` enum was removed from `proto/delicasa/device/v1/evidence.proto` and relocated to `proto/delicasa/device/v1/capture_service.proto`.

**Why**: `UploadStatus` is a capture concern, not an evidence concern. Evidence consumers shouldn't need to import capture-layer types.

**Migration**:

```typescript
// Before (v0.2.0)
import { UploadStatus } from "@delicasa/wire/gen/delicasa/device/v1/evidence_pb";

// After (v0.3.0)
import { UploadStatus } from "@delicasa/wire/gen/delicasa/device/v1/capture_service_pb";
```

### 2. EvidenceCapture.upload_status Type Changed

**What changed**: The `upload_status` field on `EvidenceCapture` changed from `UploadStatus` enum to `string`.

**Why**: Evidence captures may have upload statuses set by external pipelines that don't map to the enum. String provides flexibility.

**Migration**:

```typescript
// Before (v0.2.0) — enum comparison
if (capture.uploadStatus === UploadStatus.UPLOADED) { ... }

// After (v0.3.0) — string comparison
if (capture.uploadStatus === "uploaded") { ... }
```

**Wire compatibility**: The JSON wire format is compatible (proto3 enums serialize as strings). Only TypeScript types change.

---

## New Additions

### New Services

| Service | Package | RPCs | Proto File |
|---------|---------|------|------------|
| CameraService | delicasa.device.v1 | ListCameras, GetCamera, GetCameraStatus, ReconcileCameras | camera_service.proto |
| CaptureService | delicasa.device.v1 | CaptureImage | capture_service.proto |
| EvidenceService | delicasa.device.v1 | GetEvidencePair, GetSessionEvidence | evidence_service.proto |
| SessionService | delicasa.device.v1 | ListSessions, GetSession | session_service.proto |
| ImageService | delicasa.v1 | ListImages, SearchImages, GetPresignedUrl | image_service.proto |

### New Entities

| Entity | Package | Proto File |
|--------|---------|------------|
| Image | delicasa.v1 | image.proto |
| ImageSortField (enum) | delicasa.v1 | image.proto |
| UploadStatus (enum) | delicasa.device.v1 | capture_service.proto (moved) |

### Modified Messages

| Message | Changes |
|---------|---------|
| OperationSession | Added: total_captures, successful_captures, failed_captures, has_before_open, has_after_close, pair_complete |
| EvidenceCapture | upload_status changed from UploadStatus enum to string |

### Golden Test Vectors

New `tests/vectors/` directory with JSON fixtures for all services:
- `tests/vectors/fixtures/camera-service.json`
- `tests/vectors/fixtures/capture-service.json`
- `tests/vectors/fixtures/evidence-service.json`
- `tests/vectors/fixtures/session-service.json`
- `tests/vectors/fixtures/image-service.json`

Use these for MSW mocks and unit tests. Key conventions:
- Enum values use proto JSON string form (e.g., `"CAMERA_STATUS_ONLINE"`)
- Absent Timestamp fields are omitted (never empty string or epoch zero)
- All messages include `correlationId`

---

## Upgrade Steps

### All Consumer Repos

1. Update dependency:
   ```bash
   pnpm add @delicasa/wire@0.3.0
   ```

2. Regenerate TypeScript (if using generated types):
   ```bash
   cd node_modules/@delicasa/wire && pnpm gen
   ```

3. Ensure tsconfig has: `"moduleResolution": "bundler"` or `"node16"`

### BridgeServer Specific

1. Update import for `UploadStatus` (see breaking change #1)
2. Update any `EvidenceCapture.uploadStatus` comparisons to use string (see breaking change #2)
3. Implement new ImageService Connect handler (3 RPCs)
4. Implement device service proxy to PiOrchestrator (9 RPCs)

### NextClient Specific

1. Replace `HttpImageRepository` stubs with Connect client using `ImageService` descriptor
2. Update import for `UploadStatus` if used
3. Copy golden test vectors to MSW mock handlers
4. Remove any hand-rolled type definitions that duplicate proto-generated types

### PiDashboard Specific

1. Import device service descriptors for camera/session/evidence views
2. Replace any manual fetch calls with Connect client calls
3. Use golden test vectors for component tests

### PiOrchestrator Specific (Go — no npm dependency)

1. Implement Connect handlers for all 9 device service RPCs
2. Reference proto files as canonical contract
3. Use `tests/vectors/fixtures/` JSON as golden test inputs for Go tests

### EspCamV2 Specific (C++ — no npm dependency)

1. No code changes needed
2. MQTT message format unchanged
3. Reference Zod schemas and golden vectors for format compliance

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-03-02 | Initial gRPC-first contracts (ControllerService, ContainerAccessService, PurchaseSessionService) |
| 0.2.0 | 2026-03-03 | Unified wire contracts: device message protos, Zod schemas, MQTT schemas |
| 0.3.0 | 2026-03-04 | Device Connect RPC services, ImageService, golden test vectors, handoff matrix |
