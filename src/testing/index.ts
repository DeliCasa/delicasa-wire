/**
 * Test fixture factories for proto JSON messages.
 *
 * Re-exports all factory functions and helpers for convenient test imports:
 *
 *   import { makeCamera, makeCorrelationId } from "@delicasa/wire/testing";
 */

export {
  makeCorrelationId,
  resetCorrelationCounter,
  makeTimestamp,
  mergeDefaults,
} from "./helpers.js";

export {
  makeCameraHealth,
  makeCamera,
  makeListCamerasResponse,
  makeGetCameraResponse,
  makeGetCameraStatusResponse,
  makeReconcileCamerasResponse,
} from "./factories/camera.js";

export {
  makeCaptureImageRequest,
  makeCaptureImageResponse,
} from "./factories/capture.js";

export {
  makeEvidenceCapture,
  makeEvidencePair,
  makeGetEvidencePairResponse,
  makeGetSessionEvidenceResponse,
} from "./factories/evidence.js";

export {
  makeOperationSession,
  makeListSessionsResponse,
  makeGetSessionResponse,
} from "./factories/session.js";

export {
  makeImage,
  makeListImagesResponse,
  makeSearchImagesResponse,
  makeGetPresignedUrlResponse,
} from "./factories/image.js";
