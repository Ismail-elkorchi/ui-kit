# UIK Package Router: ui-primitives

Scope: `packages/ui-primitives/**`

## Purpose

- Shadow DOM primitives (Lit) with explicit contracts: props/attrs, events, slots, parts, and token-backed custom properties.
- Host-agnostic: no framework or bundler runtime assumptions.

## Mode Guidance

- Follow root `AGENTS.md` modes and risk triggers.
- For cross-repo reporting/session closeout, follow root `AGENTS.md`.
- Standard/Deep: use the queue (`ato q ...`) and run the required gates (`ato gate run --mode ...`).
- Fast Path: queue/gates optional; note skips in the final summary.

## Fast Context

- Public exports: `packages/ui-primitives/package.json` (no deep imports across packages)
- Component code: `packages/ui-primitives/src/**`
- Stories: `packages/ui-primitives/stories/**`
- Interaction tests: `packages/ui-primitives/tests/**`

## Local Invariants

- No literal design values in CSS/stories: use `--uik-*` only.
- Every public surface change updates stories + tests in the same change.
- Accessibility baseline: WCAG 2.2 AA; APG-grade for complex widgets; axe=0 on stories/examples.

## Local Triggers

- New complex widget (combobox/listbox/tabs/menu/etc): add a keyboard interaction test and a forced-colors story.
- New styling hooks: add component tokens in `packages/ui-tokens/tokens/components/**`.
