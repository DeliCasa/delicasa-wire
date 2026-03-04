import { describe, expect, it } from "vitest";
import {
  PiOrchCameraHealthSchema,
  PiOrchCameraSchema,
  PiOrchCameraListResponseSchema,
  CapturedEvidenceSchema,
  safeParse,
  parseOrThrow,
} from "../../src/zod/index.js";

const validHealth = {
  wifi_rssi: -67,
  free_heap: 45000,
};

const validCamera = {
  device_id: "esp-aabbccddeeff",
  status: "online" as const,
  last_seen: "2026-03-03T12:00:00Z",
  container_id: "cont-1",
};

describe("PiOrchCameraHealthSchema", () => {
  it("accepts valid health with required fields", () => {
    expect(parseOrThrow(PiOrchCameraHealthSchema, validHealth)).toEqual(validHealth);
  });

  it("accepts health with all optional fields", () => {
    const full = {
      ...validHealth,
      uptime: "2h 30m",
      uptime_seconds: 9000,
      resolution: "VGA",
      firmware_version: "1.2.3",
      last_capture: "2026-03-03T11:55:00Z",
    };
    expect(safeParse(PiOrchCameraHealthSchema, full).success).toBe(true);
  });

  it("accepts uptime as number", () => {
    expect(
      safeParse(PiOrchCameraHealthSchema, { ...validHealth, uptime: 9000 }).success,
    ).toBe(true);
  });

  it("rejects wifi_rssi above 0", () => {
    expect(
      safeParse(PiOrchCameraHealthSchema, { ...validHealth, wifi_rssi: 10 }).success,
    ).toBe(false);
  });

  it("rejects negative free_heap", () => {
    expect(
      safeParse(PiOrchCameraHealthSchema, { ...validHealth, free_heap: -1 }).success,
    ).toBe(false);
  });
});

describe("PiOrchCameraSchema", () => {
  it("accepts valid camera with required fields", () => {
    expect(parseOrThrow(PiOrchCameraSchema, validCamera)).toEqual(validCamera);
  });

  it("accepts camera with health", () => {
    expect(
      safeParse(PiOrchCameraSchema, { ...validCamera, health: validHealth }).success,
    ).toBe(true);
  });

  it("accepts camera with deprecated id field", () => {
    expect(
      safeParse(PiOrchCameraSchema, { ...validCamera, id: "legacy-id" }).success,
    ).toBe(true);
  });

  it("accepts all camera statuses", () => {
    const statuses = [
      "online", "offline", "idle", "error", "rebooting",
      "discovered", "pairing", "connecting",
    ] as const;
    for (const status of statuses) {
      expect(
        safeParse(PiOrchCameraSchema, { ...validCamera, status }).success,
      ).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    expect(
      safeParse(PiOrchCameraSchema, { ...validCamera, status: "broken" }).success,
    ).toBe(false);
  });

  it("accepts position 1-4", () => {
    for (const position of [1, 2, 3, 4]) {
      expect(
        safeParse(PiOrchCameraSchema, { ...validCamera, position }).success,
      ).toBe(true);
    }
  });

  it("rejects position 0", () => {
    expect(
      safeParse(PiOrchCameraSchema, { ...validCamera, position: 0 }).success,
    ).toBe(false);
  });

  it("rejects position 5", () => {
    expect(
      safeParse(PiOrchCameraSchema, { ...validCamera, position: 5 }).success,
    ).toBe(false);
  });

  it("accepts camera with all optional fields", () => {
    const full = {
      ...validCamera,
      id: "legacy",
      name: "Front Camera",
      health: validHealth,
      ip_address: "192.168.10.101",
      mac_address: "AA:BB:CC:DD:EE:FF",
      position: 1,
    };
    expect(safeParse(PiOrchCameraSchema, full).success).toBe(true);
  });
});

describe("PiOrchCameraListResponseSchema", () => {
  it("accepts valid list response", () => {
    const response = {
      success: true,
      data: { cameras: [validCamera] },
    };
    expect(parseOrThrow(PiOrchCameraListResponseSchema, response)).toEqual(response);
  });

  it("accepts empty cameras array", () => {
    expect(
      safeParse(PiOrchCameraListResponseSchema, {
        success: true,
        data: { cameras: [] },
      }).success,
    ).toBe(true);
  });

  it("accepts failure response", () => {
    expect(
      safeParse(PiOrchCameraListResponseSchema, {
        success: false,
        data: { cameras: [] },
      }).success,
    ).toBe(true);
  });
});

describe("CapturedEvidenceSchema", () => {
  it("accepts valid captured evidence", () => {
    const evidence = {
      image_base64: "base64data",
      content_type: "image/jpeg",
      camera_id: "cam-1",
      captured_at: "2026-03-03T12:00:00Z",
    };
    expect(parseOrThrow(CapturedEvidenceSchema, evidence)).toEqual(evidence);
  });

  it("rejects missing image_base64", () => {
    expect(
      safeParse(CapturedEvidenceSchema, {
        content_type: "image/jpeg",
        camera_id: "cam-1",
        captured_at: "2026-03-03T12:00:00Z",
      }).success,
    ).toBe(false);
  });

  it("rejects empty image_base64", () => {
    expect(
      safeParse(CapturedEvidenceSchema, {
        image_base64: "",
        content_type: "image/jpeg",
        camera_id: "cam-1",
        captured_at: "2026-03-03T12:00:00Z",
      }).success,
    ).toBe(false);
  });
});
