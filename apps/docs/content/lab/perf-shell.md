## Shell layout fixture

This route provides a stable shell layout snapshot for Lighthouse audits.

<div class="docs-lab-panel">
  <uik-stack gap="3">
    <uik-text as="p">Workspace overview</uik-text>
    <uik-stack gap="2">
      <uik-text as="p" size="sm" tone="muted">Active space</uik-text>
      <uik-text as="p">Docs</uik-text>
      <uik-text as="p" size="sm" tone="muted">Workspace</uik-text>
      <uik-text as="p">UIK Lab</uik-text>
      <uik-stack direction="horizontal" gap="2" align="center">
        <uik-text as="p" size="sm" tone="muted">Sync status</uik-text>
        <uik-badge>Online</uik-badge>
      </uik-stack>
    </uik-stack>
  </uik-stack>
</div>

## Status snapshot

<div class="docs-lab-panel">
  <uik-stack gap="3">
    <uik-text as="p">Background tasks</uik-text>
    <uik-progress value="68" max="100"></uik-progress>
    <uik-text as="p" size="sm" tone="muted">Indexing tokens and rebuilding contracts.</uik-text>
    <uik-button variant="secondary" size="sm">View log</uik-button>
  </uik-stack>
</div>
