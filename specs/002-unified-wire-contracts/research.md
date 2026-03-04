# Research: Unified Wire Contracts v0.2.0

## Decision 1: Zod vs Proto for HTTP/MQTT Boundary Schemas

**Decision**: Handwritten Zod schemas for HTTP/MQTT boundaries. Proto for
language-agnostic type definitions only (no gRPC services for device layer yet).

**Rationale**: The PiOrchestrator ↔ BridgeServer and PiOrchestrator ↔ EspCamV2
boundaries are REST and MQTT respectively — not gRPC. Runtime validation at these
boundaries is done in TypeScript (Zod) and Go (struct decoding). Proto serves as
the IDL documentation and enables future Go codegen. This is consistent with
Constitution Principle II (wire/domain separation).

**Alternatives considered**:
- Generate Zod from proto: Rejected. Tools like `protobuf-zod` don't handle the
  nuances (optional vs absent, legacy aliases, discriminated unions). Manual Zod
  gives precise boundary control.
- Proto-only (no Zod): Rejected. Proto doesn't validate REST JSON payloads at
  runtime. Consumers need TypeScript types with refinements (min, max, regex).

## Decision 2: Proto Package Structure — `delicasa.v1.device`

**Decision**: New sub-package `delicasa.v1.device` (not `delicasa.v2` or
extending `delicasa.v1` directly).

**Rationale**: Device-layer entities (cameras, operation sessions, evidence
captures) are conceptually different from the existing client-facing services
(ControllerService, ContainerAccessService, PurchaseSessionService). Separate
package prevents naming collisions and allows independent evolution.

**Alternatives considered**:
- Add to `delicasa.v1`: Rejected. Would mix client-facing service types with
  device-layer types. `Session` already exists in purchase context.
- `delicasa.v1.iot`: Rejected. Too generic. `device` is more descriptive.

## Decision 3: No gRPC Services for Device Package in v0.2.0

**Decision**: `delicasa.v1.device` defines message types and enums only.
No `service` definitions.

**Rationale**: PiOrchestrator exposes REST (Gin routes), not gRPC. Adding gRPC
service definitions implies the API should be consumed via Connect/gRPC, which
would be misleading. Service definitions will be added in v0.3.0 if/when
PiOrchestrator adopts gRPC or Connect.

## Decision 4: Schema Naming Convention

**Decision**: Prefix HTTP boundary schemas with `PiOrch` (e.g.,
`PiOrchCameraSchema`). Prefix MQTT schemas with `Mqtt` (e.g.,
`MqttCaptureAckSchema`). Existing v0.1.0 schemas (ControllerDomain,
PurchaseSessionDomain) keep their `*Domain` suffix.

**Rationale**: Clear provenance. `PiOrch*` schemas validate payloads from
PiOrchestrator HTTP APIs. `Mqtt*` schemas validate MQTT JSON payloads.
`*Domain` schemas are the application-layer view. Different naming prevents
confusion about which schema to use at which boundary.

## Decision 5: Discriminated Unions for Response Schemas

**Decision**: Use Zod discriminated unions (`z.discriminatedUnion`) for
container action responses (`status: "success" | "error"`) and capture
responses (`success: true | false`).

**Rationale**: Discriminated unions provide TypeScript type narrowing. After
parsing, `if (result.status === "success")` narrows to the success variant
with `before_captures` and `after_captures` typed correctly. This matches how
BridgeServer already pattern-matches on the `status` field.

## Decision 6: Legacy Field Handling

**Decision**: Include legacy field aliases in schemas (e.g., `id` alongside
`device_id` in camera, `status` alongside `state` in MQTT heartbeat, `heap`
alongside `free_heap_bytes`). Mark as optional.

**Rationale**: PiOrchestrator responses include legacy fields for backward
compatibility. Zod schemas must accept what the server actually sends, not
what we wish it sent. Consumers should prefer canonical fields; legacy fields
are documented as deprecated in schema comments.

## Decision 7: No Go Codegen in v0.2.0

**Decision**: Defer Go codegen to v0.3.0. v0.2.0 adds proto definitions but
not `buf.gen.yaml` for Go output.

**Rationale**: PiOrchestrator is Go but currently uses hand-written structs
for JSON decoding. Adding Go codegen requires choosing a Go protobuf plugin
(`protoc-gen-go` vs `buf.build/protocolbuffers/go`) and coordinating with
PiOrchestrator's module system. This is a separate migration step.

**Alternatives considered**:
- Add Go codegen now: Rejected. Increases scope significantly. PiOrchestrator
  team hasn't adopted proto-generated types yet. Schema package serves as
  documentation and TypeScript source of truth for now.

## Decision 8: Buf Module Path for Device Package

**Decision**: Keep single `buf.yaml` with `path: proto`. The `device/`
sub-directory is part of the same module, just a different proto package.

**Rationale**: Buf modules are directory-based. Since `device/*.proto` files
use `package delicasa.v1.device` and live under `proto/`, they're already part
of the `proto` module. No additional `buf.yaml` needed.
