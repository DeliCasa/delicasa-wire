# Feature Specification: Device Connect RPC Contracts v0.3.0

**Feature Branch**: `003-device-rpc-contracts`
**Created**: 2026-03-04
**Status**: Draft
**Input**: User description: "delicasa-wire v0.3.0 — device Connect RPC services + media/image/evidence RPC contracts + test vectors + handoff matrix"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Device Service Contracts for Pi-Bridge Communication (Priority: P1)

A BridgeServer developer needs to call PiOrchestrator device endpoints (cameras, sessions, evidence, captures) via typed Connect RPC stubs instead of hand-crafted HTTP calls. They import service descriptors from `@delicasa/wire` and get full type safety for requests and responses across the device boundary.

**Why this priority**: This is the primary integration boundary. Without typed contracts for device services, BridgeServer and PiOrchestrator developers maintain duplicate, untyped HTTP shapes that drift over time. This is the highest-impact unification.

**Independent Test**: Can be validated by running `buf lint`, `buf generate`, and verifying that TypeScript service descriptors compile and export correctly for CameraService, EvidenceService, SessionService, and CaptureService.

**Acceptance Scenarios**:

1. **Given** the wire package proto definitions, **When** a developer runs `pnpm gen`, **Then** TypeScript service descriptors are generated for CameraService, EvidenceService, SessionService, and CaptureService under `gen/ts/delicasa/device/v1/`.
2. **Given** the generated descriptors, **When** a developer imports `@delicasa/wire/gen/delicasa/device/v1/camera_service_pb`, **Then** they get typed request/response shapes for ListCameras, GetCamera, GetCameraStatus, and ReconcileCameras.
3. **Given** any request or response message in device services, **When** the developer inspects the type, **Then** a `correlation_id` string field is always present as field number 1.

---

### User Story 2 - Media/Image RPC Contracts for NextClient (Priority: P1)

A NextClient developer needs to replace stubbed `HttpImageRepository` flows with typed Connect RPC calls for listing images, searching images by container/session, and generating presigned URLs. They import the ImageService descriptor from `@delicasa/wire` and build a typed client.

**Why this priority**: NextClient currently has hand-rolled HTTP stubs for image operations. Typed RPC contracts eliminate duplication and enable automated contract testing. Equal priority with Story 1 since both are required for v0.3.0.

**Independent Test**: Can be validated by verifying that `ImageService` proto compiles, generates correct TypeScript, and the barrel export at `@delicasa/wire/gen/delicasa/v1/image_service_pb` resolves.

**Acceptance Scenarios**:

1. **Given** the ImageService proto, **When** `pnpm gen` is run, **Then** TypeScript descriptors are generated for ListImages, SearchImages, and GetPresignedUrl RPCs.
2. **Given** a ListImages request, **When** a developer constructs it, **Then** they can specify `controller_id`, `container_id`, pagination tokens, and `correlation_id`.
3. **Given** a GetPresignedUrl request with an `object_key`, **When** the service responds, **Then** the response includes `url`, `expires_at`, and `correlation_id`.

---

### User Story 3 - Golden Test Vectors for Client Testing (Priority: P2)

A developer on any consumer repo (NextClient, BridgeServer, PiDashboard) needs canonical JSON fixtures for proto messages to use in MSW mocks and unit tests. They import or copy fixtures from `@delicasa/wire/tests/` and are guaranteed they match the proto schema exactly, including correct timestamp formats and enum values.

**Why this priority**: Test flakes from mismatched fixtures (empty string timestamps, wrong enum casing) are a recurring pain point. Golden vectors prevent this but are secondary to the contract definitions themselves.

**Independent Test**: Can be validated by running `pnpm test` and confirming that all golden vector fixtures parse successfully against their proto-generated types.

**Acceptance Scenarios**:

