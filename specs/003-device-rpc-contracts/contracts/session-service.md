# SessionService Contract (delicasa.device.v1)

**Proto file**: `proto/delicasa/device/v1/session_service.proto`
**Implementing repo**: PiOrchestrator
**Base path**: `/rpc/delicasa.device.v1.SessionService/`
**Auth**: `X-API-Key` header (BridgeServer → PiOrch), none (PiDashboard → PiOrch on LAN)

## RPCs

### ListSessions
| Field | Direction | Type | Description |
|-------|-----------|------|-------------|
| correlation_id | req/res | string | Request tracing ID |
| limit | req | int32 | Max sessions to return (default 50, max 200) |
| sessions | res | OperationSession[] | Recent sessions |
| total_count | res | int32 | Total session count |

### GetSession
| Field | Direction | Type | Description |
|-------|-----------|------|-------------|
| correlation_id | req/res | string | Request tracing ID |
| session_id | req | string | Session ID to retrieve |
| session | res | OperationSession | Full session with diagnostic fields |

**Notes**: OperationSession now includes diagnostic fields: `total_captures`, `successful_captures`, `failed_captures`, `has_before_open`, `has_after_close`, `pair_complete`. These enable PiDashboard to show session health at a glance.
