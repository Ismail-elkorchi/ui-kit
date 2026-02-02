## Status bar controls

Update the status bar message and tone using form-associated primitives.

<div class="docs-lab-panel">
  <uik-input data-docs-control="status-message" value="Ready">
    <span slot="label">Status message</span>
  </uik-input>
  <uik-radio-group data-docs-control="status-tone" value="info">
    <span slot="label">Status tone</span>
    <uik-radio value="info"><span slot="label">Info</span></uik-radio>
    <uik-radio value="success"><span slot="label">Success</span></uik-radio>
    <uik-radio value="danger"><span slot="label">Danger</span></uik-radio>
    <uik-radio value="muted"><span slot="label">Muted</span></uik-radio>
  </uik-radio-group>
</div>

## Secondary sidebar toggle

Toggle the secondary sidebar to test layout changes and focus behavior.

<div class="docs-lab-panel">
  <uik-switch data-docs-control="secondary-toggle">
    <span slot="label">Secondary sidebar</span>
  </uik-switch>
</div>
