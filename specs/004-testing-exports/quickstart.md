# Quickstart: Testing Exports & Documentation Polish

**Feature**: 004-testing-exports
**Wire Version**: v0.4.0

## Scenario 1: Use Factory Functions in NextClient MSW Mock

**Goal**: Replace handcrafted JSON with typed factory calls for MSW mock handlers.

```typescript
// Before (v0.3.0) — handcrafted JSON
const mockResponse = {
  correlationId: "test-001",
  images: [{
    id: "img-001",
    objectKey: "evidence/2026/03/04/ev-before-001.jpg",
    controllerId: "ctrl-001",
    containerId: "container-001",
    sessionId: "session-001",
    captureTag: "before_open",
    contentType: "image/jpeg",
    sizeBytes: "245760",
    width: 1600,
    height: 1200,
    createdAt: "2026-03-04T10:30:00Z",
  }],
  nextPageToken: "",
  totalCount: 1,
};

// After (v0.4.0) — factory function
import { makeImage, makeListImagesResponse } from "@delicasa/wire/testing";
const mockResponse = makeListImagesResponse({
  images: [makeImage({ id: "img-001" })],
  totalCount: 1,
});
```

**Steps**:
1. `pnpm add @delicasa/wire@0.4.0`
2. Import factory functions from `@delicasa/wire/testing`
3. Call factories with only the fields you care about
4. Use result directly as MSW response body

## Scenario 2: Import Golden Vector Fixtures Directly

**Goal**: Use canonical proto JSON fixtures without copying files.

```typescript
import cameraFixtures from "@delicasa/wire/fixtures/camera-service";
import { fromJson, type JsonValue } from "@bufbuild/protobuf";
import { ListCamerasResponseSchema } from "@delicasa/wire/gen/delicasa/device/v1/camera_service_pb";

const fixtures = cameraFixtures as Record<string, JsonValue>;
const msg = fromJson(ListCamerasResponseSchema, fixtures.ListCamerasResponse);
// msg.cameras has 4 camera entries with valid proto JSON data
```

## Scenario 3: Verify Factory Round-Trip in Consumer Tests

**Goal**: Ensure factory-generated data is valid proto JSON.

```typescript
import { makeEvidencePair, makeGetEvidencePairResponse } from "@delicasa/wire/testing";
import { fromJson } from "@bufbuild/protobuf";
import { GetEvidencePairResponseSchema } from "@delicasa/wire/gen/delicasa/device/v1/evidence_service_pb";

// Create incomplete pair (no "after" capture)
const response = makeGetEvidencePairResponse({
  pair: makeEvidencePair({
    pairStatus: "EVIDENCE_PAIR_STATUS_INCOMPLETE",
    after: undefined,
    retryAfterSeconds: 5,
  }),
});

// Round-trip through proto deserialization
const msg = fromJson(GetEvidencePairResponseSchema, response);
expect(msg.pair?.pairStatus).toBe(2); // EVIDENCE_PAIR_STATUS_INCOMPLETE
expect(msg.pair?.after).toBeUndefined();
```

## Scenario 4: Read MQTT-to-Proto Mapping for PiOrchestrator Development

**Goal**: Understand how to translate MQTT capture messages to CaptureImageResponse.

1. Open `docs/MQTT_PROTO_MAPPING.md`
2. Find the 4-phase protocol table: Ack → Info → Chunk → Complete
3. Each row shows: MQTT topic, Zod schema, and which proto response field it populates
4. Use the error mapping table to handle timeout/failure CaptureStatus values

## Scenario 5: Check ESP32 Architecture Decision

**Goal**: Understand why ESP32 stays on MQTT.

1. Open `docs/ADR-001-ESP32-STAYS-MQTT.md`
2. Read Context section for hardware constraints
3. Read Consequences section for what this means for PiOrchestrator (it must translate MQTT to Connect RPC)
