# Proto Service Contracts

**Date**: 2026-03-03
**Feature**: 001-grpc-wire-contracts
**Package**: `delicasa.v1`

## ControllerService

| RPC | Request | Response | Description |
|-----|---------|----------|-------------|
| ListControllers | ListControllersRequest | ListControllersResponse | List all controllers with optional filtering |
| GetController | GetControllerRequest | GetControllerResponse | Get a single controller by ID |
| UpdateControllerName | UpdateControllerNameRequest | UpdateControllerNameResponse | Rename a controller's display name |

### ListControllers
- **Request**: `correlation_id`, optional `page_size` (int32), optional `page_token` (string)
- **Response**: `correlation_id`, repeated `controllers` (Controller), `next_page_token` (string)

### GetController
- **Request**: `correlation_id`, `controller_id` (string, required)
- **Response**: `correlation_id`, `controller` (Controller)

### UpdateControllerName
- **Request**: `correlation_id`, `controller_id` (string, required), `display_name` (string, required)
- **Response**: `correlation_id`, `controller` (Controller)

## ContainerAccessService

| RPC | Request | Response | Description |
|-----|---------|----------|-------------|
| OpenContainer | OpenContainerRequest | OpenContainerResponse | Unlock and open a container |
| CloseContainer | CloseContainerRequest | CloseContainerResponse | Close and lock a container |

### OpenContainer
- **Request**: `correlation_id`, `container_id` (string, required), `controller_id` (string, required)
- **Response**: `correlation_id`, `container` (Container)

### CloseContainer
- **Request**: `correlation_id`, `container_id` (string, required), `controller_id` (string, required)
- **Response**: `correlation_id`, `container` (Container)

## PurchaseSessionService

| RPC | Request | Response | Description |
|-----|---------|----------|-------------|
| GetPurchaseSession | GetPurchaseSessionRequest | GetPurchaseSessionResponse | Get a session by ID |
| ListPurchaseSessions | ListPurchaseSessionsRequest | ListPurchaseSessionsResponse | List sessions with filtering |

### GetPurchaseSession
- **Request**: `correlation_id`, `session_id` (string, required)
- **Response**: `correlation_id`, `session` (PurchaseSession)

### ListPurchaseSessions
- **Request**: `correlation_id`, `controller_id` (string, optional filter), `status` (PurchaseSessionStatus, optional filter), `page_size` (int32), `page_token` (string)
- **Response**: `correlation_id`, repeated `sessions` (PurchaseSession), `next_page_token` (string)

## Common Patterns

1. **CorrelationId**: Every request/response carries `string correlation_id` at field number 1.
2. **Pagination**: List RPCs use `page_size`/`page_token`/`next_page_token` pattern.
3. **Errors**: Connect RPC uses standard error codes (NOT_FOUND, INVALID_ARGUMENT, etc.) via `ConnectError`. The custom `Error` message type is for domain-specific error details embedded in error metadata.
