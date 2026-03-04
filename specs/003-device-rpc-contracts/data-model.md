# Data Model: Device Connect RPC Contracts v0.3.0

**Date**: 2026-03-04

## Entity Overview

### Existing Entities (modified)

#### EvidenceCapture (delicasa.device.v1)
| Field | Type | Notes |
|-------|------|-------|
| evidence_id | string | Primary identifier |
| capture_tag | CaptureTag enum | BEFORE_OPEN, AFTER_OPEN, BEFORE_CLOSE, AFTER_CLOSE |
| status | CaptureStatus enum | CAPTURED, FAILED, TIMEOUT, PENDING |
| camera_id | string | Device that took the capture |
| captured_at | Timestamp | When the image was captured |
| content_type | string | MIME type (e.g., "image/jpeg") |
| image_size_bytes | int64 | Size of the image |
| object_key | string | S3/R2 object key |
| upload_status | string | **CHANGED from UploadStatus enum** — free-form status |
| session_id | string | Parent session |
| container_id | string | Target container |

#### OperationSession (delicasa.device.v1)
| Field | Type | Notes |
|-------|------|-------|
| session_id | string | Primary identifier |
| container_id | string | Target container |
| status | SessionStatus enum | ACTIVE, COMPLETE, PARTIAL, FAILED |
| started_at | Timestamp | When the session began |
| elapsed_seconds | double | Duration |
| total_captures | int32 | **NEW** — total capture attempts |
| successful_captures | int32 | **NEW** — successful captures |
| failed_captures | int32 | **NEW** — failed captures |
| has_before_open | bool | **NEW** — has before-open evidence |
| has_after_close | bool | **NEW** — has after-close evidence |
| pair_complete | bool | **NEW** — before + after pair is complete |

### New Entities

#### Image (delicasa.v1) — NEW
| Field | Type | Notes |
|-------|------|-------|
| id | string | Image identifier (UUID) |
| object_key | string | S3/R2 object key |
| controller_id | string | Associated controller |
| container_id | string | Associated container |
| session_id | string | Associated capture session |
| capture_tag | string | Capture phase (before_open, after_close, etc.) |
| content_type | string | MIME type |
| size_bytes | int64 | File size |
| width | int32 | Image width in pixels |
| height | int32 | Image height in pixels |
| created_at | Timestamp | When the image was stored |

#### ImageSortField (delicasa.v1) — NEW enum
| Value | Notes |
|-------|-------|
| IMAGE_SORT_FIELD_UNSPECIFIED | Default (by created_at desc) |
| IMAGE_SORT_FIELD_CREATED_AT | Sort by creation time |
| IMAGE_SORT_FIELD_SIZE | Sort by file size |

#### UploadStatus (delicasa.device.v1) — MOVED
| Value | Notes |
|-------|-------|
| UPLOAD_STATUS_UNSPECIFIED | Zero value |
| UPLOAD_STATUS_UPLOADED | Successfully uploaded |
| UPLOAD_STATUS_FAILED | Upload failed |
| UPLOAD_STATUS_UNVERIFIED | Upload not yet verified |

Previously in `evidence.proto`, now in `capture_service.proto` where it belongs.

## Relationships

```
Controller (v1)
  └── Container (v1)
       └── PurchaseSession (v1)
       └── OperationSession (device.v1)
            └── EvidenceCapture (device.v1)
            └── EvidencePair (device.v1)
       └── Camera (device.v1)
       └── Image (v1) — NEW

Image is the client-facing view of stored evidence captures.
EvidenceCapture is the device-layer raw capture record.
```

## State Transitions

### SessionStatus
```
ACTIVE → COMPLETE (all captures succeeded)
ACTIVE → PARTIAL (some captures failed)
ACTIVE → FAILED (session-level failure)
```

### CaptureStatus
```
PENDING → CAPTURED (success)
PENDING → FAILED (camera/network error)
PENDING → TIMEOUT (no response within deadline)
```

### CameraStatus
```
DISCOVERED → PAIRING → CONNECTING → ONLINE
ONLINE → IDLE (no activity)
ONLINE → ERROR (hardware fault)
ONLINE → OFFLINE (lost contact)
ONLINE → REBOOTING (firmware update)
OFFLINE → DISCOVERED (re-appeared on network)
```
