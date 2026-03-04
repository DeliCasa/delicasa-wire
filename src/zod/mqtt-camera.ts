import { z } from "zod";

export const MqttCameraCommandSchema = z.object({
  action: z.enum([
    "capture",
    "restart",
    "reset",
    "ping",
    "health_check",
    "set_resolution",
  ]),
  request_id: z.string().min(1),
  correlation_id: z.string().optional(),
  session_id: z.string().optional(),
  phase: z.string().optional(),
  resolution: z.string().optional(),
});
export type MqttCameraCommand = z.infer<typeof MqttCameraCommandSchema>;

export const MqttCameraStatusSchema = z.object({
  device_id: z.string().min(1),
  timestamp: z.string().datetime(),
  state: z.enum(["ONLINE", "OFFLINE", "REBOOTING"]).optional(),
  status: z.enum(["online", "offline"]).optional(),
  uptime_ms: z.number().int().nonnegative().optional(),
  free_heap_bytes: z.number().int().nonnegative().optional(),
  rssi_dbm: z.number().int().optional(),
  camera_initialized: z.boolean().optional(),
  capture_ready: z.boolean().optional(),
  container_id: z.string().optional(),
  position: z.number().int().optional(),
  heap: z.number().int().nonnegative().optional(),
  wifi_rssi: z.number().int().optional(),
  uptime: z.number().int().nonnegative().optional(),
  secure_connection: z.boolean().optional(),
  message_count: z.number().int().nonnegative().optional(),
});
export type MqttCameraStatus = z.infer<typeof MqttCameraStatusSchema>;

export const MqttCameraLwtSchema = z.object({
  device_id: z.string().min(1),
  state: z.literal("OFFLINE"),
  timestamp: z.string().datetime(),
  reason: z.string().optional(),
});
export type MqttCameraLwt = z.infer<typeof MqttCameraLwtSchema>;
