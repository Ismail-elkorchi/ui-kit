import {css} from 'lit';

export const styles = css`
  :host {
    display: block;
  }

  .alert {
    display: grid;
    gap: var(--uik-space-2);
    padding: var(--uik-space-4);
    color: oklch(var(--uik-component-alert-neutral-fg));
    background-color: oklch(var(--uik-component-alert-neutral-bg));
    border: var(--uik-border-width-1) solid oklch(var(--uik-component-alert-neutral-border));
    border-radius: var(--uik-radius-3);
    box-shadow: var(--uik-shadow-0);
  }

  :host([variant='info']) .alert {
    color: oklch(var(--uik-component-alert-info-fg));
    background-color: oklch(var(--uik-component-alert-info-bg));
    border-color: oklch(var(--uik-component-alert-info-border));
  }

  :host([variant='success']) .alert {
    color: oklch(var(--uik-component-alert-success-fg));
    background-color: oklch(var(--uik-component-alert-success-bg));
    border-color: oklch(var(--uik-component-alert-success-border));
  }

  :host([variant='warning']) .alert {
    color: oklch(var(--uik-component-alert-warning-fg));
    background-color: oklch(var(--uik-component-alert-warning-bg));
    border-color: oklch(var(--uik-component-alert-warning-border));
  }

  :host([variant='danger']) .alert {
    color: oklch(var(--uik-component-alert-danger-fg));
    background-color: oklch(var(--uik-component-alert-danger-bg));
    border-color: oklch(var(--uik-component-alert-danger-border));
  }

  .title {
    font-size: var(--uik-typography-font-size-3);
    font-weight: var(--uik-typography-font-weight-semibold);
    line-height: var(--uik-typography-line-height-3);
  }

  .body {
    font-size: var(--uik-typography-font-size-2);
    line-height: var(--uik-typography-line-height-3);
  }
`;
