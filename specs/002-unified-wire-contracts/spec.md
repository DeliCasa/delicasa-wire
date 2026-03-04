# Feature Specification: Unified Wire Contracts v0.2.0

**Feature Branch**: `002-unified-wire-contracts`
**Created**: 2026-03-03
**Status**: Draft
**Input**: EPIC: delicasa-wire v0.2.0 — unified contracts for all service boundaries

## User Scenarios & Testing

### User Story 1 - BridgeServer Validates PiOrchestrator Responses (Priority: P1)

A developer working on BridgeServer imports Zod schemas from `@delicasa/wire/zod`
to validate HTTP responses from PiOrchestrator at the trust boundary — container
action responses and evidence pair responses. This replaces in-codebase schemas
like `piorch-evidence-pair.schemas.ts`.

**Why this priority**: Container action and evidence pair endpoints are on the
critical purchase path. Mismatched contracts cause purchase failures and audit
data corruption.

**Independent Test**: Import schemas, parse representative JSON fixtures (success,
error, incomplete pair), confirm typed parse results match expected shapes.

**Acceptance Scenarios**:

1. **Given** a valid container action success response with before/after captures,
   **When** parsed with `PiOrchContainerActionResponseSchema`, **Then** result is
   typed with all fields present and discriminated union resolves to success variant.
2. **Given** a container action error response with `status: "error"` and an error
   object, **When** parsed, **Then** discriminated union resolves to error variant
   with `error_code`, `retryable`, and optional `retry_after`.
3. **Given** a valid evidence pair response with `pair_status: "complete"`,
   **When** parsed with `PiOrchEvidencePairSchema`, **Then** both `before` and
   `after` captures are present with all required fields typed.
4. **Given** an evidence pair with `pair_status: "incomplete"` and
   `retry_after_seconds: 10`, **When** parsed, **Then** retry field is present
   and typed as number.
5. **Given** a malformed response missing the required `status` field,
   **When** parsed with `safeParse`, **Then** structured Zod error returned.

---

### User Story 2 - PiDashboard Validates Camera and Session Data (Priority: P2)

A developer building the PiDashboard imports camera and session schemas from
`@delicasa/wire/zod` to validate responses from PiOrchestrator. This replaces
in-codebase schemas like `v1-cameras-schemas.ts`.

**Why this priority**: Camera status is the primary diagnostic indicator for
operators. Sessions are the primary operational unit for the dashboard.

**Independent Test**: Import schemas, parse camera list and session list fixtures
with various statuses, confirm all status variants are accepted.

**Acceptance Scenarios**:

1. **Given** a camera list response with cameras in various statuses (online,
   offline, rebooting, discovered), **When** parsed with
   `PiOrchCameraListResponseSchema`, **Then** all status variants are accepted
   and health data is typed correctly.
2. **Given** a session list with sessions in `active`, `complete`, `partial`,
   `failed` statuses, **When** parsed with `PiOrchSessionListResponseSchema`,
   **Then** all statuses validate and `elapsed_seconds` is typed as number.
3. **Given** a camera with an unknown status not in the enum, **When** parsed
   with `safeParse`, **Then** validation error identifies the invalid status.

---

### User Story 3 - MQTT Protocol Schemas for EspCamV2 Communication (Priority: P2)

A developer imports MQTT message schemas from `@delicasa/wire/zod` to validate
or document the 4-part EspCamV2 capture protocol (ACK, info, chunks, complete),
heartbeat/LWT messages, and command messages. This provides a machine-readable
contract for the MQTT topic families.

**Why this priority**: The MQTT protocol is currently undocumented outside C++
and Go source code. Typed schemas make the protocol inspectable and testable
from TypeScript.

**Independent Test**: Import each MQTT schema and parse sample payloads,
confirming type inference matches what PiOrchestrator's Go adapter expects.

**Acceptance Scenarios**:

1. **Given** a capture ACK payload, **When** parsed with `MqttCaptureAckSchema`,
   **Then** all required fields typed correctly, optional fields may be absent.
2. **Given** a capture info payload with `total_chunks: 12` and `timings`,
   **When** parsed with `MqttCaptureInfoSchema`, **Then** timings fields are
   typed as numbers.
3. **Given** a chunk payload with `chunk_index: 3`, **When** parsed with
   `MqttCaptureChunkSchema`, **Then** chunk_index is a non-negative integer.
