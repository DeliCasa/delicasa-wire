# Tasks: gRPC-First Contracts Package (delicasa-wire)

**Input**: Design documents from `/specs/001-grpc-wire-contracts/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included — Zod schema tests required by SC-005 ("unit test pass rate of 100%").

**Organization**: Tasks grouped by user story. Each story is independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Exact file paths included in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — package.json, configs, directory structure, dependency install

- [x] T001 Create directory structure: `proto/delicasa/v1/`, `gen/ts/`, `src/zod/`, `tests/zod/`, `.github/workflows/`
- [x] T002 Create `package.json` with name `@delicasa/wire`, `"type": "module"`, exports map (`"./gen/*"` → `gen/ts/*`, `"./zod"` → `src/zod/index.ts`), and scripts: `gen` (buf generate), `lint:proto` (buf lint), `breaking:proto` (buf breaking --against .git#tag=$(git describe --tags --abbrev=0)), `fmt:proto` (buf format -w), `test` (vitest run)
- [x] T003 [P] Create `tsconfig.json` with `target: ES2020`, `module: ESNext`, `moduleResolution: bundler`, `declaration: true`, `declarationMap: true`, `strict: true`, `verbatimModuleSyntax: true`, `isolatedModules: true`, include `src/**/*.ts` and `gen/ts/**/*.ts`
- [x] T004 [P] Create `.gitignore` ignoring `node_modules/`, `gen/` (generated code rebuilt on install), `.turbo/`, `*.tsbuildinfo`
- [x] T005 [P] Create `vitest.config.ts` with default config for `tests/` directory
- [x] T006 Install dependencies: runtime (`@bufbuild/protobuf`, `@connectrpc/connect`, `zod`), dev (`@bufbuild/buf`, `@bufbuild/protoc-gen-es`, `typescript`, `vitest`)

---

## Phase 2: Foundational (Proto Definitions + Buf Config)

**Purpose**: Protobuf infrastructure and message definitions that ALL user stories depend on

**CRITICAL**: No user story work can begin until proto messages and Buf config are in place

- [x] T007 Create `buf.yaml` (version: v2) with module `path: proto`, lint rules `use: [STANDARD]`, breaking rules `use: [FILE]` in `/buf.yaml`
- [x] T008 Create `buf.gen.yaml` (version: v2) with `clean: true`, local plugin `protoc-gen-es` (`opt: target=ts`), output `gen/ts`, inputs `directory: proto` in `/buf.gen.yaml`
- [x] T009 [P] Create `proto/delicasa/v1/common.proto` with package `delicasa.v1`, imports for `google/protobuf/timestamp.proto`, message `Error` (code, message, details map), and pagination messages (PageRequest with page_size/page_token, PageResponse with next_page_token)
- [x] T010 [P] Create `proto/delicasa/v1/controller.proto` with `Controller` message (id, display_name, status, location, created_at, updated_at), `Location` message, `ControllerStatus` enum (CONTROLLER_STATUS_UNSPECIFIED, CONTROLLER_STATUS_ONLINE, CONTROLLER_STATUS_OFFLINE, CONTROLLER_STATUS_MAINTENANCE)
- [x] T011 [P] Create `proto/delicasa/v1/container.proto` with `Container` message (id, controller_id, slot_number, state), `ContainerState` enum (CONTAINER_STATE_UNSPECIFIED, CONTAINER_STATE_OPEN, CONTAINER_STATE_CLOSED, CONTAINER_STATE_LOCKED)
- [x] T012 [P] Create `proto/delicasa/v1/purchase_session.proto` with `PurchaseSession` message (id, controller_id, status, items, started_at, completed_at), `PurchaseItem` message, `PurchaseSessionStatus` enum (PURCHASE_SESSION_STATUS_UNSPECIFIED, PURCHASE_SESSION_STATUS_ACTIVE, PURCHASE_SESSION_STATUS_COMPLETED, PURCHASE_SESSION_STATUS_EXPIRED, PURCHASE_SESSION_STATUS_CANCELLED)

**Checkpoint**: All proto message types defined. Buf config ready. `pnpm lint:proto` should pass.

---

## Phase 3: User Story 1 — Developer Imports Shared Contracts (Priority: P1) MVP

**Goal**: Generate TypeScript types + Connect service stubs from proto definitions. Consumers can `import { Controller } from "@delicasa/wire/gen/delicasa/v1/controller_pb"` and get full type safety.

**Independent Test**: Import a generated type in a TS file and confirm `tsc` resolves it without errors.

### Implementation for User Story 1

- [x] T013 [P] [US1] Create `proto/delicasa/v1/controller_service.proto` with `ControllerService` (ListControllers, GetController, UpdateControllerName) — each request/response includes `string correlation_id = 1`, per contracts/proto-services.md
- [x] T014 [P] [US1] Create `proto/delicasa/v1/container_service.proto` with `ContainerAccessService` (OpenContainer, CloseContainer) — each request/response includes `string correlation_id = 1`
- [x] T015 [P] [US1] Create `proto/delicasa/v1/purchase_session_service.proto` with `PurchaseSessionService` (GetPurchaseSession, ListPurchaseSessions) — each request/response includes `string correlation_id = 1`
- [x] T016 [US1] Run `pnpm gen` (buf generate) and verify TypeScript files are generated under `gen/ts/delicasa/v1/`
- [x] T017 [US1] Run `pnpm lint:proto` and verify all proto files pass Buf STANDARD lint rules — fix any violations
- [x] T018 [US1] Verify package exports resolve: create a temporary TS file that imports from `@delicasa/wire/gen/delicasa/v1/controller_pb` and `@delicasa/wire/gen/delicasa/v1/controller_service_pb`, confirm `tsc --noEmit` passes

**Checkpoint**: US1 complete. Generated TS types importable with full type safety. Proto files lint-clean.

---

## Phase 4: User Story 2 — Developer Validates Data at Boundaries with Zod (Priority: P2)

**Goal**: Provide handwritten Zod schemas for domain entities (Controller, PurchaseSession, Error) with `parseOrThrow` and `safeParse` helpers. Importable via `@delicasa/wire/zod`.

**Independent Test**: Import Zod schema, pass valid/invalid data, confirm parse/reject behavior.

### Implementation for User Story 2

- [x] T019 [P] [US2] Create `src/zod/errors.ts` with `ErrorDomain` schema: `code` (z.string().min(1)), `message` (z.string().min(1)), `details` (z.record(z.string()).optional()) per data-model.md
- [x] T020 [P] [US2] Create `src/zod/controller.ts` with `ControllerDomain` and `LocationDomain` schemas: `id` (z.string().uuid()), `displayName` (z.string().min(1).max(50)), `status` (z.enum(["online", "offline", "maintenance"])), `location` (optional) per data-model.md
- [x] T021 [P] [US2] Create `src/zod/purchase-session.ts` with `PurchaseSessionDomain` and `PurchaseItemDomain` schemas: `id` (z.string().uuid()), `controllerId` (z.string().uuid()), `status` (z.enum(["active", "completed", "expired", "cancelled"])), `items` (z.array), `startedAt` (z.string().datetime()), `completedAt` (optional) per data-model.md
- [x] T022 [US2] Create `src/zod/index.ts` barrel export: re-export all schemas, implement `parseOrThrow<T>(schema: ZodSchema<T>, value: unknown): T` (throws ZodError on failure) and `safeParse<T>(schema: ZodSchema<T>, value: unknown): SafeParseReturnType<unknown, T>` helpers

### Tests for User Story 2

- [x] T023 [P] [US2] Create `tests/zod/errors.test.ts` — test ErrorDomain with valid data (passes), missing code (fails), empty message (fails), with/without details
- [x] T024 [P] [US2] Create `tests/zod/controller.test.ts` — test ControllerDomain with valid data (passes), invalid UUID (fails), invalid status (fails), optional location present/absent, displayName length bounds
- [x] T025 [P] [US2] Create `tests/zod/purchase-session.test.ts` — test PurchaseSessionDomain with valid data (passes), invalid status (fails), empty items array (passes), optional completedAt, invalid datetime format (fails)
- [x] T026 [US2] Run `pnpm test` and verify all Zod tests pass (100% pass rate per SC-005)

**Checkpoint**: US2 complete. Zod schemas importable via `@delicasa/wire/zod`. All tests green.

---

## Phase 5: User Story 3 — Developer Detects Breaking Changes (Priority: P2)

**Goal**: `pnpm breaking:proto` compares current proto files against the latest git tag and fails if breaking changes are detected.

**Independent Test**: Make a breaking change (remove a field), run the command, confirm it fails with a descriptive error.

### Implementation for User Story 3

- [x] T027 [US3] Verify `breaking` config in `buf.yaml` uses `FILE` category (already set in T007) — confirm `buf breaking` command is available via `npx buf breaking`
- [x] T028 [US3] Validate `breaking:proto` script in `package.json` uses `--against .git#tag=$(git describe --tags --abbrev=0)` — for pre-tag state, ensure script handles "no tags" gracefully (exit 0 with message)

