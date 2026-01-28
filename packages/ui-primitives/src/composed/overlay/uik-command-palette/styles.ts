import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  dialog {
    box-sizing: border-box;
    width: 100%;
    max-width: var(--uik-component-command-palette-width);
    padding: var(--uik-space-0);
    margin: auto;
    color: oklch(var(--uik-component-command-palette-fg));
    background-color: transparent;
    border: none;
  }

  dialog::backdrop {
    background-color: oklch(
      var(--uik-component-command-palette-scrim-color) /
        var(--uik-component-command-palette-scrim-opacity)
    );
  }

  .panel {
    display: grid;
    gap: var(--uik-space-3);
    padding: var(--uik-component-command-palette-padding);
    color: oklch(var(--uik-component-command-palette-fg));
    background-color: oklch(var(--uik-component-command-palette-bg));
    border: var(--uik-border-width-1) solid
      oklch(var(--uik-component-command-palette-border));
    border-radius: var(--uik-component-command-palette-radius);
    box-shadow: var(--uik-component-command-palette-shadow);
  }

  .header {
    display: grid;
    gap: var(--uik-component-command-palette-header-gap);
  }

  .title {
    margin: var(--uik-space-0);
    font-size: var(--uik-typography-font-size-4);
    font-weight: var(--uik-typography-font-weight-semibold);
    line-height: var(--uik-typography-line-height-4);
    color: oklch(var(--uik-text-strong));
  }

  .description {
    font-size: var(--uik-typography-font-size-2);
    line-height: var(--uik-typography-line-height-3);
    color: oklch(var(--uik-text-muted));
  }

  .label {
    font-size: var(--uik-typography-font-size-1);
    font-weight: var(--uik-typography-font-weight-medium);
    color: oklch(var(--uik-text-strong));
  }

  .input {
    box-sizing: border-box;
    width: 100%;
    height: var(--uik-component-command-palette-input-height);
    padding: var(--uik-component-command-palette-input-padding-y)
      var(--uik-component-command-palette-input-padding-x);
    font-size: var(--uik-component-command-palette-input-font-size);
    font-weight: var(--uik-component-command-palette-input-font-weight);
    line-height: var(--uik-component-command-palette-input-line-height);
    color: oklch(var(--uik-component-command-palette-input-fg));
    background-color: oklch(var(--uik-component-command-palette-input-bg));
    border: var(--uik-component-command-palette-input-border-width) solid
      oklch(var(--uik-component-command-palette-input-border-default));
    border-radius: var(--uik-component-command-palette-input-radius);
    box-shadow: var(--uik-component-command-palette-input-shadow);
    transition:
      border-color var(--uik-motion-transition-colors),
      box-shadow var(--uik-motion-transition-shadow),
      background-color var(--uik-motion-transition-colors),
      color var(--uik-motion-transition-colors);
  }

  .input::placeholder {
    color: oklch(var(--uik-component-command-palette-input-placeholder));
  }

  .input::selection {
    color: oklch(var(--uik-component-command-palette-input-selection-fg));
    background-color: oklch(
      var(--uik-component-command-palette-input-selection-bg)
    );
  }

  .input:hover:not(:disabled) {
    border-color: oklch(
      var(--uik-component-command-palette-input-border-hover)
    );
  }

  .input:focus-visible {
    outline: none;
    border-color: oklch(
      var(--uik-component-command-palette-input-border-focus)
    );
    box-shadow:
      var(--uik-component-command-palette-input-shadow),
      0 0 0 var(--uik-component-command-palette-input-focus-ring-offset)
        oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0
        calc(
          var(--uik-component-command-palette-input-focus-ring-offset) +
            var(--uik-component-command-palette-input-focus-ring-width)
        )
        oklch(
          var(--uik-component-command-palette-input-focus-ring) /
            var(--uik-component-command-palette-input-focus-ring-opacity)
        );
  }

  .input:disabled {
    cursor: not-allowed;
    opacity: var(--uik-component-command-palette-input-disabled-opacity);
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: var(--uik-component-command-palette-list-gap);
    max-height: var(--uik-component-command-palette-list-max-height);
    padding: var(--uik-component-command-palette-list-padding);
    overflow-y: auto;
    color: oklch(var(--uik-component-command-palette-list-fg));
    background-color: oklch(var(--uik-component-command-palette-list-bg));
    border: var(--uik-component-command-palette-list-border-width) solid
      oklch(var(--uik-component-command-palette-list-border));
    border-radius: var(--uik-component-command-palette-list-radius);
    box-shadow: var(--uik-component-command-palette-list-shadow);
  }

  .group {
    display: flex;
    flex-direction: column;
    gap: var(--uik-space-1);
  }

  .group-label {
    font-size: var(--uik-component-command-palette-group-label-font-size);
    font-weight: var(--uik-component-command-palette-group-label-font-weight);
    color: oklch(var(--uik-component-command-palette-group-label-fg));
    text-transform: uppercase;
    letter-spacing: var(
      --uik-component-command-palette-group-label-letter-spacing
    );
  }

  .item {
    display: flex;
    gap: var(--uik-space-2);
    align-items: center;
    justify-content: space-between;
    min-height: var(--uik-component-command-palette-item-height);
    padding: var(--uik-component-command-palette-item-padding-y)
      var(--uik-component-command-palette-item-padding-x);
    color: oklch(var(--uik-component-command-palette-item-fg));
    cursor: pointer;
    background-color: oklch(var(--uik-component-command-palette-item-bg));
    border-radius: var(--uik-component-command-palette-item-radius);
  }

  .item:hover {
    background-color: oklch(var(--uik-component-command-palette-item-hover-bg));
  }

  .item:active {
    background-color: oklch(
      var(--uik-component-command-palette-item-active-bg)
    );
  }

  .item[data-active="true"] {
    color: oklch(var(--uik-component-command-palette-item-selected-fg));
    background-color: oklch(
      var(--uik-component-command-palette-item-selected-bg)
    );
  }

  .item[data-disabled="true"] {
    color: oklch(var(--uik-component-command-palette-item-disabled-fg));
    cursor: not-allowed;
  }

  .item[data-disabled="true"]:hover {
    background-color: oklch(var(--uik-component-command-palette-item-bg));
  }

  .item[data-disabled="true"]:active {
    background-color: oklch(var(--uik-component-command-palette-item-bg));
  }

  .item-content {
    display: grid;
    gap: var(--uik-space-1);
  }

  .item-description {
    font-size: var(--uik-typography-font-size-1);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-component-command-palette-meta-fg));
  }

  .item-shortcut {
    font-size: var(--uik-typography-font-size-1);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-component-command-palette-meta-fg));
  }

  .highlight {
    padding: var(--uik-space-0);
    color: oklch(var(--uik-component-command-palette-highlight-fg));
    background-color: oklch(var(--uik-component-command-palette-highlight-bg));
  }

  .empty,
  .loading {
    padding: var(--uik-space-2);
    font-size: var(--uik-typography-font-size-2);
    line-height: var(--uik-typography-line-height-3);
    color: oklch(var(--uik-component-command-palette-meta-fg));
  }

  .footer {
    font-size: var(--uik-typography-font-size-1);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-component-command-palette-meta-fg));
  }

  @media (prefers-reduced-motion: reduce) {
    .input {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .panel,
    .list {
      border-color: CanvasText;
      box-shadow: none;
    }

    .item[data-active="true"] {
      outline: var(--uik-border-width-1) solid Highlight;
    }

    .highlight {
      color: HighlightText;
      background-color: Highlight;
    }
  }
`;