1. **Given** a golden test vector JSON file for CameraService responses, **When** it is deserialized with the generated proto type, **Then** it succeeds without errors.
2. **Given** a fixture with a Timestamp field that should be absent, **When** the fixture is read, **Then** the field is omitted entirely (not set to empty string or null).
3. **Given** enum fields in fixtures, **When** they are read, **Then** they use the proto JSON string representation (e.g., `"CAMERA_STATUS_ONLINE"`, not integer `1`).

---

### User Story 4 - Handoff Matrix for Cross-Repo Adoption (Priority: P2)

A developer on any DeliCasa repo needs a single reference document that tells them: which RPC method maps to which implementing repo, what base path to use, what auth headers are required, and exact curl examples for testing. They open `docs/HANDOFF_MATRIX.md` and follow it step-by-step.

**Why this priority**: The contract package is only valuable if consumers know how to adopt it. The handoff matrix is the bridge between "contracts exist" and "contracts are used." Slightly lower than contract definitions since it's documentation, not code.

**Independent Test**: Can be validated by reviewing the document for completeness: every RPC method in the package has a corresponding row in the mapping table, curl example, and implementation owner.

**Acceptance Scenarios**:

1. **Given** the handoff matrix, **When** a developer looks up any RPC method defined in the package, **Then** they find: implementing repo, base path, auth convention, and a curl example.
2. **Given** the migration document, **When** a NextClient developer reads it, **Then** they find a step-by-step checklist for removing HTTP stubs and switching to Connect RPC imports.
3. **Given** the dependency pin table, **When** any repo developer reads it, **Then** they know the exact `package.json` line to add for `@delicasa/wire@0.3.0`.

---

### User Story 5 - Breaking Change Detection Against v0.2.0 (Priority: P3)

A wire package maintainer needs confidence that proto changes are intentional and documented. Running `pnpm breaking:proto` compares the current protos against the `v0.2.0` tag and reports any wire-incompatible changes.

**Why this priority**: Breaking change detection is a safety net. Important for long-term maintenance but less urgent than getting the contracts defined and adopted.

**Independent Test**: Can be validated by running `pnpm breaking:proto` and confirming it either passes cleanly or reports only the known intentional breaking changes.

**Acceptance Scenarios**:

1. **Given** the v0.2.0 tag exists, **When** `pnpm breaking:proto` is run, **Then** it completes and reports results comparing against that tag.
2. **Given** an intentional breaking change is made, **When** it is detected by buf breaking, **Then** it is documented in the migration guide with the rationale.

---

### Edge Cases

- What happens when a client sends a request without `correlation_id`? The field is a required string in proto3 but defaults to empty string. Servers should reject empty `correlation_id` at the application layer; the proto schema permits it (proto3 has no required field constraint).
- What happens when a Timestamp field is absent in a response? The field should be omitted from the JSON representation entirely, not serialized as `"0001-01-01T00:00:00Z"` or empty string.
- What happens when the `UploadStatus` enum is encountered with an unknown value? Protobuf preserves unknown enum values as integers. Consumers should handle unrecognized values gracefully.
- What happens when `pnpm gen` is run without `buf` installed? The `@bufbuild/buf` devDependency provides the CLI. If missing, `pnpm install` must be run first.
- What happens when a consumer uses `moduleResolution: "node"` instead of `"bundler"` or `"node16"`? Subpath exports with wildcards won't resolve. This is documented as a requirement.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Package MUST define CameraService with RPCs: ListCameras, GetCamera, GetCameraStatus, ReconcileCameras under `delicasa.device.v1`.
- **FR-002**: Package MUST define EvidenceService with RPCs: GetEvidencePair, GetSessionEvidence under `delicasa.device.v1`.
- **FR-003**: Package MUST define SessionService with RPCs: ListSessions, GetSession under `delicasa.device.v1`.
- **FR-004**: Package MUST define CaptureService with RPC: CaptureImage under `delicasa.device.v1`.
- **FR-005**: Package MUST define ImageService with RPCs: ListImages, SearchImages, GetPresignedUrl under `delicasa.v1`.
- **FR-006**: Every request and response message across all services MUST include `string correlation_id = 1` as the first field.
- **FR-007**: All proto files MUST pass `buf lint` with STANDARD rules.
- **FR-008**: Code generation (`pnpm gen`) MUST produce TypeScript service descriptors (`.js` + `.d.ts`) for all new services.
- **FR-009**: Generated TypeScript MUST be importable via existing subpath exports (`@delicasa/wire/gen/*`).
- **FR-010**: Package MUST include golden test vector JSON files that exercise all new message types with valid field values.
- **FR-011**: Golden test vectors MUST omit optional Timestamp fields when absent (never empty string or epoch zero).
- **FR-012**: Golden test vectors MUST use proto JSON enum string representation (e.g., `"CAMERA_STATUS_ONLINE"`).
- **FR-013**: Package MUST include `docs/HANDOFF_MATRIX.md` mapping every RPC to its implementing repo, base path, auth convention, and curl example.
- **FR-014**: Package MUST include `docs/MIGRATION_v0.2_to_v0.3.md` with step-by-step upgrade instructions for each consumer repo.
- **FR-015**: `pnpm breaking:proto` MUST compare against the `v0.2.0` tag and report results.
- **FR-016**: All existing Zod schema tests MUST continue to pass after proto changes.
- **FR-017**: Package version MUST be bumped to `0.3.0` in `package.json`.

