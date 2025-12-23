# Tokens + Primitives Audit (UIK)

## Scope
- System boundary: `packages/ui-tokens` and `packages/ui-primitives` only.
- Goal: auditably defensible 100% naming and contract alignment.
- Constraints: obey UIK naming rules, DTF 2025.10, and accessibility standards.

## Required Questions (Final Answers)

### 1) Should `ui-primitives` depend only on `tokens/components`?
No. Primitives should consume:
- Component tokens (`component.*`) for component-specific hooks.
- Semantic tokens (`semantic.*`) for shared meaning (text, surface, focus, intent, field).
- Foundation tokens (`foundation.*`) for base scales (space, radius, typography, motion, border width).

Primitives should NOT depend directly on:
- `themes/*` (theme selection),
- `density/*` (density selection).

Reason: primitives need stable semantic and foundation scales for layout and typography while keeping theme/density as an upstream concern that only affects resolved values.

### 2) What are the distinct parts of `ui-tokens`, and how do they map to `ui-primitives`?
Tokens subsystems:
- Foundation: raw scales (space, radius, typography, motion, border, shadow).
- Semantic: meaning-based values (text, surface, intent, focus, field, icon, state).
- Component: component hooks (component.<name>.*).
- Themes: per-theme values that resolve semantic/foundation tokens.
- Density: per-density values that resolve spacing/layout scales.
- Resolver + outputs: build pipeline to emit CSS variables and JSON.

Mapping to primitives:
- Atomic primitives use foundation + semantic + component tokens.
- Composed primitives should not restyle child primitives; they use their own component tokens or none.
- Internal utilities must not depend on tokens directly.

### 3) What should the layers of `ui-primitives` be?
Proposed layers:
- `internal/`: shared helpers (id, slot utilities, a11y helpers). No component imports.
- `atomic/`: primitives that do not depend on other primitives (controls, display, layout, overlays).
- `composed/`: primitives that depend on other primitives (e.g., radio-group uses radio; tooltip uses popover).

Allowed dependency direction:
`internal` -> (atomic, composed)
`atomic` -> internal only
`composed` -> atomic + internal only

## Inventory

### ui-tokens public contract
- JS API (src/index.js, src/index.d.ts)
  - THEME_ATTRIBUTE (`data-uik-theme`)
  - DENSITY_ATTRIBUTE (`data-uik-density`)
  - ThemeName, DensityName
  - setTheme, setDensity, getCssVarName
- CSS outputs (package.json exports)
  - `./base.css`
  - `./index.css`
  - `./uik-tailwind.strict.css`
  - `./uik-tailwind.compat.css`
  - `./themes/uik-theme-base.css`
  - `./themes/uik-light.css`
  - `./themes/uik-dark.css`
  - `./themes/uik-density-comfortable.css`
  - `./themes/uik-density-compact.css`
- Resolved JSON outputs (package.json exports)
  - `./tokens.resolved.light.comfortable.json`
  - `./tokens.resolved.light.compact.json`
  - `./tokens.resolved.dark.comfortable.json`
  - `./tokens.resolved.dark.compact.json`
- Token namespaces
  - foundation: blur, border, color, layout, motion, opacity, outline, radius, shadow, size, spacing, typography, z
  - semantic: border, elevation, field, focus, icon, intent, scrim, scrollbar, selection, separator, state, surface, text
  - components: alert, badge, box, button, checkbox, heading, icon, input, link, progress, radio, radio-group, select, shell, spinner, stack, surface, switch, text, textarea
  - density: comfortable, compact
  - themes: light, dark

### ui-primitives public contract
- package.json exports
  - `./index`, `./register`
  - `./uik-alert`
  - `./uik-box`
  - `./uik-badge`
  - `./uik-button`
  - `./uik-checkbox`
  - `./uik-dialog`
  - `./uik-heading`
  - `./uik-icon`
  - `./uik-input`
  - `./uik-link`
  - `./uik-popover`
  - `./uik-progress`
  - `./uik-radio`
  - `./uik-radio-group`
  - `./uik-separator`
  - `./uik-select`
  - `./uik-spinner`
  - `./uik-stack`
  - `./uik-surface`
  - `./uik-switch`
  - `./uik-text`
  - `./uik-textarea`
  - `./uik-tooltip`
  - `./uik-visually-hidden`
- Component tag names
  - `uik-alert`, `uik-badge`, `uik-box`, `uik-button`
  - `uik-checkbox`, `uik-dialog`, `uik-heading`, `uik-icon`
  - `uik-input`, `uik-link`, `uik-popover`, `uik-progress`
  - `uik-radio`, `uik-radio-group`, `uik-separator`, `uik-select`
  - `uik-spinner`, `uik-stack`, `uik-surface`, `uik-switch`
  - `uik-text`, `uik-textarea`, `uik-tooltip`, `uik-visually-hidden`
- Props/attrs/events/slots/parts/custom properties
  - See component contracts in `packages/ui-primitives/README.md` (to be re-audited).

## Vocabulary Map (Initial)
Canonical terms (tokens + primitives):
- intent: semantic meaning values (`neutral`, `primary`, `success`, `warning`, `danger`, `info`).
- tone: colorized text/icon states (uses intent-like values plus `muted`, `strong`, `inverse`, `default`).
- variant: visual styling choice for a component (e.g., `solid`, `outline`, `ghost`, `secondary`, `link`, `danger`).
- error: reserved for validation slot/messages (not used as intent/tone).

Disallowed synonyms (enforced here):
- destructive -> danger
- error (tone/intent) -> danger
- default (button variant) -> solid

Cross-layer alignment notes:
- `danger` is the sole term for destructive intent across tokens and primitives.
- `solid` is the canonical filled button variant; `primary` remains intent-level only.

## Drift Log (Updated)
Audit source: `docs/tokens-primitives-audit.data.json` (generated by `tools/audit-tokens-primitives.mjs`, gitignored).

Findings:
- `referencedNotInTokens`: 0
- `unknownRefs`: 0
- Internal `--uik-*` aliases have been removed or privatized.
- Tokens unused by primitives still exist (dataviz palettes, shell component tokens, and unused foundation scales). These are documented in the audit data file and are not errors.

## Decisions (Final)
- Internal CSS aliases in primitives must not use public `--uik-*` names. Internal aliases are private (`--_uik-*`) or removed.
- Stack alignment is attribute-driven (no custom property hooks).
- UI primitives source is layered by folder (`src/internal`, `src/atomic`, `src/composed`) with dependency direction documented in `packages/ui-primitives/LAYERING.md`.
- Public entrypoints are limited to `index.ts` and `register.ts`; component sources live only under `src/`.
- No new public export specifiers were introduced; existing `./uik-*` entrypoints remain stable.
- Structural CSS values are allowed as literals (e.g., `display`, `flex-direction`, `position`, `overflow`, `align-items`, `justify-content`).
- Visual/design values must always come from tokens (`--uik-*`), including colors, spacing, sizes, radii, typography, shadows, and motion.
