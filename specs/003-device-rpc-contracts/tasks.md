# Tasks: Device Connect RPC Contracts v0.3.0

**Input**: Design documents from `/specs/003-device-rpc-contracts/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Included — golden test vectors are explicitly required by the feature specification (FR-010 through FR-012).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Proto sources**: `proto/delicasa/v1/`, `proto/delicasa/device/v1/`
- **Generated output**: `gen/ts/` (gitignored, rebuilt by `pnpm gen`)
- **Zod schemas**: `src/zod/`
- **Tests**: `tests/zod/`, `tests/vectors/`
- **Docs**: `docs/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Clean working tree, validate existing toolchain, prepare for new proto files

- [x] T001 Clean untracked build artifacts (*.d.ts, *.js, *.js.map, *.tgz) from repo root and src/zod/ that leaked from a prior `tsc` run
- [x] T002 Stage and commit modified proto files (proto/delicasa/device/v1/evidence.proto, proto/delicasa/device/v1/session.proto) with descriptive message
- [x] T003 Add untracked device service protos to git (proto/delicasa/device/v1/camera_service.proto, proto/delicasa/device/v1/capture_service.proto, proto/delicasa/device/v1/evidence_service.proto, proto/delicasa/device/v1/session_service.proto)
- [x] T004 Run `pnpm lint:proto` to validate all existing + newly tracked protos pass buf STANDARD lint
- [x] T005 Run `pnpm gen` to confirm TypeScript generation succeeds for all current protos
- [x] T006 Run `pnpm test` to confirm all existing Zod schema tests pass

**Checkpoint**: Clean working tree with all device service protos tracked and passing lint + gen + test.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ensure proto tooling and conventions are solid before adding new services

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Run `pnpm breaking:proto` against v0.2.0 tag and document any breaking changes detected (UploadStatus enum move, evidence.proto upload_status type change)
- [x] T008 Create `tests/vectors/` directory structure: `tests/vectors/fixtures/` for JSON fixtures and `tests/vectors/golden-vectors.test.ts` for the test harness
- [x] T009 Update `vitest.config.ts` to include `tests/vectors/**/*.test.ts` in test discovery (if not already covered by `tests/**/*.test.ts` glob)

**Checkpoint**: Foundation ready — proto tooling validated, test infrastructure for golden vectors in place.

---

## Phase 3: User Story 1 — Device Service Contracts (Priority: P1) MVP

**Goal**: All 4 device services (CameraService, CaptureService, EvidenceService, SessionService) have finalized proto definitions that pass lint, generate TypeScript, and have golden test vectors.

**Independent Test**: `pnpm lint:proto && pnpm gen && pnpm test` passes, and `gen/ts/delicasa/device/v1/*_service_pb.{js,d.ts}` files exist with correct service descriptors.

### Implementation for User Story 1

- [x] T010 [US1] Review and finalize proto/delicasa/device/v1/camera_service.proto — ensure correlation_id is field 1 in all messages, lint passes, comments are clear
- [x] T011 [P] [US1] Review and finalize proto/delicasa/device/v1/capture_service.proto — ensure UploadStatus enum has UNSPECIFIED zero value, lint passes
- [x] T012 [P] [US1] Review and finalize proto/delicasa/device/v1/evidence_service.proto — verify imports of evidence.proto are correct, lint passes
- [x] T013 [P] [US1] Review and finalize proto/delicasa/device/v1/session_service.proto — verify imports of session.proto are correct, lint passes
- [x] T014 [US1] Run `pnpm lint:proto` to validate all 4 device service protos pass STANDARD rules
- [x] T015 [US1] Run `pnpm gen` and verify gen/ts/delicasa/device/v1/ contains camera_service_pb.{js,d.ts}, capture_service_pb.{js,d.ts}, evidence_service_pb.{js,d.ts}, session_service_pb.{js,d.ts}
- [x] T016 [P] [US1] Create golden test vector fixture tests/vectors/fixtures/camera-service.json with ListCamerasResponse and GetCameraResponse examples using proto canonical JSON (enum strings, RFC 3339 timestamps, absent optionals omitted)
- [x] T017 [P] [US1] Create golden test vector fixture tests/vectors/fixtures/capture-service.json with CaptureImageRequest and CaptureImageResponse examples
- [x] T018 [P] [US1] Create golden test vector fixture tests/vectors/fixtures/evidence-service.json with GetEvidencePairResponse and GetSessionEvidenceResponse examples
- [x] T019 [P] [US1] Create golden test vector fixture tests/vectors/fixtures/session-service.json with ListSessionsResponse and GetSessionResponse examples
- [x] T020 [US1] Write tests/vectors/golden-vectors.test.ts — import fromJson/fromJsonString from @bufbuild/protobuf, load each fixture, deserialize against generated types, assert no errors
- [x] T021 [US1] Run `pnpm test` and confirm all golden vector tests + existing Zod tests pass