4. **Given** a capture complete payload, **When** parsed with
   `MqttCaptureCompleteSchema`, **Then** all timing fields present and typed.
5. **Given** a camera status heartbeat with both legacy `status` and new `state`,
   **When** parsed with `MqttCameraStatusSchema`, **Then** both are accepted as
   optional variants.
6. **Given** an error response with `error_category: "busy"` and `retry_after_ms`,
   **When** parsed with `MqttCaptureResponseSchema`, **Then** retry field typed
   as number.

---

### User Story 4 - MQTT Topic Builder Helpers (Priority: P3)

A developer imports `MqttTopics` from `@delicasa/wire/zod` to get typed topic
builder functions, replacing string literals scattered across codebases.

**Why this priority**: Topic string correctness is required for MQTT routing,
but the current system works. This is formalization, not a fix.

**Independent Test**: Import topic builder functions, assert produced strings
match patterns expected by PiOrchestrator's MQTT subscription handler.

**Acceptance Scenarios**:

1. **Given** a request_id and subtopic "ack", **When** calling
   `MqttTopics.cameraResponse(requestId, "ack")`, **Then** result is
   `camera/response/{requestId}/ack`.
2. **Given** a device_id, **When** calling `MqttTopics.cameraStatus(deviceId)`,
   **Then** result is `camera/status/{deviceId}`.
3. **Given** a container_id, MAC, and subtopic, **When** calling
   `MqttTopics.containerCamera(containerId, mac, "capture")`, **Then** result
   is `delicasa/{containerId}/camera/{mac}/capture`.

---

### User Story 5 - Device Proto Package for Language-Agnostic Types (Priority: P3)

New proto files under `proto/delicasa/v1/device/` define Camera, Session, and
Evidence entities in protobuf IDL, enabling future gRPC bridges and Go codegen.
v0.2.0 defines message types only — no gRPC service definitions yet.

**Why this priority**: Proto definitions are additive documentation. The Zod
schemas are the primary runtime deliverable. Proto definitions enable future
Go codegen and cross-language contract enforcement.

**Independent Test**: `buf lint` and `buf generate` succeed for the new package.
Generated TypeScript types compile without errors.

**Acceptance Scenarios**:

1. **Given** the new proto files in `proto/delicasa/v1/device/`, **When** running
   `buf lint`, **Then** zero warnings.
2. **Given** the new proto files, **When** running `buf generate`, **Then**
   TypeScript types are generated in `gen/ts/delicasa/v1/device/`.
3. **Given** the new proto files alongside existing v1 protos, **When** running
   `buf breaking`, **Then** no breaking changes detected (all additions).

---

### Edge Cases

- PiOrchestrator response has both `status: "success"` and a non-null `error`
  object: discriminated union resolves to success variant, error ignored.
- `captured_at` is empty string vs null vs absent: schema rejects empty strings,
  accepts absent optional fields.
- `image_data` is empty base64 string vs absent for failed capture: schema
  allows absent (failed captures have no image data).
- Chunk arrives with negative `chunk_index`: schema validates `>= 0`.
- Camera heartbeat has both legacy `status` and new `state`: schema accepts
  both as optional, consumer prefers `state`.
- `retry_after_seconds` is 0 vs absent: schema treats differently (0 = retry
  immediately, absent = session complete).
- `upload_status` is `"unverified"`: included as valid enum value.
- Camera `position` is 0 or 5 (outside 1-4 range): schema rejects.

## Requirements

### Functional Requirements

**PiOrchestrator HTTP Boundary Schemas**

- **FR-001**: Package MUST export `PiOrchContainerActionRequestSchema` with
  fields: `action` (`"open"` | `"close"`), `correlation_id` (string).
- **FR-002**: Package MUST export `PiOrchContainerActionResponseSchema` as
  discriminated union on `status` (`"success"` | `"error"`). Success variant
  includes `action_id`, `container_id`, `session_id` (optional),
  `before_captures`, `after_captures` arrays. Error variant includes `error`
  object with `error_code`, `retryable`, `retry_after` (optional).
