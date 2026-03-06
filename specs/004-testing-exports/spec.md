# Feature Specification: Testing Exports & Documentation Polish

**Feature Branch**: `004-testing-exports`
**Created**: 2026-03-06
**Status**: Draft
**Input**: Enhance delicasa-wire with shared test fixture factories, published fixture exports, MQTT-to-proto mapping docs, and ESP32 MQTT architectural decision record.

## Context

v0.3.0 shipped device Connect RPC service protos, ImageService, golden test vectors, and handoff documentation. However, consumers (BridgeServer, NextClient, PiOrchestrator, PiDashboard) still face friction when adopting the contracts:

1. **Test fixture gap**: Golden vector JSON fixtures exist but aren't published in the npm package (not in `files` or `exports`). Consumers must handcraft proto JSON for MSW mocks and integration tests.
2. **MQTT translation gap**: No document maps the 4-phase MQTT capture protocol to the corresponding `CaptureImageResponse` proto fields, creating onboarding friction for PiOrchestrator contributors.
3. **Architecture decision gap**: The decision that ESP32/EspCamV2 stays on MQTT (no gRPC/HTTP2 on device) is implicit across multiple files but has no dedicated rationale doc.
4. **Ops baseline gap**: The ops preflight confirmed Connect RPC returns 404 on BridgeServer (not yet implemented). This finding should surface in the handoff matrix so consumers know the implementation status.

### Non-Negotiable Decision (from EPIC)

**ESP32/EspCamV2 stays MQTT.** No gRPC/HTTP2 on device hardware. Protobuf remains the single contract source: MQTT payloads map to protobuf messages; server-side uses Connect RPC.

## User Scenarios & Testing

### User Story 1 - Test Fixture Factory Functions (Priority: P1)

As a developer in BridgeServer or NextClient, I want to import typed factory functions from `@delicasa/wire/testing` so that I can build valid proto JSON fixtures for MSW mocks and integration tests without handcrafting field names, enum strings, or timestamp conventions.

**Why this priority**: Every consumer needs mock data. Without factory helpers, each team reinvents fixture construction and risks drift from the canonical proto JSON format. This is the highest-friction gap reported by the EPIC.

**Independent Test**: Can be fully tested by importing a factory function, calling it with partial overrides, and verifying the result deserializes with `fromJson()` against the generated proto schema.

**Acceptance Scenarios**:

1. **Given** a consumer installs `@delicasa/wire`, **When** they `import { makeCamera, makeListCamerasResponse } from "@delicasa/wire/testing"`, **Then** the import resolves without error and returns factory functions.
2. **Given** a developer calls `makeCamera({ status: "CAMERA_STATUS_OFFLINE" })`, **When** the result is passed to `fromJson()` against the corresponding schema, **Then** it deserializes successfully with the overridden status and valid defaults for all other required fields.
3. **Given** a developer calls a factory with no arguments, **When** the result is used as a proto JSON fixture, **Then** all required fields have sensible defaults that pass proto JSON deserialization.
4. **Given** a developer calls `makeEvidencePair({ pairStatus: "EVIDENCE_PAIR_STATUS_INCOMPLETE" })`, **When** the result omits the `after` sub-message, **Then** the fixture correctly represents an incomplete pair per proto conventions.

---

### User Story 2 - Published Fixture Exports (Priority: P2)

As a developer consuming `@delicasa/wire` via npm/pnpm, I want the golden vector JSON fixture files to be available as a package export so that I can import canonical test data directly instead of copying raw JSON files from the wire repository.

**Why this priority**: The HANDOFF_MATRIX.md tells consumers to "use golden test vectors from tests/vectors/fixtures/" but those files aren't included in the published package. This creates a doc-reality mismatch.

**Independent Test**: Can be tested by checking that `@delicasa/wire/fixtures/camera-service` resolves to valid JSON when imported from a consuming project.

**Acceptance Scenarios**:

