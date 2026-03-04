# Quickstart: Unified Wire Contracts v0.2.0

## Scenario 1: BridgeServer validates container action response

```typescript
import {
  PiOrchContainerActionResponseSchema,
  safeParse,
} from "@delicasa/wire/zod";

const raw = await fetch(`${piOrchBaseUrl}/api/v1/container/${id}/action`, {
  method: "POST",
  headers: { "X-Correlation-ID": correlationId },
  body: JSON.stringify({ action: "open", correlation_id: correlationId }),
}).then(r => r.json());

const result = safeParse(PiOrchContainerActionResponseSchema, raw);
if (!result.success) {
  throw new Error(`Invalid PiOrch response: ${result.error.message}`);
}

if (result.data.status === "success") {
  // TypeScript narrows: result.data.before_captures is typed
  console.log(`Captures: ${result.data.before_captures.length} before`);
} else {
  // TypeScript narrows: result.data.error is typed
  console.log(`Error: ${result.data.error.error_code}`);
}
```

## Scenario 2: BridgeServer validates evidence pair

```typescript
import {
  PiOrchEvidencePairSchema,
  parseOrThrow,
} from "@delicasa/wire/zod";

const pair = parseOrThrow(PiOrchEvidencePairSchema, rawJson);
if (pair.pair_status === "complete") {
  console.log(`Before: ${pair.before.evidence_id}`);
  console.log(`After: ${pair.after.evidence_id}`);
} else if (pair.pair_status === "incomplete") {
  console.log(`Retry in ${pair.retry_after_seconds}s`);
}
```

## Scenario 3: PiDashboard renders camera list

```typescript
import {
  PiOrchCameraListResponseSchema,
  parseOrThrow,
} from "@delicasa/wire/zod";

const response = parseOrThrow(PiOrchCameraListResponseSchema, rawJson);
for (const cam of response.data.cameras) {
  console.log(`${cam.device_id}: ${cam.status}`);
  if (cam.health) {
    console.log(`  RSSI: ${cam.health.wifi_rssi} dBm`);
  }
}
```

## Scenario 4: PiDashboard detects stale sessions

```typescript
import {
  PiOrchSessionListResponseSchema,
  STALE_THRESHOLD_SECONDS,
  parseOrThrow,
} from "@delicasa/wire/zod";

const sessions = parseOrThrow(PiOrchSessionListResponseSchema, rawJson);
const stale = sessions.filter(
  s => s.status === "active" && s.elapsed_seconds > STALE_THRESHOLD_SECONDS
);
console.log(`${stale.length} stale sessions detected`);
```

## Scenario 5: Validate MQTT capture protocol messages

```typescript
import {
  MqttCaptureAckSchema,
  MqttCaptureInfoSchema,
  MqttCaptureChunkSchema,
  MqttCaptureCompleteSchema,
  safeParse,
} from "@delicasa/wire/zod";

// On ack topic
const ack = safeParse(MqttCaptureAckSchema, JSON.parse(message));
if (ack.success) console.log(`ACK from ${ack.data.device_id}`);

// On info topic
const info = safeParse(MqttCaptureInfoSchema, JSON.parse(message));
if (info.success) console.log(`Expecting ${info.data.total_chunks} chunks`);

// On chunk topic
const chunk = safeParse(MqttCaptureChunkSchema, JSON.parse(message));
if (chunk.success) console.log(`Chunk ${chunk.data.chunk_index}`);

// On complete topic
const complete = safeParse(MqttCaptureCompleteSchema, JSON.parse(message));
if (complete.success) console.log(`Transfer done in ${complete.data.timings.total_ms}ms`);
```

## Scenario 6: Build MQTT topic strings

```typescript
import { MqttTopics } from "@delicasa/wire/zod";

const ackTopic = MqttTopics.cameraResponse(requestId, "ack");
// → "camera/response/{requestId}/ack"

const statusTopic = MqttTopics.cameraStatus(deviceId);
// → "camera/status/{deviceId}"

const cmdTopic = MqttTopics.cameraCommand(deviceId);
// → "camera/command/{deviceId}"
```

## Scenario 7: Import proto-generated device types

```typescript
import type { Camera } from "@delicasa/wire/gen/delicasa/v1/device/camera_pb";
import type { OperationSession } from "@delicasa/wire/gen/delicasa/v1/device/session_pb";
import type { EvidencePair } from "@delicasa/wire/gen/delicasa/v1/device/evidence_pb";
```
