# UIK Naming Glossary

## Policy
- Naming coherence overrides external consumer compatibility; public exports may be renamed or removed.

## Canonical terms
- Activity bar: Left rail region in the shell layout. Component `uik-shell-activity-bar`. Event `activity-bar-select`.
- Danger intent: Use `danger` for destructive/critical intent across tokens, variants, and tones.
- Error slot: Validation message slot for form-field primitives; not a tone or intent.
- Intent: Semantic meaning in tokens (`intent.*`) and derived component styles.
- Tone: Colorized text/icon state for primitives (`tone` props).
- Sidebar (primary sidebar): Shell region `primary-sidebar` and component `uik-shell-sidebar`.
- Secondary sidebar: Optional right sidebar. Component `uik-shell-secondary-sidebar`. Event `secondary-sidebar-close`.
- Solid button: Primary filled button variant in `uik-button` and `component.button.solid`.
- Status bar: Footer region. Component `uik-shell-status-bar`.
- Shell layout: Composition container `uik-shell-layout` with regions `activityBar`, `primarySidebar`, `mainContent`, `secondarySidebar`, `statusBar`.
- Navigation: Router state change emitted as `uik-shell:navigation` via `UIK_SHELL_NAVIGATION_EVENT`.
- Route: A named entry in `UikShellRoute`.
- View: Current route id in `UikShellLocation`.
- Subview: Optional secondary view under a route.
- Tokens: Visual contract in `@ismail-elkorchi/ui-tokens` with foundation, semantic, and component layers.
- Primitives: Shadow DOM components in `@ismail-elkorchi/ui-primitives`, prefixed `uik-`.

## Disallowed synonyms
- `nav` -> use `navigation`.
- `secondary` (for sidebar events) -> use `secondary-sidebar`.
- `activity` (for activity bar events) -> use `activity-bar`.
- `destructive` -> use `danger`.
- `error` (tone/intent) -> use `danger`.
- `default` (for button variant) -> use `solid`.
- `primary` (button variant) -> use `solid`.
- `tab` (router subview) -> use `subview`.