### Key Entities

- **CameraService**: Manages camera inventory and health on a Pi controller. Core entities: Camera, CameraHealth, CameraStatus.
- **EvidenceService**: Retrieves evidence captures and before/after pairs for container operations. Core entities: EvidenceCapture, EvidencePair, CaptureTag.
- **SessionService**: Lists and retrieves operation sessions (container open/close cycles). Core entities: OperationSession, SessionStatus.
- **CaptureService (device)**: Triggers image capture on a specific camera. Core entities: CaptureImageRequest/Response, UploadStatus.
- **ImageService**: Manages image browsing and presigned URL generation for NextClient. Core entities: Image metadata, presigned URLs, search filters.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All proto files pass `buf lint` with zero warnings.
- **SC-002**: `pnpm gen` produces TypeScript descriptors for all services without errors.
- **SC-003**: All existing Zod schema tests pass (`pnpm test` exits 0).
- **SC-004**: Golden test vector tests cover at least one valid fixture per new service (minimum 5 fixture files).
- **SC-005**: `docs/HANDOFF_MATRIX.md` contains a mapping row for every RPC method in the package (minimum 15 RPCs across all services).
- **SC-006**: Every consumer repo (BridgeServer, NextClient, PiDashboard, PiOrchestrator, EspCamV2) has a dedicated section in the handoff matrix with dependency pin and adoption steps.
- **SC-007**: `pnpm breaking:proto` completes and any intentional breaking changes are documented in the migration guide.
- **SC-008**: Package is tagged as `v0.3.0` and the tag is pushed to origin.

## Assumptions

- The existing 4 untracked proto service files (`camera_service.proto`, `capture_service.proto`, `evidence_service.proto`, `session_service.proto`) under `delicasa/device/v1/` represent the intended device service contracts and will be reviewed, refined, and committed.
- The 2 modified proto files (`evidence.proto` staged, `session.proto` unstaged) are intentional changes included in v0.3.0.
- Go code generation is NOT included in this release. Only TypeScript generation is in scope.
- The `UploadStatus` enum move from `evidence.proto` to `capture_service.proto` is an intentional breaking change that will be documented.
- ImageService is a new addition under `delicasa.v1` (not a separate `delicasa.media.v1` package) to keep the structure flat and consistent.
- Auth conventions (Cognito JWT for client-facing, API key for device-facing) are documented in the handoff matrix but not enforced by proto definitions.
- The stale `workers.dev` URL defaults noted in the ops handoff are a NextClient concern and out of scope for this wire package.
- Connect RPC is not yet deployed on BridgeServer; this package defines the contracts first, other repos implement against it afterward.
