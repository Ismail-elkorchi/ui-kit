# @ismail-elkorchi/ui-primitives

Shadow DOM web components backed by the shared token CSS variables from `@ismail-elkorchi/ui-tokens`. They ship no Tailwind and assume tokens are loaded on `:root`.

## Usage

```ts
import "@ismail-elkorchi/ui-primitives/register"; // defines all elements
// or import individual components for tree-shaking:
import "@ismail-elkorchi/ui-primitives/uik-alert";
import "@ismail-elkorchi/ui-primitives/uik-badge";
import "@ismail-elkorchi/ui-primitives/uik-box";
import "@ismail-elkorchi/ui-primitives/uik-button";
import "@ismail-elkorchi/ui-primitives/uik-checkbox";
import "@ismail-elkorchi/ui-primitives/uik-dialog";
import "@ismail-elkorchi/ui-primitives/uik-heading";
import "@ismail-elkorchi/ui-primitives/uik-icon";
import "@ismail-elkorchi/ui-primitives/uik-input";
import "@ismail-elkorchi/ui-primitives/uik-link";
import "@ismail-elkorchi/ui-primitives/uik-nav";
import "@ismail-elkorchi/ui-primitives/uik-nav-rail";
import "@ismail-elkorchi/ui-primitives/uik-tree-view";
import "@ismail-elkorchi/ui-primitives/uik-popover";
import "@ismail-elkorchi/ui-primitives/uik-progress";
import "@ismail-elkorchi/ui-primitives/uik-radio";
import "@ismail-elkorchi/ui-primitives/uik-radio-group";
import "@ismail-elkorchi/ui-primitives/uik-select";
import "@ismail-elkorchi/ui-primitives/uik-separator";
import "@ismail-elkorchi/ui-primitives/uik-resizable-panels";
import "@ismail-elkorchi/ui-primitives/uik-spinner";
import "@ismail-elkorchi/ui-primitives/uik-stack";
import "@ismail-elkorchi/ui-primitives/uik-surface";
import "@ismail-elkorchi/ui-primitives/uik-switch";
import "@ismail-elkorchi/ui-primitives/uik-text";
import "@ismail-elkorchi/ui-primitives/uik-textarea";
import "@ismail-elkorchi/ui-primitives/uik-tooltip";
import "@ismail-elkorchi/ui-primitives/uik-visually-hidden";
```

Ensure your app imports tokens before Tailwind so the theme variables exist:

```css
@import "@ismail-elkorchi/ui-tokens/index.css";
@import "tailwindcss";
```

## Parts (consistent strategy)

- Most components expose `part="base"` on the primary element.
- Form-field primitives expose `part="control"` wrappers plus `part="label"`, `part="hint"`, and `part="error"` slots when slotted.
- Layout and text primitives expose `part="base"` on their container or rendered tag.

## Focus + roving focus contract

- Roving focus is implemented with a single `tabIndexValue=0` target and `tabIndexValue=-1` for the rest of the roving set (usually `uik-button` inside a composite widget).
- Arrow keys move focus within the roving set; `Home`/`End` jump to the first/last enabled item. `Enter`/`Space` activate the focused item per APG expectations.
- Focus state is tracked by item id and updated on focus and when the items list changes (falling back to the active or first enabled item).
- Shell components must delegate roving focus to primitives such as `uik-nav-rail`/`uik-tree-view` instead of re-implementing keyboard logic.

## Components and contracts

### `<uik-alert>`

- **Attributes/props**: `variant` (`neutral | info | success | warning | danger`).
- **Slots**: `title`, default slot for message body.
- **Parts**: `base`, `title`, `body`.
- **Events**: none special.
- **A11y**: `role="status"` by default; `role="alert"` for warning/danger.
- **Custom properties**: `--uik-component-alert-{neutral|info|success|warning|danger}-{bg|border|fg}`.

### `<uik-badge>`

- **Attributes/props**: `variant` (`default | secondary | danger | outline`).
- **Events**: none special; behaves like an inline element.
- **Styling hooks**: token-driven colors and `part="base"`.

### `<uik-box>`