1. **Given** `@delicasa/wire` is installed in a consumer project, **When** the developer imports from `"@delicasa/wire/fixtures/camera-service"`, **Then** the import resolves to the camera service golden vector JSON.
2. **Given** the `files` field in package.json, **When** `pnpm pack` is run, **Then** the tarball includes the fixture JSON files.
3. **Given** the HANDOFF_MATRIX.md and MIGRATION docs, **When** they reference golden test vectors, **Then** they provide the correct import path using the new subpath export.

---

### User Story 3 - MQTT-to-Proto Mapping Document (Priority: P3)

As a PiOrchestrator contributor, I want a dedicated mapping document that shows how the 4-phase MQTT capture protocol (ack, info, chunk, complete) translates into `CaptureImageResponse` proto fields so that I can implement the translation layer correctly.

**Why this priority**: The PiOrchestrator is the translation boundary between MQTT and Connect RPC. Without an explicit mapping doc, contributors must reverse-engineer the relationship by reading proto files, Zod schemas, and spec contracts separately.

**Independent Test**: Can be tested by having a new contributor read only the mapping doc and correctly identify which MQTT message fields populate which proto response fields.

**Acceptance Scenarios**:

1. **Given** a new PiOrchestrator contributor, **When** they read the MQTT-to-proto mapping doc, **Then** they can identify the exact mapping from each MQTT message type to `CaptureImageResponse` fields.
2. **Given** the mapping doc, **When** it lists the 4-phase capture protocol, **Then** each phase shows: MQTT topic pattern, Zod schema reference, and corresponding proto field(s).
3. **Given** the mapping doc, **When** it describes error scenarios (timeout, chunking failure), **Then** the doc shows what `CaptureStatus` enum value results from each failure mode.

---

### User Story 4 - ESP32 MQTT Architecture Decision Record (Priority: P4)

As a future contributor evaluating whether to add gRPC to ESP32, I want an Architecture Decision Record explaining why ESP32 stays on MQTT so that I understand the hardware constraints and don't waste time proposing an infeasible change.

**Why this priority**: This is a non-negotiable decision from the EPIC that should be preserved in the codebase. Currently the rationale is scattered implicitly across multiple files.

**Independent Test**: Can be tested by verifying the ADR exists, contains the decision, rationale, and hardware constraints, and is referenced from the main HANDOFF docs.

**Acceptance Scenarios**:

1. **Given** a contributor opens the ESP32 MQTT ADR, **When** they read the document, **Then** they find: the decision statement, rationale (ESP32 hardware constraints, MQTT maturity, no HTTP/2 stack), alternatives considered, and consequences.
2. **Given** the HANDOFF_MATRIX.md, **When** it references EspCamV2, **Then** it links to the ADR for context on why MQTT is the transport.

---

### User Story 5 - Handoff Matrix Ops Baseline Update (Priority: P5)

As a BridgeServer developer, I want the HANDOFF_MATRIX.md to include the ops baseline finding (Connect RPC not yet deployed, returns 404) so that I know the current implementation status before starting Connect route registration.

**Why this priority**: The ops preflight confirmed the network path works but Connect routes are missing. Surfacing this in the handoff matrix prevents confusion when BridgeServer developers try to test against an endpoint that doesn't exist yet.

**Independent Test**: Can be tested by reading the updated HANDOFF_MATRIX.md and finding the implementation status note for BridgeServer Connect RPC.

**Acceptance Scenarios**:

1. **Given** the HANDOFF_MATRIX.md BridgeServer section, **When** a developer reads it, **Then** they find a note stating Connect RPC routes return 404 as of 2026-03-06 and route registration is the prerequisite step.
2. **Given** the ops handoff findings, **When** the JWT audience hardcoding concern is relevant, **Then** the handoff matrix mentions it as an open item for the NextClient team.

---

### Edge Cases

- What happens when a factory function receives an unknown field name? It should be ignored (shallow merge with defaults).
- What happens when a factory is called with a Timestamp override as a Date object? Factory should accept both ISO string and Date, normalizing to ISO string.
- What happens when a consumer imports `@delicasa/wire/testing` in a production bundle? Tree-shaking should exclude it; the testing export should be clearly marked as dev-only.
- What happens when fixture JSON files are imported from a project without `resolveJsonModule`? The subpath export should work with `moduleResolution: "bundler"` or `"node16"`.

