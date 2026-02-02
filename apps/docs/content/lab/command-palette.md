## Command palette

Open the command palette to jump between docs and lab pages without leaving the keyboard.

This demo uses the `uik-command-palette` primitive wired through the ui-shell command center.

<div class="docs-lab-panel">
  <uik-stack gap="3">
    <uik-button
      variant="secondary"
      data-docs-action="command-palette-open"
      aria-haspopup="dialog"
      aria-expanded="false"
    >
      Open command palette
    </uik-button>
    <uik-text as="p" size="sm" tone="muted">
      Start typing to filter results. Use Up/Down to move and Enter to select.
    </uik-text>
  </uik-stack>
</div>

## Keyboard shortcuts

<div class="docs-lab-panel">
  <uik-description-list>
    <dt>Open</dt>
    <dd>Ctrl+K (Windows/Linux) or Cmd+K (macOS)</dd>
    <dt>Navigate results</dt>
    <dd>Up/Down arrows</dd>
    <dt>Select</dt>
    <dd>Enter</dd>
    <dt>Close</dt>
    <dd>Escape</dd>
  </uik-description-list>
</div>
