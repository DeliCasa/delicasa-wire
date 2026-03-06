# Handoff Matrix — @delicasa/wire v0.4.0

**Created**: 2026-03-04
**Updated**: 2026-03-06
**Wire Package**: `@delicasa/wire@0.4.0`

## Dependency Pin

Add to each consumer repo's `package.json`:

```jsonc
// BridgeServer/package.json
"@delicasa/wire": "0.4.0"

// NextClient/package.json
"@delicasa/wire": "0.4.0"

// PiDashboard/package.json
"@delicasa/wire": "0.4.0"
```

**tsconfig requirement**: `"moduleResolution": "bundler"` or `"node16"` (required for subpath exports).

After install: `pnpm gen` (in wire package) to regenerate TypeScript from protos.

---

## RPC Method → Implementation Mapping

### Client-Facing Services (delicasa.v1) — BridgeServer implements

| RPC Method | Service | Base Path | Auth | Implementing Repo |
|-----------|---------|-----------|------|-------------------|
| ListControllers | ControllerService | `/rpc/delicasa.v1.ControllerService/ListControllers` | Bearer JWT (Cognito) | BridgeServer |
| GetController | ControllerService | `/rpc/delicasa.v1.ControllerService/GetController` | Bearer JWT (Cognito) | BridgeServer |
| UpdateControllerName | ControllerService | `/rpc/delicasa.v1.ControllerService/UpdateControllerName` | Bearer JWT (Cognito) | BridgeServer |
| OpenContainer | ContainerAccessService | `/rpc/delicasa.v1.ContainerAccessService/OpenContainer` | Bearer JWT (Cognito) | BridgeServer |
| CloseContainer | ContainerAccessService | `/rpc/delicasa.v1.ContainerAccessService/CloseContainer` | Bearer JWT (Cognito) | BridgeServer |
| GetPurchaseSession | PurchaseSessionService | `/rpc/delicasa.v1.PurchaseSessionService/GetPurchaseSession` | Bearer JWT (Cognito) | BridgeServer |
| ListPurchaseSessions | PurchaseSessionService | `/rpc/delicasa.v1.PurchaseSessionService/ListPurchaseSessions` | Bearer JWT (Cognito) | BridgeServer |
| **ListImages** | **ImageService** | `/rpc/delicasa.v1.ImageService/ListImages` | Bearer JWT (Cognito) | **BridgeServer** |
| **SearchImages** | **ImageService** | `/rpc/delicasa.v1.ImageService/SearchImages` | Bearer JWT (Cognito) | **BridgeServer** |
| **GetPresignedUrl** | **ImageService** | `/rpc/delicasa.v1.ImageService/GetPresignedUrl` | Bearer JWT (Cognito) | **BridgeServer** |

### Device Services (delicasa.device.v1) — PiOrchestrator implements

| RPC Method | Service | Base Path | Auth | Implementing Repo |
|-----------|---------|-----------|------|-------------------|
| **ListCameras** | **CameraService** | `/rpc/delicasa.device.v1.CameraService/ListCameras` | X-API-Key / none (LAN) | **PiOrchestrator** |
| **GetCamera** | **CameraService** | `/rpc/delicasa.device.v1.CameraService/GetCamera` | X-API-Key / none (LAN) | **PiOrchestrator** |
| **GetCameraStatus** | **CameraService** | `/rpc/delicasa.device.v1.CameraService/GetCameraStatus` | X-API-Key / none (LAN) | **PiOrchestrator** |
| **ReconcileCameras** | **CameraService** | `/rpc/delicasa.device.v1.CameraService/ReconcileCameras` | X-API-Key (required) | **PiOrchestrator** |
| **CaptureImage** | **CaptureService** | `/rpc/delicasa.device.v1.CaptureService/CaptureImage` | X-API-Key | **PiOrchestrator** |
| **GetEvidencePair** | **EvidenceService** | `/rpc/delicasa.device.v1.EvidenceService/GetEvidencePair` | X-API-Key / none (LAN) | **PiOrchestrator** |
| **GetSessionEvidence** | **EvidenceService** | `/rpc/delicasa.device.v1.EvidenceService/GetSessionEvidence` | X-API-Key / none (LAN) | **PiOrchestrator** |
| **ListSessions** | **SessionService** | `/rpc/delicasa.device.v1.SessionService/ListSessions` | X-API-Key / none (LAN) | **PiOrchestrator** |
| **GetSession** | **SessionService** | `/rpc/delicasa.device.v1.SessionService/GetSession` | X-API-Key / none (LAN) | **PiOrchestrator** |

