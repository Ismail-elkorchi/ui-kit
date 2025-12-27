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

  .switch {
    position: relative;
    flex-shrink: 0;
    width: var(--uik-component-switch-width);
    height: var(--uik-component-switch-height);
  }

  input {
    position: absolute;
    inset: 0;
    margin: var(--uik-space-0);
    cursor: pointer;
    opacity: var(--uik-opacity-0);
  }

  .track {
    position: absolute;
    inset: 0;
    background-color: oklch(var(--uik-component-switch-track-bg-default));
    border: var(--uik-border-width-1) solid
      oklch(var(--uik-component-switch-track-border-default));
    border-radius: var(--uik-radius-full);
    transition:
      background-color var(--uik-motion-transition-colors),
      border-color var(--uik-motion-transition-colors),
      box-shadow var(--uik-motion-transition-shadow);
  }

  .thumb {
    position: absolute;
    top: var(--uik-component-switch-padding);
    left: var(--uik-component-switch-padding);
    width: var(--uik-component-switch-thumb-size);
    height: var(--uik-component-switch-thumb-size);
    background-color: oklch(var(--uik-component-switch-thumb-bg));
    border-radius: var(--uik-radius-full);
    box-shadow: var(--uik-component-switch-thumb-shadow);
    transition: transform var(--uik-motion-transition-transform);
  }

  input:checked ~ .track {
    background-color: oklch(var(--uik-component-switch-track-bg-checked));
    border-color: oklch(var(--uik-component-switch-track-border-checked));
  }

  input:checked ~ .thumb {
    transform: translateX(
      calc(
        var(--uik-component-switch-width) - var(
            --uik-component-switch-thumb-size
          ) - var(--uik-component-switch-padding) - var(
            --uik-component-switch-padding
          )
      )
    );
  }

  input:focus-visible ~ .track {
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

  @media (prefers-reduced-motion: reduce) {
    .track,
    .thumb {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    input:focus-visible ~ .track {
      outline: var(--uik-border-width-1) solid currentcolor;
      outline-offset: var(--uik-space-1);
      box-shadow: none;
    }
  }
`;
