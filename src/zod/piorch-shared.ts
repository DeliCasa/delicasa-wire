import { z } from "zod";

export const CaptureTagEnum = z.enum([
  "BEFORE_OPEN",
  "AFTER_OPEN",
  "BEFORE_CLOSE",
  "AFTER_CLOSE",
]);
export type CaptureTagEnum = z.infer<typeof CaptureTagEnum>;

export const CaptureStatusEnum = z.enum([
  "captured",
  "failed",
  "timeout",
]);
export type CaptureStatusEnum = z.infer<typeof CaptureStatusEnum>;

export const PairCaptureStatusEnum = z.enum([
  "captured",
  "failed",
  "timeout",
  "pending",
]);
export type PairCaptureStatusEnum = z.infer<typeof PairCaptureStatusEnum>;

export const UploadStatusEnum = z.enum([
  "uploaded",
  "failed",
  "unverified",
]);
export type UploadStatusEnum = z.infer<typeof UploadStatusEnum>;

export const ContainerActionErrorCodeEnum = z.enum([
  "CONTAINER_NOT_FOUND",
  "CONTAINER_BUSY",
  "ACTUATION_FAILED",
  "CAPTURE_FAILED",
  "SERVICE_UNAVAILABLE",
  "TIMEOUT",
  "NETWORK_ERROR",
  "INVALID_RESPONSE",
  "NO_ONLINE_CAMERAS",
  "INTERNAL_ERROR",
]);
export type ContainerActionErrorCodeEnum = z.infer<
  typeof ContainerActionErrorCodeEnum
>;

export const PairStatusEnum = z.enum([
  "complete",
  "incomplete",
  "missing",
]);
export type PairStatusEnum = z.infer<typeof PairStatusEnum>;

export const PairCaptureTagEnum = z.enum([
  "BEFORE_OPEN",
  "AFTER_CLOSE",
]);
export type PairCaptureTagEnum = z.infer<typeof PairCaptureTagEnum>;

export const CameraStatusEnum = z.enum([
  "online",
  "offline",
  "idle",
  "error",
  "rebooting",
  "discovered",
  "pairing",
  "connecting",
]);
export type CameraStatusEnum = z.infer<typeof CameraStatusEnum>;

export const SessionStatusEnum = z.enum([
  "active",
  "complete",
  "partial",
  "failed",
]);
export type SessionStatusEnum = z.infer<typeof SessionStatusEnum>;
