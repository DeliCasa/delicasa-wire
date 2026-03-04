import { describe, expect, it } from "vitest";
import {
  MqttCameraCommandSchema,
  MqttCameraStatusSchema,
  MqttCameraLwtSchema,
  safeParse,
  parseOrThrow,
} from "../../src/zod/index.js";

describe("MqttCameraCommandSchema", () => {
  const valid = {
    action: "capture" as const,
    request_id: "req-001",
  };

  it("accepts valid command", () => {
    expect(parseOrThrow(MqttCameraCommandSchema, valid)).toEqual(valid);
  });

  it("accepts all command actions", () => {
    const actions = [
      "capture", "restart", "reset", "ping", "health_check", "set_resolution",
    ] as const;
    for (const action of actions) {
      expect(
        safeParse(MqttCameraCommandSchema, { ...valid, action }).success,
      ).toBe(true);
    }
  });

  it("accepts command with all optional fields", () => {
    const full = {
      ...valid,
      correlation_id: "corr-001",
      session_id: "sess-001",
      phase: "before_open",
      resolution: "VGA",
    };
    expect(safeParse(MqttCameraCommandSchema, full).success).toBe(true);
  });

  it("rejects invalid action", () => {
    expect(
      safeParse(MqttCameraCommandSchema, { ...valid, action: "destroy" }).success,
    ).toBe(false);
  });

  it("rejects missing request_id", () => {
    expect(
      safeParse(MqttCameraCommandSchema, { action: "capture" }).success,
    ).toBe(false);
  });
});

describe("MqttCameraStatusSchema", () => {
  const valid = {
    device_id: "esp-aabbccddeeff",
    timestamp: "2026-03-03T12:00:00Z",
  };

  it("accepts minimal status", () => {
    expect(parseOrThrow(MqttCameraStatusSchema, valid)).toEqual(valid);
  });

  it("accepts status with new fields", () => {
    const full = {
      ...valid,
      state: "ONLINE" as const,
      uptime_ms: 120000,
      free_heap_bytes: 45000,
      rssi_dbm: -67,
      camera_initialized: true,
      capture_ready: true,
    };
    expect(safeParse(MqttCameraStatusSchema, full).success).toBe(true);
  });

  it("accepts status with legacy fields", () => {
    const legacy = {
      ...valid,
      status: "online" as const,
      heap: 45000,
      wifi_rssi: -67,
      uptime: 120,
    };
    expect(safeParse(MqttCameraStatusSchema, legacy).success).toBe(true);
  });

  it("accepts status with both new and legacy fields", () => {
    const mixed = {
      ...valid,
      state: "ONLINE" as const,
      status: "online" as const,
      uptime_ms: 120000,
      uptime: 120,
      free_heap_bytes: 45000,
      heap: 45000,
    };
    expect(safeParse(MqttCameraStatusSchema, mixed).success).toBe(true);
  });

  it("accepts all state values", () => {
    for (const state of ["ONLINE", "OFFLINE", "REBOOTING"] as const) {
      expect(
        safeParse(MqttCameraStatusSchema, { ...valid, state }).success,
      ).toBe(true);
    }
  });

  it("accepts optional container_id and position", () => {
    expect(
      safeParse(MqttCameraStatusSchema, {
        ...valid,
        container_id: "cont-1",
        position: 2,
      }).success,
    ).toBe(true);
  });

  it("rejects missing device_id", () => {
    expect(
      safeParse(MqttCameraStatusSchema, { timestamp: "2026-03-03T12:00:00Z" }).success,
    ).toBe(false);
  });

  it("rejects missing timestamp", () => {
    expect(
      safeParse(MqttCameraStatusSchema, { device_id: "esp-001" }).success,
    ).toBe(false);
  });
});

describe("MqttCameraLwtSchema", () => {
  const valid = {
    device_id: "esp-aabbccddeeff",
    state: "OFFLINE" as const,
    timestamp: "2026-03-03T12:00:00Z",
  };

  it("accepts valid LWT", () => {
    expect(parseOrThrow(MqttCameraLwtSchema, valid)).toEqual(valid);
  });

  it("accepts LWT with reason", () => {
    const withReason = { ...valid, reason: "ungraceful_disconnect" };
    expect(safeParse(MqttCameraLwtSchema, withReason).success).toBe(true);
  });

  it("rejects state other than OFFLINE", () => {
    expect(
      safeParse(MqttCameraLwtSchema, { ...valid, state: "ONLINE" }).success,
    ).toBe(false);
  });

  it("rejects missing device_id", () => {
    const { device_id, ...rest } = valid;
    expect(safeParse(MqttCameraLwtSchema, rest).success).toBe(false);
  });
});
