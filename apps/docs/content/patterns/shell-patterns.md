# Shell patterns

Use shell controls to manage layout state and status messaging.

## Status bar controls

```example-html
<uik-stack gap="3">
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
</uik-stack>
```

## Secondary sidebar toggle

```example-html
<uik-switch data-docs-control="secondary-toggle">
  <span slot="label">Secondary sidebar</span>
</uik-switch>
```
