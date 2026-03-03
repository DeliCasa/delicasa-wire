# Data Model: gRPC-First Contracts Package

**Date**: 2026-03-03
**Feature**: 001-grpc-wire-contracts

## Protobuf Entities (Wire Format)

### Controller
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique controller identifier (UUID) |
| display_name | string | Opaque human-readable name (e.g., "DC-001") |
| status | ControllerStatus (enum) | UNKNOWN, ONLINE, OFFLINE, MAINTENANCE |
| location | Location (message) | Physical location metadata |
| created_at | google.protobuf.Timestamp | Creation timestamp |
| updated_at | google.protobuf.Timestamp | Last update timestamp |

### Location
| Field | Type | Description |
|-------|------|-------------|
| address | string | Human-readable address |
| latitude | double | GPS latitude |
| longitude | double | GPS longitude |

### Container
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique container identifier |
| controller_id | string | Parent controller reference |
| slot_number | int32 | Physical slot position |
| state | ContainerState (enum) | UNKNOWN, OPEN, CLOSED, LOCKED |

### PurchaseSession
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique session identifier |
| controller_id | string | Associated controller |
| status | PurchaseSessionStatus (enum) | UNKNOWN, ACTIVE, COMPLETED, EXPIRED, CANCELLED |
| items | repeated PurchaseItem | Items in session |
| started_at | google.protobuf.Timestamp | Session start time |
| completed_at | google.protobuf.Timestamp | Session completion time (optional) |

### PurchaseItem
| Field | Type | Description |
|-------|------|-------------|
| product_id | string | Product reference |
| quantity | int32 | Item count |
| container_id | string | Container the item was taken from |

### Error (Common)
| Field | Type | Description |
|-------|------|-------------|
| code | string | Machine-readable error code (e.g., "NOT_FOUND") |
| message | string | Human-readable error description |
| details | map<string, string> | Additional context key-value pairs |

### CorrelationId (Common)
Embedded as `string correlation_id` field in every request and response message.

## Zod Domain Entities (Boundary Validation)

These schemas represent the domain view — camelCase fields, no infrastructure concerns.

### ControllerDomain
| Field | Zod Type | Validation |
|-------|----------|------------|
| id | z.string().uuid() | Must be valid UUID |
| displayName | z.string().min(1).max(50) | Non-empty, max 50 chars |
| status | z.enum(["online", "offline", "maintenance"]) | Known statuses only |
| location | LocationDomain (optional) | Optional nested object |

### PurchaseSessionDomain
| Field | Zod Type | Validation |
|-------|----------|------------|
| id | z.string().uuid() | Must be valid UUID |
| controllerId | z.string().uuid() | Must reference valid controller |
| status | z.enum(["active", "completed", "expired", "cancelled"]) | Known statuses |
| items | z.array(PurchaseItemDomain) | Array of items |
| startedAt | z.string().datetime() | ISO 8601 timestamp |
| completedAt | z.string().datetime().optional() | Optional completion time |

### ErrorDomain
| Field | Zod Type | Validation |
|-------|----------|------------|
| code | z.string().min(1) | Non-empty error code |
| message | z.string().min(1) | Non-empty message |
| details | z.record(z.string()).optional() | Optional key-value pairs |

## Entity Relationships

```
Controller 1──* Container       (a controller has many containers)
Controller 1──* PurchaseSession (sessions occur at a controller)
PurchaseSession 1──* PurchaseItem (a session has many items)
PurchaseItem *──1 Container     (item was taken from a container)
```

## State Transitions

### ControllerStatus
```
ONLINE → OFFLINE → ONLINE (normal operation cycle)
ONLINE → MAINTENANCE → ONLINE (scheduled maintenance)
OFFLINE → MAINTENANCE → ONLINE (repair cycle)
```

### ContainerState
```
CLOSED → OPEN → CLOSED (normal access cycle)
CLOSED → LOCKED (administrative lock)
LOCKED → CLOSED (administrative unlock)
```

### PurchaseSessionStatus
```
ACTIVE → COMPLETED (successful purchase)
ACTIVE → CANCELLED (user cancelled)
ACTIVE → EXPIRED (timeout)
```
