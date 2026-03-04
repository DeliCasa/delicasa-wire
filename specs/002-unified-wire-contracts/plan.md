# Implementation Plan: Unified Wire Contracts v0.2.0

**Branch**: `002-unified-wire-contracts` | **Date**: 2026-03-03 | **Spec**: [spec.md](./spec.md)

## Summary

Extend `@delicasa/wire` from covering only NextClient ↔ BridgeServer (gRPC/Connect)
to covering ALL four service boundaries: BridgeServer ↔ PiOrchestrator (HTTP),
PiDashboard ↔ PiOrchestrator (HTTP), EspCamV2 ↔ PiOrchestrator (MQTT), and the
existing NextClient ↔ BridgeServer (gRPC). Primary deliverables are handwritten
Zod schemas for HTTP/MQTT boundaries plus a new `delicasa.v1.device` proto package
for language-agnostic device entity definitions.

## Technical Context

**Language/Version**: TypeScript 5.7+ (ESM only), Protobuf 3
**Primary Dependencies**: `zod ^3.23`, `@bufbuild/protobuf ^2.2`, `@connectrpc/connect ^2.0`
**Dev Dependencies**: `@bufbuild/buf ^1.47`, `@bufbuild/protoc-gen-es ^2.2`, `vitest ^3.0`
**Storage**: N/A (contracts only)
**Testing**: Vitest 3.x
**Target Platform**: Node.js 18+, browser (via bundler)
**Project Type**: Library (shared contracts package)
**Constraints**: No runtime application logic. ESM only. Generated code gitignored.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Protobuf Single Source of Truth | PASS with caveat | New proto package `delicasa.v1.device` added for camera/session/evidence types. HTTP/MQTT Zod schemas are boundary validation schemas (Principle II territory) — they validate JSON payloads at trust boundaries, not gRPC wire format. |
| II. Wire/Domain Separation | PASS | New Zod schemas validate REST/MQTT payloads at service boundaries. Proto defines the language-agnostic IDL. These are independent concerns. |
| III. Breaking Changes Gated | PASS | All changes are additive — new files only. No existing proto modifications. `buf breaking` passes trivially. |
| IV. Contracts Only | PASS | No business logic added. Only schemas, topic helpers, and tests. |
| V. Lint Before Merge | PASS | CI pipeline covers lint:proto + gen + test. All new protos must pass STANDARD lint. |

**Note on Principle I caveat**: The constitution was written when the package only
had gRPC services. REST and MQTT boundaries are naturally validated by Zod at
runtime (not proto). The new `device` proto package provides the *structural
definition* in protobuf IDL while the Zod schemas provide *runtime validation*.
This is consistent with Principle II. No constitution amendment needed — the
principles already support this separation.

## Project Structure

### Documentation (this feature)

```text
specs/002-unified-wire-contracts/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── service-boundaries.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
proto/
├── delicasa/v1/                   # Existing (v0.1.0)
│   ├── common.proto
│   ├── controller.proto
│   ├── controller_service.proto
│   ├── container.proto
│   ├── container_service.proto
│   ├── purchase_session.proto
│   └── purchase_session_service.proto
└── delicasa/device/v1/            # NEW (v0.2.0)
    ├── camera.proto               # CameraStatus enum, Camera, CameraHealth
    ├── session.proto              # SessionStatus enum, OperationSession
    └── evidence.proto             # CaptureTag, CaptureStatus, EvidenceCapture, EvidencePair

src/zod/
├── index.ts                       # Barrel export (extended)
├── controller.ts                  # Existing (v0.1.0)
├── errors.ts                      # Existing (v0.1.0)
├── purchase-session.ts            # Existing (v0.1.0)
├── piorch-container-action.ts     # NEW: container action req/res schemas
├── piorch-evidence-pair.ts        # NEW: evidence pair + pair capture schemas
├── piorch-camera.ts               # NEW: camera + health schemas
├── piorch-session.ts              # NEW: session schemas
├── mqtt-capture.ts                # NEW: 4-part capture protocol schemas
├── mqtt-camera.ts                 # NEW: camera status/lwt/command schemas
├── mqtt-topics.ts                 # NEW: topic builder helpers
└── constants.ts                   # NEW: STALE_THRESHOLD_SECONDS, etc.

tests/zod/
├── controller.test.ts             # Existing (v0.1.0)
├── errors.test.ts                 # Existing (v0.1.0)
├── purchase-session.test.ts       # Existing (v0.1.0)
├── piorch-container-action.test.ts  # NEW
├── piorch-evidence-pair.test.ts     # NEW
├── piorch-camera.test.ts             # NEW
├── piorch-session.test.ts            # NEW
├── mqtt-capture.test.ts              # NEW
├── mqtt-camera.test.ts               # NEW
└── mqtt-topics.test.ts               # NEW

docs/
└── HANDOFF.md                     # NEW: per-repo integration guide

gen/ts/delicasa/v1/                # Existing generated (v0.1.0)
gen/ts/delicasa/device/v1/         # NEW generated (v0.2.0)
```

**Structure Decision**: Single-project library. Extends existing structure with
new Zod schema files organized by service boundary (piorch-*, mqtt-*) and a
new proto sub-package for device entities.

## Complexity Tracking

No constitution violations. No complexity justifications needed.
