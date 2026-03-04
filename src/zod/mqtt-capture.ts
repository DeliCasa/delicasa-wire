import { z } from "zod";

export const MqttCaptureAckSchema = z.object({
  request_id: z.string().min(1),
  device_id: z.string().min(1),
  action: z.literal("capture"),
  status: z.literal("in_progress"),
  timestamp: z.string().datetime(),
  correlation_id: z.string().optional(),
  session_id: z.string().optional(),
  phase: z.string().optional(),
});
export type MqttCaptureAck = z.infer<typeof MqttCaptureAckSchema>;

export const MqttCaptureInfoSchema = z.object({
  request_id: z.string().min(1),
  device_id: z.string().min(1),
  success: z.boolean(),
  image_size: z.number().int().nonnegative(),
  content_type: z.string().min(1),
  total_size: z.number().int().nonnegative(),
  total_chunks: z.number().int().positive(),
  timestamp: z.string().datetime(),
  timings: z.object({
    capture_ms: z.number().int().nonnegative(),
    validate_ms: z.number().int().nonnegative(),
    encode_ms: z.number().int().nonnegative(),
  }),
  correlation_id: z.string().optional(),
  session_id: z.string().optional(),
  phase: z.string().optional(),
});
export type MqttCaptureInfo = z.infer<typeof MqttCaptureInfoSchema>;

export const MqttCaptureChunkSchema = z.object({
  request_id: z.string().min(1),
  chunk_index: z.number().int().nonnegative(),
  chunk_data: z.string().min(1),
});
export type MqttCaptureChunk = z.infer<typeof MqttCaptureChunkSchema>;

export const MqttCaptureCompleteSchema = z.object({
  request_id: z.string().min(1),
  success: z.boolean(),
  chunks_sent: z.number().int().nonnegative(),
  device_id: z.string().min(1),
  status: z.literal("complete"),
  total_chunks: z.number().int().positive(),
  timestamp: z.string().datetime(),
  timings: z.object({
    total_ms: z.number().int().nonnegative(),
    capture_ms: z.number().int().nonnegative(),
    validate_ms: z.number().int().nonnegative(),
    encode_ms: z.number().int().nonnegative(),
    publish_ms: z.number().int().nonnegative(),
  }),
  correlation_id: z.string().optional(),
  session_id: z.string().optional(),
  phase: z.string().optional(),
});
export type MqttCaptureComplete = z.infer<typeof MqttCaptureCompleteSchema>;

const MqttCaptureResponseSuccessSchema = z.object({
  request_id: z.string().min(1),
  device_id: z.string().min(1),
  success: z.literal(true),
  status: z.literal("complete"),
  timestamp: z.string().datetime(),
});

const MqttCaptureResponseFailureSchema = z.object({
  request_id: z.string().min(1),
  success: z.literal(false),
  device_id: z.string().optional(),
  status: z.literal("error"),
  timestamp: z.string().datetime(),
  error: z.string(),
  error_code: z.string(),
  error_category: z.string(),
  correlation_id: z.string().optional(),
  retry_after_ms: z.number().int().positive().optional(),
  timings: z
    .object({
      total_ms: z.number().int().nonnegative(),
      capture_ms: z.number().int().nonnegative(),
      validate_ms: z.number().int().nonnegative(),
    })
    .optional(),
  diagnostics: z
    .object({
      free_heap_bytes: z.number().int().nonnegative().optional(),
      camera_error_code: z.number().int().optional(),
      consecutive_failures: z.number().int().nonnegative().optional(),
    })
    .optional(),
});

export const MqttCaptureResponseSchema = z.discriminatedUnion("success", [
  MqttCaptureResponseSuccessSchema,
  MqttCaptureResponseFailureSchema,
]);
export type MqttCaptureResponse = z.infer<typeof MqttCaptureResponseSchema>;
