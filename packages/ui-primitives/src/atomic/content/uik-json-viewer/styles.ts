import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .wrapper {
    display: block;
    padding: var(--uik-layout-control-padding-y-2)
      var(--uik-layout-control-padding-x-2);
    font-family: var(--uik-typography-font-family-mono);
    font-size: var(--uik-typography-font-size-2);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-text-default));
    background-color: oklch(var(--uik-component-json-viewer-bg));
    border: var(--uik-border-width-1) solid oklch(var(--uik-border-muted));
    border-radius: var(--uik-radius-2);
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
    gap: var(--uik-layout-control-gap-2);
    align-items: center;
    min-height: var(--uik-size-control-sm);
    padding-block: var(--uik-space-0);
    color: oklch(var(--uik-text-default));
    background-color: oklch(var(--uik-component-json-viewer-bg));
    border: var(--uik-border-width-0) solid transparent;
    border-radius: var(--uik-radius-2);
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
    gap: var(--uik-layout-control-gap-2);
    align-items: center;
    min-width: var(--uik-space-0);
  }

  .key {
    font-weight: var(--uik-typography-font-weight-medium);
    color: oklch(var(--uik-text-strong));
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
    font-size: var(--uik-typography-font-size-1);
    color: oklch(var(--uik-text-muted));
  }

  .actions {
    display: inline-flex;
    gap: var(--uik-layout-control-gap-1);
  }

  .action-button {
    display: inline-flex;
    gap: var(--uik-space-1);
    align-items: center;
    padding: var(--uik-layout-control-padding-y-1)
      var(--uik-layout-control-padding-x-1);
    font-size: var(--uik-typography-font-size-1);
    font-weight: var(--uik-typography-font-weight-medium);
    line-height: var(--uik-typography-line-height-1);
    color: oklch(var(--uik-text-default));
    cursor: pointer;
    background-color: oklch(var(--uik-component-json-viewer-bg));
    border: var(--uik-border-width-1) solid oklch(var(--uik-border-muted));
    border-radius: var(--uik-radius-2);
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
    font-weight: var(--uik-typography-font-weight-medium);
    color: oklch(var(--uik-text-danger));
    background-color: oklch(var(--uik-color-danger-1));
    border: var(--uik-border-width-1) solid oklch(var(--uik-border-danger));
    border-radius: var(--uik-radius-2);
  }

  @media (forced-colors: active) {
    :host {
      --uik-component-json-viewer-bg: Canvas;
    }

    .wrapper,
    .action-button,
    .error {
      border-color: CanvasText;
    }

    .wrapper,
    .item,
    .action-button,
    .error {
      color: CanvasText;
    }

    .action-button {
      color: ButtonText;
      forced-color-adjust: none;
      background-color: ButtonFace;
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
