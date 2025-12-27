# UI Tokens

Design tokens for UIK with W3C DTCG JSON sources, CSS custom properties, and a Tailwind v4 bridge.

## What this package provides

- Resolved JSON outputs for light/dark + density contexts (built from DTCG token sources in the repo).
- CSS custom properties under the `--uik-` prefix.
- Tailwind v4 theme mappings (strict + compat) for utility classes.
- A tiny JS/TS runtime for programmatic access.

## Installation

```bash
npm install @ismail-elkorchi/ui-tokens
```

## Outputs (what to import)

CSS entrypoints:

- `@ismail-elkorchi/ui-tokens/index.css` (base CSS + strict Tailwind theme mapping)
- `@ismail-elkorchi/ui-tokens/base.css` (CSS variables + theme/density layers)
- `@ismail-elkorchi/ui-tokens/uik-tailwind.strict.css`
- `@ismail-elkorchi/ui-tokens/uik-tailwind.compat.css`
- `@ismail-elkorchi/ui-tokens/themes/uik-theme-base.css`
- `@ismail-elkorchi/ui-tokens/themes/uik-light.css`
- `@ismail-elkorchi/ui-tokens/themes/uik-dark.css`
- `@ismail-elkorchi/ui-tokens/themes/uik-density-comfortable.css`
- `@ismail-elkorchi/ui-tokens/themes/uik-density-compact.css`

Resolved JSON outputs:

- `@ismail-elkorchi/ui-tokens/tokens.resolved.light.comfortable.json`
- `@ismail-elkorchi/ui-tokens/tokens.resolved.light.compact.json`
- `@ismail-elkorchi/ui-tokens/tokens.resolved.dark.comfortable.json`
- `@ismail-elkorchi/ui-tokens/tokens.resolved.dark.compact.json`

JS/TS entrypoint:

- `@ismail-elkorchi/ui-tokens` (ESM, with types)

## Non-Tailwind usage

Quick start:

```css
@import "@ismail-elkorchi/ui-tokens/index.css";
```

Explicit control (theme + density):

```css
@import "@ismail-elkorchi/ui-tokens/base.css";
@import "@ismail-elkorchi/ui-tokens/themes/uik-light.css";
@import "@ismail-elkorchi/ui-tokens/themes/uik-density-comfortable.css";
```

Set attributes on a root element to switch variants:

```html
<html data-uik-theme="dark" data-uik-density="compact"></html>
```

Defaults are light + comfortable when attributes are not present.

## Tailwind v4 usage

Strict vs compat:

- `uik-tailwind.strict.css` resets Tailwind theme variables first and then re-declares UIK tokens.
- `uik-tailwind.compat.css` only adds UIK tokens without resets.

Strict example:

```css
@import "tailwindcss";
@import "@ismail-elkorchi/ui-tokens/index.css";
```

Compat example:

```css
@import "tailwindcss";
@import "@ismail-elkorchi/ui-tokens/base.css";
@import "@ismail-elkorchi/ui-tokens/uik-tailwind.compat.css";
```

Example utilities:

```html
<div
  class="bg-uik-surface-bg text-uik-text-default border-uik-border-default rounded-uik-3 shadow-uik-2 ring-uik-focus-ring-default"
>
  ...
</div>
```

## Programmatic usage (JS/TS)

```js
import {
  THEME_ATTRIBUTE,
  DENSITY_ATTRIBUTE,
  BREAKPOINT_ATTRIBUTE,
  setTheme,
  setDensity,
  getCssVarName,
  createBreakpointObserver,
} from "@ismail-elkorchi/ui-tokens";

const cssVar = getCssVarName("color.accent.1");

setTheme(document.documentElement, "dark");
setDensity(document.documentElement, "compact");

document.documentElement.setAttribute(THEME_ATTRIBUTE, "dark");
document.documentElement.setAttribute(DENSITY_ATTRIBUTE, "compact");

createBreakpointObserver();
document.documentElement.setAttribute(BREAKPOINT_ATTRIBUTE, "md");
```

## Guarantees

- All CSS custom properties are prefixed with `--uik-`.
- Tailwind utilities are derived from tokens; no hard-coded design values.
- Validation gates cover build output presence and Tailwind parsing.