**Bold** = new in v0.3.0

---

## Auth Convention

| Boundary | Header | Value | Notes |
|----------|--------|-------|-------|
| NextClient → BridgeServer | `Authorization` | `Bearer <cognito-jwt>` | AWS Cognito ID token |
| BridgeServer → PiOrchestrator | `X-API-Key` | Shared secret | Configured in PiOrch env |
| PiDashboard → PiOrchestrator | None | N/A | Local LAN access (192.168.10.0/24) |
| EspCamV2 → PiOrchestrator | MQTT credentials | username/password | Over local WiFi AP |

---

## curl Examples (Connect Protocol — POST with JSON)

All Connect RPC endpoints accept `POST` with `Content-Type: application/json`.

### CameraService

```bash
# ListCameras
curl -X POST http://192.168.10.1:8081/rpc/delicasa.device.v1.CameraService/ListCameras \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $PI_API_KEY" \
  -d '{"correlationId": "test-001"}'

# GetCamera
curl -X POST http://192.168.10.1:8081/rpc/delicasa.device.v1.CameraService/GetCamera \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $PI_API_KEY" \
  -d '{"correlationId": "test-002", "deviceId": "esp32-cam-01"}'

# GetCameraStatus
curl -X POST http://192.168.10.1:8081/rpc/delicasa.device.v1.CameraService/GetCameraStatus \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $PI_API_KEY" \
  -d '{"correlationId": "test-003", "deviceId": "esp32-cam-01"}'

# ReconcileCameras
curl -X POST http://192.168.10.1:8081/rpc/delicasa.device.v1.CameraService/ReconcileCameras \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $PI_API_KEY" \
  -d '{"correlationId": "test-004"}'
```

### CaptureService

> **Implementation note**: CaptureImage triggers the 4-phase MQTT capture protocol (Ack → Info → Chunk → Complete) between PiOrchestrator and ESP32. See [MQTT_PROTO_MAPPING.md](./MQTT_PROTO_MAPPING.md) for the complete field-by-field mapping from MQTT messages to the `CaptureImageResponse` proto.

```bash
# CaptureImage
curl -X POST http://192.168.10.1:8081/rpc/delicasa.device.v1.CaptureService/CaptureImage \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $PI_API_KEY" \
  -d '{"correlationId": "test-005", "cameraId": "esp32-cam-01", "idempotencyKey": "idem-123"}'
```

### EvidenceService

```bash
# GetEvidencePair
curl -X POST http://192.168.10.1:8081/rpc/delicasa.device.v1.EvidenceService/GetEvidencePair \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $PI_API_KEY" \
  -d '{"correlationId": "test-006", "sessionId": "session-001"}'

# GetSessionEvidence
curl -X POST http://192.168.10.1:8081/rpc/delicasa.device.v1.EvidenceService/GetSessionEvidence \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $PI_API_KEY" \
  -d '{"correlationId": "test-007", "sessionId": "session-001"}'
```

### SessionService

```bash
# ListSessions
curl -X POST http://192.168.10.1:8081/rpc/delicasa.device.v1.SessionService/ListSessions \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $PI_API_KEY" \
  -d '{"correlationId": "test-008", "limit": 50}'

# GetSession
curl -X POST http://192.168.10.1:8081/rpc/delicasa.device.v1.SessionService/GetSession \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $PI_API_KEY" \
  -d '{"correlationId": "test-009", "sessionId": "session-001"}'
```

### ImageService

