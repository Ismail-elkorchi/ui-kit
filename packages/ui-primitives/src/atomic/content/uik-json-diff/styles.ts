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
    background-color: oklch(var(--uik-component-json-diff-bg));
    border: var(--uik-border-width-1) solid oklch(var(--uik-border-muted));
    border-radius: var(--uik-radius-2);
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
    gap: var(--uik-layout-control-gap-2);
    align-items: center;
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
    padding: var(--uik-space-0);
    color: oklch(var(--uik-text-muted));
    cursor: pointer;
    background: none;
    border: none;
  }

  .toggle svg {
    width: var(--uik-size-icon-sm);
    height: var(--uik-size-icon-sm);
  }

  .kind {
    padding: var(--uik-layout-control-padding-y-1)
      var(--uik-layout-control-padding-x-1);
    font-size: var(--uik-typography-font-size-1);
    font-weight: var(--uik-typography-font-weight-semibold);
    text-transform: uppercase;
    border: var(--uik-border-width-1) solid transparent;
    border-radius: var(--uik-radius-2);
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
    min-width: var(--uik-space-0);
    overflow: hidden;
    text-overflow: ellipsis;
    color: oklch(var(--uik-text-strong));
    white-space: nowrap;
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
    background-color: oklch(var(--uik-component-json-diff-bg));
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

  .detail {
    display: grid;
    grid-column: 1 / -1;
    gap: var(--uik-layout-control-gap-2);
    padding: var(--uik-layout-control-padding-y-2)
      var(--uik-layout-control-padding-x-2);
    background-color: oklch(var(--uik-surface-muted));
    border-radius: var(--uik-radius-2);
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
    font-weight: var(--uik-typography-font-weight-medium);
    color: oklch(var(--uik-text-danger));
    background-color: oklch(var(--uik-color-danger-1));
    border: var(--uik-border-width-1) solid oklch(var(--uik-border-danger));
    border-radius: var(--uik-radius-2);
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
      color: CanvasText;
      forced-color-adjust: none;
      background-color: Canvas;
      border-color: CanvasText;
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
