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
import '@ismail-elkorchi/ui-primitives/button';
import '@ismail-elkorchi/ui-primitives/badge';
import '@ismail-elkorchi/ui-primitives/input';
import '@ismail-elkorchi/ui-primitives/separator';
```

Ensure your app imports tokens before Tailwind so the theme variables exist:

```css
@import '@ismail-elkorchi/ui-tokens/index.css';
@import 'tailwindcss';
```

## Parts (consistent strategy)

- `uik-button`: `part="base"` on the internal `<button>`.
- `uik-badge`: `part="base"` on the internal `<div>`.
- `uik-input`: `part="base"` on the internal `<input>`.
- `uik-separator`: `part="base"` on the internal `<div>` line.

## Components and contracts

### `<uik-button>`

- **Attributes/props**: `variant` (`default | destructive | outline | secondary | ghost | link`), `size` (`default | sm | lg | icon`), `type` (`button | submit | reset` - defaults to `button`), `active` (boolean), `muted` (boolean), `disabled` (boolean).
- **Events**: native button events (`click`, focus/blur) bubble from the internal button; disabled buttons swallow click.
- **Styling hooks**:
  - Sizing is enforced on the `:host`. The internal button fills the host (100% width/height).
  - `active`/`muted` props control stateful colors (especially for ghost variant).
  - `part="base"` allows overrides, but avoid fighting the host sizing.

### `<uik-badge>`

- **Attributes/props**: `variant` (`default | secondary | destructive | outline`).
- **Events**: none special; behaves like an inline element.
- **Styling hooks**: token-driven colors and `part="base"`.

### `<uik-input>` (event strategy)

- **Attributes/props**: `type`, `placeholder`, `value`, `disabled`, `label` (required for a11y, sets `aria-label`).
- **Events**: re-dispatches `input` and `change` as `CustomEvent`s with `detail: { value, originalEvent }`, `bubbles: true`, `composed: true`. The internal native event is stopped to avoid duplicate handlers; listen on the custom element for `input`/`change`.
- **Styling hooks**: token-driven colors, `part="base"`. The `value` property stays in sync with user input.

### `<uik-separator>`

- **Attributes/props**: `orientation` (`horizontal | vertical`).
- **Events**: none; presentational.
- **Styling hooks**: token-driven color, `part="base"`.
