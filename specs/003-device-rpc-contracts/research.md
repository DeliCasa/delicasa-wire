# Research: Device Connect RPC Contracts v0.3.0

**Date**: 2026-03-04
**Status**: Complete

## R1: ImageService Design — What RPCs Does NextClient Need?

**Decision**: ImageService with 3 RPCs: `ListImages`, `SearchImages`, `GetPresignedUrl`

**Rationale**: NextClient currently stubs these operations via `HttpImageRepository`. The three operations map directly to the UI needs: browsing images for a controller (ListImages), filtering by container/session/time range (SearchImages), and generating temporary download URLs (GetPresignedUrl). This mirrors the existing pattern in ControllerService (list + get + mutate).

**Alternatives considered**:
- Single `GetImage` RPC with filter parameter — rejected because list vs. search have different pagination semantics (cursor vs. scored results)
- Separate `PresignService` — rejected because presigning is always in the context of an image, not a standalone concern
- `delicasa.media.v1` package — rejected to avoid namespace proliferation; `delicasa.v1` is the established client-facing package

## R2: UploadStatus Enum Relocation — Breaking Change Strategy

**Decision**: Move `UploadStatus` enum from `evidence.proto` to `capture_service.proto`. Change `evidence.proto`'s `upload_status` field from `UploadStatus` enum to `string` type.

**Rationale**: `UploadStatus` is a capture concern, not an evidence concern. Evidence consumers shouldn't need to import capture-layer types. The `string` type in evidence gives flexibility for upload status values that may not map 1:1 to the `UploadStatus` enum (e.g., status set by external upload pipelines).

**Breaking change impact**: This changes a field type from enum to string in `evidence.proto`. Consumers using the proto-generated `UploadStatus` enum on the `EvidenceCapture.upload_status` field will need to switch to string comparison. The serialized JSON wire format is compatible (enum values serialize as strings in proto3 JSON), but TypeScript types change.

**Migration path**: Document in `MIGRATION_v0.2_to_v0.3.md` with find-and-replace instructions.

## R3: Golden Test Vector Format

**Decision**: JSON files using protobuf canonical JSON encoding, validated by Vitest tests that deserialize with `fromJson()`.

**Rationale**: Proto JSON is the standard interchange format for Connect RPC. Using canonical encoding (enum as strings, timestamps as RFC 3339, absent fields omitted) ensures fixtures match what clients actually send/receive. Vitest tests prove the fixtures are valid against the generated types.

**Alternatives considered**:
- Binary proto fixtures — rejected because not human-readable, harder to maintain
- TypeScript object literals — rejected because they bypass the serialization layer that causes most bugs
- Zod-validated fixtures — rejected because golden vectors test the proto layer, not the domain layer

## R4: Session.proto Additive Fields

**Decision**: Add 6 new fields to `OperationSession`: `total_captures`, `successful_captures`, `failed_captures`, `has_before_open`, `has_after_close`, `pair_complete`.

**Rationale**: PiOrchestrator already returns these fields in its REST API. Adding them to the proto makes the contract match reality. These are additive (new field numbers 6-11), not breaking changes in proto3.

**Alternatives considered**:
- Separate `SessionDiagnostics` sub-message — rejected for being unnecessary indirection for 6 flat fields
- Keep fields out of proto, add to Zod only — rejected because it violates Principle I (proto is single source of truth)

## R5: Pagination Convention Consistency

**Decision**: Device services use `int32 limit` for simple pagination. Client-facing services use `page_size` + `page_token` for cursor pagination.

**Rationale**: Device services operate on small datasets (typically <50 cameras, <200 sessions per controller). Simple limit-based pagination is sufficient and matches PiOrchestrator's existing REST API. Client-facing services (ControllerService, ImageService) deal with potentially large datasets across all controllers and need cursor pagination.

**Alternatives considered**:
- Uniform cursor pagination everywhere — rejected because device endpoints don't need it and it adds unnecessary complexity to PiOrchestrator implementation
