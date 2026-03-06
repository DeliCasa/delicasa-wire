# Data Model: Client-Facing Capture Proxy Service

**Feature**: 005-client-capture-proxy
**Date**: 2026-03-06

## Proto Entities

### CaptureRequestStatus (enum)

Client-visible lifecycle states for a capture request.

| Value | Number | Description |
|-------|--------|-------------|
| `CAPTURE_REQUEST_STATUS_UNSPECIFIED` | 0 | Default/unknown |
| `CAPTURE_REQUEST_STATUS_ACCEPTED` | 1 | BridgeServer forwarded request to PiOrchestrator; capture in progress |
| `CAPTURE_REQUEST_STATUS_COMPLETED` | 2 | Capture succeeded; evidence fields populated |
| `CAPTURE_REQUEST_STATUS_FAILED` | 3 | Capture failed (device error, chunk mismatch, etc.) |
| `CAPTURE_REQUEST_STATUS_TIMEOUT` | 4 | PiOrchestrator did not respond within timeout |

### ClientUploadStatus (enum)

Client-visible image upload state. Mirrors device-layer `UploadStatus` values.

| Value | Number | Description |
|-------|--------|-------------|
| `CLIENT_UPLOAD_STATUS_UNSPECIFIED` | 0 | Default/unknown |
| `CLIENT_UPLOAD_STATUS_UPLOADED` | 1 | Image stored in R2; `object_key` available |
| `CLIENT_UPLOAD_STATUS_FAILED` | 2 | Upload to R2 failed |
| `CLIENT_UPLOAD_STATUS_UNVERIFIED` | 3 | Image captured but not yet uploaded/verified |

### RequestCaptureRequest (message)

| Field | Type | Number | Required | Description |
|-------|------|--------|----------|-------------|
| `correlation_id` | string | 1 | Yes | Client-supplied tracing ID |
| `controller_id` | string | 2 | Yes | Target controller |
| `capture_tag` | string | 3 | Yes | Evidence phase: `"CAPTURE_TAG_BEFORE_OPEN"`, `"CAPTURE_TAG_AFTER_CLOSE"`, etc. |
| `idempotency_key` | string | 4 | Yes | Request deduplication key |
| `session_id` | string | 5 | No | Optional session context for evidence linking |

### RequestCaptureResponse (message)

| Field | Type | Number | Required | Description |
|-------|------|--------|----------|-------------|
| `correlation_id` | string | 1 | Yes | Echo of request correlation ID |
| `request_id` | string | 2 | Yes | BridgeServer-generated capture request ID |
| `status` | CaptureRequestStatus | 3 | Yes | Current capture lifecycle state |
| `evidence_id` | string | 4 | Conditional | Present when status = COMPLETED |
| `camera_id` | string | 5 | Conditional | Camera that performed the capture |
| `captured_at` | Timestamp | 6 | Conditional | When the image was captured |
| `content_type` | string | 7 | Conditional | Image MIME type (e.g., `image/jpeg`) |
| `image_size_bytes` | int64 | 8 | Conditional | Image file size |
| `object_key` | string | 9 | Conditional | R2 storage key |
| `upload_status` | ClientUploadStatus | 10 | Conditional | Image upload state |
| `cached` | bool | 11 | Yes | True if served from idempotency cache |

### GetCaptureStatusRequest (message)

| Field | Type | Number | Required | Description |
|-------|------|--------|----------|-------------|
| `correlation_id` | string | 1 | Yes | Client-supplied tracing ID |
| `request_id` | string | 2 | Yes | The capture request ID from `RequestCaptureResponse` |

### GetCaptureStatusResponse (message)

| Field | Type | Number | Required | Description |
|-------|------|--------|----------|-------------|
| `correlation_id` | string | 1 | Yes | Echo of request correlation ID |
| `request_id` | string | 2 | Yes | The capture request ID |
| `status` | CaptureRequestStatus | 3 | Yes | Current capture lifecycle state |
| `evidence_id` | string | 4 | Conditional | Present when status = COMPLETED |
| `camera_id` | string | 5 | Conditional | Camera that performed the capture |
| `captured_at` | Timestamp | 6 | Conditional | When the image was captured |
| `content_type` | string | 7 | Conditional | Image MIME type |
| `image_size_bytes` | int64 | 8 | Conditional | Image file size |
| `object_key` | string | 9 | Conditional | R2 storage key |
| `upload_status` | ClientUploadStatus | 10 | Conditional | Image upload state |

## Factory Function Targets

| Factory | Returns | Default Override Fields |
|---------|---------|----------------------|
| `makeRequestCaptureRequest()` | RequestCaptureRequest JSON | `controllerId`, `captureTag`, `idempotencyKey`, `sessionId` |
| `makeRequestCaptureResponse()` | RequestCaptureResponse JSON (COMPLETED) | `requestId`, `status`, `evidenceId`, `objectKey`, `uploadStatus` |
| `makeGetCaptureStatusRequest()` | GetCaptureStatusRequest JSON | `requestId` |
| `makeGetCaptureStatusResponse()` | GetCaptureStatusResponse JSON (COMPLETED) | `requestId`, `status`, `evidenceId`, `objectKey` |

## Golden Vector Fixture Keys

File: `tests/vectors/fixtures/client-capture-service.json`

| Key | Description |
|-----|-------------|
| `RequestCaptureRequest` | Default request fixture |
| `RequestCaptureResponse` | Completed capture response fixture |
| `GetCaptureStatusRequest` | Status poll request fixture |
| `GetCaptureStatusResponse` | Completed status response fixture |

## Relationships

```
NextClient → delicasa.v1.CaptureService.RequestCapture → BridgeServer
BridgeServer → delicasa.device.v1.CaptureService.CaptureImage → PiOrchestrator
PiOrchestrator → MQTT 4-phase protocol → ESP32
```

`RequestCaptureResponse` fields map to `delicasa.device.v1.CaptureImageResponse`:
- `evidence_id` ← `CaptureImageResponse.evidence_id`
- `camera_id` ← `CaptureImageResponse.camera_id`
- `captured_at` ← `CaptureImageResponse.captured_at`
- `content_type` ← `CaptureImageResponse.content_type`
- `image_size_bytes` ← `CaptureImageResponse.image_size_bytes`
- `object_key` ← `CaptureImageResponse.object_key`
- `upload_status` ← mapped from `UploadStatus` to `ClientUploadStatus`
- `cached` ← `CaptureImageResponse.cached`
