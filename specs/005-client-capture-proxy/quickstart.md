# Quickstart: Client-Facing Capture Proxy Service

**Feature**: 005-client-capture-proxy

## Scenario 1: NextClient Triggers Capture

```typescript
import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { CaptureService } from "@delicasa/wire/gen/delicasa/v1/capture_service_pb";

const transport = createConnectTransport({ baseUrl: "https://bridge.delicasa.dev" });
const client = createClient(CaptureService, transport);

const response = await client.requestCapture({
  correlationId: "corr-001",
  controllerId: "ctrl-001",
  captureTag: "CAPTURE_TAG_BEFORE_OPEN",
  idempotencyKey: "idem-abc-123",
  sessionId: "session-001",
});

if (response.status === CaptureRequestStatus.COMPLETED) {
  console.log("Evidence ID:", response.evidenceId);
  console.log("Object key:", response.objectKey);
}
```

## Scenario 2: NextClient Polls Capture Status

```typescript
const statusResponse = await client.getCaptureStatus({
  correlationId: "corr-002",
  requestId: response.requestId,
});

if (statusResponse.status === CaptureRequestStatus.COMPLETED) {
  // Evidence is ready
} else if (statusResponse.status === CaptureRequestStatus.ACCEPTED) {
  // Still in progress — poll again
}
```

## Scenario 3: MSW Mock with Factory Functions

```typescript
import { http, HttpResponse } from "msw";
import { makeRequestCaptureResponse } from "@delicasa/wire/testing";

const handlers = [
  http.post("*/rpc/delicasa.v1.CaptureService/RequestCapture", () => {
    return HttpResponse.json(makeRequestCaptureResponse({
      evidenceId: "ev-test-001",
      objectKey: "evidence/2026/03/06/ev-before-001.jpg",
    }));
  }),
];
```

## Scenario 4: Golden Vector Fixtures

```typescript
import fixtures from "@delicasa/wire/fixtures/client-capture-service";

// Use canonical fixture data in tests
const request = fixtures.RequestCaptureRequest;
const response = fixtures.RequestCaptureResponse;
```

## Scenario 5: BridgeServer Implementation (curl)

```bash
# RequestCapture
curl -X POST https://bridge.delicasa.dev/rpc/delicasa.v1.CaptureService/RequestCapture \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $COGNITO_JWT" \
  -d '{"correlationId":"test-001","controllerId":"ctrl-001","captureTag":"CAPTURE_TAG_BEFORE_OPEN","idempotencyKey":"idem-001"}'

# GetCaptureStatus
curl -X POST https://bridge.delicasa.dev/rpc/delicasa.v1.CaptureService/GetCaptureStatus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $COGNITO_JWT" \
  -d '{"correlationId":"test-002","requestId":"req-001"}'
```
