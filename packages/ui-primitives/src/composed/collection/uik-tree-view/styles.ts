import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .tree {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--uik-space-0);
    width: 100%;
  }

  .item {
    display: inline-flex;
    gap: var(--uik-component-tree-view-item-gap);
    align-items: center;
    width: 100%;
    min-height: var(--uik-component-tree-view-item-height);
    padding-block: var(--uik-space-0);
    font-family: var(--uik-typography-font-family-sans);
    font-size: var(--uik-typography-font-size-2);
    font-weight: var(--uik-typography-font-weight-medium);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-component-tree-view-text-leaf));
    cursor: pointer;
    background-color: oklch(var(--uik-component-tree-view-item-bg));
    border: var(--uik-border-width-0) solid
      oklch(var(--uik-component-tree-view-item-bg));
    border-radius: var(--uik-component-tree-view-item-radius);
  }

  .item:hover {
    color: oklch(var(--uik-component-tree-view-text-hover));
    background-color: oklch(var(--uik-component-tree-view-item-hover-bg));
  }

  .item:active {
    background-color: oklch(var(--uik-component-tree-view-item-active-bg));
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

  .item[data-disabled="true"] {
    cursor: not-allowed;
    opacity: var(--uik-field-disabled-opacity);
  }

  .item[data-disabled="true"]:hover {
    color: inherit;
    background-color: oklch(var(--uik-component-tree-view-item-bg));
  }

  .item[data-kind="branch"] {
    font-weight: var(--uik-typography-font-weight-semibold);
    color: oklch(var(--uik-component-tree-view-text-branch));
  }

  .toggle {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: var(--uik-component-tree-view-item-height);
    height: var(--uik-component-tree-view-item-height);
    padding: var(--uik-space-0);
    color: oklch(var(--uik-component-tree-view-toggle-fg));
  }

  .toggle[data-open="true"] {
    color: oklch(var(--uik-component-tree-view-text-hover));
  }

  .selection {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: var(--uik-component-checkbox-size);
    height: var(--uik-component-checkbox-size);
    color: oklch(var(--uik-text-inverse));
    background-color: oklch(var(--uik-surface-bg));
    border: var(--uik-border-width-1) solid oklch(var(--uik-border-muted));
    border-radius: var(--uik-radius-1);
  }

  .selection[data-state="checked"],
  .selection[data-state="mixed"] {
    background-color: oklch(var(--uik-component-checkbox-accent));
    border-color: oklch(var(--uik-component-checkbox-accent));
  }

  .label {
    display: inline-flex;
    flex: 1 1 auto;
    align-items: center;
    justify-content: flex-start;
    min-width: var(--uik-space-0);
    padding-block: var(--uik-space-0);
    padding-inline: var(--uik-component-tree-view-item-padding-x);
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: start;
    white-space: nowrap;
  }

  @media (forced-colors: active) {
    .item:focus-visible {
      outline: var(--uik-border-width-1) solid currentcolor;
      outline-offset: var(--uik-space-1);
      box-shadow: none;
    }
  }
`;
