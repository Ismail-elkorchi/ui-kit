## Page hero

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
