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
- Use the queue + cycle: `ato q list` -> `ato q view <id>` -> `ato cycle start --json` -> `ato cycle finish --json` (update via `ato q update <id> --input <json|path>` as needed).
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

## ATO Basics (ui-kit)

- Resolve repo + protocol once per session:
  - `ato repo resolve --json`
  - `ato protocol check --json`
- Queue flow: `ato q list` -> `ato q view <id>` -> `ato cycle start --json` -> `ato q update <id> --input <json|path>` -> `ato cycle finish --json`
- Evidence: attach file/log/artifact paths (and `cmd:` references) over prose; prefer `ato q update <id> --evidence-add <file:...|cmd:...|log:...>`.

## Gate Workflow (ui-kit)

- Full gate usage: `ato gate run --mode full --json`
- Gate artifacts include stdout/stderr tail; inspect `.ato/runs/artifacts/**` before reruns.
- Touched files report (non-JSON): `ato gate run --mode full --report-touched`
- Retry only failed step: `ato gate retry --step <step_name>`
- Sandbox listen preflight: gate output warns about EPERM for browser/listen steps; follow the suggested workaround/escalation.

## Cross-repo reporting to the ATO hub

Hub path: `/home/ismail-el-korchi/Documents/Projects/ato`

- Always resolve the current session repo before cross-repo writes:
  - `ato repo resolve --json`
- You may set the hub as a default repo or pass `--repo` each time:
  - `export ATO_REPO=/home/ismail-el-korchi/Documents/Projects/ato`
  - `ato q intake --file /abs/path/to/packet.json --dest /home/ismail-el-korchi/Documents/Projects/ato --allow-cross-store-write --json`
  - `ato q intake --file /abs/path/to/packet.json --dest /home/ismail-el-korchi/Documents/Projects/ato --allow-cross-store-write --json --repo /abs/path/to/source-repo`
- Transfer single item:
  - `ato q transfer BL-XXXX --dest /home/ismail-el-korchi/Documents/Projects/ato --source /abs/path/to/source-repo --allow-cross-store-write --json`
- Transfer many items:
  - `ato q transfer --all --status queued --dest /home/ismail-el-korchi/Documents/Projects/ato --source /abs/path/to/source-repo --allow-cross-store-write --json`
- Provenance + investigation:
  - `ato q trace BL-XXXX --json`
- Receipt retention:
  - Hub stores receipts at `.ato/intake/receipts/<sha256>.json`.
  - Items reference the receipt path deterministically (notes/spec.inputs).

## Session closeout (default end-of-session ritual)

- Plan + apply (apply is atomic):
  - `ato session closeout plan --json`
  - `ato session closeout apply --dest /home/ismail-el-korchi/Documents/Projects/ato --allow-cross-store-write --json`
- Strict eligibility:
  - Plan outputs `eligible_items` and `ineligible_items` with reasons.
  - Apply transfers only eligible items by default.
  - `--force` transfers ineligible items as blocked with reasons (use sparingly).

## Known blockers policy (do not ignore)

- If `ato gate run --mode full` fails (example: Storybook a11y violations):
  - Create a queue item in ui-kit with evidence (artifact log path, failing rule summary, repro command).
  - Prefer session closeout to transfer to the hub; `ato q transfer` is a fallback.
- Blockers must be tracked as queue items; do not silently proceed.

## ATO Fast Discovery (Use This Instead of Searching)

- **Discovery**: `ato capability list`, `ato capability explain <id>`, `ato --help`, `ato <command> --help`
- **Protocol/repo**: `ato protocol check`, `ato repo resolve|list`, `ato lock status|clear`, `ato diagnose`
- **Queue**: `ato q add|update|validate|view|list|trace|intake|transfer|contract-refs`
- Queue updates can use `--input`: `ato q update <id> --input <json|path>`.
- Queue completion may require evidence citations in `spec.inputs`/notes (file paths or `cmd:` references).
- Queue add requires `--problem`, `--outcome`, `--plan-steps`, `--acceptance`, `--inputs`, `--deliverables` (optional: `--queue-target`, `--contract-refs`).
- **Gates/cycle**: `ato gate explain|run --mode fast|full`, `ato cycle start|finish|abort`, `ato status`
- **Contracts/docs**: `ato contract index|extract|compliance`, `ato docs delta`
- **Impact/deps/tests**: `ato impact build|query`, `ato deps build|query|lint`, `ato test select`
- **Dev/dashboard**: `ato dev run`, `ato dashboard build|serve`, `ato trace run`
- **Memory/learning**: `ato memory snapshot|show|query|build|record|run|link|commit|list|resolve`, `ato lesson add`, `ato pattern add|apply`, `ato plan add`, `ato goal add`
- **Context packs/routes**: `ato pack --task "..." --budget 2400 --format md`, `ato route index|pack`
