# Webviews

UIK works in webviews when you treat them as standards‑compliant web runtimes. Bundle ESM assets, load tokens first, and keep CSP and network constraints explicit.

## Recommended path

Install the UIK packages:

```bash
npm install @ismail-elkorchi/ui-tokens @ismail-elkorchi/ui-primitives @ismail-elkorchi/ui-patterns
```

Import tokens + register components in your webview entrypoint:

```ts
import "@ismail-elkorchi/ui-tokens/base.css";
import "@ismail-elkorchi/ui-tokens/themes/uik-theme-base.css";
import "@ismail-elkorchi/ui-tokens/themes/uik-dark.css";
import "@ismail-elkorchi/ui-tokens/themes/uik-density-compact.css";

import "@ismail-elkorchi/ui-primitives/register";
import "@ismail-elkorchi/ui-patterns/register";
```

Root attributes control theme + density:

```html
<html data-uik-theme="dark" data-uik-density="compact">
  <body>
    <uik-section-card>
      <uik-heading level="2">Webview panel</uik-heading>
      <uik-text>Compact density keeps layouts tight.</uik-text>
    </uik-section-card>
  </body>
</html>
```

## Example

```example-html
<uik-section-card>
  <uik-stack gap="2">
    <uik-heading level="3">Account</uik-heading>
    <uik-text>Manage access in a constrained webview.</uik-text>
    <uik-button>Review access</uik-button>
  </uik-stack>
</uik-section-card>
```

## Security + constraints

- Keep CSP explicit: allow `style-src` for token CSS and `script-src` for your module bundle.
- Avoid inline scripts; rely on a single bundled `type="module"` entry.
- Some embedded webviews throttle timers; keep UI initialization synchronous and minimal.

## Troubleshooting

- **Blank UI:** confirm the webview allows ES modules and that the bundle is loaded with `type="module"`.
- **No styling:** ensure token CSS and theme layers load before UI components render.
- **Missing components:** verify `@ismail-elkorchi/ui-primitives/register` runs once before rendering.