- **Attributes/props**: `padding` (`0-6`), `inline` (boolean).
- **Slots**: default.
- **Parts**: `base`.
- **Custom properties**: `--uik-component-box-padding-{0..6}`, `--uik-component-box-bg`, `--uik-component-box-bg-opacity`, `--uik-component-box-border-color`, `--uik-component-box-border-opacity`, `--uik-component-box-border-width`, `--uik-component-box-radius`.

### `<uik-button>`

- **Attributes/props**: `variant` (`solid | danger | outline | secondary | ghost | link`), `size` (`default | sm | lg | icon`), `type` (`button | submit | reset` - defaults to `button`), `tabIndexValue` (number), `active` (boolean), `muted` (boolean), `disabled` (boolean).
- **Events**: native button events (`click`, focus/blur) bubble from the internal button; disabled buttons swallow click.
- **Styling hooks**:
  - Sizing is enforced on the `:host`. The internal button fills the host (100% width/height).
  - `active`/`muted` props control stateful colors (especially for ghost variant).
  - `part="base"` allows overrides, but avoid fighting the host sizing.
- **A11y**: `aria-label`/`aria-labelledby`/`aria-pressed` are forwarded to the internal `<button>` for icon-only buttons and toggle states.
- **Forms**: `type="submit"` and `type="reset"` invoke `form.requestSubmit()`/`form.reset()` when inside a form.

### `<uik-checkbox>`

- **Attributes/props**: `name`, `value`, `checked`, `indeterminate` (boolean), `disabled`, `required`, `invalid`, `tabIndexValue` (number).
- **Slots**: `label`, `hint`, `error`.
- **Parts**: `base`, `control`, `label`, `hint`, `error`.
- **Events**: native `change` bubbles from the internal `<input>`.
- **A11y**: label slot or `aria-label`; hint/error slots are announced via `aria-describedby`.
- **Forms**: form-associated and participates in `FormData` when checked.
- **Custom properties**: `--uik-component-checkbox-accent`, `--uik-component-checkbox-size`.

### `<uik-dialog>`

- **Attributes/props**: `open`, `modal` (boolean).
- **Slots**: `title`, `description`, default slot for body, `actions`.
- **Parts**: `base`, `panel`, `title`, `description`, `body`, `actions`.
- **Events**: native `close`/`cancel` from `<dialog>` bubble; `overlay-close` (`detail: {reason}`).
- **A11y**: uses native dialog semantics and forwards `aria-label`/`aria-labelledby`/`aria-describedby` to `<dialog>`; Escape closes and focus returns to the opener.
- **Methods**: `showModal()`, `show()`, `close()`.
- **Custom properties**: `--uik-component-dialog-bg`, `--uik-component-dialog-fg`, `--uik-component-dialog-border`, `--uik-component-dialog-radius`, `--uik-component-dialog-padding`, `--uik-component-dialog-shadow`, `--uik-component-dialog-max-width`, `--uik-component-dialog-title-fg`, `--uik-component-dialog-description-fg`, `--uik-component-dialog-actions-gap`.

### `<uik-heading>`

- **Attributes/props**: `level` (`1-6`), `tone` (`default | strong | muted | danger | success | warning | info`).
- **Slots**: default.
- **Parts**: `base`.
- **Custom properties**: `--uik-component-heading-size-{1..6}`, `--uik-component-heading-line-height-{1..6}`, `--uik-component-heading-weight`, `--uik-component-heading-color-{default|strong|muted|danger|success|warning|info}`.

### `<uik-icon>`

- **Attributes/props**: `size` (`xs | sm | md | lg`), `tone` (`default | muted | danger | success | warning | info | inverse`).
- **Slots**: default slot for SVG.
- **Parts**: `base`.
- **A11y**: set `aria-label` for meaningful icons or `aria-hidden` for decorative ones.
- **Custom properties**: `--uik-component-icon-size-{xs|sm|md|lg}`, `--uik-component-icon-color-{default|muted|danger|success|warning|info|inverse}`.

### `<uik-input>`

