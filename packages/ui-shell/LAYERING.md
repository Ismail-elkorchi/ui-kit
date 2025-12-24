# UI Shell Layering

## Layers

- `src/internal`: non-UI utilities (routing, resize helpers, focus managers). May be imported by `structures` and `patterns`. Must not import from `structures` or `patterns`.
- `src/structures`: app-frame building blocks (layout, sidebars, status bar). May import `internal` and `@ismail-elkorchi/ui-primitives` public exports only.
- `src/patterns`: APG-aligned composites (menubar layout, navigation rail, dialog surface stacks). May import `structures`, `internal`, and `@ismail-elkorchi/ui-primitives` public exports only.

## Dependency rules

- `internal` -> `internal` only.
- `structures` -> `internal` (+ `@ismail-elkorchi/ui-primitives` public exports).
- `patterns` -> `structures` + `internal` (+ `@ismail-elkorchi/ui-primitives` public exports).
- Package-root entrypoints (for `exports`) only re-export from `src/**`.
- Enforced by `packages/ui-shell/tools/check-layering.mjs`.

## Component inventory

| Component | Layer | Purpose | Why it belongs |
| --- | --- | --- | --- |
| `uik-shell-layout` | structures | Compose app frame regions with named slots. | Pure layout building block. |
| `uik-shell-activity-bar` | structures | Vertical activity rail with toggle buttons. | Region building block; no composite APG behavior. |
| `uik-shell-sidebar` | structures | Primary sidebar with header/actions/body/footer slots. | Frame region container. |
| `uik-shell-secondary-sidebar` | structures | Optional secondary panel with close affordance. | Frame region container. |
| `uik-shell-status-bar` | structures | Status/footer bar with message + meta content. | Frame region container. |
| `router` (`UikShellRouter`) | internal | Lightweight in-memory navigation store. | Non-UI utility used by shell components or hosts. |
| patterns (none yet) | patterns | APG composites to be added. | Reserved for composite behaviors. |

## Styling contract

All visuals are driven by `--uik-*` custom properties. No hard-coded design values are allowed in component styles or stories.

### `uik-shell-layout`

- Slots: `activity-bar`, `primary-sidebar`, `main-content`, `secondary-sidebar`, `status-bar`.
- Parts: `layout`, `row`, `activity-bar`, `primary-sidebar`, `main-content`, `secondary-sidebar`, `status-bar`.
- Required CSS vars: `--uik-surface-bg`, `--uik-text-default`, `--uik-space-0`.

### `uik-shell-activity-bar`

- Slots: `footer`.
- Parts: `activity-bar`, `item`, `item-indicator`, `item-button`, `item-icon`, `spacer`, `footer`.
- Required CSS vars:
  - Component tokens: `--uik-component-shell-activity-bar-bg`, `--uik-component-shell-activity-bar-fg`, `--uik-component-shell-activity-bar-width`.
  - Foundation tokens: `--uik-size-control-lg`, `--uik-size-icon-md`, `--uik-space-2`, `--uik-border-width-1`, `--uik-border-width-2`, `--uik-radius-1`, `--uik-intent-primary-bg-default`, `--uik-typography-*`.

### `uik-shell-sidebar`

- Slots: `actions`, default slot, `footer`.
- Parts: `sidebar`, `header`, `header-content`, `heading`, `subtitle`, `actions`, `body-container`, `body`, `footer`.
- Required CSS vars:
  - Component tokens: `--uik-component-shell-sidebar-bg`, `--uik-component-shell-sidebar-fg`, `--uik-component-shell-sidebar-width`, `--uik-component-shell-divider-color`, `--uik-component-shell-scrollbar-track`, `--uik-component-shell-scrollbar-thumb`.
  - Foundation tokens: `--uik-surface-card`, `--uik-text-muted`, `--uik-size-control-md`, `--uik-space-*`, `--uik-border-width-1`, `--uik-typography-*`.

### `uik-shell-secondary-sidebar`

- Slots: default slot, `footer`.
- Parts: `secondary-sidebar`, `header`, `heading`, `close-button`, `close-icon`, `body-container`, `body`, `footer`.
- Required CSS vars:
  - Component tokens: `--uik-component-shell-secondary-sidebar-bg`, `--uik-component-shell-secondary-sidebar-width`, `--uik-component-shell-divider-color`, `--uik-component-shell-scrollbar-track`, `--uik-component-shell-scrollbar-thumb`.
  - Foundation tokens: `--uik-surface-card`, `--uik-text-muted`, `--uik-text-default`, `--uik-size-control-md`, `--uik-size-icon-sm`, `--uik-space-*`, `--uik-border-width-*`, `--uik-typography-*`.

### `uik-shell-status-bar`

- Slots: `actions`, `meta`.
- Parts: `status-bar`, `status-main`, `message`, `actions`, `meta`.
- Required CSS vars:
  - Component tokens: `--uik-component-shell-status-bar-bg`, `--uik-component-shell-status-bar-fg`, `--uik-component-shell-status-bar-height`, `--uik-component-shell-divider-color`.
  - Foundation tokens: `--uik-text-info`, `--uik-text-success`, `--uik-text-danger`, `--uik-text-muted`, `--uik-space-*`, `--uik-border-width-1`, `--uik-typography-*`.
