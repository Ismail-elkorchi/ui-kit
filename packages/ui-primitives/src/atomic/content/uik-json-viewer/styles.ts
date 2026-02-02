import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .wrapper {
    display: block;
    padding: var(--uik-component-json-viewer-padding-y)
      var(--uik-component-json-viewer-padding-x);
    color: oklch(var(--uik-component-json-viewer-fg));
    background-color: oklch(var(--uik-component-json-viewer-bg));
    border: var(--uik-component-json-viewer-border-width) solid
      oklch(var(--uik-component-json-viewer-border));
    border-radius: var(--uik-component-json-viewer-radius);
    font-family: var(--uik-component-json-viewer-font-family);
    font-size: var(--uik-component-json-viewer-font-size);
    line-height: var(--uik-component-json-viewer-line-height);
  }

  .tree {
    display: flex;
    flex-direction: column;
    gap: var(--uik-space-0);
    width: 100%;
  }

  .item {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--uik-component-json-viewer-item-gap);
    min-height: var(--uik-component-json-viewer-item-height);
    padding-block: var(--uik-space-0);
    color: oklch(var(--uik-component-json-viewer-fg));
    background-color: oklch(var(--uik-component-json-viewer-bg));
    border: var(--uik-border-width-0) solid transparent;
    border-radius: var(--uik-component-json-viewer-item-radius);
  }

  .item:hover {
    background-color: oklch(var(--uik-component-json-viewer-item-hover-bg));
  }

  .item:active {
    background-color: oklch(var(--uik-component-json-viewer-item-active-bg));
  }

  .item:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 var(--uik-focus-ring-offset-default)
        oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0
        calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
        oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
  }

  .toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--uik-component-json-viewer-toggle-size);
    height: var(--uik-component-json-viewer-toggle-size);
    color: oklch(var(--uik-component-json-viewer-toggle-fg));
  }

  .content {
    display: inline-flex;
    align-items: center;
    gap: var(--uik-component-json-viewer-item-gap);
    min-width: var(--uik-space-0);
  }

  .key {
    color: oklch(var(--uik-component-json-viewer-key-fg));
    font-weight: var(--uik-typography-font-weight-medium);
  }

  .separator {
    color: oklch(var(--uik-component-json-viewer-type-fg));
  }

  .value {
    min-width: var(--uik-space-0);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .value[data-type="string"] {
    color: oklch(var(--uik-component-json-viewer-value-string));
  }

  .value[data-type="number"] {
    color: oklch(var(--uik-component-json-viewer-value-number));
  }

  .value[data-type="boolean"] {
    color: oklch(var(--uik-component-json-viewer-value-boolean));
  }

  .value[data-type="null"] {
    color: oklch(var(--uik-component-json-viewer-value-null));
  }

  .value[data-type="object"] {
    color: oklch(var(--uik-component-json-viewer-value-object));
  }

  .value[data-type="array"] {
    color: oklch(var(--uik-component-json-viewer-value-array));
  }

  .value[data-type="unknown"] {
    color: oklch(var(--uik-component-json-viewer-value-unknown));
  }

  .type {
    color: oklch(var(--uik-component-json-viewer-type-fg));
    font-size: var(--uik-component-json-viewer-type-font-size);
  }

  .actions {
    display: inline-flex;
    gap: var(--uik-component-json-viewer-action-gap);
  }

  .action-button {
    display: inline-flex;
    align-items: center;
    gap: var(--uik-space-1);
    padding: var(--uik-component-json-viewer-action-padding-y)
      var(--uik-component-json-viewer-action-padding-x);
    color: oklch(var(--uik-component-json-viewer-action-fg));
    background-color: oklch(var(--uik-component-json-viewer-action-bg));
    border: var(--uik-component-json-viewer-action-border-width) solid
      oklch(var(--uik-component-json-viewer-action-border));
    border-radius: var(--uik-component-json-viewer-action-radius);
    font-size: var(--uik-component-json-viewer-action-font-size);
    font-weight: var(--uik-component-json-viewer-action-font-weight);
    line-height: var(--uik-component-json-viewer-action-line-height);
    cursor: pointer;
  }

  .action-button:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 var(--uik-component-json-viewer-action-focus-offset)
        oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0
        calc(
          var(--uik-component-json-viewer-action-focus-offset) +
            var(--uik-component-json-viewer-action-focus-width)
        )
        oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
  }

  .error {
    padding: var(--uik-component-json-viewer-error-padding-y)
      var(--uik-component-json-viewer-error-padding-x);
    border-radius: var(--uik-component-json-viewer-radius);
    background-color: oklch(var(--uik-component-json-viewer-error-bg));
    border: var(--uik-component-json-viewer-border-width) solid
      oklch(var(--uik-component-json-viewer-error-border));
    color: oklch(var(--uik-component-json-viewer-error-fg));
    font-weight: var(--uik-typography-font-weight-medium);
  }

  @media (forced-colors: active) {
    :host {
      --uik-component-json-viewer-bg: Canvas;
      --uik-component-json-viewer-fg: CanvasText;
      --uik-component-json-viewer-border: CanvasText;
      --uik-component-json-viewer-item-hover-bg: Canvas;
      --uik-component-json-viewer-item-active-bg: Canvas;
      --uik-component-json-viewer-toggle-fg: CanvasText;
      --uik-component-json-viewer-key-fg: CanvasText;
      --uik-component-json-viewer-type-fg: CanvasText;
      --uik-component-json-viewer-action-bg: Canvas;
      --uik-component-json-viewer-action-fg: CanvasText;
      --uik-component-json-viewer-action-border: CanvasText;
      --uik-component-json-viewer-error-bg: Canvas;
      --uik-component-json-viewer-error-fg: CanvasText;
      --uik-component-json-viewer-error-border: CanvasText;
    }

    .item:focus-visible {
      outline: var(--uik-border-width-1) solid currentcolor;
      outline-offset: var(--uik-space-1);
      box-shadow: none;
    }
  }
`;