- **Attributes/props**: `type`, `name`, `value`, `placeholder`, `disabled`, `required`, `readonly`, `invalid`, `autocomplete`, `inputmode`, `enterkeyhint`. Optional `aria-label`/`aria-labelledby` are forwarded when no label slot is provided.
- **Slots**: `label`, `hint`, `error`.
- **Events**: native `input` and `change` bubble from the internal `<input>` (no re-dispatch).
- **A11y**: label slot associates via `for`, hint/error slot text is wired to `aria-describedby`, and `aria-invalid` is set when `invalid` or an error slot is present.
- **Forms**: form-associated via `ElementInternals` and participates in `FormData` when `name` is set.

### `<uik-link>`

- **Attributes/props**: `href`, `target`, `rel`, `download`.
- **Slots**: default slot for link text.
- **Parts**: `base`.
- **Events**: native anchor events bubble from the internal `<a>`.
- **A11y**: forwards `aria-label`/`aria-labelledby`/`aria-describedby` to `<a>`.
- **Custom properties**: `--uik-component-link-fg-default`, `--uik-component-link-fg-hover`, `--uik-component-link-underline-offset`.

### `<uik-tree-view>`

- **Attributes/props**: `items` (array), `selectedIds` (string[]), `openIds` (string[]).
- **Slots**: none.
- **Parts**: `base`, `item`, `toggle`, `selection`, `label`.
- **Events**: `tree-view-select`, `tree-view-open`, `tree-view-toggle`.
- **A11y**: `role="tree"` with roving focus; Space toggles selection, Enter opens/toggles; `aria-checked` reflects tri-state.
- **Custom properties**: `--uik-component-tree-view-item-*`, `--uik-component-tree-view-indent`, `--uik-component-tree-view-text-*`, `--uik-component-tree-view-toggle-fg`.

### `<uik-nav>`

- **Attributes/props**: `items` (array), `openIds` (string[]), `currentId`.
- **Slots**: none.
- **Parts**: `base`, `item`, `toggle`, `link`, `label`.
- **Events**: `nav-select`, `nav-toggle`.
- **A11y**: renders links inside a `<nav>` element with `aria-current="page"` for the active item.
- **Custom properties**: `--uik-component-nav-item-*`, `--uik-component-nav-indent`, `--uik-component-nav-text-*`, `--uik-component-nav-toggle-fg`.

### `<uik-nav-rail>`

- **Attributes/props**: `items` (array), `activeId`, `orientation` (`vertical | horizontal`).
- **Slots**: none.
- **Parts**: `base`, `item`, `item-button`, `item-indicator`, `item-icon`.
- **Events**: `nav-rail-select`.
- **A11y**: toolbar role with roving focus; Arrow/Home/End move focus; Enter/Space activate items.
- **Custom properties**: `--uik-component-nav-rail-bg`, `--uik-component-nav-rail-fg`, `--uik-component-nav-rail-width`, `--uik-component-nav-rail-gap`, `--uik-component-nav-rail-padding-y`, `--uik-component-nav-rail-item-size`, `--uik-component-nav-rail-item-indicator-bg`, `--uik-component-nav-rail-item-indicator-radius`, `--uik-component-nav-rail-item-indicator-width`, `--uik-component-nav-rail-icon-size`.

### `<uik-popover>`

- **Attributes/props**: `open`, `placement` (`bottom-start | bottom | bottom-end | top-start | top | top-end`), `popover` (`auto | manual | hint`).
- **Slots**: `trigger`, default slot for panel content.
- **Parts**: `control` (trigger wrapper), `base` (panel).
- **Events**: native events bubble from slotted trigger; panel listens for `toggle` when supported; `overlay-close` (`detail: {reason}`).
- **A11y**: forwards `aria-label`/`aria-labelledby`/`aria-describedby` to the panel.
- **Behavior**: uses the Popover API when available; falls back to a positioned panel in Shadow DOM.
- **Custom properties**: `--uik-component-popover-bg`, `--uik-component-popover-fg`, `--uik-component-popover-border`, `--uik-component-popover-radius`, `--uik-component-popover-padding-x`, `--uik-component-popover-padding-y`, `--uik-component-popover-shadow`, `--uik-component-popover-offset`.

### `<uik-progress>`

