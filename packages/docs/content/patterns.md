## UI patterns

UI patterns are composed UIK elements built from primitives and tokens. They bundle common layouts and flows into ready-to-use Custom Elements with clear slots, parts, and token-backed theming.

## Register patterns

Load tokens and register primitives before registering patterns.

```ts
import "@ismail-elkorchi/ui-tokens/index.css";
import "@ismail-elkorchi/ui-primitives/register";
import "@ismail-elkorchi/ui-patterns/register";
```

```html
<html data-uik-theme="dark" data-uik-density="comfortable"></html>
```

## Empty state

```html
<uik-empty-state>
  <span slot="title">No data yet</span>
  <span slot="description">Create your first record to get started.</span>
  <div slot="actions">
    <uik-button variant="solid">Create record</uik-button>
    <uik-button variant="outline">Learn more</uik-button>
  </div>
</uik-empty-state>
```

<div class="docs-lab-panel">
  <uik-empty-state>
    <span slot="title">No data yet</span>
    <span slot="description">Create your first record to get started.</span>
    <div slot="actions">
      <uik-button variant="solid">Create record</uik-button>
      <uik-button variant="outline">Learn more</uik-button>
    </div>
  </uik-empty-state>
</div>
