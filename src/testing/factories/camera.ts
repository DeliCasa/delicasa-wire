/**
 * Proto JSON test fixture factories for CameraService messages.
 *
 * Returns plain objects compatible with `fromJson()` from `@bufbuild/protobuf`.
 * No generated code imports — consumers cast to `JsonValue` themselves.
 */

import {
  makeCorrelationId,
  makeTimestamp,
  mergeDefaults,
} from "../helpers.js";

// ---------------------------------------------------------------------------
// CameraHealth
// ---------------------------------------------------------------------------

const CAMERA_HEALTH_DEFAULTS = {
  wifiRssi: -42,
  freeHeap: "245760",
  uptimeSeconds: "3600",
  firmwareVersion: "2.1.0",
  resolution: "1600x1200",
  lastCapture: makeTimestamp(),
} as const;

type CameraHealthOverrides = Partial<
  Record<keyof typeof CAMERA_HEALTH_DEFAULTS, unknown>
>;

export function makeCameraHealth(overrides?: CameraHealthOverrides) {
  return mergeDefaults(
    { ...CAMERA_HEALTH_DEFAULTS, lastCapture: makeTimestamp() },
    overrides,
  );
}

// ---------------------------------------------------------------------------
// Camera
// ---------------------------------------------------------------------------

const CAMERA_DEFAULTS = {
  deviceId: "cam-test-001",
  name: "Test Camera 1",
  status: "CAMERA_STATUS_ONLINE",
  containerId: "ctn-test-001",
  position: 1,
  lastSeen: makeTimestamp(),
  health: makeCameraHealth(),
  ipAddress: "192.168.10.101",
  macAddress: "AA:BB:CC:DD:EE:01",
} as const;

type CameraOverrides = Partial<Record<keyof typeof CAMERA_DEFAULTS, unknown>>;

export function makeCamera(overrides?: CameraOverrides) {
  return mergeDefaults(
    {
      ...CAMERA_DEFAULTS,
      lastSeen: makeTimestamp(),
      health: makeCameraHealth(),
    },
    overrides,
  );
}

// ---------------------------------------------------------------------------
// ListCamerasResponse
// ---------------------------------------------------------------------------

export function makeListCamerasResponse(
  overrides?: Partial<{
    correlationId: string;
    cameras: ReturnType<typeof makeCamera>[];
    totalCount: number;
  }>,
) {
  const cameras = overrides?.cameras ?? [makeCamera()];
  return mergeDefaults(
    {
      correlationId: makeCorrelationId(),
      cameras,
      totalCount: cameras.length,
    },
    overrides,
  );
}

// ---------------------------------------------------------------------------
// GetCameraResponse
// ---------------------------------------------------------------------------

export function makeGetCameraResponse(
  overrides?: Partial<{
    correlationId: string;
    camera: ReturnType<typeof makeCamera>;
  }>,
) {
  return mergeDefaults(
    {
      correlationId: makeCorrelationId(),
      camera: makeCamera(),
    },
    overrides,
  );
}

// ---------------------------------------------------------------------------
// GetCameraStatusResponse
// ---------------------------------------------------------------------------

export function makeGetCameraStatusResponse(
  overrides?: Partial<{
    correlationId: string;
    deviceId: string;
    status: string;
    lastSeen: string;
    ready: boolean;
  }>,
) {
  return mergeDefaults(
    {
      correlationId: makeCorrelationId(),
      deviceId: "cam-test-001",
      status: "CAMERA_STATUS_ONLINE",
      lastSeen: makeTimestamp(),
      ready: true,
    },
    overrides,
  );
}

// ---------------------------------------------------------------------------
// ReconcileCamerasResponse
// ---------------------------------------------------------------------------

export function makeReconcileCamerasResponse(
  overrides?: Partial<{
    correlationId: string;
    reconciledCount: number;
    reconciledDeviceIds: string[];
  }>,
) {
  return mergeDefaults(
    {
      correlationId: makeCorrelationId(),
      reconciledCount: 1,
      reconciledDeviceIds: ["cam-test-001"],
    },
    overrides,
  );
}