- **Attributes/props**: `value`, `max`, `indeterminate` (boolean).
- **Slots**: none.
- **Parts**: `base`.
- **A11y**: forwards `aria-label`/`aria-labelledby` to the internal `<progress>`.
- **Custom properties**: `--uik-component-progress-track-bg`, `--uik-component-progress-bar-bg`, `--uik-component-progress-height`, `--uik-component-progress-min-width`, `--uik-component-progress-radius`.

### `<uik-radio>`

- **Attributes/props**: `name`, `value`, `checked`, `disabled`, `required`, `invalid`.
- **Slots**: `label`, `hint`, `error`.
- **Parts**: `base`, `control`, `label`, `hint`, `error`.
- **Events**: native `change` bubbles from the internal `<input>`.
- **A11y**: label slot or `aria-label`; hint/error slots are announced via `aria-describedby`.
- **Forms**: form-associated; when inside `uik-radio-group`, the group manages the submitted value.
- **Custom properties**: `--uik-component-radio-accent`, `--uik-component-radio-size`.

### `<uik-radio-group>`

- **Attributes/props**: `name`, `value`, `orientation` (`vertical | horizontal`), `disabled`, `required`, `invalid`.
- **Slots**: `label`, `hint`, `error`, default slot for `<uik-radio>` children.
- **Parts**: `base`, `control`, `label`, `hint`, `error`.
- **Events**: native `change` bubbles from child radios.
- **A11y**: label slot wires to `aria-labelledby`; hint/error are announced via `aria-describedby`.
- **Keyboard**: arrow keys move selection within the group.
- **Forms**: form-associated via `ElementInternals`.
- **Custom properties**: `--uik-component-radio-group-gap`.

### `<uik-separator>`

- **Attributes/props**: `orientation` (`horizontal | vertical`).
- **Events**: none; presentational.
- **Styling hooks**: token-driven color, `part="base"`. Horizontal renders as `<hr>`, vertical as `role="separator"`.

### `<uik-resizable-panels>`

- **Attributes/props**: `orientation` (`horizontal | vertical`), `startSize`, `minStartSize`, `minEndSize`, `step`, `stepLarge` (px).
- **Slots**: `start`, `end`.
- **Parts**: `base`, `panel-start`, `panel-end`, `handle`, `handle-grip`.
- **Events**: `resizable-panels-resize` (`detail: {startSize, endSize, ratio, source, phase}`).
- **A11y**: handle uses `role="separator"` with keyboard resizing and `aria-valuenow`; label defaults to "Resize panels" unless `aria-label`/`aria-labelledby` is set.
- **Motion/contrast**: handle transitions use motion tokens; forced-colors uses system colors.
- **Custom properties**: `--uik-component-resizable-panels-panel-min-size`, `--uik-component-resizable-panels-panel-start-size`, `--uik-component-resizable-panels-handle-hit`, `--uik-component-resizable-panels-handle-size`, `--uik-component-resizable-panels-handle-bg`, `--uik-component-resizable-panels-handle-hover-bg`, `--uik-component-resizable-panels-handle-active-bg`, `--uik-component-resizable-panels-handle-radius`, `--uik-component-resizable-panels-step`, `--uik-component-resizable-panels-step-lg`.

### `<uik-select>`

- **Attributes/props**: `name`, `value`, `disabled`, `required`, `invalid`.
- **Slots**: `label`, `hint`, `error`, default slot for `<option>` elements.
- **Parts**: `base`, `control`, `label`, `hint`, `error`.
- **Events**: native `change` bubbles from the internal `<select>`.
- **A11y**: label slot or `aria-label`; hint/error slots are announced via `aria-describedby`.
- **Forms**: form-associated via `ElementInternals`.
- **Custom properties**: `--uik-component-select-base-*` (bg, border-default, border-hover, border-focus, fg, padding-x, padding-y, radius, shadow, font-size, line-height).

### `<uik-spinner>`

- **Attributes/props**: `size` (`sm | md | lg`), `tone` (`default | muted | primary | danger | success | warning | info`).
- **Slots**: none.
- **Parts**: `base`.
- **Motion**: animation stops when `prefers-reduced-motion: reduce`.
- **Custom properties**: `--uik-component-spinner-size-{sm|md|lg}`, `--uik-component-spinner-track`, `--uik-component-spinner-indicator-{default|muted|primary|danger|success|warning|info}`.

