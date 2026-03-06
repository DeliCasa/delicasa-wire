/**
 * Proto JSON test fixture factories for EvidenceService messages.
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
// EvidenceCapture
// ---------------------------------------------------------------------------

const EVIDENCE_CAPTURE_DEFAULTS = {
  evidenceId: "ev-test-001",
  captureTag: "CAPTURE_TAG_BEFORE_OPEN",
  status: "CAPTURE_STATUS_CAPTURED",
  cameraId: "cam-test-001",
  capturedAt: makeTimestamp(),
  contentType: "image/jpeg",
  imageSizeBytes: "245760",
  objectKey: "captures/ev-test-001.jpg",
  uploadStatus: "uploaded",
  sessionId: "sess-test-001",
  containerId: "ctn-test-001",
} as const;

type EvidenceCaptureOverrides = Partial<
  Record<keyof typeof EVIDENCE_CAPTURE_DEFAULTS, unknown>
>;

export function makeEvidenceCapture(overrides?: EvidenceCaptureOverrides) {
  return mergeDefaults(
    { ...EVIDENCE_CAPTURE_DEFAULTS, capturedAt: makeTimestamp() },
    overrides,
  );
}

// ---------------------------------------------------------------------------
// EvidencePair
// ---------------------------------------------------------------------------

export function makeEvidencePair(
  overrides?: Partial<{
    contractVersion: string;
    sessionId: string;
    containerId: string;
    pairStatus: string;
    before: ReturnType<typeof makeEvidenceCapture> | undefined;
    after: ReturnType<typeof makeEvidenceCapture> | undefined;
    queriedAt: string;
    retryAfterSeconds: number;
  }>,
) {
  const defaults: Record<string, unknown> = {
    contractVersion: "v1",
    sessionId: "sess-test-001",
    containerId: "ctn-test-001",
    pairStatus: "EVIDENCE_PAIR_STATUS_COMPLETE",
    before: makeEvidenceCapture(),
    after: makeEvidenceCapture({
      captureTag: "CAPTURE_TAG_AFTER_CLOSE",
      evidenceId: "ev-test-002",
    }),
    queriedAt: makeTimestamp(),
    retryAfterSeconds: 0,
  };

  if (!overrides) return { ...defaults };

  const result = { ...defaults };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete result[key];
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// GetEvidencePairResponse
// ---------------------------------------------------------------------------

export function makeGetEvidencePairResponse(
  overrides?: Partial<{
    correlationId: string;
    pair: ReturnType<typeof makeEvidencePair>;
  }>,
) {
  return mergeDefaults(
    {
      correlationId: makeCorrelationId(),
      pair: makeEvidencePair(),
    },
    overrides,
  );
}

// ---------------------------------------------------------------------------
// GetSessionEvidenceResponse
// ---------------------------------------------------------------------------

export function makeGetSessionEvidenceResponse(
  overrides?: Partial<{
    correlationId: string;
    sessionId: string;
    containerId: string;
    captures: ReturnType<typeof makeEvidenceCapture>[];
    totalCaptures: number;
    successfulCaptures: number;
    failedCaptures: number;
  }>,
) {
  const captures = overrides?.captures ?? [
    makeEvidenceCapture(),
    makeEvidenceCapture({
      captureTag: "CAPTURE_TAG_AFTER_CLOSE",
      evidenceId: "ev-test-002",
    }),
  ];
  return mergeDefaults(
    {
      correlationId: makeCorrelationId(),
      sessionId: "sess-test-001",
      containerId: "ctn-test-001",
      captures,
      totalCaptures: captures.length,
      successfulCaptures: captures.length,
      failedCaptures: 0,
    },
    overrides,
  );
}