- **FR-003**: Package MUST export `BridgeEvidenceCaptureSchema` with fields:
  `camera_id`, `captured_at` (ISO8601), `content_type`, `capture_reason` /
  `capture_tag` (enum), `status` (`"captured"` | `"failed"` | `"timeout"`),
  `evidence_id`, and optional fields for `image_data`, `device_id`,
  `container_id`, `session_id`, `object_key`, `upload_status`, `error_message`.
- **FR-004**: Package MUST export `PiOrchEvidencePairSchema` with fields:
  `contract_version` (literal `"v1"`), `session_id`, `container_id`,
  `pair_status` (`"complete"` | `"incomplete"` | `"missing"`), `before`/`after`
  (PairCapture), `queried_at`, optional `retry_after_seconds` and
  `liveness_proof`.
- **FR-005**: Package MUST export `PairCaptureSchema` with fields: `evidence_id`,
  `capture_tag`, `status` (captured/failed/timeout/pending), `image_size_bytes`,
  and optional metadata fields.
- **FR-006**: Package MUST export `PiOrchCameraSchema` with fields: `device_id`,
  `status` (8-value enum), `last_seen`, `container_id`, optional `health`,
  `name`, `ip_address`, `mac_address`, `position` (1-4), `id` (deprecated alias).
- **FR-007**: Package MUST export `PiOrchCameraHealthSchema` with fields:
  `wifi_rssi` (max 0), `free_heap` (non-negative), and optional `uptime`,
  `uptime_seconds`, `resolution`, `firmware_version`, `last_capture`.
- **FR-008**: Package MUST export `PiOrchCameraListResponseSchema` wrapping
  cameras array in `{ success, data: { cameras } }` envelope.
- **FR-009**: Package MUST export `PiOrchSessionSchema` with fields: `session_id`,
  `status` (active/complete/partial/failed), `started_at`, `elapsed_seconds`,
  optional `container_id`.
- **FR-010**: Package MUST export `PiOrchSessionListResponseSchema`.
- **FR-011**: Package MUST export `PiOrchEvidencePairLivenessProofSchema` with
  fields: `method`, optional probe/capture/heap fields.
- **FR-012**: Package MUST export `CapturedEvidenceSchema` for PiDashboard manual
  capture: `image_base64`, `content_type`, `camera_id`, `captured_at`.
- **FR-013**: Package MUST export `STALE_THRESHOLD_SECONDS = 300` as named constant.

**MQTT Protocol Schemas**

- **FR-014**: Package MUST export `MqttCameraCommandSchema` with `action` (6-value
  enum), `request_id`, and optional `correlation_id`, `session_id`, `phase`,
  `resolution`.
- **FR-015**: Package MUST export `MqttCaptureAckSchema` with `request_id`,
  `device_id`, `action: "capture"`, `status: "in_progress"`, `timestamp`, and
  optional correlation/session/phase fields.
- **FR-016**: Package MUST export `MqttCaptureInfoSchema` with `request_id`,
  `device_id`, `success`, image metadata, `total_chunks`, `timings` object,
  and optional correlation/session/phase fields.
- **FR-017**: Package MUST export `MqttCaptureChunkSchema` with `request_id`,
  `chunk_index` (non-negative integer), `chunk_data` (base64 string).
- **FR-018**: Package MUST export `MqttCaptureCompleteSchema` with `request_id`,
  `success`, `chunks_sent`, `device_id`, `total_chunks`, `timings` object with
  5 fields, and optional correlation/session/phase fields.
- **FR-019**: Package MUST export `MqttCaptureResponseSchema` for single-message
  responses — discriminated union on `success`. Failure variant includes error
  fields, optional `retry_after_ms`, optional `diagnostics`.
- **FR-020**: Package MUST export `MqttCameraStatusSchema` with `device_id`,
  `timestamp`, and optional fields for both new (`state`, `uptime_ms`,
  `free_heap_bytes`, `rssi_dbm`) and legacy (`status`, `heap`, `wifi_rssi`,
  `uptime`) formats.
- **FR-021**: Package MUST export `MqttCameraLwtSchema` with `device_id`,
  `state: "OFFLINE"`, `timestamp`, optional `reason`.
- **FR-022**: Package MUST export `MqttTopics` namespace with typed topic builder
  functions and `VALIDATION_ERROR` constant.

**Proto Layer**

- **FR-023**: Package MUST add `proto/delicasa/v1/device/camera.proto` with
  `CameraStatus` enum, `Camera` message, `CameraHealth` message.
