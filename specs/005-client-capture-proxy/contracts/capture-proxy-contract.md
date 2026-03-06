# Contract: Client-Facing Capture Proxy Service

**Package**: `@delicasa/wire`
**Proto package**: `delicasa.v1`
**Proto file**: `proto/delicasa/v1/capture_service.proto`

## Service Definition

```
service CaptureService {
  rpc RequestCapture(RequestCaptureRequest) returns (RequestCaptureResponse);
  rpc GetCaptureStatus(GetCaptureStatusRequest) returns (GetCaptureStatusResponse);
}
```

## Connect RPC Endpoints

| Method | URL Path | Auth |
|--------|----------|------|
| RequestCapture | `POST /rpc/delicasa.v1.CaptureService/RequestCapture` | Bearer JWT (Cognito) |
| GetCaptureStatus | `POST /rpc/delicasa.v1.CaptureService/GetCaptureStatus` | Bearer JWT (Cognito) |

## Import Paths

```typescript
// Service descriptor (for Connect client)
import { CaptureService } from "@delicasa/wire/gen/delicasa/v1/capture_service_pb";

// Message types
import {
  RequestCaptureRequestSchema,
  RequestCaptureResponseSchema,
  GetCaptureStatusRequestSchema,
  GetCaptureStatusResponseSchema,
  CaptureRequestStatusSchema,
  ClientUploadStatusSchema,
} from "@delicasa/wire/gen/delicasa/v1/capture_service_pb";

// Test factories
import {
  makeRequestCaptureRequest,
  makeRequestCaptureResponse,
  makeGetCaptureStatusRequest,
  makeGetCaptureStatusResponse,
} from "@delicasa/wire/testing";

// Golden vector fixtures
import fixtures from "@delicasa/wire/fixtures/client-capture-service";
```

## Contract Rules

1. `correlation_id` MUST be field number 1 in all request/response messages.
2. `capture_tag` is a `string` field (not an enum import) — consistent with `Image.capture_tag` in `image.proto`.
3. Factory functions return plain `Record<string, unknown>` objects — no proto class imports.
4. Default factory responses use `CAPTURE_REQUEST_STATUS_COMPLETED` status with all evidence fields populated.
5. Conditional fields (`evidence_id`, `object_key`, etc.) are omitted when status is not `COMPLETED`.

## Internal Routing (BridgeServer implementation detail)

```
delicasa.v1.CaptureService.RequestCapture
  → BridgeServer maps controller_id to Pi address
  → BridgeServer calls delicasa.device.v1.CaptureService.CaptureImage on PiOrchestrator
  → BridgeServer translates device response to client response
  → Returns RequestCaptureResponse to NextClient
```

BridgeServer is responsible for:
- Mapping `controller_id` → PiOrchestrator endpoint
- Mapping `capture_tag` string → device-layer `CaptureTag` enum
- Mapping device `UploadStatus` → client `ClientUploadStatus`
- Generating `request_id` for tracking
- Managing idempotency cache
