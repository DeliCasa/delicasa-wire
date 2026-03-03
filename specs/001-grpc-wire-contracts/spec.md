# Feature Specification: gRPC-First Contracts Package (delicasa-wire)

**Feature Branch**: `001-grpc-wire-contracts`
**Created**: 2026-03-03
**Status**: Draft
**Input**: User description: "EPIC: delicasa-wire — gRPC-first contracts + generated TS + Zod boundary validation"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Imports Shared Contracts (Priority: P1)

A developer working on BridgeServer or NextClient installs `@delicasa/wire` and imports generated service client stubs and message types. They get full type safety and autocomplete in their IDE. When the contracts package is updated, they run a single install command to get the latest types — no manual type synchronization needed.

**Why this priority**: This is the core value proposition. Without importable, generated types, no other story delivers value. Eliminates "envelope drift" where manually maintained types diverge across services.

**Independent Test**: Can be tested by installing the published package in a fresh TypeScript project, importing a generated type (e.g., `Controller`), and confirming the compiler accepts it with full autocompletion.

**Acceptance Scenarios**:

1. **Given** a TypeScript project with `@delicasa/wire` installed, **When** a developer imports a generated message type, **Then** the compiler resolves all types without errors and IDE autocomplete shows all message fields.
2. **Given** the contracts package has been updated with a new field on a message, **When** the developer updates the package, **Then** the new field is available in types immediately — no manual type editing required.
3. **Given** a developer imports Connect service definitions, **When** they create a service client, **Then** the client has typed methods for all RPCs.

---

### User Story 2 - Developer Validates Data at Boundaries with Zod (Priority: P2)

A developer uses handwritten Zod schemas from `@delicasa/wire/zod` to validate data crossing trust boundaries — environment variables, external API responses, or data entering React components from server-side fetches. The Zod schemas represent the domain's view of the data (not the wire format), providing runtime validation with clear error messages.

**Why this priority**: Generated types provide compile-time safety but not runtime validation. Boundary validation prevents malformed data from propagating into the application layer. This complements P1 by covering the runtime gap.

**Independent Test**: Can be tested by importing a Zod schema, passing valid and invalid data, and confirming parse succeeds or returns structured errors.

**Acceptance Scenarios**:

1. **Given** a domain schema for Controller, **When** a developer calls `parseOrThrow` with valid data, **Then** the parsed result is returned with correct types.
2. **Given** a domain schema for Controller, **When** a developer calls `safeParse` with invalid data, **Then** a structured error is returned describing the validation failure — not a thrown exception.
3. **Given** a developer imports the Zod entry point, **Then** all domain schemas (Controller, PurchaseSession, Error) and helper functions (parseOrThrow, safeParse) are available.

---

### User Story 3 - Developer Detects Breaking Changes Before Merge (Priority: P2)

A developer modifies a `.proto` file (e.g., renames a field or removes an RPC). Before the change is merged, the CI pipeline runs breaking-change detection and blocks the merge with a clear error message explaining which contract was broken and how.

**Why this priority**: Without breaking change detection, a service update could silently break all consumers. This safety net is essential for a shared contracts package to be trusted.

**Independent Test**: Can be tested locally by making a breaking change to a proto file and running the breaking-change check command, confirming it exits with a non-zero code and descriptive error.

**Acceptance Scenarios**:

1. **Given** a proto file with an existing field, **When** a developer removes the field and runs the breaking-change check, **Then** the check fails with a message identifying the removed field.
2. **Given** a proto file with a valid additive change (new field), **When** the developer runs the breaking-change check, **Then** the check passes.
3. **Given** a pull request with a breaking proto change, **When** CI runs, **Then** the pipeline fails and the PR cannot be merged until the break is resolved.

---

### User Story 4 - Developer Lints Proto Files for Consistency (Priority: P3)

A developer writes a new `.proto` file or modifies an existing one. The linter enforces naming conventions, package structure, and best practices — catching issues like incorrect casing, missing package declarations, or non-standard field numbering before code review.

