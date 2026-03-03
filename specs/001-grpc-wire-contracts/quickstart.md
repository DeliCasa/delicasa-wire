# Quickstart: @delicasa/wire

## Prerequisites

- Node.js 20+
- pnpm 9+

## Setup

```bash
git clone <repo-url> delicasa-wire
cd delicasa-wire
pnpm install
```

## Generate TypeScript from Proto

```bash
pnpm gen
```

This runs `buf generate` which reads `proto/delicasa/v1/*.proto` and outputs TypeScript to `gen/ts/`.

## Lint Proto Files

```bash
pnpm lint:proto
```

Enforces naming conventions, package structure, and Protobuf best practices.

## Format Proto Files

```bash
pnpm fmt:proto
```

Auto-formats all `.proto` files in place.

## Check for Breaking Changes

```bash
pnpm breaking:proto
```

Compares current proto files against the latest git tag. Fails if any breaking changes are detected (removed fields, renamed RPCs, etc.).

## Run Tests

```bash
pnpm test
```

Runs Vitest tests for Zod schemas and generated code validation.

## Consuming in Another Project

Add the dependency:

```bash
# Via git URL (before npm publishing)
pnpm add @delicasa/wire@github:your-org/delicasa-wire#v0.1.0
# Or via workspace path (monorepo)
pnpm add @delicasa/wire@workspace:*
```

Import generated types:

```typescript
import { Controller } from "@delicasa/wire/gen/delicasa/v1/controller_pb";
import { ControllerService } from "@delicasa/wire/gen/delicasa/v1/controller_service_pb";
```

Import Zod schemas:

```typescript
import { ControllerDomain, parseOrThrow, safeParse } from "@delicasa/wire/zod";
```

## Version Bumping

1. Make proto/schema changes
2. Run `pnpm gen` to regenerate
3. Run `pnpm lint:proto` and `pnpm test`
4. Update version in `package.json`
5. Commit and tag: `git tag v0.2.0 && git push --tags`

## Project Structure

```
delicasa-wire/
├── proto/delicasa/v1/     # Protobuf definitions (source of truth)
├── gen/ts/                # Generated TypeScript (do not edit)
├── src/zod/               # Handwritten domain Zod schemas
├── buf.yaml               # Buf workspace + lint + breaking config
├── buf.gen.yaml           # Buf code generation config
├── package.json           # @delicasa/wire package
└── .github/workflows/     # CI pipeline
```
