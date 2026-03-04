# EvidenceService Contract (delicasa.device.v1)

**Proto file**: `proto/delicasa/device/v1/evidence_service.proto`
**Implementing repo**: PiOrchestrator
**Base path**: `/rpc/delicasa.device.v1.EvidenceService/`
**Auth**: `X-API-Key` header (BridgeServer → PiOrch), none (PiDashboard → PiOrch on LAN)

## RPCs

### GetEvidencePair
| Field | Direction | Type | Description |
|-------|-----------|------|-------------|
| correlation_id | req/res | string | Request tracing ID |
| session_id | req | string | Operation session ID |
| pair | res | EvidencePair | Before/after evidence pair |

### GetSessionEvidence
| Field | Direction | Type | Description |
|-------|-----------|------|-------------|
| correlation_id | req/res | string | Request tracing ID |
| session_id | req/res | string | Operation session ID |
| container_id | res | string | Container for this session |
| captures | res | EvidenceCapture[] | All captures in the session |
| total_captures | res | int32 | Total capture count |
| successful_captures | res | int32 | Successful capture count |
| failed_captures | res | int32 | Failed capture count |

**Notes**: GetEvidencePair returns the canonical before-open / after-close pair for inventory delta computation. The `retry_after_seconds` field in EvidencePair indicates the client should poll again if the pair is incomplete.
