# Edge adapters policy

UI Kit ships standards-first custom elements and tokens. We do **not** ship
framework adapters or wrapper layers.

## Policy: no framework adapters

- Core UIK packages must remain framework-agnostic and ESM-first.
- No React/Vue/Svelte adapters or wrapper layers live in this repo.
- Integrations are documented as standards-first ESM + custom elements.

## Supported integration path

Use ESM imports, token CSS layers, and component registration. This is the
canonical path across all hosts.

```js
import "@ismail-elkorchi/ui-tokens/base.css";
import "@ismail-elkorchi/ui-tokens/themes/uik-theme-base.css";
import "@ismail-elkorchi/ui-tokens/themes/uik-light.css";
import "@ismail-elkorchi/ui-tokens/themes/uik-density-comfortable.css";
import "@ismail-elkorchi/ui-primitives/register";
import "@ismail-elkorchi/ui-patterns/register";
```

## Optional modules boundary

Optional modules that introduce framework coupling are **not allowed** in core
packages. If an experiment is ever needed, it must live outside core and still
follow standards-first exports; this policy is strict until `1.0.0`.

## Pre-stable rules (strict)

- Breaking changes are expected.
- Compatibility layers, migrations, and deprecation scaffolding are prohibited.

## Troubleshooting

- **Missing components:** verify `@ismail-elkorchi/ui-primitives/register` runs
  once before rendering.
- **Styles missing:** ensure `@ismail-elkorchi/ui-tokens/base.css` and theme
  layers load before components render.
