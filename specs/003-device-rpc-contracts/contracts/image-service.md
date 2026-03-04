# ImageService Contract (delicasa.v1)

**Proto file**: `proto/delicasa/v1/image_service.proto`
**Implementing repo**: BridgeServer
**Base path**: `/rpc/delicasa.v1.ImageService/`
**Auth**: `Authorization: Bearer <cognito-jwt>` (NextClient → BridgeServer)

## RPCs

### ListImages
| Field | Direction | Type | Description |
|-------|-----------|------|-------------|
| correlation_id | req/res | string | Request tracing ID |
| controller_id | req | string | Filter by controller |
| container_id | req | string | Optional filter by container |
| page_size | req | int32 | Results per page (default 20) |
| page_token | req | string | Cursor for next page |
| images | res | Image[] | Page of images |
| next_page_token | res | string | Cursor for next page (empty if last) |
| total_count | res | int32 | Total matching images |

### SearchImages
| Field | Direction | Type | Description |
|-------|-----------|------|-------------|
| correlation_id | req/res | string | Request tracing ID |
| controller_id | req | string | Required controller scope |
| container_id | req | string | Optional container filter |
| session_id | req | string | Optional session filter |
| capture_tag | req | string | Optional phase filter (e.g., "before_open") |
| from_date | req | Timestamp | Optional start of date range |
| to_date | req | Timestamp | Optional end of date range |
| sort_by | req | ImageSortField | Sort field |
| page_size | req | int32 | Results per page |
| page_token | req | string | Cursor for next page |
| images | res | Image[] | Matching images |
| next_page_token | res | string | Cursor for next page |
| total_count | res | int32 | Total matching images |

### GetPresignedUrl
| Field | Direction | Type | Description |
|-------|-----------|------|-------------|
| correlation_id | req/res | string | Request tracing ID |
| object_key | req | string | S3/R2 object key |
| expires_in_seconds | req | int32 | URL validity duration (default 3600) |
| url | res | string | Presigned download URL |
| expires_at | res | Timestamp | When the URL expires |

**Notes**: ImageService is the client-facing abstraction over stored evidence captures. It bridges the gap between PiOrchestrator's device-layer captures and NextClient's image browsing UI. BridgeServer implements this by querying its database (which stores image metadata synced from PiOrchestrator) and generating presigned URLs against R2.

## Entity: Image
| Field | Type | Description |
|-------|------|-------------|
| id | string | Image UUID |
| object_key | string | S3/R2 object key |
| controller_id | string | Controller that owns this image |
| container_id | string | Container the image is for |
| session_id | string | Capture session |
| capture_tag | string | Phase (before_open, after_close, etc.) |
| content_type | string | MIME type |
| size_bytes | int64 | File size |
| width | int32 | Image width px |
| height | int32 | Image height px |
| created_at | Timestamp | Storage timestamp |
