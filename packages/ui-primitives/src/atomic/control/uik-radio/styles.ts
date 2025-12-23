import {css} from 'lit';

export const styles = css`
  :host {
    display: block;
  }

  .field {
    display: grid;
    gap: var(--uik-space-2);
  }

  .control {
    display: inline-flex;
    gap: var(--uik-space-2);
    align-items: center;
    font-size: var(--uik-typography-font-size-3);
    line-height: var(--uik-typography-line-height-4);
    color: oklch(var(--uik-text-default));
    cursor: pointer;
  }

  .control-text {
    color: oklch(var(--uik-text-default));
  }

  .hint {
    font-size: var(--uik-typography-font-size-1);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-text-muted));
  }

  .error {
    font-size: var(--uik-typography-font-size-1);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-text-danger));
  }

  input {
    width: var(--uik-component-radio-size);
    height: var(--uik-component-radio-size);
    margin: var(--uik-space-0);
    accent-color: oklch(var(--uik-component-radio-accent));
  }

  input:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 var(--uik-focus-ring-offset-default) oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0 calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
        oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
  }

  :host([disabled]) .control {
    cursor: not-allowed;
    opacity: var(--uik-field-disabled-opacity);
  }

  @media (forced-colors: active) {
    input:focus-visible {
      outline: var(--uik-border-width-1) solid currentcolor;
      outline-offset: var(--uik-space-1);
      box-shadow: none;
    }
  }
`;
