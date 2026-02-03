# Command palette workflow

Give teams a fast, keyboard-first way to reach navigation and actions.

## Trigger and guidance

```example-html
<uik-section-card>
  <uik-heading slot="title" level="2">Command palette</uik-heading>
  <uik-text as="p">
    Open the palette to search actions, jump to sections, or run workflows.
  </uik-text>
  <uik-stack gap="2">
    <uik-button
      variant="secondary"
      data-docs-action="command-palette-open"
      aria-haspopup="dialog"
      aria-expanded="false"
    >
      Open command palette
    </uik-button>
    <uik-text as="p" size="sm" tone="muted">
      Use Cmd+K (macOS) or Ctrl+K (Windows/Linux) to open. Type to filter.
    </uik-text>
  </uik-stack>
</uik-section-card>
```

## Keyboard shortcuts

```example-html
<uik-description-list>
  <dt>Open palette</dt>
  <dd>Cmd+K (macOS) / Ctrl+K (Windows/Linux)</dd>
  <dt>Navigate results</dt>
  <dd>Up/Down arrows</dd>
  <dt>Run command</dt>
  <dd>Enter</dd>
  <dt>Close</dt>
  <dd>Escape</dd>
</uik-description-list>
```
