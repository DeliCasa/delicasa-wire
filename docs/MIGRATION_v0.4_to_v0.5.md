# Migration Guide: v0.4.0 → v0.5.0

**Date**: 2026-03-06

## Overview

v0.5.0 adds the **client-facing `delicasa.v1.CaptureService`** — a capture proxy contract for BridgeServer that NextClient uses to trigger image captures without calling device-layer services directly.

## Dependency Update

```jsonc
// All consumer repos:
"@delicasa/wire": "0.5.0"
```

Then: `pnpm install && pnpm gen` (in wire package) to regenerate TypeScript from protos.

## New: Client-Facing CaptureService

### Proto

New file: `proto/delicasa/v1/capture_service.proto`

| RPC | Description |
|-----|-------------|
| `RequestCapture` | Client triggers an image capture on a controller's camera |
| `GetCaptureStatus` | Client polls for capture completion status |

### Import Paths

```typescript
// Generated service descriptor + message schemas
import {
  CaptureServiceSchema,
  RequestCaptureRequestSchema,
  RequestCaptureResponseSchema,
  GetCaptureStatusRequestSchema,
  GetCaptureStatusResponseSchema,
} from "@delicasa/wire/gen/delicasa/v1/capture_service_pb";

// Factory functions for tests
import {
  makeRequestCaptureRequest,
  makeRequestCaptureResponse,
  makeGetCaptureStatusRequest,
  makeGetCaptureStatusResponse,
} from "@delicasa/wire/testing";

// Golden vector fixtures for MSW mocks
import clientCaptureFixtures from "@delicasa/wire/fixtures/client-capture-service";
```

### Proxy Routing

BridgeServer implements `delicasa.v1.CaptureService` and internally proxies to `delicasa.device.v1.CaptureService.CaptureImage` on PiOrchestrator:

```
NextClient → BridgeServer (delicasa.v1.CaptureService.RequestCapture)
                ↓ internal proxy
             PiOrchestrator (delicasa.device.v1.CaptureService.CaptureImage)
```

### curl Examples

```bash
# RequestCapture
curl -X POST https://bridge.delicasa.dev/rpc/delicasa.v1.CaptureService/RequestCapture \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $COGNITO_JWT" \
  -d '{"correlationId": "test-001", "controllerId": "ctrl-001", "captureTag": "CAPTURE_TAG_BEFORE_OPEN", "idempotencyKey": "idem-001", "sessionId": "session-001"}'

# GetCaptureStatus
curl -X POST https://bridge.delicasa.dev/rpc/delicasa.v1.CaptureService/GetCaptureStatus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $COGNITO_JWT" \
  -d '{"correlationId": "test-002", "requestId": "req-001"}'
```

### Enums

Two new enums in `delicasa.v1`:

| Enum | Values |
|------|--------|
| `CaptureRequestStatus` | `UNSPECIFIED`, `ACCEPTED`, `COMPLETED`, `FAILED`, `TIMEOUT` |
| `ClientUploadStatus` | `UNSPECIFIED`, `UPLOADED`, `FAILED`, `UNVERIFIED` |

These are intentionally separate from the device-layer enums in `delicasa.device.v1` to maintain service boundary independence.

## BridgeServer Must Implement

BridgeServer developers need to create Connect handlers for:

1. **`RequestCapture`** — Accept client request, forward to PiOrchestrator's `CaptureImage`, map device response to `RequestCaptureResponse`
2. **`GetCaptureStatus`** — Poll device endpoint or read from request status cache, return `GetCaptureStatusResponse`

Register routes under: `/rpc/delicasa.v1.CaptureService/`

## No Breaking Changes

All additions are backward-compatible. Existing services, factories, and fixtures are unchanged.
