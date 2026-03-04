import { z } from "zod";
import {
  PairCaptureStatusEnum,
  PairCaptureTagEnum,
  PairStatusEnum,
  UploadStatusEnum,
} from "./piorch-shared.js";

export const PairCaptureSchema = z.object({
  evidence_id: z.string().min(1),
  capture_tag: PairCaptureTagEnum,
  status: PairCaptureStatusEnum,
  image_size_bytes: z.number().int().nonnegative(),
  missing_reason: z.string().optional(),
  failure_detail: z.string().optional(),
  device_id: z.string().optional(),
  container_id: z.string().optional(),
  session_id: z.string().optional(),
  captured_at: z.string().datetime().optional(),
  content_type: z.string().optional(),
  image_data: z.string().optional(),
  object_key: z.string().optional(),
  upload_status: UploadStatusEnum.optional(),
});
export type PairCapture = z.infer<typeof PairCaptureSchema>;

export const PiOrchEvidencePairLivenessProofSchema = z.object({
  method: z.enum(["uptime_advance", "probe_responded"]),
  capture_ready: z.boolean(),
  probe_1_uptime_s: z.number().optional(),
  probe_2_uptime_s: z.number().optional(),
  delta_s: z.number().optional(),
  probe_latency_ms: z.number().int().nonnegative().optional(),
  free_heap: z.number().int().nonnegative().optional(),
  wifi_rssi: z.number().int().max(0).optional(),
});
export type PiOrchEvidencePairLivenessProof = z.infer<
  typeof PiOrchEvidencePairLivenessProofSchema
>;

export const PiOrchEvidencePairSchema = z.object({
  contract_version: z.literal("v1"),
  session_id: z.string().min(1),
  container_id: z.string().min(1),
  pair_status: PairStatusEnum,
  before: PairCaptureSchema,
  after: PairCaptureSchema,
  queried_at: z.string().datetime(),
  retry_after_seconds: z.number().optional(),
  liveness_proof: PiOrchEvidencePairLivenessProofSchema.optional(),
});
export type PiOrchEvidencePair = z.infer<typeof PiOrchEvidencePairSchema>;