**Checkpoint**: US3 complete. Breaking change detection configured and validated.

---

## Phase 6: User Story 4 — Developer Lints Proto Files (Priority: P3)

**Goal**: `pnpm lint:proto` enforces naming conventions and `pnpm fmt:proto` auto-formats proto files.

**Independent Test**: Introduce a lint violation, run lint, confirm it reports the issue.

### Implementation for User Story 4

- [x] T029 [US4] Verify `pnpm lint:proto` passes on all proto files (already validated in T017, but re-confirm after all service protos added)
- [x] T030 [US4] Verify `pnpm fmt:proto` is idempotent — run twice, confirm no changes on second run via `git diff`

**Checkpoint**: US4 complete. Lint and format tooling validated.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: CI pipeline, migration guide, and v0.1.0 tag

- [x] T031 Create `.github/workflows/ci.yml` — trigger on push/PR, steps: checkout, setup Node 20, pnpm install, `pnpm lint:proto`, `pnpm gen`, `pnpm test`, cache pnpm store
- [x] T032 Create `MIGRATION.md` at repo root — explain: how to run `buf generate`, how to bump versions (edit package.json + tag), how to run `buf breaking`/`buf lint`, dependency line for BridgeServer/NextClient
- [x] T033 Run full validation: `pnpm lint:proto && pnpm gen && pnpm test` succeeds end-to-end
- [x] T034 Tag `v0.1.0` and verify `git tag -l` shows it

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T006 install must complete)
- **US1 (Phase 3)**: Depends on Phase 2 (proto messages must exist for service protos to import)
- **US2 (Phase 4)**: Depends on Phase 1 only (Zod schemas are independent of proto gen) — CAN run in parallel with US1
- **US3 (Phase 5)**: Depends on Phase 3 (needs proto files to exist for breaking check)
- **US4 (Phase 6)**: Depends on Phase 3 (needs all proto files to exist for lint validation)
- **Polish (Phase 7)**: Depends on Phases 3–6 complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational (Phase 2). No dependencies on other stories.
- **US2 (P2)**: Depends on Setup (Phase 1) only. **Can run in parallel with US1.**
- **US3 (P2)**: Depends on US1 (needs proto files and initial generation).
- **US4 (P3)**: Depends on US1 (needs all proto files to validate lint).

