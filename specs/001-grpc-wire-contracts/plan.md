# Implementation Plan: gRPC-First Contracts Package

**Branch**: `001-grpc-wire-contracts` | **Date**: 2026-03-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-grpc-wire-contracts/spec.md`

## Summary

Create `@delicasa/wire` — the single source of truth for all inter-service contracts in the DeliCasa platform. Protobuf definitions generate TypeScript types and Connect RPC service stubs. Handwritten Zod schemas provide runtime boundary validation. Buf v2 enforces lint rules and breaking change detection. CI gates every PR. Tagged as v0.1.0.

## Technical Context

**Language/Version**: TypeScript 5.x (generated + handwritten), Protobuf 3 (proto definitions)
**Primary Dependencies**: `@bufbuild/protobuf` (runtime), `@connectrpc/connect` (service types), `@bufbuild/buf` (CLI), `@bufbuild/protoc-gen-es` (codegen), `zod` (validation)
**Storage**: N/A (contracts package, no persistence)
**Testing**: Vitest (Zod schema tests, generated code smoke tests)
**Target Platform**: Node.js 20+ / modern browsers (ESM only)
**Project Type**: Library (shared contracts package)
**Performance Goals**: Code generation under 5 seconds, package install + gen under 30 seconds
**Constraints**: Zero runtime dependencies beyond `@bufbuild/protobuf`, `@connectrpc/connect`, and `zod`
**Scale/Scope**: 3 services, ~10 RPCs, 5 entities, 3 Zod schemas

## Constitution Check

*No constitution file found. No gates to enforce.*

**Post-design re-check**: N/A.

## Project Structure

### Documentation (this feature)

```text
specs/001-grpc-wire-contracts/
├── plan.md              # This file
├── research.md          # Phase 0: technology decisions
├── data-model.md        # Phase 1: entity definitions
├── quickstart.md        # Phase 1: developer quickstart
├── contracts/           # Phase 1: service contract specs
│   └── proto-services.md
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
delicasa-wire/
├── proto/
│   └── delicasa/
│       └── v1/
│           ├── common.proto               # CorrelationId, Error, pagination
│           ├── controller.proto            # Controller message + enums
│           ├── controller_service.proto    # ControllerService RPCs
│           ├── container.proto             # Container message + enums
│           ├── container_service.proto     # ContainerAccessService RPCs
│           ├── purchase_session.proto      # PurchaseSession message + enums
│           └── purchase_session_service.proto  # PurchaseSessionService RPCs
├── gen/
│   └── ts/                                # Generated TypeScript (do not edit)
│       └── delicasa/
│           └── v1/
│               ├── common_pb.ts
│               ├── controller_pb.ts
│               ├── controller_service_pb.ts
│               ├── container_pb.ts
│               ├── container_service_pb.ts
│               ├── purchase_session_pb.ts
│               └── purchase_session_service_pb.ts
├── src/
│   └── zod/
│       ├── index.ts                       # Barrel export + helpers
│       ├── controller.ts                  # ControllerDomain schema
│       ├── purchase-session.ts            # PurchaseSessionDomain schema
│       └── errors.ts                      # ErrorDomain schema
├── tests/
│   └── zod/
│       ├── controller.test.ts
│       ├── purchase-session.test.ts
│       └── errors.test.ts
├── .github/
│   └── workflows/
│       └── ci.yml                         # Lint + gen + test pipeline
├── buf.yaml                               # Buf v2 workspace config
├── buf.gen.yaml                           # Buf v2 generation config
├── package.json                           # @delicasa/wire
├── tsconfig.json                          # TypeScript config
├── vitest.config.ts                       # Test config
├── .gitignore
└── MIGRATION.md                           # Consumer migration guide
```

**Structure Decision**: Single library project. Proto definitions in `proto/`, generated output in `gen/ts/`, handwritten source in `src/`. Tests mirror source structure. No build step for proto → TS beyond `buf generate`. Zod source compiled by consumers' bundlers directly (no pre-compilation needed since we ship `.ts` source for Zod and `.js` + `.d.ts` for generated code).

## Complexity Tracking

No constitution violations. No complexity justifications needed.
