/**
 * Round-trip deserialization tests for EvidenceService factory functions.
 *
 * Each test calls a factory, passes the result through `fromJson()`,
 * and asserts the deserialized proto message has the expected field values.
 */
import { describe, expect, it, beforeEach } from "vitest";
import { fromJson, type JsonValue } from "@bufbuild/protobuf";
import { resetCorrelationCounter } from "../../src/testing/helpers.js";
import {
  makeEvidenceCapture,
  makeEvidencePair,
  makeGetEvidencePairResponse,
  makeGetSessionEvidenceResponse,
} from "../../src/testing/factories/evidence.js";
import {
  GetEvidencePairResponseSchema,
  GetSessionEvidenceResponseSchema,
} from "../../gen/ts/delicasa/device/v1/evidence_service_pb.js";
import {
  CaptureTag,
  CaptureStatus,
  EvidencePairStatus,
} from "../../gen/ts/delicasa/device/v1/evidence_pb.js";

describe("EvidenceService factories", () => {
  beforeEach(() => {
    resetCorrelationCounter();
  });

  it("makeEvidenceCapture() — verify via pair wrapper; check evidenceId, captureTag, status", () => {
    const json = makeGetEvidencePairResponse({
      pair: makeEvidencePair({
        before: makeEvidenceCapture(),
      }),
    });
    const msg = fromJson(GetEvidencePairResponseSchema, json as JsonValue);

    expect(msg.pair).toBeDefined();
    expect(msg.pair!.before).toBeDefined();
    expect(msg.pair!.before!.evidenceId).toBe("ev-test-001");
    expect(msg.pair!.before!.captureTag).toBe(CaptureTag.BEFORE_OPEN);
    expect(msg.pair!.before!.status).toBe(CaptureStatus.CAPTURED);
    expect(msg.pair!.before!.cameraId).toBe("cam-test-001");
    expect(msg.pair!.before!.contentType).toBe("image/jpeg");
    expect(msg.pair!.before!.objectKey).toBe("captures/ev-test-001.jpg");
  });

  it("makeEvidencePair() — complete pair with before and after", () => {
    const json = makeGetEvidencePairResponse({
      pair: makeEvidencePair(),
    });
    const msg = fromJson(GetEvidencePairResponseSchema, json as JsonValue);

    expect(msg.pair).toBeDefined();
    expect(msg.pair!.pairStatus).toBe(EvidencePairStatus.COMPLETE);
    expect(msg.pair!.contractVersion).toBe("v1");
    expect(msg.pair!.sessionId).toBe("sess-test-001");
    expect(msg.pair!.containerId).toBe("ctn-test-001");
    expect(msg.pair!.before).toBeDefined();
    expect(msg.pair!.before!.captureTag).toBe(CaptureTag.BEFORE_OPEN);
    expect(msg.pair!.after).toBeDefined();
    expect(msg.pair!.after!.captureTag).toBe(CaptureTag.AFTER_CLOSE);
    expect(msg.pair!.after!.evidenceId).toBe("ev-test-002");
  });

  it("makeEvidencePair({ pairStatus: INCOMPLETE, after: undefined }) — incomplete pair", () => {
    const json = makeGetEvidencePairResponse({
      pair: makeEvidencePair({
        pairStatus: "EVIDENCE_PAIR_STATUS_INCOMPLETE",
        after: undefined,
      }),
    });
    const msg = fromJson(GetEvidencePairResponseSchema, json as JsonValue);

    expect(msg.pair).toBeDefined();
    expect(msg.pair!.pairStatus).toBe(EvidencePairStatus.INCOMPLETE);
    expect(msg.pair!.before).toBeDefined();
    expect(msg.pair!.after).toBeUndefined();
  });

  it("makeGetEvidencePairResponse() — verify correlationId and pair exists", () => {
    const json = makeGetEvidencePairResponse();
    const msg = fromJson(GetEvidencePairResponseSchema, json as JsonValue);

    expect(msg.correlationId).toBe("corr-test-001");
    expect(msg.pair).toBeDefined();
    expect(msg.pair!.pairStatus).toBe(EvidencePairStatus.COMPLETE);
  });

  it("makeGetSessionEvidenceResponse() — verify captures array and counts", () => {
    const json = makeGetSessionEvidenceResponse();
    const msg = fromJson(GetSessionEvidenceResponseSchema, json as JsonValue);

    expect(msg.correlationId).toBe("corr-test-001");
    expect(msg.sessionId).toBe("sess-test-001");
    expect(msg.containerId).toBe("ctn-test-001");
    expect(msg.captures).toHaveLength(2);
    expect(msg.totalCaptures).toBe(2);
    expect(msg.successfulCaptures).toBe(2);
    expect(msg.failedCaptures).toBe(0);
    expect(msg.captures[0]!.captureTag).toBe(CaptureTag.BEFORE_OPEN);
    expect(msg.captures[1]!.captureTag).toBe(CaptureTag.AFTER_CLOSE);
  });
});