### Within Each User Story

- Service protos (T013–T015) can run in parallel
- Zod schemas (T019–T021) can run in parallel
- Zod tests (T023–T025) can run in parallel
- Generation (T016) must follow all proto creation
- Test execution (T026) must follow all test file creation

### Parallel Opportunities

```
After Phase 1 completes:
  ├── Phase 2 (Foundational protos) ──→ Phase 3 (US1: Service protos + gen)
  │                                         ├── Phase 5 (US3: Breaking)
  │                                         └── Phase 6 (US4: Lint)
  └── Phase 4 (US2: Zod schemas + tests) ──────────────────────────┐
                                                                    ↓
                                                              Phase 7 (Polish)
```

---

## Parallel Example: User Story 1

```bash
# Launch all service proto files in parallel:
Task: "Create controller_service.proto in proto/delicasa/v1/"
Task: "Create container_service.proto in proto/delicasa/v1/"
Task: "Create purchase_session_service.proto in proto/delicasa/v1/"

# Then sequentially:
Task: "Run pnpm gen"
Task: "Run pnpm lint:proto"
Task: "Verify exports resolve"
```

## Parallel Example: User Story 2

```bash
# Launch all Zod schemas in parallel:
Task: "Create errors.ts in src/zod/"
Task: "Create controller.ts in src/zod/"
Task: "Create purchase-session.ts in src/zod/"

# Then barrel export:
Task: "Create index.ts in src/zod/"

# Then all tests in parallel:
Task: "Create errors.test.ts in tests/zod/"
Task: "Create controller.test.ts in tests/zod/"
Task: "Create purchase-session.test.ts in tests/zod/"

# Then validate:
Task: "Run pnpm test"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational proto messages
3. Complete Phase 3: US1 — service protos + code generation
4. **STOP and VALIDATE**: Import generated types in a TS file, confirm `tsc` passes
5. Package is usable for type-safe imports at this point

### Incremental Delivery

1. Setup + Foundational → Proto infrastructure ready
2. Add US1 (service protos + gen) → Importable contracts (MVP!)
3. Add US2 (Zod schemas) → Runtime boundary validation
4. Add US3 + US4 (breaking + lint) → Quality gates
5. Polish (CI + docs + tag) → v0.1.0 release

### Optimal Single-Developer Flow

1. Phase 1 (Setup) — 5 min
2. Phase 2 (Foundational) — 10 min
3. Phase 3 (US1) + Phase 4 (US2) in interleaved order — 20 min
4. Phase 5 + Phase 6 (validation) — 5 min
5. Phase 7 (CI + docs + tag) — 10 min
6. **Total**: ~50 min

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- US1 and US2 can run in parallel (different directories, no shared files)
- `gen/` is gitignored — generated on install via postinstall or explicit `pnpm gen`
- Breaking check (US3) is a no-op before v0.1.0 tag exists — the script should handle this gracefully
- All proto enums use `TYPE_NAME_UNSPECIFIED` as zero value per Buf STANDARD lint rules
