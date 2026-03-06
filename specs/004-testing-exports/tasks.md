# Tasks: Testing Exports & Documentation Polish

**Input**: Design documents from `/specs/004-testing-exports/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included — factory functions require round-trip deserialization tests per FR-010.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Create directory structure and shared helper utilities

- [X] T001 Create testing module directory structure: `src/testing/`, `src/testing/factories/`, `tests/testing/`
- [X] T002 Create shared helper functions (mergeDefaults, makeCorrelationId, makeTimestamp) in `src/testing/helpers.ts`

---

## Phase 2: Foundational (Package Configuration)

**Purpose**: Update package.json exports and files — MUST complete before factory or fixture tasks

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Add `"./testing"` subpath export and `"./fixtures/*"` subpath export to `package.json` exports field
- [X] T004 Add `"src/testing"` and `"tests/vectors/fixtures"` to `package.json` files array
- [X] T005 Verify `pnpm pack` includes fixture JSON files and src/testing/ in the tarball

**Checkpoint**: Package exports configured — story implementation can begin

---

## Phase 3: User Story 1 — Test Fixture Factory Functions (Priority: P1) MVP

**Goal**: Consumers can `import { makeCamera, ... } from "@delicasa/wire/testing"` and build valid proto JSON fixtures with partial overrides

**Independent Test**: Import a factory, call it with overrides, pass result to `fromJson()` — deserialization succeeds

### Tests for User Story 1

- [X] T006 [P] [US1] Write round-trip deserialization tests for camera factories in `tests/testing/camera-factories.test.ts`
- [X] T007 [P] [US1] Write round-trip deserialization tests for capture factories in `tests/testing/capture-factories.test.ts`
- [X] T008 [P] [US1] Write round-trip deserialization tests for evidence factories in `tests/testing/evidence-factories.test.ts`
- [X] T009 [P] [US1] Write round-trip deserialization tests for session factories in `tests/testing/session-factories.test.ts`
- [X] T010 [P] [US1] Write round-trip deserialization tests for image factories in `tests/testing/image-factories.test.ts`

### Implementation for User Story 1

- [X] T011 [P] [US1] Implement camera factories (makeCamera, makeCameraHealth, makeListCamerasResponse, makeGetCameraResponse, makeGetCameraStatusResponse, makeReconcileCamerasResponse) in `src/testing/factories/camera.ts`
- [X] T012 [P] [US1] Implement capture factories (makeCaptureImageRequest, makeCaptureImageResponse) in `src/testing/factories/capture.ts`
- [X] T013 [P] [US1] Implement evidence factories (makeEvidenceCapture, makeEvidencePair, makeGetEvidencePairResponse, makeGetSessionEvidenceResponse) in `src/testing/factories/evidence.ts`
- [X] T014 [P] [US1] Implement session factories (makeOperationSession, makeListSessionsResponse, makeGetSessionResponse) in `src/testing/factories/session.ts`
- [X] T015 [P] [US1] Implement image factories (makeImage, makeListImagesResponse, makeSearchImagesResponse, makeGetPresignedUrlResponse) in `src/testing/factories/image.ts`
- [X] T016 [US1] Create barrel export re-exporting all factories and helpers from `src/testing/index.ts`
- [X] T017 [US1] Run all factory tests and verify 100% pass with `pnpm test`

**Checkpoint**: All factory functions importable from `@delicasa/wire/testing`, all round-trip tests pass

---

## Phase 4: User Story 2 — Published Fixture Exports (Priority: P2)

**Goal**: Consumers can `import fixtures from "@delicasa/wire/fixtures/camera-service"` to get canonical proto JSON test data

**Independent Test**: Run `pnpm pack`, inspect tarball for fixture files, verify import resolves in a consumer-like test

- [X] T018 [US2] Write a test in `tests/testing/fixture-exports.test.ts` that imports each fixture file via the module path and verifies it contains expected keys
- [X] T019 [US2] Run `pnpm pack` and verify tarball includes all 5 fixture JSON files under `tests/vectors/fixtures/`
- [X] T020 [US2] Update HANDOFF_MATRIX.md fixture references (line ~190-191) to use the new `@delicasa/wire/fixtures/*` import path in `docs/HANDOFF_MATRIX.md`

**Checkpoint**: Golden vector fixtures are importable from the published package

---

## Phase 5: User Story 3 — MQTT-to-Proto Mapping Document (Priority: P3)

**Goal**: A single document shows how the 4-phase MQTT capture protocol maps to CaptureImageResponse proto fields

**Independent Test**: Read the doc and identify which MQTT field maps to which proto response field

- [X] T021 [US3] Create `docs/MQTT_PROTO_MAPPING.md` with 4-phase protocol table (Ack → Info → Chunk → Complete), MQTT topic patterns, Zod schema references, and proto field mappings
- [X] T022 [US3] Add error scenario mapping table (timeout → CAPTURE_STATUS_TIMEOUT, failure → CAPTURE_STATUS_FAILED) to `docs/MQTT_PROTO_MAPPING.md`
- [X] T023 [US3] Add cross-reference link from HANDOFF_MATRIX.md CaptureService section to the new mapping doc in `docs/HANDOFF_MATRIX.md`

**Checkpoint**: PiOrchestrator contributors can read one doc to understand MQTT→Proto translation

---

## Phase 6: User Story 4 — ESP32 MQTT Architecture Decision Record (Priority: P4)

**Goal**: Document why ESP32 stays on MQTT as a non-negotiable architectural constraint

**Independent Test**: ADR file exists with decision, rationale, alternatives, consequences sections

- [X] T024 [US4] Create `docs/ADR-001-ESP32-STAYS-MQTT.md` with ADR sections: Title, Status (Accepted), Context (ESP32 hardware constraints, no HTTP/2 stack), Decision, Alternatives Considered, Consequences
- [X] T025 [US4] Add link to ADR from HANDOFF_MATRIX.md EspCamV2 section in `docs/HANDOFF_MATRIX.md`

**Checkpoint**: Non-negotiable ESP32 MQTT decision has a single authoritative source

---

## Phase 7: User Story 5 — Handoff Matrix Ops Baseline Update (Priority: P5)

**Goal**: HANDOFF_MATRIX.md reflects ops baseline findings (Connect RPC 404, JWT audience concern)

**Independent Test**: Read HANDOFF_MATRIX.md and find implementation status note for BridgeServer

- [X] T026 [US5] Add "Implementation Status" subsection to HANDOFF_MATRIX.md BridgeServer adoption guide noting Connect RPC 404 baseline (from ops handoff) in `docs/HANDOFF_MATRIX.md`
- [X] T027 [US5] Add open item note about JWT audience hardcoding (workers.dev) to HANDOFF_MATRIX.md NextClient section in `docs/HANDOFF_MATRIX.md`

**Checkpoint**: Handoff matrix reflects real-world deployment state

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Migration doc, version bump, full validation

- [X] T028 Create `docs/MIGRATION_v0.3_to_v0.4.md` documenting new `./testing` and `./fixtures/*` exports with import examples
- [X] T029 Update `docs/HANDOFF.md` title to reference v0.4.0
- [X] T030 Bump version to `0.4.0` in `package.json`
- [X] T031 Run full validation: `pnpm lint:proto && pnpm gen && pnpm test` — all tests must pass
- [X] T032 Run `pnpm breaking:proto` against v0.3.0 tag — confirm no breaking changes
- [ ] T033 Commit all changes, create PR, merge, tag v0.4.0, push tag, delete feature branch

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — factory functions need helpers and package config
- **US2 (Phase 4)**: Depends on Phase 2 only — fixture publishing is independent of factories
- **US3 (Phase 5)**: No code dependencies — docs only, can start after Phase 2
- **US4 (Phase 6)**: No code dependencies — docs only, can start after Phase 2
- **US5 (Phase 7)**: No code dependencies — docs only, can start after Phase 2
- **Polish (Phase 8)**: Depends on all stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 helpers — core MVP deliverable
- **US2 (P2)**: Independent of US1 — only needs package.json config from Phase 2
- **US3 (P3)**: Independent — pure documentation
- **US4 (P4)**: Independent — pure documentation
- **US5 (P5)**: Independent — pure documentation

### Parallel Opportunities

- T006-T010: All 5 test files can be written in parallel
- T011-T015: All 5 factory files can be written in parallel
- US2-US5 (Phases 4-7): All can run in parallel after Phase 2
- T021-T022: Both mapping doc tasks are sequential (same file)
- T026-T027: Both handoff matrix tasks are sequential (same file)

---

## Parallel Example: User Story 1

```bash
# Write all 5 test files in parallel:
Task T006: camera-factories.test.ts
Task T007: capture-factories.test.ts
Task T008: evidence-factories.test.ts
Task T009: session-factories.test.ts
Task T010: image-factories.test.ts

# Write all 5 factory files in parallel:
Task T011: factories/camera.ts
Task T012: factories/capture.ts
Task T013: factories/evidence.ts
Task T014: factories/session.ts
Task T015: factories/image.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Package config (T003-T005)
3. Complete Phase 3: Factory functions + tests (T006-T017)
4. **STOP and VALIDATE**: All factory round-trip tests pass
5. This alone delivers the highest-value improvement (consumer ergonomics)

### Incremental Delivery

1. Setup + Foundational → Package config ready
2. US1: Factory functions → Test independently → Consumer can import factories
3. US2: Published fixtures → Fixture JSON importable from package
4. US3-US5: Documentation → MQTT mapping, ADR, ops baseline
5. Polish: Migration doc, version bump, tag v0.4.0

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Factory functions MUST NOT import from `gen/` — they return plain JsonValue objects
- All factory tests use `fromJson()` from `@bufbuild/protobuf` to verify round-trip deserialization
- Commit after each phase or logical group
- Stop at any checkpoint to validate independently
