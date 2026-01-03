# UIK Package Router: ui-tokens

Scope: `packages/ui-tokens/**`

## Purpose

- Single source of truth for design values and component styling hooks.
- Emits deterministic outputs (CSS + JSON) consumed by primitives/shell/apps.

## Mode Guidance

- Follow root `AGENTS.md` modes and risk triggers.
- For cross-repo reporting/session closeout, follow root `AGENTS.md`.
- Standard/Deep: use the queue (`ato q ...`) and run the required gates (`ato gate run --mode ...`).
- Fast Path: queue/gates optional; note skips in the final summary.

## Fast Context

- Public exports/outputs: `packages/ui-tokens/package.json`
- Token sources: `packages/ui-tokens/tokens/**`
- Build pipeline: `packages/ui-tokens/scripts/build.mjs`, `packages/ui-tokens/scripts/verify.mjs`

## Local Invariants

- Tokens define what values exist; no UI behavior/composition code here.
- Component hooks live under `packages/ui-tokens/tokens/components/**` and are consumed as `--uik-component-*`.
- Determinism is mandatory: file-walkers and generators must sort inputs.

## Local Triggers

- Adding/changing a token family: ensure outputs are regenerated and verified.
- Missing hook needed by primitives/shell/apps: create a backlog entry tagged `Debt` with scope and acceptance criteria.
