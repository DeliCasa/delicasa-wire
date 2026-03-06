# Implementation Plan: Client-Facing Capture Proxy Service

**Branch**: `005-client-capture-proxy` | **Date**: 2026-03-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-client-capture-proxy/spec.md`

## Summary

Add a client-facing `delicasa.v1.CaptureService` proto with `RequestCapture` and `GetCaptureStatus` RPCs so NextClient can trigger captures through BridgeServer without referencing device-layer services. Clarify the service boundary split in documentation, add factory functions and golden vector fixtures, and create a migration guide. Bump to v0.5.0.

## Technical Context

**Language/Version**: TypeScript 5.7+ (ESM only), Protobuf 3
**Primary Dependencies**: `@bufbuild/protobuf ^2.2`, `@connectrpc/connect ^2.0`, `zod ^3.23`
**Storage**: N/A (contracts-only package)
**Testing**: Vitest (round-trip deserialization tests)
**Target Platform**: npm package consumed by BridgeServer, NextClient, PiDashboard
**Project Type**: Library (contracts package)
**Performance Goals**: N/A (no runtime)
**Constraints**: No cross-package proto imports (see research.md Decision 1); no application logic (Constitution Principle IV)
**Scale/Scope**: 1 new proto service file, 4 new factory functions, ~6 test cases, documentation updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Protobuf Is the Single Source of Truth | PASS | New `capture_service.proto` under `proto/delicasa/v1/` defines the contract; TS types generated via `buf generate` |
| II. Wire Format and Domain Validation Are Separate | PASS | No new Zod schemas needed — this is a proto-only service contract |
| III. Breaking Changes MUST Be Gated | PASS | Adding a new service is non-breaking; `buf breaking` will confirm |
| IV. Contracts Only — No Application Logic | PASS | Factory functions are pure data construction (same pattern as v0.4.0); no business logic |
| V. Lint Before Merge | PASS | `pnpm lint:proto && pnpm gen && pnpm test` required before tagging |

**Gate result**: PASS — all 5 principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/005-client-capture-proxy/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── capture-proxy-contract.md
├── checklists/
│   └── requirements.md
└── spec.md
```

### Source Code (repository root)

```text
proto/delicasa/v1/
├── capture_service.proto          # NEW: client-facing CaptureService
└── (existing service protos)

src/testing/
├── factories/
│   └── client-capture.ts          # NEW: factory functions for client capture
└── index.ts                       # MODIFIED: re-export new factories

tests/
├── testing/
│   └── client-capture-factories.test.ts  # NEW: round-trip tests
└── vectors/
    └── fixtures/
        └── client-capture-service.json   # NEW: golden vector fixture

docs/
├── HANDOFF_MATRIX.md              # MODIFIED: service boundary section + routing
└── MIGRATION_v0.4_to_v0.5.md     # NEW: migration guide
```

**Structure Decision**: Follows existing conventions — one proto file per service, one factory file per service, one test file per factory file, one fixture JSON per service.
