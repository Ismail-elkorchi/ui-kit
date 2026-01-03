# UIK Package Router: ui-shell

Scope: `packages/ui-shell/**`

## Purpose

- Light DOM shell/layout structures that compose primitives via public contracts only.
- Provides regions + navigation scaffolding; apps own business logic.

## Mode Guidance

- Follow root `AGENTS.md` modes and risk triggers.
- For cross-repo reporting/session closeout, follow root `AGENTS.md`.
- Standard/Deep: use the queue (`ato q ...`) and run the required gates (`ato gate run --mode ...`).
- Fast Path: queue/gates optional; note skips in the final summary.

## Fast Context

- Overview + contracts: `packages/ui-shell/README.md`
- Component code: `packages/ui-shell/src/**`
- Router: `packages/ui-shell/src/internal/router.ts`
- Tests: `packages/ui-shell/tests/**`

## Local Invariants

- Use primitives via public API only; no reaching into primitive internals.
- Token-driven styling only; shell sizing/spacing should use component tokens.
- Keyboard/focus behavior must be predictable and tested (especially nav/sidebars).

## Local Triggers

- If shell duplicates roving focus, move it into a primitive and consume it.
- If a shell region affects keyboard UX, add an interaction test and document the contract.
