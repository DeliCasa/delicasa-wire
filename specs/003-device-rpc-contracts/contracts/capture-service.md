# CaptureService Contract (delicasa.device.v1)

**Proto file**: `proto/delicasa/device/v1/capture_service.proto`
**Implementing repo**: PiOrchestrator
**Base path**: `/rpc/delicasa.device.v1.CaptureService/`
**Auth**: `X-API-Key` header (BridgeServer → PiOrch)

## RPCs

### CaptureImage
| Field | Direction | Type | Description |
|-------|-----------|------|-------------|
| correlation_id | req/res | string | Request tracing ID |
| camera_id | req | string | Target camera device ID |
| idempotency_key | req | string | Dedup key for retries |
| evidence_id | res | string | Generated evidence ID |
| camera_id | res | string | Camera that captured |
| captured_at | res | Timestamp | Capture timestamp |
| content_type | res | string | MIME type (image/jpeg) |
| image_size_bytes | res | int64 | Image file size |
| object_key | res | string | S3/R2 object key (if uploaded) |
| image_data | res | bytes | Raw JPEG (if no S3 configured) |
| upload_status | res | UploadStatus | Upload result |
| cached | res | bool | True if served from idempotency cache |

**Notes**: This RPC triggers a synchronous MQTT capture command to the ESP32 camera, waits for chunked image response, optionally uploads to R2, and returns the result. The `idempotency_key` prevents duplicate captures within a configurable TTL.

## Enums (defined in this file)

### UploadStatus
| Value | Description |
|-------|-------------|
| UPLOAD_STATUS_UNSPECIFIED | Zero value |
| UPLOAD_STATUS_UPLOADED | Successfully uploaded to object storage |
| UPLOAD_STATUS_FAILED | Upload attempt failed |
| UPLOAD_STATUS_UNVERIFIED | Upload not yet verified (async verification pending) |
