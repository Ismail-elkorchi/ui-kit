## Form primitives fixture

Use this page to capture a representative form surface in Lighthouse audits.

<div class="docs-lab-panel">
  <uik-stack gap="4">
    <uik-input value="Workspace">
      <span slot="label">Project name</span>
    </uik-input>
    <uik-radio-group value="daily">
      <span slot="label">Sync cadence</span>
      <uik-radio value="daily"><span slot="label">Daily</span></uik-radio>
      <uik-radio value="weekly"><span slot="label">Weekly</span></uik-radio>
      <uik-radio value="manual"><span slot="label">Manual</span></uik-radio>
    </uik-radio-group>
    <uik-switch>
      <span slot="label">Enable alerts</span>
    </uik-switch>
  </uik-stack>
</div>

## Action + feedback fixture

<div class="docs-lab-panel">
  <uik-stack gap="3">
    <uik-button variant="secondary">Save snapshot</uik-button>
    <uik-button variant="ghost">Discard changes</uik-button>
    <uik-progress value="32" max="100"></uik-progress>
    <uik-badge>Draft</uik-badge>
  </uik-stack>
</div>
