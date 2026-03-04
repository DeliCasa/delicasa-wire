# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

`@delicasa/wire` is the single source of truth for inter-service contracts in the DeliCasa IoT vending machine platform. Protobuf definitions generate TypeScript types + Connect RPC service stubs. Handwritten Zod schemas provide runtime boundary validation. This is a **contracts-only package** — no application logic.

## Commands

```bash
pnpm gen                # buf generate → gen/ts/ (JS + DTS from proto)
pnpm lint:proto         # buf lint (STANDARD rules)
pnpm fmt:proto          # buf format -w (auto-format protos)
pnpm breaking:proto     # buf breaking against latest git tag
pnpm test               # vitest run (Zod schema tests)
pnpm type-check         # tsc --noEmit

# Full validation (run before tagging):
pnpm lint:proto && pnpm gen && pnpm test
```

## Architecture

Two parallel layers, one generated, one handwritten:

```
proto/delicasa/v1/*.proto   →  buf generate  →  gen/ts/delicasa/v1/*_pb.{js,d.ts}
                                                 (generated, gitignored, DO NOT EDIT)

src/zod/*.ts                                     (handwritten domain schemas)
tests/zod/*.test.ts                              (Vitest tests for Zod schemas)
```

**Proto → Generated TS**: `buf.gen.yaml` uses local `protoc-gen-es` plugin with `target=js+dts,import_extension=.js`. Output is `.js` + `.d.ts` pairs under `gen/ts/`. Connect-ES v2 merged service descriptor generation into `protoc-gen-es` — only one plugin needed.

**Zod layer**: Domain schemas in `src/zod/` represent the **domain view** (camelCase, no correlation_id, domain-specific validation rules), NOT the wire format. They're for boundary validation — env vars, external API responses, data entering React components.

### Package Exports

```
"@delicasa/wire/gen/*"  →  gen/ts/*.{js,d.ts}    (wildcard subpath, crosses directories)
"@delicasa/wire/zod"    →  src/zod/index.ts       (barrel with parseOrThrow/safeParse)
```

Consumers need `"moduleResolution": "bundler"` or `"node16"` in their tsconfig.

### Proto Services

| Service | RPCs | Proto File |
|---------|------|------------|
| ControllerService | ListControllers, GetController, UpdateControllerName | controller_service.proto |
| ContainerAccessService | OpenContainer, CloseContainer | container_service.proto |
| PurchaseSessionService | GetPurchaseSession, ListPurchaseSessions | purchase_session_service.proto |

Every request/response includes `string correlation_id = 1`.

## Buf Config (v2)

- `buf.yaml`: Workspace config. Lint uses `STANDARD` category. Breaking uses `FILE` category.
- `buf.gen.yaml`: Code generation config. `clean: true` wipes `gen/ts/` before regenerating.
- No `buf.work.yaml` — v2 replaced it with the `modules` field in `buf.yaml`.

## Proto Conventions

- Package: `delicasa.v1`
- Enum zero values: `TYPE_NAME_UNSPECIFIED` (required by Buf STANDARD lint)
- Fields: `snake_case` (proto convention; generated TS uses `camelCase`)
- Messages: `PascalCase`
- Message/enum files: `controller.proto` (entities), `controller_service.proto` (RPCs)
- `correlation_id` is always field number 1 in request/response messages

## Version Bumping

1. Edit protos / Zod schemas
2. `pnpm lint:proto && pnpm gen && pnpm test`
3. Update `version` in `package.json`
4. Commit, then `git tag vX.Y.Z && git push --tags`

Breaking change detection compares against the latest git tag. Pre-first-tag, it skips gracefully.

## Key Constraints

- ESM only (`"type": "module"`). No CJS.
- `gen/` is gitignored — consumers must run `pnpm gen` after cloning or after proto changes.
- Zod schemas are handwritten, NOT auto-generated from proto. They intentionally differ from wire format.
- This repo is part of the DeliCasa monorepo ecosystem (BridgeServer, NextClient, PiOrchestrator consume it).

## Active Technologies
- TypeScript 5.7+ (ESM only), Protobuf 3 + `zod ^3.23`, `@bufbuild/protobuf ^2.2`, `@connectrpc/connect ^2.0` (002-unified-wire-contracts)
- N/A (contracts only) (002-unified-wire-contracts)

## Recent Changes
- 002-unified-wire-contracts: Added TypeScript 5.7+ (ESM only), Protobuf 3 + `zod ^3.23`, `@bufbuild/protobuf ^2.2`, `@connectrpc/connect ^2.0`
