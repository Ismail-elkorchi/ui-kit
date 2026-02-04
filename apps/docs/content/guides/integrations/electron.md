# Electron

Use UIK in Electron by bundling standard ESM assets and loading token CSS at startup. Keep the renderer web‑standards first and treat Electron as the host shell.

## Recommended path

Install the packages you need:

```bash
npm install @ismail-elkorchi/ui-tokens @ismail-elkorchi/ui-primitives @ismail-elkorchi/ui-patterns @ismail-elkorchi/ui-shell
```

Register components and load tokens in your renderer entrypoint:

```ts
import "@ismail-elkorchi/ui-tokens/base.css";
import "@ismail-elkorchi/ui-tokens/themes/uik-theme-base.css";
import "@ismail-elkorchi/ui-tokens/themes/uik-light.css";
import "@ismail-elkorchi/ui-tokens/themes/uik-density-comfortable.css";

import "@ismail-elkorchi/ui-primitives/register";
import "@ismail-elkorchi/ui-patterns/register";
import "@ismail-elkorchi/ui-shell/register";
```

Set theme + density on the root element:

```html
<html data-uik-theme="light" data-uik-density="comfortable">
  <body>
    <uik-shell-layout>
      <main slot="content">
        <uik-page-hero title="Welcome"></uik-page-hero>
      </main>
    </uik-shell-layout>
  </body>
</html>
```

## Example

```example-html
<uik-surface>
  <uik-stack gap="2">
    <uik-heading level="2">Electron shell</uik-heading>
    <uik-text>UIK components are standard custom elements.</uik-text>
    <uik-button>Launch</uik-button>
  </uik-stack>
</uik-surface>
```

## Security + constraints

- Keep renderer code standards‑first; avoid enabling Node.js APIs in the renderer.
- Use a preload bridge for host APIs instead of exposing Node globals.
- Keep CSP strict: allow `style-src` for token CSS and `script-src` for module bundles only.

## Troubleshooting

- **Styles missing:** ensure `@ismail-elkorchi/ui-tokens/base.css` and theme layers load before components render.
- **Components not defined:** confirm `@ismail-elkorchi/ui-primitives/register` (and patterns/shell as needed) runs once in the renderer entry.
- **Theme not applied:** verify `data-uik-theme` and `data-uik-density` are set on the document root.
