# UIK Package Router: docs

Scope: `packages/docs/**`

## Purpose

- Public documentation + dogfooding lab that exercises tokens/primitives/shell without a framework runtime.

## Mode Guidance

- Follow root `AGENTS.md` modes and risk triggers.
- Standard/Deep: use the queue (`ato q ...`) and run the required gates (`ato gate run --mode ...`).
- Fast Path: queue/gates optional; note skips in the final summary.

## Fast Context

- App wiring: `packages/docs/src/main.ts`, `packages/docs/src/app.ts`
- Docs content: `packages/docs/src/content.ts`
- Docs styling: `packages/docs/src/styles.css` (token-first)

## Local Invariants

- No literal design values: use `--uik-*` in CSS and inline styles.
- Examples demonstrate public contracts (props/events/slots/parts/custom properties).
- A11y is a gate: stories/examples should pass axe=0.

## Local Triggers

- If docs require a literal breakpoint/utility workaround, create a backlog item tagged `Debt` with a reproducer and acceptance criteria.
