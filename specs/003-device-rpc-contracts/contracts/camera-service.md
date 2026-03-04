# CameraService Contract (delicasa.device.v1)

**Proto file**: `proto/delicasa/device/v1/camera_service.proto`
**Implementing repo**: PiOrchestrator
**Base path**: `/rpc/delicasa.device.v1.CameraService/`
**Auth**: `X-API-Key` header (BridgeServer → PiOrch), none (PiDashboard → PiOrch on LAN)

## RPCs

### ListCameras
| Field | Direction | Type | Description |
|-------|-----------|------|-------------|
| correlation_id | req/res | string | Request tracing ID |
| cameras | res | Camera[] | All registered cameras |
| total_count | res | int32 | Total camera count |

### GetCamera
| Field | Direction | Type | Description |
|-------|-----------|------|-------------|
| correlation_id | req/res | string | Request tracing ID |
| device_id | req | string | Camera device ID |
| camera | res | Camera | Full camera details with health |

### GetCameraStatus
| Field | Direction | Type | Description |
|-------|-----------|------|-------------|
| correlation_id | req/res | string | Request tracing ID |
| device_id | req/res | string | Camera device ID |
| status | res | CameraStatus | Current status enum |
| last_seen | res | Timestamp | Last heartbeat time |
| ready | res | bool | Whether camera is ready to capture |

### ReconcileCameras
| Field | Direction | Type | Description |
|-------|-----------|------|-------------|
| correlation_id | req/res | string | Request tracing ID |
| reconciled_count | res | int32 | Number of cameras reconciled |
| reconciled_device_ids | res | string[] | Device IDs that were reconciled |

**Notes**: ReconcileCameras is admin-only (requires API key). It transitions DISCOVERED cameras to ONLINE after mDNS discovery confirms their presence.
