# Overlays and feedback

Use dialogs, popovers, and progress indicators to keep people oriented while
tasks complete.

## Dialog

```example-html
<uik-stack gap="3">
  <uik-button variant="solid" data-docs-action="dialog-open">Open dialog</uik-button>
  <uik-dialog data-docs-dialog>
    <span slot="title">Docs dialog</span>
    <span slot="description">A modal dialog using native semantics.</span>
    <uik-text as="p">
      Use this space for confirmation or structured content.
    </uik-text>
    <uik-button slot="actions" variant="outline" data-docs-action="dialog-close">
      Close
    </uik-button>
  </uik-dialog>
</uik-stack>
```

## Popover and tooltip

```example-html
<uik-stack direction="horizontal" gap="3" align="center">
  <uik-popover placement="bottom-start" popover="auto">
    <uik-button slot="trigger" variant="secondary">Toggle popover</uik-button>
    <uik-text as="p">Popover content with a short explanation.</uik-text>
  </uik-popover>
  <uik-tooltip placement="top">
    <uik-button slot="trigger" variant="ghost">Hover for tooltip</uik-button>
    <uik-text as="p">Tooltip content.</uik-text>
  </uik-tooltip>
</uik-stack>
```

## Progress

```example-html
<uik-stack gap="3">
  <uik-progress data-docs-progress value="42" max="100"></uik-progress>
  <uik-button variant="ghost" data-docs-action="progress-toggle">
    Toggle indeterminate
  </uik-button>
</uik-stack>
```
