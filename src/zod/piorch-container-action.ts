import { z } from "zod";
import {
  CaptureTagEnum,
  CaptureStatusEnum,
  UploadStatusEnum,
  ContainerActionErrorCodeEnum,
} from "./piorch-shared.js";

export const PiOrchContainerActionRequestSchema = z.object({
  action: z.enum(["open", "close"]),
  correlation_id: z.string().min(1),
});
export type PiOrchContainerActionRequest = z.infer<
  typeof PiOrchContainerActionRequestSchema
>;

export const BridgeEvidenceCaptureSchema = z.object({
  camera_id: z.string().min(1),
  captured_at: z.string().datetime(),
  content_type: z.string().min(1),
  capture_reason: CaptureTagEnum,
  capture_tag: CaptureTagEnum,
  status: CaptureStatusEnum,
  evidence_id: z.string().min(1),
  image_data: z.string().optional(),
  device_id: z.string().optional(),
  container_id: z.string().optional(),
  session_id: z.string().optional(),
  object_key: z.string().optional(),
  upload_status: UploadStatusEnum.optional(),
  error_message: z.string().optional(),
});
export type BridgeEvidenceCapture = z.infer<typeof BridgeEvidenceCaptureSchema>;

const ContainerActionSuccessSchema = z.object({
  status: z.literal("success"),
  action_id: z.string().min(1),
  container_id: z.string().min(1),
  session_id: z.string().optional(),
  before_captures: z.array(BridgeEvidenceCaptureSchema),
  after_captures: z.array(BridgeEvidenceCaptureSchema),
});

const ContainerActionErrorSchema = z.object({
  status: z.literal("error"),
  action_id: z.string().optional(),
  error: z.object({
    error_code: ContainerActionErrorCodeEnum,
    retryable: z.boolean(),
    retry_after: z.number().optional(),
  }),
});

export const PiOrchContainerActionResponseSchema = z.discriminatedUnion(
  "status",
  [ContainerActionSuccessSchema, ContainerActionErrorSchema],
);
export type PiOrchContainerActionResponse = z.infer<
  typeof PiOrchContainerActionResponseSchema
>;
