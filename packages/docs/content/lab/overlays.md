## Dialog

Open a modal dialog and validate keyboard dismissal and focus handling.

<div class="docs-lab-panel">
  <uik-button variant="solid" data-docs-action="dialog-open">Open dialog</uik-button>
  <uik-dialog data-docs-dialog>
    <span slot="title">Docs dialog</span>
    <span slot="description">A modal dialog using native semantics.</span>
    <uik-text as="p" class="docs-paragraph">Use this space for confirmation or structured content.</uik-text>
    <uik-button slot="actions" variant="outline" data-docs-action="dialog-close">Close</uik-button>
  </uik-dialog>
</div>

## Popover and tooltip

Popover uses the native Popover API when available. Tooltip provides a hint affordance.

<div class="docs-lab-panel">
  <uik-popover placement="bottom-start" popover="auto">
    <uik-button slot="trigger" variant="secondary">Toggle popover</uik-button>
    <div class="docs-popover-panel">
      <uik-text as="p">Popover content with a short explanation.</uik-text>
    </div>
  </uik-popover>
  <uik-tooltip placement="top">
    <uik-button slot="trigger" variant="ghost">Hover for tooltip</uik-button>
    <uik-text as="p">Tooltip content.</uik-text>
  </uik-tooltip>
</div>

## Progress

Track background work with determinate or indeterminate progress.

<div class="docs-lab-panel">
  <uik-progress data-docs-progress value="42" max="100"></uik-progress>
  <uik-button variant="ghost" data-docs-action="progress-toggle">Toggle indeterminate</uik-button>
</div>
