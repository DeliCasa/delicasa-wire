import { describe, expect, it } from "vitest";
import { MqttTopics } from "../../src/zod/index.js";

describe("MqttTopics", () => {
  it("builds camera response topic with subtopic", () => {
    expect(MqttTopics.cameraResponse("req-001", "ack")).toBe(
      "camera/response/req-001/ack",
    );
  });

  it("builds camera response topic without subtopic", () => {
    expect(MqttTopics.cameraResponse("req-001")).toBe(
      "camera/response/req-001",
    );
  });

  it("builds camera response topic for chunk", () => {
    expect(MqttTopics.cameraResponse("req-001", "chunk/3")).toBe(
      "camera/response/req-001/chunk/3",
    );
  });

  it("builds camera response topic for complete", () => {
    expect(MqttTopics.cameraResponse("req-001", "complete")).toBe(
      "camera/response/req-001/complete",
    );
  });

  it("builds camera status topic", () => {
    expect(MqttTopics.cameraStatus("esp-aabbccddeeff")).toBe(
      "camera/status/esp-aabbccddeeff",
    );
  });

  it("builds camera command topic", () => {
    expect(MqttTopics.cameraCommand("esp-aabbccddeeff")).toBe(
      "camera/command/esp-aabbccddeeff",
    );
  });

  it("builds container camera topic", () => {
    expect(
      MqttTopics.containerCamera("cont-1", "AA:BB:CC:DD:EE:FF", "capture"),
    ).toBe("delicasa/cont-1/camera/AA:BB:CC:DD:EE:FF/capture");
  });

  it("builds container camera status topic", () => {
    expect(
      MqttTopics.containerCamera("cont-1", "AA:BB:CC:DD:EE:FF", "status"),
    ).toBe("delicasa/cont-1/camera/AA:BB:CC:DD:EE:FF/status");
  });

  it("has VALIDATION_ERROR constant", () => {
    expect(MqttTopics.VALIDATION_ERROR).toBe(
      "camera/response/_invalid/error",
    );
  });
});