## Requirements

### Functional Requirements

- **FR-001**: Package MUST export a `"./testing"` subpath providing typed factory functions for all major proto message types (Camera, EvidencePair, OperationSession, CaptureImageRequest, CaptureImageResponse, Image, and their list/get response wrappers).
- **FR-002**: Each factory function MUST return a `JsonValue`-compatible object that successfully deserializes via `fromJson()` against the corresponding generated proto schema.
- **FR-003**: Factory functions MUST accept an optional partial overrides argument to customize specific fields while keeping valid defaults for the rest.
- **FR-004**: Factory functions MUST handle proto JSON conventions: enum values as strings (e.g., `"CAMERA_STATUS_ONLINE"`), absent timestamps omitted entirely, `correlation_id` always present.
- **FR-005**: Package MUST publish golden vector fixture JSON files and expose them via a `"./fixtures/*"` subpath export.
- **FR-006**: Package `files` field MUST include the fixture directory in the published tarball.
- **FR-007**: Package MUST include a MQTT-to-proto mapping document mapping all 4 MQTT capture protocol phases to proto response fields.
- **FR-008**: Package MUST include an ESP32 MQTT architecture decision record with decision, rationale, alternatives, and consequences.
- **FR-009**: HANDOFF_MATRIX.md MUST be updated with an ops baseline note for BridgeServer (Connect RPC 404 status, JWT audience concern).
- **FR-010**: All factory functions MUST have corresponding unit tests verifying round-trip deserialization with `fromJson()`.
- **FR-011**: MIGRATION docs MUST be updated to reference the new `"./testing"` and `"./fixtures/*"` exports with correct import examples.
- **FR-012**: Factory functions MUST include `correlationId` generation (auto-generated UUID or sequential ID) when not provided in overrides.

### Key Entities

- **Factory Function**: A function that returns a valid proto JSON object with sensible defaults, accepting partial overrides. One per major message type.
- **Golden Vector Fixture**: A canonical JSON file containing one or more named proto JSON objects used for deserialization testing. Already exists; now needs to be published.
- **MQTT Phase**: One of 4 stages in the ESP32 capture protocol (ack, info, chunk, complete). Maps to specific fields in `CaptureImageResponse`.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Consumers can import factory functions and build valid proto JSON fixtures in under 2 lines of code per message type, compared to 10+ lines of handcrafted JSON today.
- **SC-002**: 100% of factory-generated fixtures pass `fromJson()` deserialization against their corresponding proto schema (verified by automated tests).
- **SC-003**: All golden vector fixture files are included in `pnpm pack` output, verified by checking the tarball contents.
- **SC-004**: A new PiOrchestrator contributor can identify the complete MQTT-to-proto field mapping by reading a single document.
- **SC-005**: The "ESP32 stays MQTT" decision has a single authoritative source document, eliminating the need to search multiple files for the rationale.
- **SC-006**: All existing 160 tests continue to pass after changes (no regressions).

## Assumptions

- Factory functions target proto JSON format (for use with `fromJson()`), not Zod domain format. The two layers serve different purposes.
- The `"./testing"` export is intended for development/test use only. No runtime production code should depend on it.
- ISO 8601 strings are the canonical timestamp format in factory output (matching proto JSON Timestamp convention).
- The ops handoff findings from Dokku are reference material stored in `specs/004-testing-exports/OPS_HANDOFF_GRPC_BASELINE.md`, not published in the package.

## Scope Boundaries

### In Scope

- Factory functions in `src/testing/` for proto JSON fixture construction
- Publishing fixtures via `"./fixtures/*"` subpath export
- MQTT-to-proto mapping document
- ESP32 MQTT architecture decision record
- HANDOFF_MATRIX.md ops baseline update
- MIGRATION doc updates for new exports
- Unit tests for all factory functions

### Out of Scope

- Changes to other repos (BridgeServer, NextClient, PiOrchestrator, EspCamV2)
- New proto definitions or service changes
- Zod schema changes
- Connect RPC implementation (that's a BridgeServer task)
- Package version bump strategy (determined during implementation)
