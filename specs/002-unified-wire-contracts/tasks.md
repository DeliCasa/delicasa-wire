# Tasks: Unified Wire Contracts v0.2.0

**Input**: Design documents from `/specs/002-unified-wire-contracts/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

## Phase 1: Setup

**Purpose**: Project structure prep and version bump

- [x] T001 Bump `version` to `0.2.0` in `package.json`
- [x] T002 Create `src/zod/constants.ts` with `STALE_THRESHOLD_SECONDS = 300` export
- [x] T003 Create `proto/delicasa/v1/device/` directory structure

---

## Phase 2: Foundational (Shared Zod Primitives)

**Purpose**: Shared enums and sub-schemas reused across multiple user stories

- [x] T004 Create shared capture-tag and capture-status enums in `src/zod/piorch-shared.ts` — `CaptureTagEnum` (`BEFORE_OPEN`, `AFTER_OPEN`, `BEFORE_CLOSE`, `AFTER_CLOSE`), `CaptureStatusEnum`, `UploadStatusEnum`, `ContainerActionErrorCodeEnum`

**Checkpoint**: Shared primitives ready — user stories can begin

---

## Phase 3: User Story 1 - BridgeServer Validates PiOrchestrator Responses (Priority: P1)

**Goal**: Zod schemas for container action response and evidence pair at the BridgeServer ↔ PiOrchestrator HTTP boundary

**Independent Test**: `pnpm test -- piorch-container-action && pnpm test -- piorch-evidence-pair`

### Tests for User Story 1

- [x] T005 [P] [US1] Write tests for `BridgeEvidenceCaptureSchema` in `tests/zod/piorch-container-action.test.ts` — valid capture, failed capture, all capture tags, missing required fields, invalid upload_status
- [x] T006 [P] [US1] Write tests for `PiOrchContainerActionResponseSchema` in `tests/zod/piorch-container-action.test.ts` — success variant with captures, error variant with error_code, malformed (missing status), all error codes
- [x] T007 [P] [US1] Write tests for `PairCaptureSchema` and `PiOrchEvidencePairSchema` in `tests/zod/piorch-evidence-pair.test.ts` — complete pair, incomplete pair with retry, missing pair, liveness proof, all pair statuses, invalid capture_tag
- [x] T008 [P] [US1] Write tests for `PiOrchContainerActionRequestSchema` in `tests/zod/piorch-container-action.test.ts` — valid open/close, missing correlation_id, invalid action

### Implementation for User Story 1

- [x] T009 [US1] Implement `BridgeEvidenceCaptureSchema` and `PiOrchContainerActionRequestSchema` in `src/zod/piorch-container-action.ts`
- [x] T010 [US1] Implement `PiOrchContainerActionResponseSchema` as discriminated union in `src/zod/piorch-container-action.ts`
- [x] T011 [US1] Implement `PairCaptureSchema`, `PiOrchEvidencePairLivenessProofSchema`, and `PiOrchEvidencePairSchema` in `src/zod/piorch-evidence-pair.ts`
- [x] T012 [US1] Export all US1 schemas from `src/zod/index.ts` barrel

**Checkpoint**: BridgeServer boundary schemas complete and tested

---

## Phase 4: User Story 2 - PiDashboard Validates Camera and Session Data (Priority: P2)

**Goal**: Zod schemas for camera list and session list at the PiDashboard ↔ PiOrchestrator boundary

**Independent Test**: `pnpm test -- piorch-camera && pnpm test -- piorch-session`

### Tests for User Story 2

- [x] T013 [P] [US2] Write tests for `PiOrchCameraHealthSchema` and `PiOrchCameraSchema` in `tests/zod/piorch-camera.test.ts` — valid camera with health, camera without health, all 8 statuses, invalid status, position bounds (1-4), deprecated `id` field
- [x] T014 [P] [US2] Write tests for `PiOrchCameraListResponseSchema` and `CapturedEvidenceSchema` in `tests/zod/piorch-camera.test.ts` — valid list response, empty cameras array, manual capture response
- [x] T015 [P] [US2] Write tests for `PiOrchSessionSchema` and `PiOrchSessionListResponseSchema` in `tests/zod/piorch-session.test.ts` — valid session all statuses, stale detection with elapsed_seconds, optional container_id, list response

### Implementation for User Story 2

- [x] T016 [P] [US2] Implement `PiOrchCameraHealthSchema`, `PiOrchCameraSchema`, `PiOrchCameraListResponseSchema`, and `CapturedEvidenceSchema` in `src/zod/piorch-camera.ts`
- [x] T017 [P] [US2] Implement `PiOrchSessionSchema` and `PiOrchSessionListResponseSchema` in `src/zod/piorch-session.ts`
- [x] T018 [US2] Export all US2 schemas and `STALE_THRESHOLD_SECONDS` from `src/zod/index.ts` barrel

**Checkpoint**: PiDashboard boundary schemas complete and tested

---

## Phase 5: User Story 3 - MQTT Protocol Schemas (Priority: P2)

**Goal**: Zod schemas for the 4-part EspCamV2 capture protocol and camera status/command messages

**Independent Test**: `pnpm test -- mqtt-capture && pnpm test -- mqtt-camera`

### Tests for User Story 3

- [x] T019 [P] [US3] Write tests for `MqttCaptureAckSchema`, `MqttCaptureInfoSchema`, `MqttCaptureChunkSchema`, `MqttCaptureCompleteSchema` in `tests/zod/mqtt-capture.test.ts` — valid payloads for each step, optional correlation/session/phase fields absent, negative chunk_index rejected, timings validated
- [x] T020 [P] [US3] Write tests for `MqttCaptureResponseSchema` in `tests/zod/mqtt-capture.test.ts` — success variant, failure variant with diagnostics, busy variant with retry_after_ms
- [x] T021 [P] [US3] Write tests for `MqttCameraCommandSchema`, `MqttCameraStatusSchema`, `MqttCameraLwtSchema` in `tests/zod/mqtt-camera.test.ts` — all 6 command actions, status with new+legacy fields, LWT payload, missing device_id rejected

### Implementation for User Story 3

- [x] T022 [P] [US3] Implement `MqttCaptureAckSchema`, `MqttCaptureInfoSchema`, `MqttCaptureChunkSchema`, `MqttCaptureCompleteSchema`, `MqttCaptureResponseSchema` in `src/zod/mqtt-capture.ts`
- [x] T023 [P] [US3] Implement `MqttCameraCommandSchema`, `MqttCameraStatusSchema`, `MqttCameraLwtSchema` in `src/zod/mqtt-camera.ts`
- [x] T024 [US3] Export all US3 schemas from `src/zod/index.ts` barrel

**Checkpoint**: MQTT protocol schemas complete and tested

---

## Phase 6: User Story 4 - MQTT Topic Builder Helpers (Priority: P3)

**Goal**: Typed topic builder functions replacing string literals

**Independent Test**: `pnpm test -- mqtt-topics`

### Tests for User Story 4

- [x] T025 [P] [US4] Write tests for `MqttTopics` in `tests/zod/mqtt-topics.test.ts` — cameraResponse with/without subtopic, cameraStatus, cameraCommand, containerCamera, VALIDATION_ERROR constant

### Implementation for User Story 4

- [x] T026 [US4] Implement `MqttTopics` namespace with builder functions in `src/zod/mqtt-topics.ts`
- [x] T027 [US4] Export `MqttTopics` from `src/zod/index.ts` barrel

**Checkpoint**: Topic helpers complete and tested

---

## Phase 7: User Story 5 - Device Proto Package (Priority: P3)

**Goal**: Proto definitions for camera, session, and evidence entities

**Independent Test**: `pnpm lint:proto && pnpm gen`

- [x] T028 [P] [US5] Create `proto/delicasa/v1/device/camera.proto` with `CameraStatus` enum, `Camera` message, `CameraHealth` message
- [x] T029 [P] [US5] Create `proto/delicasa/v1/device/session.proto` with `SessionStatus` enum, `OperationSession` message
- [x] T030 [P] [US5] Create `proto/delicasa/v1/device/evidence.proto` with `CaptureTag`, `CaptureStatus`, `UploadStatus`, `EvidencePairStatus` enums, `EvidenceCapture` message, `EvidencePair` message
- [x] T031 [US5] Run `pnpm lint:proto && pnpm gen` and verify new types generated in `gen/ts/delicasa/v1/device/`
- [x] T032 [US5] Run `pnpm breaking:proto` and confirm no breaking changes

**Checkpoint**: Proto package passes lint, generation, and breaking change check

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, CI, and release

- [x] T033 Run full validation: `pnpm lint:proto && pnpm gen && pnpm test` end-to-end
- [x] T034 [P] Update `MIGRATION.md` with v0.1.0 → v0.2.0 changes, new schema imports, Go codegen status
- [x] T035 [P] Create `docs/HANDOFF.md` with exact dependency lines per repo, /rpc endpoint base URLs, required headers/auth strategy
- [x] T036 Update `.github/workflows/ci.yml` if needed for new proto package
- [x] T037 Tag `v0.2.0`, push tag, push branch, create PR, merge, clean up branches

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational)**: Depends on Phase 1
- **Phase 3 (US1)**: Depends on Phase 2
- **Phase 4 (US2)**: Depends on Phase 2 — can parallel with Phase 3
- **Phase 5 (US3)**: Depends on Phase 2 — can parallel with Phase 3, 4
- **Phase 6 (US4)**: No schema dependencies — can parallel with Phase 3-5
- **Phase 7 (US5)**: No Zod dependencies — can parallel with Phase 3-6
- **Phase 8 (Polish)**: Depends on all user story phases complete

### User Story Dependencies

- **US1 (P1)**: Uses shared enums from Phase 2
- **US2 (P2)**: Uses shared enums from Phase 2, independent of US1
- **US3 (P2)**: Independent of all other stories
- **US4 (P3)**: Independent — topic builders have no schema deps
- **US5 (P3)**: Independent — proto definitions standalone

### Parallel Opportunities

```
Phase 2 complete →
  ├── US1 (Phase 3) ─┐
  ├── US2 (Phase 4) ─┤
  ├── US3 (Phase 5) ─┼── all can run in parallel
  ├── US4 (Phase 6) ─┤
  └── US5 (Phase 7) ─┘
                      └── Phase 8 (after all complete)
```

---

## Implementation Strategy

### Sequential (single developer)

1. Phase 1 + 2 (setup + shared enums)
2. Phase 3 (US1 — BridgeServer boundary, highest impact)
3. Phase 4 (US2 — PiDashboard boundary)
4. Phase 5 (US3 — MQTT protocol)
5. Phase 6 + 7 (topic helpers + proto, lightweight)
6. Phase 8 (docs + release)

### Task Count

- **Total**: 37 tasks
- **US1**: 8 tasks (tests + implementation)
- **US2**: 6 tasks
- **US3**: 6 tasks
- **US4**: 3 tasks
- **US5**: 5 tasks
- **Setup/Foundation/Polish**: 9 tasks
