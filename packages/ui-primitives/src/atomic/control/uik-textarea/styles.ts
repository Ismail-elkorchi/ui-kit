import { css } from "lit";

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

  textarea {
    box-sizing: border-box;
    width: 100%;
    min-height: var(--uik-component-textarea-base-min-height);
    padding: var(--uik-component-textarea-base-padding-y)
      var(--uik-component-textarea-base-padding-x);
    font-family: var(--uik-typography-font-family-sans);
    font-size: var(--uik-component-textarea-base-font-size);
    font-weight: var(--uik-typography-font-weight-regular);
    line-height: var(--uik-component-textarea-base-line-height);
    color: oklch(var(--uik-component-textarea-base-fg));
    resize: vertical;
    background-color: oklch(var(--uik-component-textarea-base-bg));
    border-color: oklch(var(--uik-component-textarea-base-border-default));
    border-style: var(--uik-border-style-solid);
    border-width: var(--uik-border-width-1);
    border-radius: var(--uik-component-textarea-base-radius);
    box-shadow: var(--uik-component-textarea-base-shadow);
    transition:
      border-color var(--uik-motion-transition-colors),
      box-shadow var(--uik-motion-transition-shadow),
      background-color var(--uik-motion-transition-colors),
      color var(--uik-motion-transition-colors);
  }

  textarea:hover {
    border-color: oklch(var(--uik-component-textarea-base-border-hover));
  }

  textarea::placeholder {
    color: oklch(var(--uik-component-textarea-base-placeholder));
  }

  textarea::selection {
    color: oklch(var(--uik-selection-fg));
    background-color: oklch(var(--uik-selection-bg));
  }

  textarea:focus-visible {
    outline: none;
    border-color: oklch(var(--uik-component-textarea-base-border-focus));
    box-shadow:
      var(--uik-component-textarea-base-shadow),
      0 0 0 var(--uik-focus-ring-offset-default)
        oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0
        calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
        oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
  }

  textarea:disabled {
    cursor: not-allowed;
    opacity: var(--uik-field-disabled-opacity);
  }

  @media (forced-colors: active) {
    textarea:focus-visible {
      outline: var(--uik-border-width-1) solid currentcolor;
      outline-offset: var(--uik-space-1);
      box-shadow: none;
    }
  }
`;
