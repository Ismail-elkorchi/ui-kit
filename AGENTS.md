# UIK Monorepo Invariants (Enforced)

These rules are mandatory. Any change that violates them is rejected.

## Authority + Conflicts

- This file is the highest public contributor contract in this repository.
- If a deeper `AGENTS.md` applies to the edited path, the deeper file wins.
- If a conflict blocks correctness, stop and ask. Otherwise, note the conflict in the final summary.

## Mandatory Cognitive Triggers (No Exceptions)

- Identify the correct mode (Fast/Standard/Deep) before editing.
- If risk triggers apply (exports/tokens/tests/storybook/tooling/deps), bump mode and run the required gate.
- If a contract/router mismatch is found, note it in the final summary and continue unless it blocks correctness.
- Before finishing, run the required quality gate for the chosen mode or explicitly record why it was skipped.

## Modes (Power-Ups)

Choose the lightest mode that fits.

### Fast Path (micro)

- Single file, <=50 LOC changed, no public contract changes, no tests/stories/exports/tokens/deps touched.
- Queue optional; gates optional.
- If you skip gates, say so with a reason.

### Standard Path

- Default for package/docs work.
- Run the lightest relevant verification set, usually `npm run lint` plus the nearest affected package/doc/test command.

### Deep Path (macro)

- Multi-package changes, contract changes, or any work tagged `macro-scope`.
- Run the full gate chain: `npm test`, plus any focused build or release checks required by the touched surface.

Risk triggers (bump mode): touching `package.json`, exports, tokens sources, component contracts, Storybook, tests, or build tooling.

## Router Protocol (Minimal Reads)

- Start with this file.
- If working under `packages/*`, read that package's `AGENTS.md` next.
- Prefer `rg -n` / `rg --files` for discovery.

## Core Invariants (Summary)

- Components are Custom Elements with Shadow DOM; primitives are host-agnostic.
- Tokens-first: no literal design values; component hooks live in `packages/ui-tokens/tokens/components/` and are consumed as `--uik-component-*`; use public exports only.
- Accessibility baseline: WCAG 2.2 + APG keyboard patterns; reduced motion and forced colors supported.
- Deterministic builds and stable output ordering.

## Naming (Summary)

- One concept -> one term; nouns for things, verbs for actions, booleans `is/has/can/should`.
- Names mirror domain meaning, not build tools or vendors.

## No Adapters Policy

- Do not add framework adapters in core packages; integration lives in recipes/docs or external edges.

## Docs + Internal System

- Public docs: package `README.md` only.
- Gate logs and temporary artifacts should stay outside committed sources.

## Verification

- Package/docs changes: run the narrowest relevant checks first.
- Tooling/build changes: run `npm test` unless a narrower proof is clearly sufficient, and state any skipped heavyweight checks explicitly.
- Prefer reproducible file/log evidence over prose claims.
