# Quickstart: Device Connect RPC Contracts v0.3.0

## Prerequisites

- Node.js 20+
- pnpm 9.15+
- Buf CLI (provided via `@bufbuild/buf` devDependency)

## Setup

```bash
cd delicasa-wire
pnpm install
pnpm gen          # Generate TypeScript from proto definitions
pnpm test         # Verify everything works
```

## What's New in v0.3.0

### New Proto Services

| Service | Package | RPCs |
|---------|---------|------|
| CameraService | delicasa.device.v1 | ListCameras, GetCamera, GetCameraStatus, ReconcileCameras |
| CaptureService | delicasa.device.v1 | CaptureImage |
| EvidenceService | delicasa.device.v1 | GetEvidencePair, GetSessionEvidence |
| SessionService | delicasa.device.v1 | ListSessions, GetSession |
| ImageService | delicasa.v1 | ListImages, SearchImages, GetPresignedUrl |

### Modified Messages

- `EvidenceCapture.upload_status`: Changed from `UploadStatus` enum to `string`
- `OperationSession`: Added 6 diagnostic fields (total_captures, successful_captures, failed_captures, has_before_open, has_after_close, pair_complete)
- `UploadStatus` enum: Moved from `evidence.proto` to `capture_service.proto`

### New Entities

- `Image` message in `delicasa.v1` — client-facing image metadata
- `ImageSortField` enum — sort options for image queries

## Consuming in TypeScript

### Import Generated Types

```typescript
// Device services (BridgeServer → PiOrchestrator, PiDashboard → PiOrchestrator)
import { CameraService } from "@delicasa/wire/gen/delicasa/device/v1/camera_service_pb";
import { CaptureService } from "@delicasa/wire/gen/delicasa/device/v1/capture_service_pb";
import { EvidenceService } from "@delicasa/wire/gen/delicasa/device/v1/evidence_service_pb";
import { SessionService } from "@delicasa/wire/gen/delicasa/device/v1/session_service_pb";

// Client-facing services (NextClient → BridgeServer)
import { ImageService } from "@delicasa/wire/gen/delicasa/v1/image_service_pb";
```

### Import Zod Schemas (unchanged)

```typescript
import {
  PiOrchCameraSchema,
  PiOrchSessionSchema,
  PiOrchEvidencePairSchema,
  parseOrThrow,
} from "@delicasa/wire/zod";
```

### Create a Connect Client

```typescript
import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { CameraService } from "@delicasa/wire/gen/delicasa/device/v1/camera_service_pb";

const transport = createConnectTransport({
  baseUrl: "http://192.168.10.1:8081",
});

const client = createClient(CameraService, transport);
const response = await client.listCameras({ correlationId: crypto.randomUUID() });
```

## Validation Pipeline

Run before committing or tagging:

```bash
pnpm lint:proto        # Buf STANDARD lint
pnpm gen               # Regenerate TypeScript
pnpm test              # Zod + golden vector tests
pnpm breaking:proto    # Breaking change check vs v0.2.0
pnpm type-check        # TypeScript compilation check
```

## Golden Test Vectors

JSON fixtures in `tests/vectors/fixtures/` provide canonical examples of every new message type. Use these for MSW mocks and unit tests:

```typescript
import cameraFixtures from "@delicasa/wire/tests/vectors/fixtures/camera-service.json";
// Use in MSW handlers, Vitest mocks, etc.
```

**Key rules for fixtures**:
- Absent Timestamp fields are omitted entirely (never empty string)
- Enum values use proto JSON string form (e.g., `"CAMERA_STATUS_ONLINE"`)
- All messages include `correlationId` (camelCase in JSON)
