import type { z, ZodType } from "zod";

// v0.1.0 — Domain schemas
export { ErrorDomain } from "./errors.js";
export { LocationDomain, ControllerDomain } from "./controller.js";
export {
  PurchaseItemDomain,
  PurchaseSessionDomain,
} from "./purchase-session.js";

// v0.2.0 — Constants
export { STALE_THRESHOLD_SECONDS } from "./constants.js";

// v0.2.0 — Shared enums
export {
  CaptureTagEnum,
  CaptureStatusEnum,
  PairCaptureStatusEnum,
  UploadStatusEnum,
  ContainerActionErrorCodeEnum,
  PairStatusEnum,
  PairCaptureTagEnum,
  CameraStatusEnum,
  SessionStatusEnum,
} from "./piorch-shared.js";

// v0.2.0 — PiOrchestrator HTTP boundary: container action
export {
  PiOrchContainerActionRequestSchema,
  BridgeEvidenceCaptureSchema,
  PiOrchContainerActionResponseSchema,
} from "./piorch-container-action.js";
export type {
  PiOrchContainerActionRequest,
  BridgeEvidenceCapture,
  PiOrchContainerActionResponse,
} from "./piorch-container-action.js";

// v0.2.0 — PiOrchestrator HTTP boundary: evidence pair
export {
  PairCaptureSchema,
  PiOrchEvidencePairLivenessProofSchema,
  PiOrchEvidencePairSchema,
} from "./piorch-evidence-pair.js";
export type {
  PairCapture,
  PiOrchEvidencePairLivenessProof,
  PiOrchEvidencePair,
} from "./piorch-evidence-pair.js";

// v0.2.0 — PiOrchestrator HTTP boundary: cameras
export {
  PiOrchCameraHealthSchema,
  PiOrchCameraSchema,
  PiOrchCameraListResponseSchema,
  CapturedEvidenceSchema,
} from "./piorch-camera.js";
export type {
  PiOrchCameraHealth,
  PiOrchCamera,
  PiOrchCameraListResponse,
  CapturedEvidence,
} from "./piorch-camera.js";

// v0.2.0 — PiOrchestrator HTTP boundary: sessions
export {
  PiOrchSessionSchema,
  PiOrchSessionListResponseSchema,
} from "./piorch-session.js";
export type {
  PiOrchSession,
  PiOrchSessionListResponse,
} from "./piorch-session.js";

// v0.2.0 — MQTT capture protocol
export {
  MqttCaptureAckSchema,
  MqttCaptureInfoSchema,
  MqttCaptureChunkSchema,
  MqttCaptureCompleteSchema,
  MqttCaptureResponseSchema,
} from "./mqtt-capture.js";
export type {
  MqttCaptureAck,
  MqttCaptureInfo,
  MqttCaptureChunk,
  MqttCaptureComplete,
  MqttCaptureResponse,
} from "./mqtt-capture.js";

// v0.2.0 — MQTT camera status/command
export {
  MqttCameraCommandSchema,
  MqttCameraStatusSchema,
  MqttCameraLwtSchema,
} from "./mqtt-camera.js";
export type {
  MqttCameraCommand,
  MqttCameraStatus,
  MqttCameraLwt,
} from "./mqtt-camera.js";

// v0.2.0 — MQTT topic helpers
export { MqttTopics } from "./mqtt-topics.js";

/**
 * Parse a value against a Zod schema, throwing on failure.
 * Use at trust boundaries where invalid data should halt execution.
 */
export function parseOrThrow<T>(schema: ZodType<T>, value: unknown): T {
  return schema.parse(value);
}

/**
 * Safely parse a value against a Zod schema, returning a result object.
 * Use at trust boundaries where you want to handle errors gracefully.
 */
export function safeParse<T>(
  schema: ZodType<T>,
  value: unknown,
): z.SafeParseReturnType<unknown, T> {
  return schema.safeParse(value);
}
