# Section card

Section cards group related settings with a clear title and aligned actions.

## Settings block

```example-html
<uik-section-card>
  <uik-heading slot="title" level="2">Workspace settings</uik-heading>
  <uik-text as="p">Control how your workspace handles permissions and access.</uik-text>
  <uik-text as="p" tone="muted">Changes apply immediately to active sessions.</uik-text>
  <div slot="actions">
    <uik-button variant="secondary">Edit</uik-button>
    <uik-button variant="ghost">View policy</uik-button>
  </div>
</uik-section-card>
```

## Compact stack

```example-html
<uik-section-card>
  <uik-heading slot="title" level="2">Notification defaults</uik-heading>
  <uik-text as="p">Choose how your team is notified about updates.</uik-text>
  <div slot="actions">
    <uik-button variant="secondary">Configure</uik-button>
  </div>
</uik-section-card>
```
