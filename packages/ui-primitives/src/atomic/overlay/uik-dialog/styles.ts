import {css} from 'lit';

export const styles = css`
  :host {
    display: block;
  }

  dialog {
    width: 100%;
    max-width: var(--uik-layout-panel-width-md);
    padding: var(--uik-space-0);
    margin: auto;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
    color: oklch(var(--uik-text-default));
    background-color: oklch(var(--uik-surface-card));
    border: none;
    border-radius: var(--uik-radius-4);
    box-shadow: var(--uik-elevation-modal-shadow);
  }

  dialog::backdrop {
    background-color: oklch(var(--uik-scrim-color) / var(--uik-scrim-opacity));
  }

  .panel {
    display: grid;
    gap: var(--uik-space-4);
    padding: var(--uik-space-5);
  }

  .title {
    margin: var(--uik-space-0);
    font-size: var(--uik-typography-font-size-5);
    font-weight: var(--uik-typography-font-weight-semibold);
    line-height: var(--uik-typography-line-height-5);
  }

  .description {
    font-size: var(--uik-typography-font-size-2);
    line-height: var(--uik-typography-line-height-3);
    color: oklch(var(--uik-text-muted));
  }

  .actions {
    display: flex;
    gap: var(--uik-space-2);
    justify-content: flex-end;
  }
`;
