# Tasks: Client-Facing Capture Proxy Service

**Input**: Design documents from `/specs/005-client-capture-proxy/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included — factory functions require round-trip deserialization tests per FR-011.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No new infrastructure needed — existing project structure supports this feature.

- [X] T001 Verify existing project builds cleanly: run `pnpm lint:proto && pnpm gen && pnpm test` to confirm green baseline

---

## Phase 2: Foundational (Proto Definition)

**Purpose**: Define the proto service file — BLOCKS all user stories

**CRITICAL**: No factory, fixture, or documentation work can begin until the proto compiles and generates successfully.

- [X] T002 Create `proto/delicasa/v1/capture_service.proto` with `CaptureRequestStatus` enum, `ClientUploadStatus` enum, `RequestCaptureRequest`, `RequestCaptureResponse`, `GetCaptureStatusRequest`, `GetCaptureStatusResponse` messages, and `CaptureService` service definition with `RequestCapture` and `GetCaptureStatus` RPCs
- [X] T003 Run `pnpm lint:proto` to verify the new proto passes buf STANDARD lint rules
- [X] T004 Run `pnpm gen` to generate TypeScript from the new proto and verify `gen/ts/delicasa/v1/capture_service_pb.js` and `.d.ts` are produced
- [X] T005 Run `pnpm breaking:proto` against v0.4.0 tag to confirm no breaking changes

**Checkpoint**: Proto compiles, lints, generates TS, no breaking changes — story implementation can begin

---

## Phase 3: User Story 1 — Client-Facing Capture Contract (Priority: P1) MVP

**Goal**: Consumers can import the `CaptureService` descriptor and construct valid `RequestCapture` / `GetCaptureStatus` requests that round-trip through proto serialization.

**Independent Test**: Import the generated schema, construct a request via factory, pass to `fromJson()` — deserialization succeeds.

### Tests for User Story 1

- [X] T006 [P] [US1] Write round-trip deserialization tests for client capture factories in `tests/testing/client-capture-factories.test.ts` — test all 4 factory functions with default values and overrides, verify `fromJson()` succeeds, verify conditional fields are omitted when appropriate

### Implementation for User Story 1

- [X] T007 [P] [US1] Implement client capture factory functions (`makeRequestCaptureRequest`, `makeRequestCaptureResponse`, `makeGetCaptureStatusRequest`, `makeGetCaptureStatusResponse`) in `src/testing/factories/client-capture.ts`
- [X] T008 [US1] Add client capture factory exports to barrel file `src/testing/index.ts`
- [X] T009 [US1] Run all tests with `pnpm test` and verify 100% pass (existing + new factory tests)

**Checkpoint**: Factory functions importable from `@delicasa/wire/testing`, all round-trip tests pass

---

## Phase 4: User Story 2 — Service Boundary Documentation (Priority: P2)

**Goal**: HANDOFF_MATRIX.md clearly separates client-facing vs device-facing services with an explicit boundary section and capture proxy routing entry.

**Independent Test**: Read the handoff matrix and find the new "Service Boundaries" section and the `delicasa.v1.CaptureService` routing entry.

- [X] T010 [US2] Add a "Service Boundaries" section near the top of `docs/HANDOFF_MATRIX.md` explicitly defining `delicasa.v1.*` as client-facing (BridgeServer) and `delicasa.device.v1.*` as device-facing (PiOrchestrator)
- [X] T011 [US2] Add `delicasa.v1.CaptureService` RPCs (`RequestCapture`, `GetCaptureStatus`) to the client-facing services routing table in `docs/HANDOFF_MATRIX.md` with auth (Bearer JWT), base path, and implementing repo (BridgeServer)
- [X] T012 [US2] Add a proxy routing note under the BridgeServer adoption guide in `docs/HANDOFF_MATRIX.md` explaining that `RequestCapture` internally proxies to `delicasa.device.v1.CaptureService.CaptureImage` on PiOrchestrator
- [X] T013 [US2] Add curl examples for the new `delicasa.v1.CaptureService` RPCs to `docs/HANDOFF_MATRIX.md`

**Checkpoint**: Any developer reading HANDOFF_MATRIX.md can identify capture routing without ambiguity

---

## Phase 5: User Story 3 — Capture Proxy Test Fixtures (Priority: P3)

**Goal**: Golden vector fixture JSON file exists for the client-facing capture service, importable via `@delicasa/wire/fixtures/client-capture-service`.

**Independent Test**: Import the fixture file and verify it contains expected keys.

- [X] T014 [US3] Create golden vector fixture file `tests/vectors/fixtures/client-capture-service.json` with `RequestCaptureRequest`, `RequestCaptureResponse`, `GetCaptureStatusRequest`, `GetCaptureStatusResponse` keys containing canonical proto JSON payloads
- [X] T015 [US3] Add `"./fixtures/client-capture-service"` subpath export to `package.json` (or verify wildcard `"./fixtures/*"` already covers it)
- [X] T016 [US3] Add fixture import test for `client-capture-service.json` to `tests/testing/fixture-exports.test.ts` verifying expected keys
- [X] T017 [US3] Run `pnpm pack` and verify tarball includes `tests/vectors/fixtures/client-capture-service.json`

**Checkpoint**: Golden vector fixtures importable from the published package

---

## Phase 6: User Story 4 — Migration Guide (Priority: P4)

**Goal**: BridgeServer developers have a step-by-step migration doc for implementing the new capture proxy service.

**Independent Test**: Read the migration doc and find import paths, curl examples, and the proxy routing diagram.

- [X] T018 [US4] Create `docs/MIGRATION_v0.4_to_v0.5.md` with sections: new capture proxy service overview, import paths, curl examples for both RPCs, proxy routing diagram, version bump instructions, and copy-pasteable dependency line
- [X] T019 [US4] Update `docs/HANDOFF.md` title and version reference to v0.5.0

**Checkpoint**: Migration guide provides everything a BridgeServer developer needs to implement the capture proxy

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Version bump, full validation, release

- [X] T020 Bump version to `0.5.0` in `package.json`
- [X] T021 Update version references in `docs/HANDOFF_MATRIX.md` header and dependency pin examples to v0.5.0
- [X] T022 Run full validation: `pnpm lint:proto && pnpm gen && pnpm test` — all tests must pass
- [X] T023 Run `pnpm breaking:proto` against v0.4.0 tag — confirm no breaking changes
- [ ] T024 Commit all changes, create PR, merge, tag v0.5.0, push tag, delete feature branch

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — factory functions need generated TS types for test imports
- **US2 (Phase 4)**: Depends on Phase 2 only — documentation, no code dependencies on factories
- **US3 (Phase 5)**: Depends on Phase 3 — fixture JSON should use same values as factory defaults
- **US4 (Phase 6)**: Depends on Phase 2 only — docs only, independent of factories/fixtures
- **Polish (Phase 7)**: Depends on all stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 (proto generation) — core MVP deliverable
- **US2 (P2)**: Independent of US1 — pure documentation
- **US3 (P3)**: Depends on US1 (factory defaults inform fixture values)
- **US4 (P4)**: Independent of US1/US3 — pure documentation

### Parallel Opportunities

- T006-T007: Test file and factory file can be written in parallel (different files)
- US2 (Phase 4) and US1 (Phase 3): Can run in parallel after Phase 2
- US4 (Phase 6) and US1 (Phase 3): Can run in parallel after Phase 2
- T010-T013: All HANDOFF_MATRIX tasks are sequential (same file)

---

## Parallel Example: User Story 1

```bash
# Write test and factory in parallel:
Task T006: tests/testing/client-capture-factories.test.ts
Task T007: src/testing/factories/client-capture.ts

# Then sequentially:
Task T008: src/testing/index.ts (barrel export)
Task T009: pnpm test (validation)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Verify baseline (T001)
2. Complete Phase 2: Proto definition (T002-T005)
3. Complete Phase 3: Factory functions + tests (T006-T009)
4. **STOP and VALIDATE**: All factory round-trip tests pass
5. This alone delivers the highest-value improvement (NextClient can code against the contract)

### Incremental Delivery

1. Setup + Foundational → Proto compiles
2. US1: Factory functions → Consumer can import and test against the contract
3. US2: Service boundary docs → No more mis-routing confusion
4. US3: Golden vector fixtures → MSW mocks use canonical data
5. US4: Migration guide → BridgeServer developers can implement
6. Polish: Version bump, tag v0.5.0

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Factory functions MUST NOT import from `gen/` — they return plain `Record<string, unknown>` objects
- All factory tests use `fromJson()` from `@bufbuild/protobuf` to verify round-trip deserialization
- `capture_tag` is `string` type in the client proto (per research.md Decision 1) — NOT the device-layer enum
- `ClientUploadStatus` is redeclared in `delicasa.v1` (per research.md Decision 3) — NOT imported from device layer
- Commit after each phase or logical group
- Stop at any checkpoint to validate independently
