# @ismail-elkorchi/ui-primitives

Shadow DOM web components backed by the shared token CSS variables from `@ismail-elkorchi/ui-tokens`. They ship no Tailwind and assume tokens are loaded on `:root`.

## Build & distribution

- `npm run build` emits ESM + `.d.ts` files into `dist/`.
- Exported subpaths map directly to files: `dist/index.js`, `dist/register.js`, `dist/uik-button.js`, `dist/uik-badge.js`, `dist/uik-input.js`, `dist/uik-separator.js`.
- Published artifacts include only `dist/` and this README; TypeScript sources stay in the workspace.

## Usage

```ts
import '@ismail-elkorchi/ui-primitives/register'; // defines all elements
// or import individual components for tree-shaking:
import '@ismail-elkorchi/ui-primitives/uik-button';
import '@ismail-elkorchi/ui-primitives/uik-badge';
import '@ismail-elkorchi/ui-primitives/uik-input';
import '@ismail-elkorchi/ui-primitives/uik-separator';
```

Ensure your app imports tokens before Tailwind so the theme variables exist:

```css
@import '@ismail-elkorchi/ui-tokens/index.css';
@import 'tailwindcss';
```

## Parts (consistent strategy)

- `uik-button`: `part="base"` on the internal `<button>`.
- `uik-badge`: `part="base"` on the internal `<div>`.
- `uik-input`: `part="base"` on the internal `<input>`, `part="control"` wrapper, plus `part="label"`, `part="hint"`, `part="error"` when slotted.
- `uik-separator`: `part="base"` on the rendered line (`<hr>` or `<div>`).

## Components and contracts

### `<uik-button>`

- **Attributes/props**: `variant` (`default | destructive | outline | secondary | ghost | link`), `size` (`default | sm | lg | icon`), `type` (`button | submit | reset` - defaults to `button`), `active` (boolean), `muted` (boolean), `disabled` (boolean).
- **Events**: native button events (`click`, focus/blur) bubble from the internal button; disabled buttons swallow click.
- **Styling hooks**:
  - Sizing is enforced on the `:host`. The internal button fills the host (100% width/height).
  - `active`/`muted` props control stateful colors (especially for ghost variant).
  - `part="base"` allows overrides, but avoid fighting the host sizing.
- **A11y**: `aria-label`/`aria-labelledby` are forwarded to the internal `<button>` for icon-only buttons.
- **Forms**: `type="submit"` and `type="reset"` invoke `form.requestSubmit()`/`form.reset()` when inside a form.

### `<uik-badge>`

- **Attributes/props**: `variant` (`default | secondary | destructive | outline`).
- **Events**: none special; behaves like an inline element.
- **Styling hooks**: token-driven colors and `part="base"`.

### `<uik-input>`

- **Attributes/props**: `type`, `name`, `value`, `placeholder`, `disabled`, `required`, `readonly`, `invalid`, `autocomplete`, `inputmode`, `enterkeyhint`. Optional `aria-label`/`aria-labelledby` are forwarded when no label slot is provided.
- **Slots**: `label`, `hint`, `error`.
- **Events**: native `input` and `change` bubble from the internal `<input>` (no re-dispatch).
- **A11y**: label slot associates via `for`, hint/error slot text is wired to `aria-describedby`, and `aria-invalid` is set when `invalid` or an error slot is present.
- **Forms**: form-associated via `ElementInternals` and participates in `FormData` when `name` is set.

### `<uik-separator>`

- **Attributes/props**: `orientation` (`horizontal | vertical`).
- **Events**: none; presentational.
- **Styling hooks**: token-driven color, `part="base"`. Horizontal renders as `<hr>`, vertical as `role="separator"`.
