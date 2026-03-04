# Implementation Plan: Device Connect RPC Contracts v0.3.0

**Branch**: `003-device-rpc-contracts` | **Date**: 2026-03-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-device-rpc-contracts/spec.md`

## Summary

Add Connect RPC service definitions for all device-layer boundaries (CameraService, EvidenceService, SessionService, CaptureService under `delicasa.device.v1`) and a new ImageService under `delicasa.v1` for NextClient media operations. Include golden test vectors, breaking change documentation, handoff matrix, and migration guide. Tag as v0.3.0.

## Technical Context

**Language/Version**: TypeScript 5.7+ (ESM only), Protobuf 3
**Primary Dependencies**: `@bufbuild/protobuf ^2.2`, `@connectrpc/connect ^2.0`, `zod ^3.23`
**Storage**: N/A (contracts only)
**Testing**: Vitest 3.x (Zod schema tests + golden vector tests)
**Target Platform**: npm package consumed by BridgeServer, NextClient, PiDashboard
**Project Type**: Library (contracts-only package)
**Performance Goals**: N/A (no runtime code)
**Constraints**: ESM only, `gen/` gitignored, no application logic
**Scale/Scope**: 8 proto services total (5 existing + 3 new files), ~20 RPCs, 5 consumer repos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Protobuf Is the Single Source of Truth | PASS | All new contracts originate from `.proto` files. TS is generated via `buf generate`. |
| II. Wire Format and Domain Validation Are Separate | PASS | No new Zod schemas being auto-generated from proto. Existing Zod schemas unchanged. |
| III. Breaking Changes MUST Be Gated | PASS | `UploadStatus` enum move from evidence.proto to capture_service.proto is intentional; will be documented in migration guide. `buf breaking` runs against v0.2.0 tag. |
| IV. Contracts Only — No Application Logic | PASS | Only proto definitions, generated TS, golden test fixtures, and documentation. |
| V. Lint Before Merge | PASS | CI pipeline: `pnpm lint:proto && pnpm gen && pnpm test` must be green before tag. |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/003-device-rpc-contracts/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── camera-service.md
│   ├── evidence-service.md
│   ├── session-service.md
│   ├── capture-service.md
│   └── image-service.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
proto/
├── delicasa/v1/
│   ├── common.proto                  # existing
│   ├── container.proto               # existing
│   ├── container_service.proto       # existing
│   ├── controller.proto              # existing
│   ├── controller_service.proto      # existing
│   ├── purchase_session.proto        # existing
│   ├── purchase_session_service.proto # existing
│   ├── image.proto                   # NEW — Image entity + enums
│   └── image_service.proto           # NEW — ImageService RPCs
├── delicasa/device/v1/
│   ├── camera.proto                  # existing
│   ├── camera_service.proto          # existing (untracked → commit)
│   ├── capture_service.proto         # existing (untracked → commit)
│   ├── evidence.proto                # existing (staged changes → commit)
│   ├── evidence_service.proto        # existing (untracked → commit)
│   ├── session.proto                 # existing (unstaged changes → commit)
│   └── session_service.proto         # existing (untracked → commit)

gen/ts/                               # gitignored, rebuilt by `pnpm gen`
├── delicasa/v1/
│   ├── image_pb.{js,d.ts}           # NEW generated
│   └── image_service_pb.{js,d.ts}   # NEW generated
├── delicasa/device/v1/
│   ├── camera_service_pb.{js,d.ts}  # NEW generated
│   ├── capture_service_pb.{js,d.ts} # NEW generated
│   ├── evidence_service_pb.{js,d.ts}# NEW generated
│   └── session_service_pb.{js,d.ts} # NEW generated

tests/
├── zod/                              # existing tests (unchanged)
└── vectors/                          # NEW — golden test vector tests
    ├── fixtures/                     # JSON fixture files
    │   ├── camera-service.json
    │   ├── capture-service.json
    │   ├── evidence-service.json
    │   ├── session-service.json
    │   └── image-service.json
    └── golden-vectors.test.ts        # Vitest test loading + validating fixtures

docs/
├── HANDOFF.md                        # existing (update or supersede)
├── HANDOFF_MATRIX.md                 # NEW — per-RPC mapping table
└── MIGRATION_v0.2_to_v0.3.md        # NEW — upgrade guide
```

**Structure Decision**: Extends existing flat structure. New proto files follow established naming: `<entity>.proto` for messages, `<entity>_service.proto` for RPCs. Golden test vectors get a dedicated `tests/vectors/` directory to avoid mixing with Zod schema tests.

## Complexity Tracking

No constitution violations. Table not needed.