**Why this priority**: Lint ensures long-term consistency as more contributors touch proto files. Lower priority than contract generation and breaking-change detection because it's about code quality rather than correctness.

**Independent Test**: Can be tested by introducing a lint violation (e.g., camelCase field name) and running the lint command, confirming it reports the violation.

**Acceptance Scenarios**:

1. **Given** a proto file with a naming convention violation, **When** the developer runs the lint command, **Then** the linter reports the violation.
2. **Given** a well-formed proto file following all conventions, **When** the developer runs the lint command, **Then** it passes with no errors.

---

### Edge Cases

- What happens when a developer runs code generation without installing dependencies first? The generation script should fail with a clear error message.
- What happens when proto files have import cycles? Lint should detect and report circular dependencies.
- What happens when the generated output directory is stale from a previous run? Generation should overwrite cleanly without leftover artifacts.
- What happens when consuming projects use different module systems? The package exports should support ESM as the primary target for modern bundlers.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Package MUST provide service definitions for ControllerService (ListControllers, GetController, UpdateControllerName), ContainerAccessService (OpenContainer, CloseContainer), and PurchaseSessionService (GetPurchaseSession, ListPurchaseSessions).
- **FR-002**: Every request and response message MUST include a `correlation_id` field for distributed tracing.
- **FR-003**: Package MUST define a common Error message type with code, message, and details fields for structured error reporting.
- **FR-004**: Package MUST generate TypeScript types and service stubs compatible with browser and server environments from the contract definitions.
- **FR-005**: Package MUST enforce contract lint rules (naming conventions, package structure, field numbering) via an automated check.
- **FR-006**: Package MUST detect breaking changes in contract definitions when compared against the previous release.
- **FR-007**: Package MUST provide handwritten Zod schemas for domain entities: Controller, PurchaseSession, and Error.
- **FR-008**: Package MUST export `parseOrThrow` and `safeParse` helper functions for runtime boundary validation.
- **FR-009**: Package MUST be publishable as `@delicasa/wire` with separate export paths for generated code and Zod schemas.
- **FR-010**: Package MUST include CI automation that runs lint, generation, and tests on every push and pull request.
- **FR-011**: Package MUST be tagged as v0.1.0 for the initial release.

### Key Entities

- **Controller**: Represents a physical vending machine unit. Key attributes: unique identifier, opaque display name (e.g., "DC-001"), status, location metadata.
- **Container**: A compartment within a Controller that holds products. Key attributes: container identifier, parent controller reference, open/closed state.
- **PurchaseSession**: Represents a customer's active interaction with a Controller (browsing, selecting, paying). Key attributes: session identifier, associated controller, status (active/completed/expired), item list.
- **Error**: Structured error envelope for all service responses. Key attributes: error code (string enum), human-readable message, optional details map.
- **CorrelationId**: A trace identifier included in all requests and responses to enable distributed tracing across services.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All consuming projects (BridgeServer, NextClient) can import generated types and see zero type errors when contracts are in sync — measured by successful compilation.
- **SC-002**: Adding a new field to a contract message and re-generating takes under 30 seconds end-to-end.
- **SC-003**: 100% of contract files pass lint checks without warnings on every CI run.
- **SC-004**: Breaking changes are caught before merge in 100% of cases where a field is removed, renamed, or a service method signature changes.
- **SC-005**: Zod boundary validation correctly rejects invalid data for all domain schemas — measured by unit test pass rate of 100%.
- **SC-006**: A new developer can clone the repo, install dependencies, and run generation + tests in under 2 minutes following the migration guide.

## Assumptions

- ESM is the primary module format; CJS compatibility is not required for the initial release.
- The package will be consumed via git URL or workspace path (not npm registry) for the initial release.
- Buf CLI (v2) is available in the development environment and CI.
- Contract namespace is `delicasa.v1` — versioning is at the package level, not per-service.
- Connect RPC is the transport framework; pure gRPC (HTTP/2 only) support is not a goal for this release.
