/**
 * Proto JSON test fixture factories for SessionService messages.
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
// OperationSession
// ---------------------------------------------------------------------------

const OPERATION_SESSION_DEFAULTS = {
  sessionId: "sess-test-001",
  containerId: "ctn-test-001",
  status: "SESSION_STATUS_COMPLETE",
  startedAt: makeTimestamp(),
  elapsedSeconds: 60.0,
  totalCaptures: 2,
  successfulCaptures: 2,
  failedCaptures: 0,
  hasBeforeOpen: true,
  hasAfterClose: true,
  pairComplete: true,
} as const;

type OperationSessionOverrides = Partial<
  Record<keyof typeof OPERATION_SESSION_DEFAULTS, unknown>
>;

export function makeOperationSession(overrides?: OperationSessionOverrides) {
  return mergeDefaults(
    { ...OPERATION_SESSION_DEFAULTS, startedAt: makeTimestamp() },
    overrides,
  );
}

// ---------------------------------------------------------------------------
// ListSessionsResponse
// ---------------------------------------------------------------------------

export function makeListSessionsResponse(
  overrides?: Partial<{
    correlationId: string;
    sessions: ReturnType<typeof makeOperationSession>[];
    totalCount: number;
  }>,
) {
  const sessions = overrides?.sessions ?? [makeOperationSession()];
  return mergeDefaults(
    {
      correlationId: makeCorrelationId(),
      sessions,
      totalCount: sessions.length,
    },
    overrides,
  );
}

// ---------------------------------------------------------------------------
// GetSessionResponse
// ---------------------------------------------------------------------------

export function makeGetSessionResponse(
  overrides?: Partial<{
    correlationId: string;
    session: ReturnType<typeof makeOperationSession>;
  }>,
) {
  return mergeDefaults(
    {
      correlationId: makeCorrelationId(),
      session: makeOperationSession(),
    },
    overrides,
  );
}
