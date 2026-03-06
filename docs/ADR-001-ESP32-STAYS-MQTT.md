# ADR-001: ESP32 Stays on MQTT

**Status**: Accepted
**Date**: 2026-03-04
**Deciders**: DeliCasa engineering team

---

## Context

The DeliCasa platform uses ESP32-S3 cameras (EspCamV2) as edge devices inside vending machine controllers. These cameras capture images on demand, report health status, and stream image data in chunks to the PiOrchestrator over a local WiFi access point (`192.168.10.0/24`).

The rest of the platform is migrating to Connect RPC (gRPC-compatible, HTTP/2-based) for inter-service communication. The question is whether ESP32 devices should also migrate to Connect RPC / gRPC.

## Decision

**ESP32/EspCamV2 devices will remain on MQTT. This is non-negotiable.**

The PiOrchestrator serves as the translation boundary: it receives MQTT messages from ESP32 devices and exposes Connect RPC services to upstream consumers (BridgeServer, PiDashboard).

```
ESP32 (MQTT) → PiOrchestrator (translates) → BridgeServer (Connect RPC)
```

## Rationale

### Hardware Constraints

1. **No HTTP/2 stack**: The ESP32-S3 Arduino/ESP-IDF SDK does not include a production-quality HTTP/2 implementation. The available TLS + HTTP stacks (mbedTLS + ESP-HTTP-Client) support HTTP/1.1 only.

2. **Memory limitations**: ESP32-S3 has ~512 KB SRAM. HTTP/2 framing, HPACK header compression, and stream multiplexing would consume significant memory budget that is needed for image capture buffers (~100-200 KB per JPEG).

3. **No protobuf runtime**: While protobuf-lite exists for embedded C++, the ESP32 firmware uses a lightweight JSON-over-MQTT approach that fits within flash and RAM constraints. Adding a protobuf runtime would increase firmware size by ~50-100 KB.

### MQTT Advantages for Edge Devices

1. **Lightweight protocol**: MQTT has minimal packet overhead (2-byte fixed header). Ideal for constrained devices.

2. **Built-in QoS**: MQTT QoS levels (0, 1, 2) provide delivery guarantees without application-level retry logic.

3. **Chunked transfer**: The 4-phase capture protocol (Ack → Info → Chunk → Complete) naturally maps to MQTT topic-based message routing, enabling chunked image transfer within MQTT's message size limits.

4. **Connection resilience**: MQTT's keep-alive and Last Will and Testament (LWT) mechanisms provide robust connection monitoring for devices that may intermittently lose WiFi.

5. **Proven in production**: The current MQTT-based capture protocol is battle-tested and reliable.

## Alternatives Considered

### 1. gRPC on ESP32

**Rejected**: No HTTP/2 stack available. Would require porting or writing an HTTP/2 implementation for ESP-IDF, which is not viable given the memory constraints and development effort.

### 2. Connect RPC (HTTP/1.1 mode)

**Rejected**: While Connect RPC supports HTTP/1.1 with unary RPCs, this would still require a protobuf runtime on the ESP32 and would not support streaming (needed for chunked image transfer). The benefit over MQTT is marginal for device-to-local-Pi communication.

### 3. CoAP (Constrained Application Protocol)

**Considered but rejected**: CoAP is designed for constrained devices but lacks the pub/sub model needed for the capture protocol's multi-phase flow. Would also require new infrastructure (CoAP broker) without clear benefits over the existing MQTT broker on the Pi.

### 4. Custom TCP protocol

**Rejected**: Would require maintaining a custom protocol implementation on both ESP32 and PiOrchestrator. MQTT already provides the reliability, routing, and tooling needed.

## Consequences

### Positive

- ESP32 firmware remains simple and maintainable (JSON + MQTT, no protobuf dependency)
- PiOrchestrator acts as a clean translation boundary, isolating edge device concerns from the rest of the platform
- MQTT message schemas are documented via Zod schemas in `@delicasa/wire/zod` and validated with golden test vectors
- The 4-phase capture protocol is well-documented in [MQTT_PROTO_MAPPING.md](./MQTT_PROTO_MAPPING.md)

### Negative

- PiOrchestrator must implement MQTT-to-proto translation logic for every device interaction
- Two contract systems coexist: Protobuf (services) and Zod (MQTT messages)
- Changes to device message formats require coordinated updates to both Zod schemas and ESP32 firmware

### Neutral

- Protobuf remains the single source of truth for all non-device contracts
- The `@delicasa/wire` package publishes both proto-generated types and Zod MQTT schemas, keeping all contracts in one place
