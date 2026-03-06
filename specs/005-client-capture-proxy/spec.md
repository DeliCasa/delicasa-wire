# Feature Specification: Client-Facing Capture Proxy Service

**Feature Branch**: `005-client-capture-proxy`
**Created**: 2026-03-06
**Status**: Draft
**Input**: Add client-facing CaptureService for BridgeServer + clarify device CaptureService boundary + update HANDOFF_MATRIX + add fixtures to prevent test drift

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Client-Facing Capture Contract (Priority: P1)

A NextClient developer needs to trigger image capture through BridgeServer without knowing about the device-layer CaptureService or PiOrchestrator internals. They import a service descriptor from the wire package and call it against BridgeServer's URL with their Cognito JWT.

**Why this priority**: This is the core gap — NextClient currently has no capture RPC contract to code against. Without this, capture triggers must be hand-wired via HTTP, leading to contract drift and broken integrations.

**Independent Test**: Import the generated capture service descriptor, construct a valid request using factory functions, and verify it serializes/deserializes correctly via round-trip test.

**Acceptance Scenarios**:

1. **Given** the wire package is installed, **When** a consumer imports the client capture service descriptor, **Then** the descriptor includes `RequestCapture` and `GetCaptureStatus` method definitions.
2. **Given** a valid `RequestCapture` request with `controller_id`, `capture_tag`, `correlation_id`, and `idempotency_key`, **When** serialized to proto JSON and deserialized back, **Then** all fields survive the round-trip without data loss.
3. **Given** a `RequestCapture` response, **When** the capture succeeds, **Then** the response includes `evidence_id`, `object_key`, `upload_status`, and `captured_at` timestamp.
4. **Given** a `RequestCapture` request with a duplicate `idempotency_key`, **When** processed, **Then** the response indicates it was served from cache.
5. **Given** a `GetCaptureStatus` request, **When** the capture is still in progress, **Then** the response includes a status indicating the capture has not completed yet.

---

### User Story 2 — Service Boundary Documentation (Priority: P2)

A developer onboarding to the DeliCasa platform reads the handoff matrix and immediately understands which services belong to which boundary: `delicasa.v1.*` is client-facing (BridgeServer), `delicasa.device.v1.*` is device-facing (PiOrchestrator). They never accidentally call a device service directly from the NextClient.

**Why this priority**: The current documentation gap caused the original mis-routing problem. Fixing it prevents recurrence and reduces onboarding confusion.

**Independent Test**: Read the handoff matrix and identify, for every listed RPC method, which boundary it belongs to and which repo implements it.

**Acceptance Scenarios**:

1. **Given** the handoff matrix document, **When** a developer looks for capture RPCs, **Then** they see both the client-facing `delicasa.v1.CaptureService` (BridgeServer) and the device-facing `delicasa.device.v1.CaptureService` (PiOrchestrator) with clear labels.
2. **Given** the handoff matrix document, **When** reading the BridgeServer section, **Then** the routing table shows that `delicasa.v1.CaptureService.RequestCapture` internally proxies to `delicasa.device.v1.CaptureService.CaptureImage`.
3. **Given** the handoff matrix document, **When** a developer reads the top-level section, **Then** there is an explicit "Service Boundary" section explaining the `delicasa.v1` vs `delicasa.device.v1` split.

---

### User Story 3 — Capture Proxy Test Fixtures (Priority: P3)

A NextClient developer writing MSW mocks for the capture flow uses factory functions from the wire package instead of hand-crafting proto JSON. The fixtures enforce correct enum values, proper timestamp formatting, and field presence conventions.

**Why this priority**: Prevents test drift — hand-written fixtures silently become invalid when proto schemas evolve. Factory functions provide a single source of truth.

**Independent Test**: Call the capture proxy factory function with overrides, pass the result to `fromJson()`, and verify successful deserialization.

**Acceptance Scenarios**:

1. **Given** the wire testing module is imported, **When** calling the client capture request factory, **Then** it returns a valid proto JSON object with default `controller_id`, `capture_tag`, `correlation_id`, and `idempotency_key`.
2. **Given** a factory-generated capture response, **When** the response has `upload_status` set to a valid enum value, **Then** the value is a proper enum string (e.g., `"UPLOAD_STATUS_UPLOADED"`) and not a numeric code.
3. **Given** a factory-generated capture response with no `captured_at` timestamp, **When** serialized, **Then** the `capturedAt` key is absent from the JSON (not an empty string or null).

---

### User Story 4 — Migration Guide for Capture Proxy (Priority: P4)

A BridgeServer developer receives a migration document that tells them exactly which new service methods to implement, what the request/response shapes are, and how the internal proxy routing should work.

**Why this priority**: Without a migration guide, BridgeServer developers must reverse-engineer the proto files. The guide accelerates adoption.

**Independent Test**: Follow the migration guide from start to finish and confirm it covers every new RPC method with a concrete example.

