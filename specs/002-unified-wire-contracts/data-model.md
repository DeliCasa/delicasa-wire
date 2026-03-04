# Data Model: Unified Wire Contracts v0.2.0

## Entity Map

### HTTP Boundary Entities (BridgeServer ↔ PiOrchestrator)

#### PiOrchContainerActionRequest
- `action`: enum `"open"` | `"close"` (required)
- `correlation_id`: string (required)

#### PiOrchContainerActionResponse (discriminated union on `status`)
**Success variant** (`status: "success"`):
- `status`: literal `"success"`
- `action_id`: string (required)
- `container_id`: string (required)
- `session_id`: string (optional)
- `before_captures`: array of BridgeEvidenceCapture
- `after_captures`: array of BridgeEvidenceCapture

**Error variant** (`status: "error"`):
- `status`: literal `"error"`
- `action_id`: string (optional)
- `error.error_code`: string enum (CONTAINER_NOT_FOUND, CONTAINER_BUSY,
  ACTUATION_FAILED, CAPTURE_FAILED, SERVICE_UNAVAILABLE, TIMEOUT,
  NETWORK_ERROR, INVALID_RESPONSE, NO_ONLINE_CAMERAS, INTERNAL_ERROR)
- `error.retryable`: boolean
- `error.retry_after`: number (optional, seconds)

#### BridgeEvidenceCapture
- `camera_id`: string (required)
- `captured_at`: ISO8601 string (required)
- `content_type`: string (required, default `"image/jpeg"`)
- `capture_reason`: CaptureTag enum (required)
- `capture_tag`: CaptureTag enum (required, same as capture_reason)
- `status`: enum `"captured"` | `"failed"` | `"timeout"` (required)
- `evidence_id`: string (required)
- `image_data`: base64 string (optional)
- `device_id`: string (optional)
- `container_id`: string (optional)
- `session_id`: string (optional)
- `object_key`: string (optional)
- `upload_status`: enum `"uploaded"` | `"failed"` | `"unverified"` (optional)
- `error_message`: string (optional)

#### PiOrchEvidencePair
- `contract_version`: literal `"v1"` (required)
- `session_id`: string (required)
- `container_id`: string (required)
- `pair_status`: enum `"complete"` | `"incomplete"` | `"missing"` (required)
- `before`: PairCapture (required)
- `after`: PairCapture (required)
- `queried_at`: ISO8601 string (required)
- `retry_after_seconds`: number (optional)
- `liveness_proof`: LivenessProof (optional)

#### PairCapture
- `evidence_id`: string (required)
- `capture_tag`: enum `"BEFORE_OPEN"` | `"AFTER_CLOSE"` (required)
- `status`: enum `"captured"` | `"failed"` | `"timeout"` | `"pending"` (required)
- `image_size_bytes`: non-negative integer (required)
- `missing_reason`: string (optional)
- `failure_detail`: string (optional)
- `device_id`: string (optional)
- `container_id`: string (optional)
- `session_id`: string (optional)
- `captured_at`: ISO8601 string (optional)
- `content_type`: string (optional)
- `image_data`: base64 string (optional)
- `object_key`: string (optional)
- `upload_status`: enum `"uploaded"` | `"failed"` | `"unverified"` (optional)

#### LivenessProof
- `method`: enum `"uptime_advance"` | `"probe_responded"` (required)
- `capture_ready`: boolean (required)
- `probe_1_uptime_s`: number (optional)
- `probe_2_uptime_s`: number (optional)
- `delta_s`: number (optional)
- `probe_latency_ms`: non-negative integer (optional)
- `free_heap`: non-negative integer (optional)
- `wifi_rssi`: integer max 0 (optional)

### Camera & Session Entities (PiDashboard ↔ PiOrchestrator)

#### PiOrchCamera
- `device_id`: string (required, canonical)
- `id`: string (optional, deprecated alias for device_id)
- `name`: string (optional)
- `status`: enum 8 values (required)
- `last_seen`: ISO8601 string (required)
- `container_id`: string (required)
- `health`: PiOrchCameraHealth (optional)
- `ip_address`: string (optional)
- `mac_address`: string (optional)
- `position`: integer 1-4 (optional)

