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

## Section card

```html
<uik-section-card>
  <uik-heading slot="title" level="2">Workspace settings</uik-heading>
  <uik-text as="p"
    >Control how your workspace handles permissions and access.</uik-text
  >
  <div slot="actions">
    <uik-button variant="secondary">Edit</uik-button>
    <uik-button variant="ghost">View policy</uik-button>
  </div>
</uik-section-card>
```

<div class="docs-lab-panel">
  <uik-section-card>
    <uik-heading slot="title" level="2">Workspace settings</uik-heading>
    <uik-text as="p">Control how your workspace handles permissions and access.</uik-text>
    <div slot="actions">
      <uik-button variant="secondary">Edit</uik-button>
      <uik-button variant="ghost">View policy</uik-button>
    </div>
  </uik-section-card>
</div>

## Page hero

```html
<uik-page-hero>
  <div slot="eyebrow">
    <uik-badge variant="secondary">Project</uik-badge>
    <uik-badge variant="outline">Design Ops</uik-badge>
  </div>
  <uik-heading slot="title" level="1">Design system overview</uik-heading>
  <uik-text slot="summary" as="p">
    Track adoption, review token drift, and share the latest components.
  </uik-text>
  <nav slot="links" aria-label="Primary actions">
    <a class="docs-hero-link" href="#">View roadmap</a>
    <a class="docs-hero-link" href="#">Open changelog</a>
  </nav>
  <div slot="panel">
    <uik-select>
      <span slot="label">Theme</span>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </uik-select>
    <uik-button variant="ghost" size="sm">Open controls</uik-button>
  </div>
</uik-page-hero>
```

<div class="docs-lab-panel">
  <uik-page-hero>
    <div slot="eyebrow" class="docs-hero-top">
      <uik-badge variant="secondary">Project</uik-badge>
      <uik-badge variant="outline">Design Ops</uik-badge>
    </div>
    <uik-heading slot="title" level="1">Design system overview</uik-heading>
    <uik-text slot="summary" as="p" class="docs-summary">
      Track adoption, review token drift, and share the latest components.
    </uik-text>
    <nav slot="links" class="docs-hero-links" aria-label="Primary actions">
      <a class="docs-hero-link" href="#">View roadmap</a>
      <a class="docs-hero-link" href="#">Open changelog</a>
    </nav>
    <div slot="panel">
      <div class="docs-hero-control-grid">
        <uik-select>
          <span slot="label">Theme</span>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </uik-select>
        <uik-select>
          <span slot="label">Density</span>
          <option value="comfortable">Comfortable</option>
          <option value="compact">Compact</option>
        </uik-select>
      </div>
      <div class="docs-hero-panel-actions">
        <uik-button variant="ghost" size="sm">Open controls</uik-button>
      </div>
    </div>
  </uik-page-hero>
</div>
