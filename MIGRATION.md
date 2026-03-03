# MIGRATION.md — @delicasa/wire

## Adding as a dependency

### Via git URL (before npm publishing)

```bash
# BridgeServer or NextClient
pnpm add @delicasa/wire@github:DeliCasa/delicasa-wire#v0.1.0
```

### Via workspace path (monorepo)

```bash
pnpm add @delicasa/wire@workspace:*
```

## Importing generated types

```typescript
// Message types
import type { Controller } from "@delicasa/wire/gen/delicasa/v1/controller_pb";
import type { PurchaseSession } from "@delicasa/wire/gen/delicasa/v1/purchase_session_pb";
import type { Container } from "@delicasa/wire/gen/delicasa/v1/container_pb";

// Service descriptors (for Connect clients)
import { ControllerService } from "@delicasa/wire/gen/delicasa/v1/controller_service_pb";
import { ContainerAccessService } from "@delicasa/wire/gen/delicasa/v1/container_service_pb";
import { PurchaseSessionService } from "@delicasa/wire/gen/delicasa/v1/purchase_session_service_pb";
```

## Importing Zod domain schemas

```typescript
import {
  ControllerDomain,
  PurchaseSessionDomain,
  ErrorDomain,
  parseOrThrow,
  safeParse,
} from "@delicasa/wire/zod";

// Parse with throw on failure
const controller = parseOrThrow(ControllerDomain, rawData);

// Safe parse (returns result object)
const result = safeParse(ControllerDomain, rawData);
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

## Running buf generate

After cloning or updating proto files:

```bash
pnpm install    # install deps (includes buf CLI + codegen plugin)
pnpm gen        # runs buf generate → outputs to gen/ts/
```

Generated files are in `gen/ts/` and are `.gitignore`'d. They must be regenerated after pulling proto changes.

## Running buf lint

```bash
pnpm lint:proto    # enforces Buf STANDARD lint rules
```

Checks naming conventions (snake_case fields, PascalCase messages), package structure, enum zero values (`_UNSPECIFIED`), and more.

## Running buf breaking

```bash
pnpm breaking:proto
```

Compares current proto files against the latest git tag. Detects:
- Removed fields or messages
- Changed field types or numbers
- Renamed RPCs
- Removed services

If no tags exist yet (pre-v0.1.0), the check skips gracefully.

## Formatting proto files

```bash
pnpm fmt:proto    # auto-formats all .proto files in place
```

## Bumping versions

1. Make your proto/schema changes
2. Run validation:
   ```bash
   pnpm lint:proto && pnpm gen && pnpm test
   ```
3. Update version in `package.json`
4. Commit all changes
5. Tag and push:
   ```bash
   git tag v0.2.0
   git push && git push --tags
   ```

## Consumer tsconfig requirements

Consumers need `moduleResolution` that supports the `exports` field:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

Or `"node16"` / `"nodenext"` for Node.js without a bundler.
