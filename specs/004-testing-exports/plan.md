# Implementation Plan: Testing Exports & Documentation Polish

**Branch**: `004-testing-exports` | **Date**: 2026-03-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-testing-exports/spec.md`

## Summary

Enhance `@delicasa/wire` consumer ergonomics by adding typed factory functions (`./testing` export), publishing golden vector fixtures (`./fixtures/*` export), creating MQTT-to-proto mapping documentation, and preserving the ESP32 MQTT architectural decision as an ADR. Updates handoff matrix with ops baseline findings.

## Technical Context

**Language/Version**: TypeScript 5.7+ (ESM only)
**Primary Dependencies**: `@bufbuild/protobuf ^2.2` (for `JsonValue` type), `zod ^3.23` (existing, not needed for testing module)
**Storage**: N/A (contracts-only package)
**Testing**: Vitest 3.x — factory round-trip tests via `fromJson()`
**Target Platform**: Node.js 20+ / Bundler consumers (Next.js, Vite)
**Project Type**: Library (npm package)
**Performance Goals**: N/A (zero runtime cost — factory functions are dev-only)
**Constraints**: No new runtime dependencies. Factory functions return plain objects (`JsonValue`), no proto imports at runtime. Testing export is dev-only.
**Scale/Scope**: ~15 factory functions covering 8 services, 5 fixture files published, 3 new docs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Protobuf Is the Single Source of Truth | PASS | No proto changes. Factory defaults derived from existing proto definitions. |
| II. Wire Format and Domain Validation Are Separate | PASS | Factory functions produce proto JSON (wire format), not Zod domain objects. Separation maintained. |
| III. Breaking Changes MUST Be Gated | PASS | No proto changes → no breaking changes. New exports are additive. |
| IV. Contracts Only — No Application Logic | PASS | Factory functions are pure data construction (deep-merge defaults with overrides). No business logic, no DB, no HTTP. Analogous to `parseOrThrow`/`safeParse` helpers already allowed by constitution. |
| V. Lint Before Merge | PASS | No proto changes → `buf lint` unaffected. New tests added to existing vitest suite. |

**Gate result**: PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/004-testing-exports/
├── plan.md                          # This file
├── research.md                      # Phase 0 output
├── data-model.md                    # Phase 1 output
├── quickstart.md                    # Phase 1 output
├── contracts/                       # Phase 1 output
│   ├── testing-export-contract.md
│   └── fixtures-export-contract.md
├── checklists/
│   └── requirements.md
├── OPS_HANDOFF_GRPC_BASELINE.md     # Ops reference (not published)
└── tasks.md                         # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── zod/                  # Existing — no changes
└── testing/              # NEW — factory functions
    ├── index.ts          # Barrel export
    ├── factories/
    │   ├── camera.ts     # makeCamera, makeListCamerasResponse, makeGetCameraResponse, etc.
    │   ├── capture.ts    # makeCaptureImageRequest, makeCaptureImageResponse
    │   ├── evidence.ts   # makeEvidenceCapture, makeEvidencePair, makeGetEvidencePairResponse, etc.
    │   ├── session.ts    # makeOperationSession, makeListSessionsResponse, etc.
    │   └── image.ts      # makeImage, makeListImagesResponse, makeSearchImagesResponse, etc.
    └── helpers.ts        # mergeDefaults(), makeCorrelationId(), makeTimestamp()

tests/
├── zod/                  # Existing — no changes
├── vectors/
│   ├── fixtures/         # Existing JSON fixtures — now also published
│   │   ├── camera-service.json
│   │   ├── capture-service.json
│   │   ├── evidence-service.json
│   │   ├── session-service.json
│   │   └── image-service.json
│   └── golden-vectors.test.ts    # Existing — no changes
└── testing/              # NEW — factory round-trip tests
    ├── camera-factories.test.ts
    ├── capture-factories.test.ts
    ├── evidence-factories.test.ts
    ├── session-factories.test.ts
    └── image-factories.test.ts

docs/
├── HANDOFF_MATRIX.md              # UPDATED — ops baseline note
├── HANDOFF.md                     # Existing — minor update
├── MIGRATION_v0.2_to_v0.3.md     # Existing — no changes
├── MIGRATION_v0.3_to_v0.4.md     # NEW — documents new exports
├── MQTT_PROTO_MAPPING.md          # NEW — 4-phase capture protocol mapping
└── ADR-001-ESP32-STAYS-MQTT.md   # NEW — architecture decision record
```

**Structure Decision**: Extends existing single-project layout. New `src/testing/` directory parallels `src/zod/` as a separate concern. Factory functions organized by service domain, matching the proto file organization.

## Complexity Tracking

No constitution violations — table not needed.
