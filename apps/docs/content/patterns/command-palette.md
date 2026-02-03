# Command palette

Offer keyboard-first navigation with the command palette pattern. The command
palette uses the `uik-command-palette` primitive wired through the shell command
center.

## Trigger and instructions

```example-html
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
```

## Keyboard shortcuts

```example-html
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
```
