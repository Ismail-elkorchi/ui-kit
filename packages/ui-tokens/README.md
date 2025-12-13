# @ismail-elkorchi/ui-tokens

CSS-only design tokens. Load them before Tailwind so the variables are available to `@ismail-elkorchi/ui-primitives` and `@ismail-elkorchi/ui-shell`.

## Usage

```css
@import '@ismail-elkorchi/ui-tokens/index.css';
@import 'tailwindcss';
```

`index.css` forwards to `theme.css`, which defines Tailwind v4 `@layer base` variables plus a matching `@theme` block.

## Build & distribution

- `npm run build` copies `index.css` and `theme.css` into `dist/`.
- Exported entrypoints resolve to `dist/index.css` and `dist/theme.css`.
- Published output includes only `dist/` and this README; workspace CSS sources stay local.
