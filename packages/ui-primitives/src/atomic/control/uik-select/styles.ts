import {css} from 'lit';

export const styles = css`
  :host {
    display: block;
    min-width: 0;
  }

  .field {
    display: grid;
    gap: var(--uik-space-2);
  }

  .label {
    font-size: var(--uik-typography-font-size-2);
    font-weight: var(--uik-typography-font-weight-medium);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-text-strong));
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

  :host([disabled]) .label {
    color: oklch(var(--uik-text-disabled));
  }

  select {
    width: 100%;
    height: var(--uik-size-control-md);
    box-sizing: border-box;
    padding: var(--uik-component-select-base-padding-y) var(--uik-component-select-base-padding-x);
    font-family: var(--uik-typography-font-family-sans);
    font-size: var(--uik-component-select-base-font-size);
    font-weight: var(--uik-typography-font-weight-regular);
    line-height: var(--uik-component-select-base-line-height);
    color: oklch(var(--uik-component-select-base-fg));
    background-color: oklch(var(--uik-component-select-base-bg));
    border-color: oklch(var(--uik-component-select-base-border-default));
    border-style: var(--uik-border-style-solid);
    border-width: var(--uik-border-width-1);
    border-radius: var(--uik-component-select-base-radius);
    box-shadow: var(--uik-component-select-base-shadow);
    transition:
      border-color var(--uik-motion-transition-colors),
      box-shadow var(--uik-motion-transition-shadow),
      background-color var(--uik-motion-transition-colors),
      color var(--uik-motion-transition-colors);
  }

  select:hover {
    border-color: oklch(var(--uik-component-select-base-border-hover));
  }

  select:focus-visible {
    outline: none;
    border-color: oklch(var(--uik-component-select-base-border-focus));
    box-shadow:
      var(--uik-component-select-base-shadow),
      0 0 0 var(--uik-focus-ring-offset-default) oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0 calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
        oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
  }

  select:disabled {
    cursor: not-allowed;
    opacity: var(--uik-field-disabled-opacity);
  }

  @media (forced-colors: active) {
    select:focus-visible {
      outline: var(--uik-border-width-1) solid currentcolor;
      outline-offset: var(--uik-space-1);
      box-shadow: none;
    }
  }
`;
