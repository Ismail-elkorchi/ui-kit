import { css } from "lit";

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
    box-sizing: border-box;
    width: var(--uik-component-radio-size);
    height: var(--uik-component-radio-size);
    margin: var(--uik-space-0);
  }

  input:disabled {
    cursor: not-allowed;
  }

  @supports (accent-color: auto) {
    input {
      accent-color: oklch(var(--uik-component-radio-accent));
    }
  }

  @supports not (accent-color: auto) {
    input {
      display: inline-grid;
      place-content: center;
      appearance: none;
      background-color: oklch(var(--uik-surface-bg));
      border-color: oklch(var(--uik-border-default));
      border-style: var(--uik-border-style-solid);
      border-width: var(--uik-border-width-1);
      border-radius: var(--uik-radius-full);
      transition:
        border-color var(--uik-motion-transition-colors),
        box-shadow var(--uik-motion-transition-shadow);
    }

    input::before {
      width: calc(var(--uik-component-radio-size) / 2);
      height: calc(var(--uik-component-radio-size) / 2);
      content: "";
      background-color: oklch(var(--uik-component-radio-accent));
      border-radius: var(--uik-radius-full);
      transform: scale(0);
      transition: transform var(--uik-motion-transition-transform);
    }

    input:checked {
      border-color: oklch(var(--uik-component-radio-accent));
    }

    input:checked::before {
      transform: scale(1);
    }

    @media (prefers-reduced-motion: reduce) {
      input,
      input::before {
        transition: none;
      }
    }

    @media (forced-colors: active) {
      input {
        appearance: auto;
      }

      input::before {
        content: none;
      }
    }
  }

  input:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 var(--uik-focus-ring-offset-default)
        oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0
        calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
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
