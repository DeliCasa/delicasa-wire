import { z } from "zod";
import { CameraStatusEnum } from "./piorch-shared.js";

export const PiOrchCameraHealthSchema = z.object({
  wifi_rssi: z.number().int().max(0),
  free_heap: z.number().int().nonnegative(),
  uptime: z.union([z.string(), z.number()]).optional(),
  uptime_seconds: z.number().int().nonnegative().optional(),
  resolution: z.string().optional(),
  firmware_version: z.string().optional(),
  last_capture: z.string().datetime().optional(),
});
export type PiOrchCameraHealth = z.infer<typeof PiOrchCameraHealthSchema>;

export const PiOrchCameraSchema = z.object({
  device_id: z.string().min(1),
  id: z.string().optional(),
  name: z.string().optional(),
  status: CameraStatusEnum,
  last_seen: z.string().datetime(),
  container_id: z.string().min(1),
  health: PiOrchCameraHealthSchema.optional(),
  ip_address: z.string().optional(),
  mac_address: z.string().optional(),
  position: z.number().int().min(1).max(4).optional(),
});
export type PiOrchCamera = z.infer<typeof PiOrchCameraSchema>;

export const PiOrchCameraListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    cameras: z.array(PiOrchCameraSchema),
  }),
});
export type PiOrchCameraListResponse = z.infer<
  typeof PiOrchCameraListResponseSchema
>;

export const CapturedEvidenceSchema = z.object({
  image_base64: z.string().min(1),
  content_type: z.string().min(1),
  camera_id: z.string().min(1),
  captured_at: z.string().datetime(),
});
export type CapturedEvidence = z.infer<typeof CapturedEvidenceSchema>;
