# UI Primitives Layering

## Purpose
Make internal dependencies explicit, enforceable, and documented with rationale.

## Layers

### internal/
Shared utilities (ids, slots, a11y helpers). No component imports.

### atomic/
Primitives that do not depend on other primitives. Allowed deps: `internal/` and platform APIs only.

### composed/
Primitives that depend on other primitives. Allowed deps: `atomic/` + `internal/` only.

## Allowed Dependency Direction
`internal` -> (atomic, composed)  
`atomic` -> internal only  
`composed` -> atomic + internal only

## Classification

| component | layer | kind | rationale |
| --- | --- | --- | --- |
| uik-alert | atomic | feedback | Status container with slots; no primitive dependencies. |
| uik-badge | atomic | content | Inline label indicator that stands alone. |
| uik-box | atomic | layout | Generic layout container without primitive dependencies. |
| uik-button | atomic | control | Interactive control using native button semantics only. |
| uik-checkbox | atomic | control | Form control wrapper around native input; self-contained. |
| uik-dialog | atomic | overlay | Uses native dialog for overlay behavior; self-contained. |
| uik-heading | atomic | content | Text semantic wrapper with no primitive dependencies. |
| uik-icon | atomic | content | Inline icon rendering with no primitive dependencies. |
| uik-input | atomic | control | Form control wrapper around native input; self-contained. |
| uik-link | atomic | control | Interactive anchor styling with no primitive dependencies. |
| uik-popover | atomic | overlay | Overlay container/trigger logic without other primitives. |
| uik-progress | atomic | feedback | Progress indicator element without primitive dependencies. |
| uik-radio | atomic | control | Form control wrapper around native radio input; self-contained. |
| uik-select | atomic | control | Form control wrapper around native select; self-contained. |
| uik-separator | atomic | layout | Structural divider element with no primitive dependencies. |
| uik-spinner | atomic | feedback | Indeterminate progress indicator with no primitive dependencies. |
| uik-stack | atomic | layout | Stack layout utility without primitive dependencies. |
| uik-surface | atomic | layout | Surface container for layout/background; self-contained. |
| uik-switch | atomic | control | Form control toggle built on native input; self-contained. |
| uik-text | atomic | content | Text styling wrapper with no primitive dependencies. |
| uik-textarea | atomic | control | Form control wrapper around native textarea; self-contained. |
| uik-visually-hidden | atomic | content | Accessibility utility for hidden content; self-contained. |
| uik-radio-group | composed | collection | Coordinates a collection of `uik-radio` elements. |
| uik-tooltip | composed | overlay | Specializes popover behavior/styling for tooltips. |
