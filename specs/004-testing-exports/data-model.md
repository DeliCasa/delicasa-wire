# Data Model: Testing Exports & Documentation Polish

**Feature**: 004-testing-exports
**Date**: 2026-03-06

## Entities

This feature doesn't introduce new proto entities. It creates **factory functions** that produce instances of existing proto JSON entities. The entities below are the factory targets.

### Factory Target: Camera (from camera.proto)

| Field | Proto JSON Key | Default Value | Override Type |
|-------|---------------|---------------|---------------|
| deviceId | `deviceId` | `"esp32-cam-test-001"` | `string` |
| name | `name` | `"Test Camera"` | `string` |
| status | `status` | `"CAMERA_STATUS_ONLINE"` | Enum string |
| containerId | `containerId` | `"container-test-001"` | `string` |
| position | `position` | `1` | `number` |
| lastSeen | `lastSeen` | Current ISO timestamp | `string` (ISO 8601) |
| health | `health` | `undefined` (absent) | Nested object or `undefined` |
| ipAddress | `ipAddress` | `"192.168.10.101"` | `string` |
| macAddress | `macAddress` | `"AA:BB:CC:DD:EE:01"` | `string` |

### Factory Target: CameraHealth (from camera.proto)

| Field | Proto JSON Key | Default Value | Override Type |
|-------|---------------|---------------|---------------|
| wifiRssi | `wifiRssi` | `-45` | `number` |
| freeHeap | `freeHeap` | `"125000"` | `string` (int64) |
| uptimeSeconds | `uptimeSeconds` | `"3600"` | `string` (int64) |
| firmwareVersion | `firmwareVersion` | `"2.1.0"` | `string` |
| resolution | `resolution` | `"1600x1200"` | `string` |
| lastCapture | `lastCapture` | `undefined` (absent) | `string` (ISO 8601) or `undefined` |

### Factory Target: EvidenceCapture (from evidence.proto)

| Field | Proto JSON Key | Default Value | Override Type |
|-------|---------------|---------------|---------------|
| evidenceId | `evidenceId` | `"ev-test-001"` | `string` |
| captureTag | `captureTag` | `"CAPTURE_TAG_BEFORE_OPEN"` | Enum string |
| status | `status` | `"CAPTURE_STATUS_CAPTURED"` | Enum string |
| cameraId | `cameraId` | `"esp32-cam-test-001"` | `string` |
| capturedAt | `capturedAt` | Current ISO timestamp | `string` (ISO 8601) |
| contentType | `contentType` | `"image/jpeg"` | `string` |
| imageSizeBytes | `imageSizeBytes` | `"245760"` | `string` (int64) |
| objectKey | `objectKey` | `"evidence/test/ev-test-001.jpg"` | `string` |
| uploadStatus | `uploadStatus` | `"uploaded"` | `string` |
| sessionId | `sessionId` | `"session-test-001"` | `string` |
| containerId | `containerId` | `"container-test-001"` | `string` |

### Factory Target: EvidencePair (from evidence.proto)

| Field | Proto JSON Key | Default Value | Override Type |
|-------|---------------|---------------|---------------|
| contractVersion | `contractVersion` | `"v1"` | `string` |
| sessionId | `sessionId` | `"session-test-001"` | `string` |
| containerId | `containerId` | `"container-test-001"` | `string` |
| pairStatus | `pairStatus` | `"EVIDENCE_PAIR_STATUS_COMPLETE"` | Enum string |
| before | `before` | `makeEvidenceCapture()` result | Nested or `undefined` |
| after | `after` | `makeEvidenceCapture({captureTag: "CAPTURE_TAG_AFTER_CLOSE"})` | Nested or `undefined` |
| queriedAt | `queriedAt` | Current ISO timestamp | `string` (ISO 8601) |
| retryAfterSeconds | `retryAfterSeconds` | `0` | `number` |

### Factory Target: OperationSession (from session.proto)

| Field | Proto JSON Key | Default Value | Override Type |
|-------|---------------|---------------|---------------|
| sessionId | `sessionId` | `"session-test-001"` | `string` |
| containerId | `containerId` | `"container-test-001"` | `string` |
| status | `status` | `"SESSION_STATUS_COMPLETE"` | Enum string |
| startedAt | `startedAt` | Current ISO timestamp | `string` (ISO 8601) |
| endedAt | `endedAt` | `undefined` (absent) | `string` or `undefined` |
| totalCaptures | `totalCaptures` | `2` | `number` |
| successfulCaptures | `successfulCaptures` | `2` | `number` |
| failedCaptures | `failedCaptures` | `0` | `number` |
| hasBeforeOpen | `hasBeforeOpen` | `true` | `boolean` |
| hasAfterClose | `hasAfterClose` | `true` | `boolean` |
| pairComplete | `pairComplete` | `true` | `boolean` |

### Factory Target: CaptureImageRequest/Response (from capture_service.proto)

**Request defaults**: correlationId auto-generated, cameraId `"esp32-cam-test-001"`, idempotencyKey `"idem-test-001"`.

**Response defaults**: All required fields populated, `uploadStatus` as `"UPLOAD_STATUS_UPLOADED"`, `cached` as `false`.

### Factory Target: Image (from image.proto)

| Field | Proto JSON Key | Default Value | Override Type |
|-------|---------------|---------------|---------------|
| id | `id` | `"img-test-001"` | `string` |
| objectKey | `objectKey` | `"evidence/test/ev-test-001.jpg"` | `string` |
| controllerId | `controllerId` | `"ctrl-test-001"` | `string` |
| containerId | `containerId` | `"container-test-001"` | `string` |
| sessionId | `sessionId` | `"session-test-001"` | `string` |
| captureTag | `captureTag` | `"before_open"` | `string` |
| contentType | `contentType` | `"image/jpeg"` | `string` |
| sizeBytes | `sizeBytes` | `"245760"` | `string` (int64) |
| width | `width` | `1600` | `number` |
| height | `height` | `1200` | `number` |
| createdAt | `createdAt` | Current ISO timestamp | `string` (ISO 8601) |

## Relationships

Factory functions compose:
- `makeListCamerasResponse()` internally calls `makeCamera()` for each camera in the list
- `makeEvidencePair()` internally calls `makeEvidenceCapture()` for before/after
- `makeListSessionsResponse()` internally calls `makeOperationSession()` for each session
- Response wrappers always include a `correlationId` via `makeCorrelationId()`
