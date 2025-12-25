import {css} from 'lit';

export const styles = css`
  :host {
    display: block;
  }

  dialog {
    box-sizing: border-box;
    width: 100%;
    max-width: var(--uik-component-dialog-max-width);
    padding: var(--uik-space-0);
    margin: auto;
    overflow: hidden auto;
    color: oklch(var(--uik-component-dialog-fg));
    background-color: oklch(var(--uik-component-dialog-bg));
    border: var(--uik-border-width-1) solid oklch(var(--uik-component-dialog-border));
    border-radius: var(--uik-component-dialog-radius);
    box-shadow: var(--uik-component-dialog-shadow);
  }

  dialog::backdrop {
    background-color: oklch(var(--uik-scrim-color) / var(--uik-scrim-opacity));
  }

  .panel {
    display: grid;
    gap: var(--uik-space-4);
    padding: var(--uik-component-dialog-padding);
  }

  .title {
    margin: var(--uik-space-0);
    font-size: var(--uik-typography-font-size-5);
    font-weight: var(--uik-typography-font-weight-semibold);
    line-height: var(--uik-typography-line-height-5);
    color: oklch(var(--uik-component-dialog-title-fg));
  }

  .description {
    font-size: var(--uik-typography-font-size-2);
    line-height: var(--uik-typography-line-height-3);
    color: oklch(var(--uik-component-dialog-description-fg));
  }

  .actions {
    display: flex;
    gap: var(--uik-component-dialog-actions-gap);
    justify-content: flex-end;
  }
`;
