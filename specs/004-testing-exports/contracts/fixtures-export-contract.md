# Contract: @delicasa/wire/fixtures/* Export

**Version**: v0.4.0
**Type**: npm subpath export (library public API)

## Subpath Export

```jsonc
// package.json exports entry
"./fixtures/*": {
  "default": "./tests/vectors/fixtures/*.json"
}
```

## Published Files

```jsonc
// package.json files addition
"files": [
  "gen/ts",
  "src/zod",
  "src/testing",
  "tests/vectors/fixtures"
]
```

## Available Fixtures

| Import Path | File | Contents |
|-------------|------|----------|
| `@delicasa/wire/fixtures/camera-service` | `camera-service.json` | ListCamerasResponse, GetCameraResponse, GetCameraStatusResponse, ReconcileCamerasResponse + edge case variants |
| `@delicasa/wire/fixtures/capture-service` | `capture-service.json` | CaptureImageRequest, CaptureImageResponse + cached variant |
| `@delicasa/wire/fixtures/evidence-service` | `evidence-service.json` | GetEvidencePairResponse (complete, incomplete, missing), GetSessionEvidenceResponse + failure variant |
| `@delicasa/wire/fixtures/session-service` | `session-service.json` | ListSessionsResponse, GetSessionResponse + all-statuses variant |
| `@delicasa/wire/fixtures/image-service` | `image-service.json` | ListImagesResponse, SearchImagesResponse, GetPresignedUrlResponse |

## Contract Rules

1. Each JSON file is a `Record<string, JsonValue>` — keys are fixture names, values are proto JSON objects
2. All fixtures MUST pass `fromJson()` deserialization against their corresponding generated proto schema
3. Fixture names follow pattern: `MessageTypeName` for happy path, `MessageTypeName_variant` for edge cases
4. Fixtures are versioned with the package — consumers pin to a wire version to get stable fixtures

## Consumer Usage Example

```typescript
import cameraFixtures from "@delicasa/wire/fixtures/camera-service";
import { fromJson, type JsonValue } from "@bufbuild/protobuf";
import { ListCamerasResponseSchema } from "@delicasa/wire/gen/delicasa/device/v1/camera_service_pb";

const fixtures = cameraFixtures as Record<string, JsonValue>;
const msg = fromJson(ListCamerasResponseSchema, fixtures.ListCamerasResponse);
```

## Consumer tsconfig Requirement

```jsonc
{
  "compilerOptions": {
    "moduleResolution": "bundler",  // or "node16"
    "resolveJsonModule": true
  }
}
```
