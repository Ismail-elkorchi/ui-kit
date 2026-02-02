import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .wrapper {
    display: block;
    padding: var(--uik-layout-control-padding-y-2)
      var(--uik-layout-control-padding-x-2);
    color: oklch(var(--uik-text-default));
    background-color: oklch(var(--uik-component-json-diff-bg));
    border: var(--uik-border-width-1) solid oklch(var(--uik-border-muted));
    border-radius: var(--uik-radius-2);
    font-family: var(--uik-typography-font-family-mono);
    font-size: var(--uik-typography-font-size-2);
    line-height: var(--uik-typography-line-height-2);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--uik-space-2);
  }

  .summary {
    font-weight: var(--uik-typography-font-weight-semibold);
    color: oklch(var(--uik-text-strong));
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: var(--uik-space-2);
  }

  .item {
    display: grid;
    grid-template-columns: auto auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--uik-layout-control-gap-2);
    padding: var(--uik-layout-control-padding-y-2)
      var(--uik-layout-control-padding-x-2);
    background-color: oklch(var(--uik-component-json-diff-bg));
    border: var(--uik-border-width-1) solid oklch(var(--uik-border-muted));
    border-radius: var(--uik-radius-2);
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
    background: none;
    border: none;
    padding: var(--uik-space-0);
    cursor: pointer;
  }

  .toggle svg {
    width: var(--uik-size-icon-sm);
    height: var(--uik-size-icon-sm);
  }

  .kind {
    text-transform: uppercase;
    font-size: var(--uik-typography-font-size-1);
    font-weight: var(--uik-typography-font-weight-semibold);
    padding: var(--uik-layout-control-padding-y-1)
      var(--uik-layout-control-padding-x-1);
    border-radius: var(--uik-radius-2);
    border: var(--uik-border-width-1) solid transparent;
  }

  .kind[data-kind="add"] {
    color: oklch(var(--uik-text-success));
    background-color: oklch(var(--uik-color-success-1));
    border-color: oklch(var(--uik-border-success));
  }

  .kind[data-kind="remove"] {
    color: oklch(var(--uik-text-danger));
    background-color: oklch(var(--uik-color-danger-1));
    border-color: oklch(var(--uik-border-danger));
  }

  .kind[data-kind="replace"] {
    color: oklch(var(--uik-text-warning));
    background-color: oklch(var(--uik-color-warning-1));
    border-color: oklch(var(--uik-border-warning));
  }

  .path {
    color: oklch(var(--uik-text-strong));
    min-width: var(--uik-space-0);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
    color: oklch(var(--uik-text-default));
    background-color: oklch(var(--uik-component-json-diff-bg));
    border: var(--uik-border-width-1) solid oklch(var(--uik-border-muted));
    border-radius: var(--uik-radius-2);
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

  .detail {
    display: grid;
    gap: var(--uik-layout-control-gap-2);
    grid-column: 1 / -1;
    padding: var(--uik-layout-control-padding-y-2)
      var(--uik-layout-control-padding-x-2);
    border-radius: var(--uik-radius-2);
    background-color: oklch(var(--uik-surface-muted));
  }

  .detail-block {
    display: grid;
    gap: var(--uik-layout-control-gap-1);
  }

  .detail-label {
    font-size: var(--uik-typography-font-size-1);
    font-weight: var(--uik-typography-font-weight-medium);
    color: oklch(var(--uik-text-muted));
  }

  .error {
    padding: var(--uik-layout-control-padding-y-2)
      var(--uik-layout-control-padding-x-2);
    border-radius: var(--uik-radius-2);
    background-color: oklch(var(--uik-color-danger-1));
    border: var(--uik-border-width-1) solid oklch(var(--uik-border-danger));
    color: oklch(var(--uik-text-danger));
    font-weight: var(--uik-typography-font-weight-medium);
  }

  @media (forced-colors: active) {
    :host {
      --uik-component-json-diff-bg: Canvas;
    }

    .wrapper,
    .item,
    .action-button,
    .detail,
    .error {
      border-color: CanvasText;
    }

    .wrapper,
    .item,
    .action-button,
    .detail,
    .error,
    .path,
    .summary {
      color: CanvasText;
    }

    .kind {
      forced-color-adjust: none;
      color: CanvasText;
      background-color: Canvas;
      border-color: CanvasText;
    }

    .action-button {
      forced-color-adjust: none;
      color: ButtonText;
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