**Acceptance Scenarios**:

1. **Given** the migration document, **When** a developer reads the "Capture Proxy" section, **Then** they find the exact import path for the new service descriptor, a curl example for each RPC, and the internal proxy routing diagram.
2. **Given** the migration document, **When** a developer checks the version bump section, **Then** the dependency line is a copy-pasteable version string.

---

### Edge Cases

- What happens when `controller_id` in `RequestCapture` refers to a controller that has no cameras online? The response should indicate capture failure with a meaningful error status.
- What happens when the PiOrchestrator is unreachable from BridgeServer? The client-facing response should include a timeout or unavailable status — the internal proxy failure should not leak device-layer details.
- What happens when `GetCaptureStatus` is called with an unknown `request_id`? The response should indicate the capture request was not found.
- What happens when `capture_tag` is an invalid enum value? The system should reject the request with a validation error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The wire package MUST define a `delicasa.v1.CaptureService` with `RequestCapture` and `GetCaptureStatus` RPC methods.
- **FR-002**: The `RequestCapture` request MUST include `correlation_id`, `controller_id`, `capture_tag`, `idempotency_key`, and optional `session_id`.
- **FR-003**: The `RequestCapture` response MUST include `correlation_id`, `request_id`, and a `CaptureRequestStatus` enum indicating the outcome (accepted, completed, failed, timeout).
- **FR-004**: The `RequestCapture` response, when capture completes synchronously, MUST include `evidence_id`, `object_key`, `captured_at`, `content_type`, `image_size_bytes`, and `upload_status`.
- **FR-005**: The `GetCaptureStatus` request MUST accept either `request_id` or `correlation_id` to look up a capture.
- **FR-006**: The `GetCaptureStatus` response MUST include the current `CaptureRequestStatus` and, if capture is complete, the same evidence fields as `RequestCapture`.
- **FR-007**: The handoff matrix MUST include a "Service Boundaries" section that explicitly defines `delicasa.v1.*` as client-facing and `delicasa.device.v1.*` as device-facing.
- **FR-008**: The handoff matrix MUST include a routing entry showing `delicasa.v1.CaptureService` is implemented by BridgeServer and proxies to `delicasa.device.v1.CaptureService` on PiOrchestrator.
- **FR-009**: The wire package MUST provide factory functions (`makeRequestCaptureRequest`, `makeRequestCaptureResponse`, `makeGetCaptureStatusRequest`, `makeGetCaptureStatusResponse`) in the `@delicasa/wire/testing` export.
- **FR-010**: The wire package MUST provide a golden vector fixture file for the client-facing capture service at `@delicasa/wire/fixtures/client-capture-service`.
- **FR-011**: All factory-generated fixtures MUST pass round-trip deserialization via `fromJson()` without errors.
- **FR-012**: A migration document MUST be created documenting the new capture proxy service, import paths, curl examples, and version bump instructions.

### Key Entities

- **CaptureRequestStatus**: Represents the lifecycle of a client-initiated capture request — accepted (in progress), completed (evidence available), failed (device or upload error), timeout (device did not respond).
- **RequestCaptureRequest**: The client's instruction to capture an image on a specific controller, tagged for a specific evidence phase (before-open, after-close, etc.).
- **RequestCaptureResponse**: The outcome of the capture request, including evidence identifiers and image metadata when complete.
- **GetCaptureStatusRequest**: A poll-based query to check the state of a previously submitted capture request.
- **GetCaptureStatusResponse**: The current state of the capture, with full evidence details when complete.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A NextClient developer can trigger capture through BridgeServer using a single service import and method call, without referencing device-layer services.
- **SC-002**: Every RPC method in the handoff matrix has an unambiguous boundary label (client-facing or device-facing), making mis-routing impossible from documentation alone.
- **SC-003**: 100% of factory-generated capture proxy fixtures pass round-trip deserialization tests.
- **SC-004**: The migration document provides copy-pasteable code for BridgeServer developers to implement all new capture proxy methods.
- **SC-005**: The wire package passes all CI gates: lint, breaking change detection, code generation, and tests — with zero regressions.

## Assumptions

- The client-facing `CaptureService` name is preferred over `DeviceProxyService` for clarity — NextClient developers think in terms of "capture an image" not "proxy to a device."
- `capture_tag` in the client-facing service uses the `CaptureTag` enum from the device evidence proto (imported cross-package) to maintain a single source of truth for capture tag values.
- `RequestCapture` may complete synchronously (PiOrchestrator returns the capture result within the RPC timeout) or the client may need to poll via `GetCaptureStatus`. Both paths are supported.
- This is a minor version bump (v0.5.0) since it adds a new service — a feature release, not a patch.
- BridgeServer implements the client-facing service; PiOrchestrator implements the device service. No other repos are modified.
- Auth for the client-facing service is Bearer JWT (Cognito), matching all other `delicasa.v1.*` services.