- **FR-024**: Package MUST add `proto/delicasa/v1/device/session.proto` with
  `SessionStatus` enum, `OperationSession` message.
- **FR-025**: Package MUST add `proto/delicasa/v1/device/evidence.proto` with
  `CaptureTag`, `CaptureStatus`, `UploadStatus`, `EvidencePairStatus` enums,
  `EvidenceCapture` message, `EvidencePair` message.
- **FR-026**: All new protos MUST pass `buf lint` (STANDARD category).

**Testing & Integration**

- **FR-027**: All new schemas MUST have Vitest tests under `tests/zod/`.
- **FR-028**: All new schemas MUST be exported from `@delicasa/wire/zod` barrel.
- **FR-029**: Package version MUST be bumped to `0.2.0` in `package.json`.
- **FR-030**: `MIGRATION.md` MUST document v0.1.0 → v0.2.0 changes.
- **FR-031**: `docs/HANDOFF.md` MUST provide exact dependency lines per repo,
  expected base URLs, and required headers/auth strategy.

### Key Entities

- **PiOrchContainerActionResponse**: Discriminated union for container door
  action results — success with evidence captures or error with retry info.
- **BridgeEvidenceCapture**: Single image capture entry in a container action
  result — camera ID, evidence ID, capture phase, status, optional image data
  and storage reference.
- **PiOrchEvidencePair**: Audit record for a vending session — BEFORE_OPEN and
  AFTER_CLOSE captures forming the tamper-evidence pair.
- **PairCapture**: One half of an evidence pair with status (captured/failed/
  timeout/pending) and image metadata.
- **PiOrchCamera**: Camera device as known to PiOrchestrator — device_id,
  container association, live health metrics.
- **PiOrchSession**: Operation cycle — session_id, status, elapsed time for
  stale detection.
- **MqttCaptureAck/Info/Chunk/Complete**: 4-part chunked image transfer protocol
  from EspCamV2 cameras.
- **MqttCameraStatus**: Heartbeat and LWT payload from ESP32 cameras.
- **MqttCameraCommand**: Command payload sent to ESP32 cameras.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All new Zod schemas have Vitest coverage exercising valid payloads,
  invalid payloads, and optional-field absence combinations.
- **SC-002**: `pnpm lint:proto` passes with zero warnings for new proto files.
- **SC-003**: `pnpm breaking:proto` passes (all additions, no changes to existing).
- **SC-004**: `pnpm gen` generates TypeScript types for `delicasa.v1.device`
  alongside existing `delicasa.v1` types without errors.
- **SC-005**: A BridgeServer developer can replace `piorch-evidence-pair.schemas.ts`
  import with `@delicasa/wire/zod` and compile with zero type errors.
- **SC-006**: A PiDashboard developer can replace `v1-cameras-schemas.ts` import
  with `@delicasa/wire/zod` and compile with zero type errors.
- **SC-007**: `STALE_THRESHOLD_SECONDS` exported as named constant (not hardcoded).
- **SC-008**: `MqttTopics` helpers produce strings matching PiOrchestrator and
  EspCamV2 topic literals — verified by automated string comparison tests.
- **SC-009**: `docs/HANDOFF.md` contains exact dependency lines for BridgeServer,
  NextClient, PiDashboard, and PiOrchestrator (schema-only reference).

## Assumptions

- Existing v0.1.0 protos (controller, container, purchase_session services) are
  NOT modified. All changes are additive.
- `image_data` (base64) is not format-validated by Zod (too expensive for large
  JPEG payloads). Binary validity enforced at application layer.
- `capture_reason` and `capture_tag` in BridgeEvidenceCapture are always equal.
  Schema does not enforce equality — Go handler guarantees it.
- Device proto package defines message types only in v0.2.0. Service definitions
  deferred to v0.3.0.
- EspCamV2 device IDs follow `esp-{12hex}` pattern. Schemas MAY validate with
  regex but are not required to.
- MQTT schemas are authoritative documentation and TypeScript bridge targets.
  PiOrchestrator Go code does not use Zod at runtime.
- Camera `position` is 1-indexed (1-4), representing physical slot positions.
- `upload_status: "unverified"` added to correct an omission in v0.1.0-era
  BridgeServer schemas.