### `<uik-stack>`

- **Attributes/props**: `direction` (`vertical | horizontal`), `gap` (`1-6`), `align` (`start | center | end | stretch`), `justify` (`start | center | end | between`).
- **Slots**: default.
- **Parts**: `base`.
- **Custom properties**: `--uik-component-stack-gap-{1..6}`.

### `<uik-surface>`

- **Attributes/props**: `variant` (`base | muted | card | elevated | popover`), `bordered` (boolean).
- **Slots**: default.
- **Parts**: `base`.
- **Custom properties**: `--uik-component-surface-bg-{default|muted|card|elevated|popover}`, `--uik-component-surface-shadow-{default|card|elevated|popover}`, `--uik-component-surface-border-color-{default|bordered}`, `--uik-component-surface-border-width-{default|bordered}`, `--uik-component-surface-radius`.

### `<uik-switch>`

- **Attributes/props**: `name`, `value`, `checked`, `disabled`, `required`, `invalid`.
- **Slots**: `label`, `hint`, `error`.
- **Parts**: `base`, `control`, `track`, `thumb`, `label`, `hint`, `error`.
- **Events**: native `change` bubbles from the internal `<input>`.
- **A11y**: `role="switch"` plus label slot or `aria-label`.
- **Forms**: form-associated and participates in `FormData` when checked.
- **Custom properties**: `--uik-component-switch-height`, `--uik-component-switch-width`, `--uik-component-switch-padding`, `--uik-component-switch-thumb-size`, `--uik-component-switch-thumb-bg`, `--uik-component-switch-thumb-shadow`, `--uik-component-switch-track-bg-default`, `--uik-component-switch-track-bg-checked`, `--uik-component-switch-track-border-default`, `--uik-component-switch-track-border-checked`.

### `<uik-text>`

- **Attributes/props**: `as` (`span | p | div | label`), `size` (`sm | md | lg | xl`), `weight` (`regular | medium | semibold | bold`), `tone` (`default | muted | strong | danger | success | warning | info`), `truncate` (boolean).
- **Slots**: default.
- **Parts**: `base`.
- **Custom properties**: `--uik-component-text-size-{sm|md|lg|xl}`, `--uik-component-text-line-height-{sm|md|lg|xl}`, `--uik-component-text-weight-{regular|medium|semibold|bold}`, `--uik-component-text-color-{default|muted|strong|danger|success|warning|info}`.

### `<uik-textarea>`

- **Attributes/props**: `name`, `value`, `placeholder`, `rows`, `disabled`, `required`, `readonly`, `invalid`.
- **Slots**: `label`, `hint`, `error`.
- **Parts**: `base`, `control`, `label`, `hint`, `error`.
- **Events**: native `input` and `change` bubble from the internal `<textarea>`.
- **A11y**: label slot or `aria-label`; hint/error slots are announced via `aria-describedby`.
- **Forms**: form-associated via `ElementInternals`.
- **Custom properties**: `--uik-component-textarea-base-*` (bg, border-default, border-hover, border-focus, fg, placeholder, padding-x, padding-y, radius, shadow, font-size, line-height, min-height).

### `<uik-tooltip>`

- **Attributes/props**: `open`, `placement`, `popover` (defaults to `popover="hint"`).
- **Slots**: `trigger`, default slot for tooltip content.
- **Parts**: `control` (trigger wrapper), `base` (panel).
- **Events**: `overlay-close` (`detail: {reason}`).
- **A11y**: panel uses `role="tooltip"` and wires `aria-describedby` onto the trigger.
- **Custom properties**: `--uik-component-tooltip-bg`, `--uik-component-tooltip-fg`, `--uik-component-tooltip-radius`, `--uik-component-tooltip-padding-x`, `--uik-component-tooltip-padding-y`, `--uik-component-tooltip-shadow`, `--uik-component-tooltip-offset`.

### `<uik-visually-hidden>`

- **Attributes/props**: none.
- **Slots**: default.
- **Parts**: `base`.
- **A11y**: hides content visually while keeping it available to assistive tech.
