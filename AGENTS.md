<!-- ATO_PROTOCOL_VERSION: 1 -->
<!-- ATO_MIN_CLI_VERSION: 0.1.0 -->

# UIK Monorepo Invariants (Enforced)

These rules are mandatory. Any change that violates them is rejected.

## Authority + Conflicts

- `.ato/contracts/PLATFORM_CONTRACT.md` is the highest authority.
- If any `AGENTS.md` conflicts with the contract, the contract wins.
- If a conflict is found during package/docs work, record a queue item tagged `Uncertainty` or `Debt` and continue unless it blocks correctness. If it blocks, stop and ask.
- For internal-only work, do not use the queue; note the conflict in the final summary and ask only if it blocks.

## Mandatory Cognitive Triggers (No Exceptions)

- Identify the correct mode (Fast/Standard/Deep) before editing.
- If risk triggers apply (exports/tokens/tests/storybook/tooling/deps), bump mode and run the required gate.
- If a contract/router mismatch is found, record `Uncertainty`/`Debt` (or note it in the final summary for internal-only work) and continue unless it blocks correctness.
- Before finishing, run the required quality gate for the chosen mode or explicitly record why it was skipped.
- For write commands, ensure protocol compatibility (`ato protocol check`) if unsure.

## Modes (Power-Ups)

Choose the lightest mode that fits.

### Fast Path (micro)

- Single file, <=50 LOC changed, no public contract changes, no tests/stories/exports/tokens/deps touched.
- Queue optional; gates optional.
- If you skip gates, say so with a reason.

### Standard Path

- Default for package/docs work.
- Use the queue: `ato q next` -> `ato q start` -> `ato q done`.
- Run the fast gate (`ato gate run --mode fast`).

### Deep Path (macro)

- Multi-package changes, contract changes, or any work tagged `macro-scope`.
- Run the full gate and include contract review notes in the queue item.

Risk triggers (bump mode): touching `package.json`, exports, tokens sources, component contracts, Storybook, tests, or build tooling.

## Router Protocol (Minimal Reads)

- Start with this file.
- If working under `packages/*`, read that package's `AGENTS.md` next.
- Prefer `rg -n` / `rg --files` for discovery; use `rg --no-ignore-vcs` or `find` when searching ignored/hidden `.ato/**` artifacts.

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
- `.ato/*` is the cognitive system; do not unignore it.
- Reads are allowed anytime; write updates only at checkpoints (change-set, verification, scope change).

## Power Commands (Optional)

- Queue: `ato q next|start|done|update|upgrade`
- Context pack: `ato pack --task "..." --budget 2400 --format md` (budget is tokens)
- Quality gates: `ato gate run --mode fast|full`
- Repo index: `ato route index`
