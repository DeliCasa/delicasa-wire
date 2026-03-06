/**
 * Round-trip deserialization tests for SessionService factory functions.
 *
 * Each test calls a factory, passes the result through `fromJson()`,
 * and asserts the deserialized proto message has the expected field values.
 */
import { describe, expect, it, beforeEach } from "vitest";
import { fromJson, type JsonValue } from "@bufbuild/protobuf";
import { resetCorrelationCounter } from "../../src/testing/helpers.js";
import {
  makeOperationSession,
  makeListSessionsResponse,
  makeGetSessionResponse,
} from "../../src/testing/factories/session.js";
import {
  ListSessionsResponseSchema,
  GetSessionResponseSchema,
} from "../../gen/ts/delicasa/device/v1/session_service_pb.js";
import { SessionStatus } from "../../gen/ts/delicasa/device/v1/session_pb.js";

describe("SessionService factories", () => {
  beforeEach(() => {
    resetCorrelationCounter();
  });

  it("makeOperationSession() — default session via GetSessionResponse", () => {
    const json = makeGetSessionResponse();
    const msg = fromJson(GetSessionResponseSchema, json as JsonValue);

    expect(msg.correlationId).toBe("corr-test-001");
    expect(msg.session).toBeDefined();
    expect(msg.session!.sessionId).toBe("sess-test-001");
    expect(msg.session!.containerId).toBe("ctn-test-001");
    expect(msg.session!.status).toBe(SessionStatus.COMPLETE);
    expect(msg.session!.pairComplete).toBe(true);
    expect(msg.session!.hasBeforeOpen).toBe(true);
    expect(msg.session!.hasAfterClose).toBe(true);
    expect(msg.session!.totalCaptures).toBe(2);
    expect(msg.session!.successfulCaptures).toBe(2);
    expect(msg.session!.failedCaptures).toBe(0);
    expect(msg.session!.elapsedSeconds).toBe(60.0);
    expect(msg.session!.startedAt).toBeDefined();
  });

  it("makeOperationSession({ status: ACTIVE, pairComplete: false }) — overrides", () => {
    const json = makeGetSessionResponse({
      session: makeOperationSession({
        status: "SESSION_STATUS_ACTIVE",
        pairComplete: false,
      }),
    });
    const msg = fromJson(GetSessionResponseSchema, json as JsonValue);

    expect(msg.session).toBeDefined();
    expect(msg.session!.status).toBe(SessionStatus.ACTIVE);
    expect(msg.session!.pairComplete).toBe(false);
  });

  it("makeListSessionsResponse() — default has 1 session", () => {
    const json = makeListSessionsResponse();
    const msg = fromJson(ListSessionsResponseSchema, json as JsonValue);

    expect(msg.correlationId).toBe("corr-test-001");
    expect(msg.sessions).toHaveLength(1);
    expect(msg.totalCount).toBe(1);
    expect(msg.sessions[0]!.sessionId).toBe("sess-test-001");
    expect(msg.sessions[0]!.status).toBe(SessionStatus.COMPLETE);
  });

  it("makeGetSessionResponse() — verify correlationId and session exists", () => {
    const json = makeGetSessionResponse();
    const msg = fromJson(GetSessionResponseSchema, json as JsonValue);

    expect(msg.correlationId).toBe("corr-test-001");
    expect(msg.session).toBeDefined();
    expect(msg.session!.sessionId).toBe("sess-test-001");
  });
});
