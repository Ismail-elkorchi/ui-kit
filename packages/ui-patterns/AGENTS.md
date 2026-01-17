# UIK Package Router: ui-patterns

Scope: `packages/ui-patterns/**`

## Purpose

- Composed UI patterns built from primitives with explicit slots/parts.
- Host-agnostic: no framework or bundler runtime assumptions.
- Styling is token-driven via `--uik-*` custom properties.

## Mode Guidance

- Follow root `AGENTS.md` modes and risk triggers.
- For cross-repo reporting/session closeout, follow root `AGENTS.md`.
- Standard/Deep: use the queue (`ato q ...`) and run the required gates (`ato gate run --mode ...`).
- Fast Path: queue/gates optional; note skips in the final summary.

## Fast Context

- Overview: `packages/ui-patterns/README.md`
- Component code: `packages/ui-patterns/src/**`
- Tests: `packages/ui-patterns/tests/**`

## Local Invariants

- Patterns consume primitives via public exports only.
- No `@ismail-elkorchi/ui-shell` dependency.
- No literal design values; use existing `--uik-*` tokens.
- Document slots/parts/css props for each pattern.

## Local Triggers

- New styling hooks that require new tokens must be added in `packages/ui-tokens`.