#### PiOrchCameraHealth
- `wifi_rssi`: integer max 0 (required)
- `free_heap`: non-negative integer (required)
- `uptime`: string or number (optional, legacy)
- `uptime_seconds`: non-negative integer (optional)
- `resolution`: string (optional)
- `firmware_version`: string (optional)
- `last_capture`: ISO8601 string (optional)

#### PiOrchSession
- `session_id`: string (required)
- `status`: enum `"active"` | `"complete"` | `"partial"` | `"failed"` (required)
- `started_at`: ISO8601 string (required)
- `elapsed_seconds`: number (required)
- `container_id`: string (optional)

#### CapturedEvidence (PiDashboard manual capture)
- `image_base64`: base64 string (required)
- `content_type`: string (required)
- `camera_id`: string (required)
- `captured_at`: ISO8601 string (required)

### MQTT Protocol Entities (EspCamV2 ↔ PiOrchestrator)

#### MqttCameraCommand
- `action`: enum 6 values (required)
- `request_id`: string (required)
- `correlation_id`: string (optional)
- `session_id`: string (optional)
- `phase`: string (optional)
- `resolution`: string (optional)

#### MqttCaptureAck
- `request_id`: string (required)
- `device_id`: string (required)
- `action`: literal `"capture"` (required)
- `status`: literal `"in_progress"` (required)
- `timestamp`: ISO8601 string (required)
- `correlation_id`: string (optional)
- `session_id`: string (optional)
- `phase`: string (optional)

#### MqttCaptureInfo
- `request_id`: string (required)
- `device_id`: string (required)
- `success`: boolean (required)
- `image_size`: non-negative integer (required)
- `content_type`: string (required)
- `total_size`: non-negative integer (required)
- `total_chunks`: positive integer (required)
- `timestamp`: ISO8601 string (required)
- `timings`: { capture_ms, validate_ms, encode_ms } (required)
- `correlation_id`: string (optional)
- `session_id`: string (optional)
- `phase`: string (optional)

#### MqttCaptureChunk
- `request_id`: string (required)
- `chunk_index`: non-negative integer (required)
- `chunk_data`: base64 string (required)

#### MqttCaptureComplete
- `request_id`: string (required)
- `success`: boolean (required)
- `chunks_sent`: non-negative integer (required)
- `device_id`: string (required)
- `status`: literal `"complete"` (required)
- `total_chunks`: positive integer (required)
- `timestamp`: ISO8601 string (required)
- `timings`: { total_ms, capture_ms, validate_ms, encode_ms, publish_ms } (required)
- `correlation_id`: string (optional)
- `session_id`: string (optional)
- `phase`: string (optional)

#### MqttCaptureResponse (discriminated union on `success`)
**Success variant**: request_id, device_id, status: "complete", timestamp
**Failure variant**: error fields, optional retry_after_ms, diagnostics

#### MqttCameraStatus (heartbeat)
- `device_id`: string (required)
- `timestamp`: ISO8601 string (required)
- New fields: `state`, `uptime_ms`, `free_heap_bytes`, `rssi_dbm`,
  `camera_initialized`, `capture_ready` (all optional)
- Legacy fields: `status`, `heap`, `wifi_rssi`, `uptime`,
  `secure_connection`, `message_count` (all optional)

#### MqttCameraLwt
- `device_id`: string (required)
- `state`: literal `"OFFLINE"` (required)
- `timestamp`: ISO8601 string (required)
- `reason`: string (optional)

## Entity Relationships

```
PiOrchContainerActionResponse
  └── has many → BridgeEvidenceCapture (before_captures, after_captures)

PiOrchEvidencePair
  ├── has one → PairCapture (before)
  ├── has one → PairCapture (after)
  └── has one? → LivenessProof

PiOrchCameraListResponse
  └── has many → PiOrchCamera
                    └── has one? → PiOrchCameraHealth

PiOrchSessionListResponse
  └── has many → PiOrchSession

MqttCameraCommand ──triggers──→ MqttCaptureAck ──→ MqttCaptureInfo
                                                       ──→ MqttCaptureChunk (×N)
                                                       ──→ MqttCaptureComplete
```
