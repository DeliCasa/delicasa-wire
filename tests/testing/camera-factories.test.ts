/**
 * Round-trip deserialization tests for CameraService factory functions.
 *
 * Each test calls a factory, passes the result through `fromJson()`,
 * and asserts the deserialized proto message has the expected field values.
 */
import { describe, expect, it, beforeEach } from "vitest";
import { fromJson, type JsonValue } from "@bufbuild/protobuf";
import { resetCorrelationCounter } from "../../src/testing/helpers.js";
import {
  makeCameraHealth,
  makeCamera,
  makeListCamerasResponse,
  makeGetCameraResponse,
  makeGetCameraStatusResponse,
  makeReconcileCamerasResponse,
} from "../../src/testing/factories/camera.js";
import {
  ListCamerasResponseSchema,
  GetCameraResponseSchema,
  GetCameraStatusResponseSchema,
  ReconcileCamerasResponseSchema,
} from "../../gen/ts/delicasa/device/v1/camera_service_pb.js";
import { CameraStatus } from "../../gen/ts/delicasa/device/v1/camera_pb.js";

describe("CameraService factories", () => {
  beforeEach(() => {
    resetCorrelationCounter();
  });

  it("makeCamera() — default camera round-trips via GetCameraResponse", () => {
    const json = makeGetCameraResponse();
    const msg = fromJson(GetCameraResponseSchema, json as JsonValue);

    expect(msg.correlationId).toBe("corr-test-001");
    expect(msg.camera).toBeDefined();
    expect(msg.camera!.deviceId).toBe("cam-test-001");
    expect(msg.camera!.status).toBe(CameraStatus.ONLINE);
    expect(msg.camera!.position).toBe(1);
    expect(msg.camera!.name).toBe("Test Camera 1");
    expect(msg.camera!.containerId).toBe("ctn-test-001");
    expect(msg.camera!.ipAddress).toBe("192.168.10.101");
    expect(msg.camera!.macAddress).toBe("AA:BB:CC:DD:EE:01");
  });

  it("makeCamera({ status: CAMERA_STATUS_OFFLINE }) — override status", () => {
    const json = makeGetCameraResponse({
      camera: makeCamera({ status: "CAMERA_STATUS_OFFLINE" }),
    });
    const msg = fromJson(GetCameraResponseSchema, json as JsonValue);

    expect(msg.camera).toBeDefined();
    expect(msg.camera!.status).toBe(CameraStatus.OFFLINE);
  });

  it("makeCamera({ health: undefined, lastSeen: undefined }) — absent optional fields", () => {
    const json = makeGetCameraResponse({
      camera: makeCamera({ health: undefined, lastSeen: undefined }),
    });
    const msg = fromJson(GetCameraResponseSchema, json as JsonValue);

    expect(msg.camera).toBeDefined();
    expect(msg.camera!.health).toBeUndefined();
    expect(msg.camera!.lastSeen).toBeUndefined();
  });

  it("makeCameraHealth() — verify nested health fields via camera", () => {
    const json = makeGetCameraResponse({
      camera: makeCamera({ health: makeCameraHealth() }),
    });
    const msg = fromJson(GetCameraResponseSchema, json as JsonValue);

    expect(msg.camera).toBeDefined();
    expect(msg.camera!.health).toBeDefined();
    expect(msg.camera!.health!.wifiRssi).toBe(-42);
    expect(msg.camera!.health!.firmwareVersion).toBe("2.1.0");
    expect(msg.camera!.health!.resolution).toBe("1600x1200");
    expect(msg.camera!.health!.freeHeap).toBe(BigInt(245760));
    expect(msg.camera!.health!.uptimeSeconds).toBe(BigInt(3600));
  });

  it("makeListCamerasResponse() — default has 1 camera, totalCount=1", () => {
    const json = makeListCamerasResponse();
    const msg = fromJson(ListCamerasResponseSchema, json as JsonValue);

    expect(msg.correlationId).toBe("corr-test-001");
    expect(msg.cameras).toHaveLength(1);
    expect(msg.totalCount).toBe(1);
    expect(msg.cameras[0]!.deviceId).toBe("cam-test-001");
  });

  it("makeListCamerasResponse() — multiple cameras", () => {
    const json = makeListCamerasResponse({
      cameras: [makeCamera(), makeCamera({ deviceId: "cam-2" })],
      totalCount: 2,
    });
    const msg = fromJson(ListCamerasResponseSchema, json as JsonValue);

    expect(msg.cameras).toHaveLength(2);
    expect(msg.totalCount).toBe(2);
    expect(msg.cameras[0]!.deviceId).toBe("cam-test-001");
    expect(msg.cameras[1]!.deviceId).toBe("cam-2");
  });

  it("makeGetCameraStatusResponse() — default ready=true, status ONLINE", () => {
    const json = makeGetCameraStatusResponse();
    const msg = fromJson(GetCameraStatusResponseSchema, json as JsonValue);

    expect(msg.correlationId).toBe("corr-test-001");
    expect(msg.ready).toBe(true);
    expect(msg.status).toBe(CameraStatus.ONLINE);
    expect(msg.deviceId).toBe("cam-test-001");
    expect(msg.lastSeen).toBeDefined();
  });

  it("makeGetCameraStatusResponse({ ready: false, lastSeen: undefined }) — absent lastSeen", () => {
    const json = makeGetCameraStatusResponse({
      ready: false,
      lastSeen: undefined,
    });
    const msg = fromJson(GetCameraStatusResponseSchema, json as JsonValue);

    expect(msg.ready).toBe(false);
    expect(msg.lastSeen).toBeUndefined();
  });

  it("makeReconcileCamerasResponse() — default reconciled values", () => {
    const json = makeReconcileCamerasResponse();
    const msg = fromJson(ReconcileCamerasResponseSchema, json as JsonValue);

    expect(msg.correlationId).toBe("corr-test-001");
    expect(msg.reconciledCount).toBe(1);
    expect(msg.reconciledDeviceIds).toEqual(["cam-test-001"]);
  });
});
