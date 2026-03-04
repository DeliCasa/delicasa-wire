# HANDOFF — @delicasa/wire v0.2.0

## Per-Repo Integration Guide

### BridgeServer (TypeScript / Hono.js on Cloudflare Workers)

**Dependency**:
```bash
pnpm add @delicasa/wire@github:DeliCasa/delicasa-wire#v0.2.0
```

**What to use**:
- `PiOrchContainerActionResponseSchema` — validate `POST /api/v1/container/:id/action` responses from PiOrchestrator
- `PiOrchEvidencePairSchema` — validate `GET /api/v1/sessions/:id/evidence-pair` responses
- `PiOrchCameraListResponseSchema` — validate `GET /api/v1/cameras` responses
- `BridgeEvidenceCaptureSchema` — validate individual capture entries
- Existing: `ControllerService`, `ContainerAccessService`, `PurchaseSessionService` for Connect/gRPC clients

**Migration steps**:
1. Add dependency
2. Replace `src/interfaces/schemas/piorch-evidence-pair.schemas.ts` with imports from `@delicasa/wire/zod`
3. Replace any inline Zod schemas for PiOrch responses with wire schemas
4. Run `pnpm type-check` to verify no type regressions

**Expected base URLs for PiOrchestrator RPC**:
```
PiOrchestrator API: http://{pi_ip}:8081/api/v1
```

**Required headers**:
```
X-Correlation-ID: <uuid>           # Required for all requests
X-Purchase-Session-ID: <session>   # Required for container actions
X-Idempotency-Key: <key>           # Recommended for container actions
X-API-Key: <key>                   # Optional, per deployment config
Content-Type: application/json
Accept: application/json
```

---

### NextClient (TypeScript / Next.js 15)

**Dependency**:
```bash
pnpm add @delicasa/wire@github:DeliCasa/delicasa-wire#v0.2.0
```

**What to use**:
- Proto-generated Connect service descriptors for TRPC/Connect clients
- `ControllerDomain`, `PurchaseSessionDomain` — domain validation in UI layer
- No direct use of `PiOrch*` schemas (those are for BridgeServer ↔ PiOrch boundary)

**Required tsconfig**:
```json
{ "compilerOptions": { "moduleResolution": "bundler" } }
```

---

### PiDashboard (TypeScript / React 19 + Vite)

**Dependency**:
```bash
npm install @delicasa/wire@github:DeliCasa/delicasa-wire#v0.2.0
```

**What to use**:
- `PiOrchCameraListResponseSchema` — validate `GET /api/v1/cameras` responses
- `PiOrchSessionListResponseSchema` — validate `GET /v1/sessions` responses
- `CapturedEvidenceSchema` — validate `POST /v1/cameras/:id/evidence` responses
- `STALE_THRESHOLD_SECONDS` — replace hardcoded `300` for stale session detection
- `PiOrchCameraSchema`, `PiOrchSessionSchema` — TypeScript types for components

**Migration steps**:
1. Add dependency
2. Replace `src/infrastructure/api/v1-cameras-schemas.ts` with imports from `@delicasa/wire/zod`
3. Replace hardcoded `300` in `src/infrastructure/api/sessions.ts` with `STALE_THRESHOLD_SECONDS`
4. Run `npm run build` to verify

**Expected base URLs**:
```
PiOrchestrator Dashboard API: http://{pi_ip}:8082/v1
PiOrchestrator Main API:      http://{pi_ip}:8081/api/v1
```

---

### PiOrchestrator (Go / Gin) — Schema Reference Only

PiOrchestrator is the **producer** of the schemas documented in this package.
It does NOT consume `@delicasa/wire` as a Go dependency (no Go codegen in v0.2.0).

**What this package provides**:
- Authoritative documentation of expected response shapes
- Proto definitions (`delicasa.device.v1`) for future Go codegen
- MQTT protocol schemas matching PiOrchestrator's Go struct definitions

**Future (v0.3.0)**: Go codegen via `buf.gen.yaml` for `protoc-gen-go`, enabling
PiOrchestrator to import generated Go types from this package.

---

### EspCamV2 (C++17 / Arduino/ESP-IDF) — Schema Reference Only

EspCamV2 is the **producer** of MQTT messages documented by `Mqtt*Schema` types.
It does NOT consume `@delicasa/wire` as a C++ dependency.

**What this package provides**:
- Machine-readable documentation of the MQTT capture protocol
- `MqttTopics` helpers matching `TopicBuilder.cpp` topic patterns
- Schema validation for testing MQTT payloads in TypeScript integration tests

---

## Auth Strategy (Standardized Across Repos)

| Boundary | Auth Method | Header |
|----------|-------------|--------|
| NextClient → BridgeServer | AWS Cognito JWT | `Authorization: Bearer <token>` |
| BridgeServer → PiOrchestrator | API Key (optional) | `X-API-Key: <key>` |
| PiDashboard → PiOrchestrator | None (local network) | — |
| PiOrchestrator → EspCamV2 | MQTT broker credentials | MQTT `username`/`password` |

## Version History

| Version | Tag | Changes |
|---------|-----|---------|
| 0.1.0 | `v0.1.0` | Initial: ControllerService, ContainerAccessService, PurchaseSessionService, Zod domain schemas |
| 0.2.0 | `v0.2.0` | PiOrch HTTP boundary schemas, MQTT protocol schemas, device proto package, topic helpers |
