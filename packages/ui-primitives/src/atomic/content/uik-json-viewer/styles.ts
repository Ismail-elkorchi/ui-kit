import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .wrapper {
    display: block;
    padding: var(--uik-layout-control-padding-y-2)
      var(--uik-layout-control-padding-x-2);
    color: oklch(var(--uik-component-json-viewer-fg));
    background-color: oklch(var(--uik-component-json-viewer-bg));
    border: var(--uik-border-width-1) solid
      oklch(var(--uik-component-json-viewer-border));
    border-radius: var(--uik-component-json-viewer-radius);
    font-family: var(--uik-typography-font-family-mono);
    font-size: var(--uik-typography-font-size-2);
    line-height: var(--uik-typography-line-height-2);
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
    gap: var(--uik-layout-control-gap-2);
    min-height: var(--uik-size-control-sm);
    padding-block: var(--uik-space-0);
    color: oklch(var(--uik-component-json-viewer-fg));
    background-color: oklch(var(--uik-component-json-viewer-bg));
    border: var(--uik-border-width-0) solid transparent;
    border-radius: var(--uik-component-json-viewer-radius);
  }

  .item:hover {
    background-color: oklch(var(--uik-surface-muted));
  }

  .item:active {
    background-color: oklch(var(--uik-surface-muted));
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
    width: var(--uik-size-icon-sm);
    height: var(--uik-size-icon-sm);
    color: oklch(var(--uik-text-muted));
  }

  .content {
    display: inline-flex;
    align-items: center;
    gap: var(--uik-layout-control-gap-2);
    min-width: var(--uik-space-0);
  }

  .key {
    color: oklch(var(--uik-text-strong));
    font-weight: var(--uik-typography-font-weight-medium);
  }

  .separator {
    color: oklch(var(--uik-text-muted));
  }

  .value {
    min-width: var(--uik-space-0);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .value[data-type="string"] {
    color: oklch(var(--uik-text-success));
  }

  .value[data-type="number"] {
    color: oklch(var(--uik-text-info));
  }

  .value[data-type="boolean"] {
    color: oklch(var(--uik-text-warning));
  }

  .value[data-type="null"] {
    color: oklch(var(--uik-text-muted));
  }

  .value[data-type="object"] {
    color: oklch(var(--uik-text-default));
  }

  .value[data-type="array"] {
    color: oklch(var(--uik-text-default));
  }

  .value[data-type="unknown"] {
    color: oklch(var(--uik-text-muted));
  }

  .type {
    color: oklch(var(--uik-text-muted));
    font-size: var(--uik-typography-font-size-1);
  }

  .actions {
    display: inline-flex;
    gap: var(--uik-layout-control-gap-1);
  }

  .action-button {
    display: inline-flex;
    align-items: center;
    gap: var(--uik-space-1);
    padding: var(--uik-layout-control-padding-y-1)
      var(--uik-layout-control-padding-x-1);
    color: oklch(var(--uik-component-json-viewer-fg));
    background-color: oklch(var(--uik-component-json-viewer-bg));
    border: var(--uik-border-width-1) solid
      oklch(var(--uik-component-json-viewer-border));
    border-radius: var(--uik-component-json-viewer-radius);
    font-size: var(--uik-typography-font-size-1);
    font-weight: var(--uik-typography-font-weight-medium);
    line-height: var(--uik-typography-line-height-1);
    cursor: pointer;
  }

  .action-button:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 var(--uik-focus-ring-offset-default)
        oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0
        calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
        oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
  }

  .error {
    padding: var(--uik-layout-control-padding-y-2)
      var(--uik-layout-control-padding-x-2);
    border-radius: var(--uik-component-json-viewer-radius);
    background-color: oklch(var(--uik-color-danger-1));
    border: var(--uik-border-width-1) solid oklch(var(--uik-border-danger));
    color: oklch(var(--uik-text-danger));
    font-weight: var(--uik-typography-font-weight-medium);
  }

  @media (forced-colors: active) {
    :host {
      --uik-component-json-viewer-bg: Canvas;
      --uik-component-json-viewer-fg: CanvasText;
      --uik-component-json-viewer-border: CanvasText;
    }

    .action-button {
      forced-color-adjust: none;
      color: ButtonText;
      background-color: ButtonFace;
      border-color: ButtonText;
    }

    .item:focus-visible {
      outline: var(--uik-border-width-1) solid currentcolor;
      outline-offset: var(--uik-space-1);
      box-shadow: none;
    }

    .error {
      color: CanvasText;
      background-color: Canvas;
      border-color: CanvasText;
    }
  }
`;
