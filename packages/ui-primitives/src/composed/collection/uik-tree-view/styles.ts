import {css} from 'lit';

export const styles = css`
  :host {
    display: block;
  }

  .tree {
    display: flex;
    flex-direction: column;
    gap: var(--uik-space-0);
    width: 100%;
    box-sizing: border-box;
  }

  .item {
    display: inline-flex;
    align-items: center;
    gap: var(--uik-component-tree-view-item-gap);
    min-height: var(--uik-component-tree-view-item-height);
    width: 100%;
    padding-block: var(--uik-space-0);
    border: var(--uik-border-width-0) solid oklch(var(--uik-component-tree-view-item-bg));
    border-radius: var(--uik-component-tree-view-item-radius);
    background-color: oklch(var(--uik-component-tree-view-item-bg));
    font-family: var(--uik-typography-font-family-sans);
    font-size: var(--uik-typography-font-size-2);
    font-weight: var(--uik-typography-font-weight-medium);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-component-tree-view-text-leaf));
    cursor: pointer;
  }

  .item:hover {
    background-color: oklch(var(--uik-component-tree-view-item-hover-bg));
    color: oklch(var(--uik-component-tree-view-text-hover));
  }

  .item:active {
    background-color: oklch(var(--uik-component-tree-view-item-active-bg));
  }

  .item:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 var(--uik-focus-ring-offset-default) oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0 calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
        oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
  }

  .item[data-disabled='true'] {
    cursor: not-allowed;
    opacity: var(--uik-field-disabled-opacity);
  }

  .item[data-disabled='true']:hover {
    background-color: oklch(var(--uik-component-tree-view-item-bg));
    color: inherit;
  }

  .item[data-kind='branch'] {
    color: oklch(var(--uik-component-tree-view-text-branch));
    font-weight: var(--uik-typography-font-weight-semibold);
  }

  .toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--uik-component-tree-view-item-height);
    height: var(--uik-component-tree-view-item-height);
    padding: var(--uik-space-0);
    color: oklch(var(--uik-component-tree-view-toggle-fg));
    flex: 0 0 auto;
  }

  .toggle[data-open='true'] {
    color: oklch(var(--uik-component-tree-view-text-hover));
  }

  .selection {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--uik-component-checkbox-size);
    height: var(--uik-component-checkbox-size);
    border-radius: var(--uik-radius-1);
    border: var(--uik-border-width-1) solid oklch(var(--uik-border-muted));
    background-color: oklch(var(--uik-surface-bg));
    color: oklch(var(--uik-text-inverse));
    flex: 0 0 auto;
  }

  .selection[data-state='checked'],
  .selection[data-state='mixed'] {
    background-color: oklch(var(--uik-component-checkbox-accent));
    border-color: oklch(var(--uik-component-checkbox-accent));
  }

  .label {
    flex: 1 1 auto;
    min-width: var(--uik-space-0);
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    padding-inline: var(--uik-component-tree-view-item-padding-x);
    padding-block: var(--uik-space-0);
    text-align: start;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (forced-colors: active) {
    .item:focus-visible {
      outline: var(--uik-border-width-1) solid currentcolor;
      outline-offset: var(--uik-space-1);
      box-shadow: none;
    }
  }
`;
