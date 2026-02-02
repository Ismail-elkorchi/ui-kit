# Examples

Use these production-ready examples as starting points. Each example pairs a live preview with a copyable snippet.

## Buttons and inputs

```example-html
<uik-stack direction="horizontal" gap="2" align="center">
  <uik-button variant="solid">Create</uik-button>
  <uik-input
    placeholder="Workspace name"
    aria-label="Workspace name"
  ></uik-input>
</uik-stack>
```

## Dialog

```example-html
<uik-dialog open>
  <span slot="title">Invite team</span>
  <span slot="description">Share the link below with your teammates.</span>
  <uik-input placeholder="team@uik.dev" aria-label="Invitee email"></uik-input>
  <uik-stack slot="actions" direction="horizontal" gap="2" justify="end">
    <uik-button variant="secondary">Cancel</uik-button>
    <uik-button>Send invite</uik-button>
  </uik-stack>
</uik-dialog>
```

## Tooltip

```example-html
<uik-tooltip open>
  <uik-button slot="trigger" variant="secondary">Hover me</uik-button>
  Helpful tooltip text.
</uik-tooltip>
```
