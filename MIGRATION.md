# MIGRATION.md — @delicasa/wire

## Adding as a dependency

### Via git URL (before npm publishing)

```bash
# BridgeServer or NextClient
pnpm add @delicasa/wire@github:DeliCasa/delicasa-wire#v0.2.0
```

### Via workspace path (monorepo)

```bash
pnpm add @delicasa/wire@workspace:*
```

## What changed in v0.2.0

### New: PiOrchestrator HTTP Boundary Schemas

Zod schemas for validating JSON responses from PiOrchestrator at trust boundaries.
Replaces in-codebase schemas like `piorch-evidence-pair.schemas.ts` (BridgeServer)
and `v1-cameras-schemas.ts` (PiDashboard).

```typescript
import {
  // Container action (BridgeServer → PiOrch)
  PiOrchContainerActionRequestSchema,
  PiOrchContainerActionResponseSchema,
  BridgeEvidenceCaptureSchema,

  // Evidence pair (BridgeServer → PiOrch)
  PiOrchEvidencePairSchema,
  PairCaptureSchema,
  PiOrchEvidencePairLivenessProofSchema,

  // Cameras (PiDashboard + BridgeServer → PiOrch)
  PiOrchCameraSchema,
  PiOrchCameraHealthSchema,
  PiOrchCameraListResponseSchema,
  CapturedEvidenceSchema,

  // Sessions (PiDashboard → PiOrch)
  PiOrchSessionSchema,
  PiOrchSessionListResponseSchema,
  STALE_THRESHOLD_SECONDS,
} from "@delicasa/wire/zod";
```

### New: MQTT Protocol Schemas

Zod schemas documenting the EspCamV2 ↔ PiOrchestrator MQTT protocol — the
4-part capture protocol, camera status/LWT, and command messages.

```typescript
import {
  MqttCaptureAckSchema,
  MqttCaptureInfoSchema,
  MqttCaptureChunkSchema,
  MqttCaptureCompleteSchema,
  MqttCaptureResponseSchema,
  MqttCameraCommandSchema,
  MqttCameraStatusSchema,
  MqttCameraLwtSchema,
  MqttTopics,
} from "@delicasa/wire/zod";
```

### New: Device Proto Package

Proto definitions for camera, session, and evidence entities under
`delicasa.device.v1`. Message types only — no gRPC services yet.

```typescript
import type { Camera } from "@delicasa/wire/gen/delicasa/device/v1/camera_pb";
import type { OperationSession } from "@delicasa/wire/gen/delicasa/device/v1/session_pb";
import type { EvidencePair } from "@delicasa/wire/gen/delicasa/device/v1/evidence_pb";
```

### Unchanged from v0.1.0

- Existing proto services: ControllerService, ContainerAccessService, PurchaseSessionService
- Existing Zod schemas: ControllerDomain, PurchaseSessionDomain, ErrorDomain
- Helper functions: `parseOrThrow`, `safeParse`

## Importing generated types

```typescript
// v0.1.0 — Client-facing service types (unchanged)
import type { Controller } from "@delicasa/wire/gen/delicasa/v1/controller_pb";
import { ControllerService } from "@delicasa/wire/gen/delicasa/v1/controller_service_pb";

// v0.2.0 — Device-layer types (new)
import type { Camera, CameraHealth } from "@delicasa/wire/gen/delicasa/device/v1/camera_pb";
import type { OperationSession } from "@delicasa/wire/gen/delicasa/device/v1/session_pb";
import type { EvidenceCapture, EvidencePair } from "@delicasa/wire/gen/delicasa/device/v1/evidence_pb";
```

## Importing Zod domain schemas

```typescript
import {
  // Domain schemas (v0.1.0)
  ControllerDomain,
  PurchaseSessionDomain,
  ErrorDomain,

  // PiOrch boundary schemas (v0.2.0)
  PiOrchContainerActionResponseSchema,
  PiOrchEvidencePairSchema,
  PiOrchCameraListResponseSchema,
  PiOrchSessionListResponseSchema,
  STALE_THRESHOLD_SECONDS,

  // MQTT schemas (v0.2.0)
  MqttCaptureAckSchema,
  MqttCameraStatusSchema,
  MqttTopics,

  // Helpers
  parseOrThrow,
  safeParse,
} from "@delicasa/wire/zod";
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

## Running buf breaking

```bash
pnpm breaking:proto
```

Compares current proto files against the latest git tag. Detects removed/changed
fields, types, RPCs, and services.

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
   git tag v0.3.0
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