```bash
# ListImages (via BridgeServer)
curl -X POST https://bridge.delicasa.dev/rpc/delicasa.v1.ImageService/ListImages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $COGNITO_JWT" \
  -d '{"correlationId": "test-010", "controllerId": "ctrl-001", "pageSize": 20}'

# SearchImages
curl -X POST https://bridge.delicasa.dev/rpc/delicasa.v1.ImageService/SearchImages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $COGNITO_JWT" \
  -d '{"correlationId": "test-011", "controllerId": "ctrl-001", "sessionId": "session-001", "pageSize": 20}'

# GetPresignedUrl
curl -X POST https://bridge.delicasa.dev/rpc/delicasa.v1.ImageService/GetPresignedUrl \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $COGNITO_JWT" \
  -d '{"correlationId": "test-012", "objectKey": "evidence/2026/03/04/ev-before-001.jpg", "expiresInSeconds": 3600}'
```

---

## Per-Consumer Adoption Guide

### BridgeServer

1. Add `"@delicasa/wire": "0.4.0"` to `package.json`
2. Run `pnpm install && pnpm gen` (in wire package)
3. **Implement ImageService**: Create Connect handler for ListImages, SearchImages, GetPresignedUrl
4. **Implement device proxy**: Forward device service RPCs to PiOrchestrator (CameraService, SessionService, EvidenceService, CaptureService)
5. Import types: `import { ImageService } from "@delicasa/wire/gen/delicasa/v1/image_service_pb"`
6. Register Connect routes under `/rpc/` base path

**Implementation Status** (from ops baseline 2026-03-04):
- Connect RPC endpoints return **404** — handler registration not yet deployed
- BridgeServer health check passes (`/health` returns OK), but `/trpc/health.check` reports a db column mismatch (`column "d"."stripe_customer_id" does not exist`) — this is a pre-existing schema issue unrelated to wire contracts
- All 3 Dokku apps (BridgeServer, NextClient, PiDashboard) rebuilt successfully against current dependencies

### NextClient

1. Add `"@delicasa/wire": "0.4.0"` to `package.json`
2. Run `pnpm install && pnpm gen` (in wire package)
3. **Remove HttpImageRepository stubs** — replace with Connect client using ImageService descriptor
4. **Remove manual HTTP calls** for camera/session data — use device service descriptors via BridgeServer proxy
5. Import: `import { ImageService } from "@delicasa/wire/gen/delicasa/v1/image_service_pb"`
6. Use `@connectrpc/connect-web` transport targeting BridgeServer URL
7. Use golden test vectors via `import fixtures from "@delicasa/wire/fixtures/camera-service"` for MSW mocks (also available: `capture-service`, `evidence-service`, `session-service`, `image-service`)
8. Use factory functions via `import { makeCamera, makeListCamerasResponse } from "@delicasa/wire/testing"` for custom test fixtures

**Open item**: JWT `aud` claim is hardcoded to a `workers.dev` URL in `BridgeAuthService`. This needs a source code fix to make the audience configurable via environment variable. The Zod dev defaults also reference `workers.dev` but are dead code in production (no runtime impact).

### PiDashboard

1. Add `"@delicasa/wire": "0.4.0"` to `package.json`
2. Run `npm install && pnpm gen` (in wire package)
3. Import device service descriptors for camera list, session list, evidence pair views
4. Use `@connectrpc/connect-web` transport targeting PiOrchestrator on LAN (`http://localhost:8081`)
5. No auth headers needed (LAN access)

### PiOrchestrator (Go)

1. **Reference only** — PiOrchestrator does not consume this npm package
2. Use proto files as the canonical contract for implementing Connect handlers
3. Implement all device services: CameraService (4 RPCs), CaptureService (1), EvidenceService (2), SessionService (2)
4. Base path: `/rpc/delicasa.device.v1.<ServiceName>/<MethodName>`
5. Accept `X-API-Key` header for auth; skip auth for LAN-origin requests

### EspCamV2 (C++)

1. **Reference only** — EspCamV2 does not consume this npm package
2. **ESP32 stays on MQTT** — this is a non-negotiable architectural decision. See [ADR-001-ESP32-STAYS-MQTT.md](./ADR-001-ESP32-STAYS-MQTT.md) for rationale
3. Use MQTT message schemas documented in Zod schemas (`@delicasa/wire/zod`) as the canonical format for camera status, capture ack, capture chunks, capture complete messages
4. See [MQTT_PROTO_MAPPING.md](./MQTT_PROTO_MAPPING.md) for how MQTT messages map to proto `CaptureImageResponse` fields
5. Golden test vectors in `tests/vectors/fixtures/` can be used to validate message format compliance
