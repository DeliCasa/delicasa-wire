<!--
  Sync Impact Report
  Version change: N/A → 1.0.0 (initial ratification)
  Modified principles: N/A (new document)
  Added sections: Core Principles (5), Constraints, Quality Gates, Governance
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md — ✅ already has Constitution Check gate
    - .specify/templates/spec-template.md — ✅ no changes needed
    - .specify/templates/tasks-template.md — ✅ no changes needed
  Follow-up TODOs: None
-->

# delicasa-wire Constitution

## Core Principles

### I. Protobuf Is the Single Source of Truth

All inter-service contracts MUST originate from `.proto` files under
`proto/delicasa/v1/`. TypeScript types, service stubs, and client code
are generated artifacts — never hand-edited. If a contract needs to
change, the proto file changes first; everything else follows via
`buf generate`.

Rationale: Eliminates "envelope drift" where manually maintained types
across BridgeServer, NextClient, and PiOrchestrator diverge silently.

### II. Wire Format and Domain Validation Are Separate Concerns

Zod schemas in `src/zod/` MUST represent the **domain view** of data —
camelCase fields, domain-specific validation rules, no infrastructure
fields (e.g., `correlation_id`). They MUST NOT be auto-generated from
proto definitions. Wire format (proto) and domain validation serve
different purposes and MUST evolve independently.

Rationale: Proto describes what crosses the wire; Zod describes what the
application layer accepts. Coupling them defeats the purpose of boundary
validation.

### III. Breaking Changes MUST Be Gated

No proto change that removes a field, changes a field type/number,
renames an RPC, or removes a service may merge without passing
`buf breaking`. The breaking check compares against the latest semver
git tag using the `FILE` category. Intentional breaking changes MUST
increment the MAJOR version.

Rationale: Multiple services consume this package. A silent breaking
change propagates failures across the entire platform.

### IV. Contracts Only — No Application Logic

This repository MUST NOT contain business logic, database access,
HTTP handlers, UI components, or any runtime application code. It
contains only: proto definitions, generated TypeScript, Zod domain
schemas, and their tests. Utility code is limited to the `parseOrThrow`
and `safeParse` helpers.

Rationale: Keeping the package lean ensures it remains a dependency
that any service can adopt without pulling in unrelated concerns.

### V. Lint Before Merge

All proto files MUST pass `buf lint` with the `STANDARD` category
before merging. All Zod schema tests MUST pass with 100% success rate.
The CI pipeline (`pnpm lint:proto && pnpm gen && pnpm test`) MUST be
green before any tag is created.

Rationale: Consistent proto style (naming, enum zero values, package
structure) prevents accidental divergence as more contributors touch
the definitions.

## Constraints

- **ESM only**: Package uses `"type": "module"`. No CommonJS support.
- **No runtime deps beyond core three**: `@bufbuild/protobuf`,
  `@connectrpc/connect`, `zod`. Transport choice is the consumer's
  concern.
- **Generated code is gitignored**: `gen/` MUST be rebuilt via
  `pnpm gen` after clone or proto changes. Never commit generated
  output.
- **Buf v2 config**: Use `version: v2` in `buf.yaml` and
  `buf.gen.yaml`. No `buf.work.yaml`.
- **Proto conventions**: Package `delicasa.v1`, `snake_case` fields,
  `PascalCase` messages, `TYPE_NAME_UNSPECIFIED` enum zero values,
  `correlation_id` at field number 1 in all request/response messages.

## Quality Gates

All features MUST pass the following gates during planning and
implementation:

| Gate | Check | Enforced By |
|------|-------|-------------|
| Proto lint | `pnpm lint:proto` passes | CI + local |
| Breaking change | `pnpm breaking:proto` passes | CI + local |
| Zod tests | `pnpm test` — 100% pass | CI + local |
| Generation | `pnpm gen` completes without error | CI + local |
| No app logic | PR review — no business logic in repo | Code review |

## Governance

This constitution supersedes all other development practices for the
`@delicasa/wire` repository. Amendments require:

1. A PR modifying this file with rationale for each change.
2. Approval from at least one maintainer.
3. Version increment following semver (MAJOR for principle
   removal/redefinition, MINOR for additions, PATCH for clarifications).
4. Propagation of changes to dependent templates (plan, spec, tasks).

Compliance is verified during `/speckit.plan` via the Constitution Check
gate. All PRs MUST be reviewed against active principles.

**Version**: 1.0.0 | **Ratified**: 2026-03-03 | **Last Amended**: 2026-03-03