**Checkpoint**: All 4 device service protos finalized, generated TS verified, golden vectors passing. User Story 1 complete.

---

## Phase 4: User Story 2 — Media/Image RPC Contracts (Priority: P1)

**Goal**: ImageService defined under delicasa.v1 with Image entity, generates TypeScript, has golden test vectors.

**Independent Test**: `pnpm lint:proto && pnpm gen` passes, `gen/ts/delicasa/v1/image_service_pb.{js,d.ts}` and `gen/ts/delicasa/v1/image_pb.{js,d.ts}` exist, golden vector tests pass.

### Implementation for User Story 2

- [x] T022 [P] [US2] Create proto/delicasa/v1/image.proto — define Image message (id, object_key, controller_id, container_id, session_id, capture_tag, content_type, size_bytes, width, height, created_at) and ImageSortField enum with UNSPECIFIED zero value
- [x] T023 [US2] Create proto/delicasa/v1/image_service.proto — define ImageService with ListImages, SearchImages, GetPresignedUrl RPCs per contracts/image-service.md. Ensure correlation_id is field 1 in all request/response messages, use page_size/page_token for pagination, import google/protobuf/timestamp.proto and delicasa/v1/image.proto
- [x] T024 [US2] Run `pnpm lint:proto` to validate image.proto and image_service.proto pass STANDARD rules
- [x] T025 [US2] Run `pnpm gen` and verify gen/ts/delicasa/v1/ contains image_pb.{js,d.ts} and image_service_pb.{js,d.ts}
- [x] T026 [US2] Create golden test vector fixture tests/vectors/fixtures/image-service.json with ListImagesResponse, SearchImagesResponse, and GetPresignedUrlResponse examples
- [x] T027 [US2] Add image-service fixture validation to tests/vectors/golden-vectors.test.ts (import Image and ImageService generated types)
- [x] T028 [US2] Run `pnpm test` and confirm all tests pass

**Checkpoint**: ImageService proto complete, generated TS verified, golden vectors passing. User Story 2 complete.

---

## Phase 5: User Story 3 — Golden Test Vectors (Priority: P2)

**Goal**: All golden vector fixtures are comprehensive, well-documented, and cover edge cases (absent timestamps, all enum values).

**Independent Test**: `pnpm test` passes, and each fixture file exercises the documented edge cases.

### Implementation for User Story 3

- [x] T029 [P] [US3] Enhance tests/vectors/fixtures/camera-service.json — add examples with all CameraStatus enum values, absent optional health fields, multiple cameras in list response
- [x] T030 [P] [US3] Enhance tests/vectors/fixtures/evidence-service.json — add EvidencePair with INCOMPLETE pair_status, absent after capture, retry_after_seconds set
- [x] T031 [P] [US3] Enhance tests/vectors/fixtures/session-service.json — add sessions with all SessionStatus values, absent started_at demonstrating timestamp omission
- [x] T032 [US3] Update tests/vectors/golden-vectors.test.ts to validate edge cases: enum round-tripping (string→enum→string), absent timestamp fields are truly undefined (not empty string), and document the convention in test comments
- [x] T033 [US3] Run `pnpm test` and confirm all enhanced golden vector tests pass

**Checkpoint**: Golden vectors comprehensive with edge case coverage. User Story 3 complete.

---

## Phase 6: User Story 4 — Handoff Matrix & Migration Docs (Priority: P2)

**Goal**: Complete documentation for cross-repo adoption: handoff matrix with per-RPC mapping, migration guide from v0.2.0 to v0.3.0.

**Independent Test**: Review docs for completeness: every RPC has a mapping row, every consumer repo has a section, curl examples are syntactically correct.

### Implementation for User Story 4

- [x] T034 [P] [US4] Create docs/HANDOFF_MATRIX.md — include: dependency pin table (per-repo package.json line), RPC→repo mapping table (all RPCs across all 8 services with implementing repo, base path, auth convention), curl POST examples for every new RPC (device services: CameraService 4 RPCs, CaptureService 1, EvidenceService 2, SessionService 2; client service: ImageService 3), per-consumer sections (BridgeServer, NextClient, PiDashboard, PiOrchestrator, EspCamV2)
- [x] T035 [P] [US4] Create docs/MIGRATION_v0.2_to_v0.3.md — include: breaking changes (UploadStatus enum move, evidence.proto upload_status type change to string), new additions (4 device services, ImageService, Image entity, OperationSession diagnostic fields), step-by-step upgrade for each consumer, find-and-replace instructions for UploadStatus migration, tsconfig requirements reminder

**Checkpoint**: All documentation complete. User Story 4 complete.

---

## Phase 7: User Story 5 — Breaking Change Validation (Priority: P3)

**Goal**: `pnpm breaking:proto` runs against v0.2.0 and any detected breaks are documented.

