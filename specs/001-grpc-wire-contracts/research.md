# Research: gRPC-First Contracts Package

**Date**: 2026-03-03
**Feature**: 001-grpc-wire-contracts

## Decision 1: Buf CLI Version & Config Format

**Decision**: Use Buf v2 configuration format (`version: v2` in `buf.yaml` and `buf.gen.yaml`).

**Rationale**: v2 unifies workspace config into a single `buf.yaml` file. The `modules` field replaces the old `buf.work.yaml`. Simpler, fewer files, current best practice.

**Alternatives considered**:
- Buf v1 config: Still supported but deprecated. Would require 3 config files instead of 2.

## Decision 2: Code Generation Plugins

**Decision**: Use only `buf.build/bufbuild/es` (remote plugin). Do NOT use `buf.build/connectrpc/es`.

**Rationale**: In Connect-ES v2 (released Nov 2024), `protoc-gen-es` now generates both Protobuf message types AND Connect service descriptors. The old `protoc-gen-connect-es` plugin was removed. One plugin does everything.

**Alternatives considered**:
- Connect-ES v1 (two plugins): Outdated, more complexity, no benefit.
- Local plugin via `@bufbuild/protoc-gen-es`: Would work but remote plugins avoid needing the binary installed locally. We'll use local plugin via devDependency for CI reproducibility.

## Decision 3: Runtime Dependencies

**Decision**:
- Runtime: `@bufbuild/protobuf` (serialization runtime), `@connectrpc/connect` (client/transport types)
- Dev: `@bufbuild/buf` (CLI), `@bufbuild/protoc-gen-es` (code generator)
- Peer: None for now — consumers install their own transport (`@connectrpc/connect-web` or `@connectrpc/connect-node`)

**Rationale**: Keep the wire package lean. Transport choice is the consumer's concern (browser vs Node.js).

## Decision 4: Package Exports & Module Format

**Decision**: ESM-only (`"type": "module"`). Exports map:
- `"./gen/*"` → `gen/ts/*` (generated code)
- `"./zod"` → `src/zod/index.ts` (domain schemas)

**Rationale**: All consumers (NextClient, BridgeServer) use modern bundlers that support ESM natively. CJS adds complexity with no concrete consumer requirement.

**Alternatives considered**:
- Dual CJS+ESM: Significantly more complex build, no consumer requires it.
- Single barrel export: Would work but prevents tree-shaking of generated code.

## Decision 5: TypeScript Configuration

**Decision**: `moduleResolution: "bundler"`, `target: "ES2020"`, `module: "ESNext"`, `declaration: true`.

**Rationale**: `bundler` resolution enables `exports` field support without requiring `.js` extensions in source imports. All consumers use bundlers (Turbopack, Vite, Wrangler).

## Decision 6: Breaking Change Detection Baseline

**Decision**: Use `buf breaking --against .git#tag=v0.1.0` (compare against latest tag) for post-v0.1.0 changes. For the initial release, no baseline exists so breaking check is a no-op.

**Rationale**: Tag-based comparison is more reliable than branch-based for a package that uses semver tags.

## Decision 7: Zod Schema Design

**Decision**: Handwritten Zod schemas in `src/zod/` — NOT auto-generated from proto definitions. Schemas represent the domain view of data, not the wire format.

**Rationale**: Wire format (proto) and domain validation have different concerns. Proto has `correlation_id` on every message; domain schemas omit infrastructure fields. Proto uses `snake_case`; domain schemas use `camelCase`. Handwritten schemas allow domain-specific validation rules (e.g., "controller name must match DC-XXX pattern").

**Alternatives considered**:
- Auto-generated Zod from proto: Produces 1:1 mapping of wire format, not useful for domain validation.
- Shared generated + manual overlay: Over-engineered for 3 schemas.

## Decision 8: buf.gen.yaml Plugin Configuration

**Decision**: Use local plugin (`local: protoc-gen-es`) with `@bufbuild/protoc-gen-es` as devDependency rather than remote plugin.

**Rationale**: Local plugin ensures exact version pinning via `package.json`, works offline, and is faster in CI (no BSR network call). The `@bufbuild/buf` npm package provides the `buf` CLI binary.

**Alternatives considered**:
- Remote plugin (`remote: buf.build/bufbuild/es`): Works but adds network dependency and version drift risk.
