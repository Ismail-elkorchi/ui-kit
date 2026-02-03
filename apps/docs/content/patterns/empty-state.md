# Empty state

Empty states should acknowledge missing content and guide the next best action.

## Primary empty state

```example-html
<uik-empty-state>
  <span slot="title">Nothing here yet</span>
  <span slot="description">Add your first item to see activity.</span>
  <div slot="actions">
    <uik-button variant="solid">Add item</uik-button>
    <uik-button variant="ghost">Browse templates</uik-button>
  </div>
  <uik-text as="p" tone="muted">Tip: import data from CSV or connect an API.</uik-text>
</uik-empty-state>
```

## Secondary guidance

```example-html
<uik-empty-state>
  <span slot="title">No alerts configured</span>
  <span slot="description">Create a rule to watch for unusual activity.</span>
  <div slot="actions">
    <uik-button variant="solid">Create alert</uik-button>
    <uik-button variant="ghost">View docs</uik-button>
  </div>
</uik-empty-state>
```