**Independent Test**: `pnpm breaking:proto` completes (may report intentional breaks) and the migration guide covers each break.

### Implementation for User Story 5

- [x] T036 [US5] Run `pnpm breaking:proto` against v0.2.0 tag, capture output, and cross-reference every reported break with docs/MIGRATION_v0.2_to_v0.3.md to ensure all are documented
- [x] T037 [US5] If any undocumented breaks found in T036, update docs/MIGRATION_v0.2_to_v0.3.md to cover them

**Checkpoint**: Breaking change analysis complete and documented. User Story 5 complete.

---

## Phase 8: Polish & Release

**Purpose**: Version bump, final validation, tag, and push

- [x] T038 Bump version to "0.3.0" in package.json
- [x] T039 Update Zod barrel export (src/zod/index.ts) — add v0.3.0 section comment if needed (no new Zod schemas required, but ensure barrel is clean)
- [x] T040 Run full validation pipeline: `pnpm lint:proto && pnpm gen && pnpm test && pnpm type-check`
- [x] T041 Update docs/HANDOFF.md to reference v0.3.0 and link to HANDOFF_MATRIX.md
- [ ] T042 Clean up specs/003-device-rpc-contracts/ — ensure all spec artifacts are committed
- [ ] T043 Create final commit with all v0.3.0 changes
- [ ] T044 Create git tag v0.3.0 and push tag to origin

**Checkpoint**: v0.3.0 tagged and pushed. All deliverables complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion
- **User Story 1 (Phase 3)**: Depends on Phase 2 — BLOCKS nothing (device protos already drafted)
- **User Story 2 (Phase 4)**: Depends on Phase 2 — can run in parallel with US1
- **User Story 3 (Phase 5)**: Depends on US1 and US2 (enhances their fixtures)
- **User Story 4 (Phase 6)**: Depends on US1 and US2 (needs final RPC list for mapping table)
- **User Story 5 (Phase 7)**: Depends on US1 and US2 (needs all proto changes committed)
- **Polish (Phase 8)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: After Phase 2 — independent, no cross-story deps
- **User Story 2 (P1)**: After Phase 2 — independent, no cross-story deps
- **User Story 3 (P2)**: After US1 + US2 — enhances their fixtures
- **User Story 4 (P2)**: After US1 + US2 — needs final RPC inventory
- **User Story 5 (P3)**: After US1 + US2 — needs all proto changes finalized

### Within Each User Story

- Proto definition → lint → gen → fixtures → tests → validate
- Models/entities before services (for proto imports)

### Parallel Opportunities

- **Phase 1**: T002 + T003 can partially overlap (different files)
- **Phase 3**: T010-T013 can run in parallel (4 different proto files), T016-T019 in parallel (4 fixture files)
- **Phase 4**: T022 can run in parallel with Phase 3 tasks (different package)
- **Phase 6**: T034 + T035 in parallel (different doc files)
- **US1 + US2**: Can run fully in parallel after Phase 2

---

## Parallel Example: User Story 1

```bash
# Finalize all 4 device service protos in parallel (different files):
Task T010: "Review camera_service.proto"
Task T011: "Review capture_service.proto"
Task T012: "Review evidence_service.proto"
Task T013: "Review session_service.proto"

# After lint+gen, create all 4 fixture files in parallel:
Task T016: "Create camera-service.json fixture"
Task T017: "Create capture-service.json fixture"
Task T018: "Create evidence-service.json fixture"
Task T019: "Create session-service.json fixture"
```

## Parallel Example: User Story 1 + User Story 2

```bash
# US1 and US2 have no cross-dependencies and can start simultaneously:
# Agent A: T010-T021 (device service protos + vectors)
# Agent B: T022-T028 (image service proto + vectors)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (clean tree, track protos)
2. Complete Phase 2: Foundational (breaking check, test infra)
3. Complete Phase 3: User Story 1 (device service protos + vectors)
4. Complete Phase 4: User Story 2 (ImageService proto + vectors)
5. **STOP and VALIDATE**: `pnpm lint:proto && pnpm gen && pnpm test`

### Full Delivery

6. Complete Phase 5: User Story 3 (enhanced golden vectors)
7. Complete Phase 6: User Story 4 (handoff matrix + migration docs)
8. Complete Phase 7: User Story 5 (breaking change validation)
9. Complete Phase 8: Polish & Release (version bump, tag v0.3.0)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All proto files must follow conventions: `correlation_id` at field 1, `TYPE_NAME_UNSPECIFIED` enum zero values, `snake_case` fields, `PascalCase` messages
- Golden vector fixtures use proto canonical JSON: enum strings, RFC 3339 timestamps, absent fields omitted
- Total tasks: 44
- Device service protos are already drafted (untracked) — review + refine, don't rewrite from scratch
