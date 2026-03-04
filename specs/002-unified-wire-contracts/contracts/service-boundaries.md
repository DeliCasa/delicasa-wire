# Service Boundary Contracts: v0.2.0

## Boundary 1: BridgeServer → PiOrchestrator (HTTP REST)

### Container Action
- **Endpoint**: `POST /api/v1/container/:containerId/action`
- **Headers**: `X-Correlation-ID`, `X-Purchase-Session-ID`, `X-Idempotency-Key`
- **Request**: `PiOrchContainerActionRequestSchema`
- **Response**: `PiOrchContainerActionResponseSchema` (discriminated union)
- **Timeout**: 60s overall

### Evidence Pair
- **Endpoint**: `GET /api/v1/sessions/:sessionId/evidence-pair`
- **Headers**: `Accept: application/json`, `X-Correlation-ID`
- **Response**: `PiOrchEvidencePairSchema`
- **Retry**: [1000, 2000, 4000]ms backoff

### Camera List
- **Endpoint**: `GET /api/v1/cameras`
- **Response**: `PiOrchCameraListResponseSchema`
- **Timeout**: 10s

### Single Camera Capture
- **Endpoint**: `POST /api/v1/cameras/:id/capture`
- **Response**: `CapturedEvidenceSchema`
- **Timeout**: 35s

## Boundary 2: PiDashboard → PiOrchestrator (HTTP REST)

### Session List
- **Primary**: `GET /v1/sessions` (port 8082)
- **Fallback**: `GET /v1/diagnostics/sessions` (port 8081)
- **Response**: `PiOrchSessionListResponseSchema`

### Camera List
- **Endpoint**: `GET /api/v1/cameras`
- **Response**: `PiOrchCameraListResponseSchema`
- **Shared with**: Boundary 1

### Manual Evidence Capture
- **Endpoint**: `POST /v1/cameras/:cameraId/evidence`
- **Response**: `CapturedEvidenceSchema`

## Boundary 3: PiOrchestrator ↔ EspCamV2 (MQTT)

### Command (Pi → ESP)
- **Topic**: `camera/command/{device_id}`
- **Schema**: `MqttCameraCommandSchema`

### 4-Part Capture Protocol (ESP → Pi)
1. `camera/response/{request_id}/ack` → `MqttCaptureAckSchema`
2. `camera/response/{request_id}/info` → `MqttCaptureInfoSchema`
3. `camera/response/{request_id}/chunk/{N}` → `MqttCaptureChunkSchema`
4. `camera/response/{request_id}/complete` → `MqttCaptureCompleteSchema`

### Single-Message Response (ESP → Pi)
- **Topic**: `camera/response/{request_id}`
- **Schema**: `MqttCaptureResponseSchema` (discriminated union)

### Camera Status (ESP → Pi, retained)
- **Topic**: `camera/status/{device_id}`
- **Schema**: `MqttCameraStatusSchema` (heartbeat) / `MqttCameraLwtSchema` (disconnect)

## Boundary 4: NextClient ↔ BridgeServer (gRPC/Connect)

Existing v0.1.0 — no changes:
- `ControllerService` (ListControllers, GetController, UpdateControllerName)
- `ContainerAccessService` (OpenContainer, CloseContainer)
- `PurchaseSessionService` (GetPurchaseSession, ListPurchaseSessions)

## Schema Export Map

| Schema | Boundary | File |
|--------|----------|------|
| `PiOrchContainerActionRequestSchema` | 1 | `src/zod/piorch-container-action.ts` |
| `PiOrchContainerActionResponseSchema` | 1 | `src/zod/piorch-container-action.ts` |
| `BridgeEvidenceCaptureSchema` | 1 | `src/zod/piorch-container-action.ts` |
| `PiOrchEvidencePairSchema` | 1 | `src/zod/piorch-evidence-pair.ts` |
| `PairCaptureSchema` | 1 | `src/zod/piorch-evidence-pair.ts` |
| `PiOrchEvidencePairLivenessProofSchema` | 1 | `src/zod/piorch-evidence-pair.ts` |
| `PiOrchCameraSchema` | 1, 2 | `src/zod/piorch-camera.ts` |
| `PiOrchCameraHealthSchema` | 1, 2 | `src/zod/piorch-camera.ts` |
| `PiOrchCameraListResponseSchema` | 1, 2 | `src/zod/piorch-camera.ts` |
| `PiOrchSessionSchema` | 2 | `src/zod/piorch-session.ts` |
| `PiOrchSessionListResponseSchema` | 2 | `src/zod/piorch-session.ts` |
| `CapturedEvidenceSchema` | 2 | `src/zod/piorch-camera.ts` |
| `MqttCameraCommandSchema` | 3 | `src/zod/mqtt-camera.ts` |
| `MqttCaptureAckSchema` | 3 | `src/zod/mqtt-capture.ts` |
| `MqttCaptureInfoSchema` | 3 | `src/zod/mqtt-capture.ts` |
| `MqttCaptureChunkSchema` | 3 | `src/zod/mqtt-capture.ts` |
| `MqttCaptureCompleteSchema` | 3 | `src/zod/mqtt-capture.ts` |
| `MqttCaptureResponseSchema` | 3 | `src/zod/mqtt-capture.ts` |
| `MqttCameraStatusSchema` | 3 | `src/zod/mqtt-camera.ts` |
| `MqttCameraLwtSchema` | 3 | `src/zod/mqtt-camera.ts` |
| `MqttTopics` | 3 | `src/zod/mqtt-topics.ts` |
| `STALE_THRESHOLD_SECONDS` | 2 | `src/zod/constants.ts` |
