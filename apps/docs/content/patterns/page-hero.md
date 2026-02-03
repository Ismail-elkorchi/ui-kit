# Page hero

Page heroes introduce the page context and optional controls without leaving the
primary content flow.

## Hero with controls

```example-html
<uik-page-hero>
  <uik-stack slot="eyebrow" direction="horizontal" gap="2" align="center">
    <uik-badge variant="secondary">Project</uik-badge>
    <uik-badge variant="outline">Design Ops</uik-badge>
  </uik-stack>
  <uik-heading slot="title" level="1">Design system overview</uik-heading>
  <uik-text slot="summary" as="p">
    Track adoption, review token drift, and share the latest components.
  </uik-text>
  <uik-stack slot="links" direction="horizontal" gap="2" align="center">
    <uik-link href="#">View roadmap</uik-link>
    <uik-link href="#">Open changelog</uik-link>
  </uik-stack>
  <uik-stack slot="panel" gap="3">
    <uik-stack direction="horizontal" gap="2" align="center">
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
    </uik-stack>
    <uik-button variant="ghost" size="sm">Open controls</uik-button>
  </uik-stack>
</uik-page-hero>
```

## Hero without panel

```example-html
<uik-page-hero>
  <uik-stack slot="eyebrow" direction="horizontal" gap="2" align="center">
    <uik-badge variant="secondary">Release</uik-badge>
    <uik-badge variant="outline">v1.2</uik-badge>
  </uik-stack>
  <uik-heading slot="title" level="1">Quarterly product review</uik-heading>
  <uik-text slot="summary" as="p">
    Summarize wins, blockers, and the next set of milestones.
  </uik-text>
  <uik-stack slot="links" direction="horizontal" gap="2" align="center">
    <uik-link href="#">Download report</uik-link>
    <uik-link href="#">Share update</uik-link>
  </uik-stack>
</uik-page-hero>
```
