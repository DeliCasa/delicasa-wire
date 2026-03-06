# Research: Testing Exports & Documentation Polish

**Feature**: 004-testing-exports
**Date**: 2026-03-06

## Decision 1: Factory Function API Design

**Decision**: Factory functions return plain `Record<string, JsonValue>` objects (proto JSON canonical format), not protobuf message instances.

**Rationale**: Consumers use `fromJson(Schema, json)` to deserialize. Factories produce the JSON input, not the deserialized output. This keeps the testing module dependency-free at runtime — no need to import generated proto schemas in the factory code itself. Consumers bring their own `@bufbuild/protobuf` import for deserialization.

**Alternatives considered**:
- **Return proto message instances**: Would require importing generated schemas in factories, coupling factory code to generated output. Rejected — factories should be independent of `gen/` artifacts.
- **Return Zod domain objects**: Wrong layer — factories target wire format, not domain validation. Zod schemas already handle domain-level defaults.

## Decision 2: Deep Merge Strategy for Overrides

**Decision**: Use a simple shallow spread for top-level fields, with explicit handling for nested objects (health, pair.before, pair.after). No external deep-merge library.

**Rationale**: Proto JSON objects are shallow-ish (1-2 levels of nesting). A hand-written merge for the 4-5 cases with nested sub-messages is simpler and more predictable than introducing a deep-merge dependency. Keeps `node_modules` lean per constitution Constraint ("No runtime deps beyond core three").

**Alternatives considered**:
- **lodash.merge**: Adds a dependency for a contracts-only package. Rejected.
- **structuredClone + spread**: Overkill for the nesting depth involved.

## Decision 3: Fixture Publishing Strategy

**Decision**: Add `tests/vectors/fixtures` to `package.json` `files` array. Add `"./fixtures/*"` subpath export mapping to `tests/vectors/fixtures/*.json`. Consumers import as `@delicasa/wire/fixtures/camera-service`.

**Rationale**: The HANDOFF_MATRIX.md already tells consumers to use golden test vectors. Publishing them makes the advice actionable without manual file copying. The `./fixtures/*` wildcard subpath follows the same pattern as `./gen/*`.

**Alternatives considered**:
- **Copy-only approach**: Document that consumers should copy files manually. Rejected — creates version drift when fixtures update.
- **Move fixtures to `src/testing/fixtures/`**: Would co-locate with factories but breaks existing `tests/vectors/golden-vectors.test.ts` import paths. Rejected — unnecessary churn.

## Decision 4: Version Bump Scope

**Decision**: Bump to v0.4.0 (minor version). New subpath exports are additive but represent new public API surface.

**Rationale**: Per semver, new exports that don't break existing consumers warrant a minor bump. The `./testing` and `./fixtures/*` exports are new API surface. No proto changes means no breaking changes.

**Alternatives considered**:
- **v0.3.1 (patch)**: Patches are for bug fixes. New exports are a feature. Rejected.
- **v1.0.0 (major)**: Premature — the package is still pre-1.0.

## Decision 5: MQTT Mapping Doc Scope

**Decision**: Document only the CaptureService MQTT↔Proto mapping (the 4-phase protocol). Camera status MQTT messages are already well-documented in Zod schemas and don't have a corresponding Connect RPC that translates them.

**Rationale**: The PiOrchestrator translation layer exists specifically for the capture workflow. Camera status messages flow through MQTT to PiOrchestrator's internal state without a 1:1 RPC mapping. The highest-value mapping doc covers the capture protocol.

**Alternatives considered**:
- **Full MQTT schema mapping for all message types**: Over-scoped — camera status and LWT messages don't map 1:1 to proto RPCs. Would create a confusing document.

## Decision 6: ADR Format

**Decision**: Follow lightweight ADR format: Title, Status, Context, Decision, Consequences. No MADR template — keep it simple for a contracts package.

**Rationale**: A single-page ADR is sufficient to record the ESP32 MQTT decision with hardware constraints. The full MADR template (with drivers, options matrix, pros/cons table) is overkill for a binary hardware constraint.

**Alternatives considered**:
- **Inline in HANDOFF_MATRIX.md**: Buries the rationale in a large reference document. Rejected — ADR should be findable by filename.
- **Full MADR template**: Over-engineered for a hardware constraint that has no realistic alternatives.
