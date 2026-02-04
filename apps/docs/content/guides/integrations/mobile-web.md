# Mobile web

Ship UIK on mobile web by keeping bundles lean, loading tokens early, and respecting device constraints. Everything stays standards‑first and ESM‑based.

## Recommended path

Install the packages:

```bash
npm install @ismail-elkorchi/ui-tokens @ismail-elkorchi/ui-primitives @ismail-elkorchi/ui-patterns
```

Load tokens + register components in your entrypoint:

```ts
import "@ismail-elkorchi/ui-tokens/base.css";
import "@ismail-elkorchi/ui-tokens/themes/uik-theme-base.css";
import "@ismail-elkorchi/ui-tokens/themes/uik-light.css";
import "@ismail-elkorchi/ui-tokens/themes/uik-density-comfortable.css";

import "@ismail-elkorchi/ui-primitives/register";
import "@ismail-elkorchi/ui-patterns/register";
```

Set theme + density on the document root:

```html
<html data-uik-theme="light" data-uik-density="comfortable">
  <body>
    <uik-empty-state title="All set" description="You are ready to go."></uik-empty-state>
  </body>
</html>
```

## Example

```example-html
<uik-empty-state title="No items" description="Create your first entry.">
  <uik-button slot="actions">Create item</uik-button>
</uik-empty-state>
```

## Security + constraints

- Prefer a single module bundle with predictable loading order.
- Avoid blocking scripts; token CSS should load before render.
- Respect reduced‑motion preferences and avoid heavy animations on first paint.

## Troubleshooting

- **Styles missing:** confirm token CSS imports are included in your mobile build pipeline.
- **Layout feels dense:** adjust `data-uik-density` and verify density CSS is loaded.
- **Slow first paint:** defer non‑critical components and keep the initial route minimal.
