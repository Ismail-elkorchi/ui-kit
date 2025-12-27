import { css } from "lit";

export const comboboxStyles = css`
  :host {
    position: relative;
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

  .control {
    position: relative;
  }

  input {
    box-sizing: border-box;
    display: flex;
    width: 100%;
    height: var(--uik-component-combobox-base-height);
    padding: var(--uik-component-combobox-base-padding-y)
      var(--uik-component-combobox-base-padding-x);
    font-size: var(--uik-component-combobox-base-font-size);
    font-weight: var(--uik-component-combobox-base-font-weight);
    line-height: var(--uik-component-combobox-base-line-height);
    color: oklch(var(--uik-component-combobox-base-fg));
    background-color: oklch(var(--uik-component-combobox-base-bg));
    border-color: oklch(var(--uik-component-combobox-base-border-default));
    border-style: var(--uik-border-style-solid);
    border-width: var(--uik-component-combobox-base-border-width);
    border-radius: var(--uik-component-combobox-base-radius);
    box-shadow: var(--uik-component-combobox-base-shadow);
    transition:
      border-color var(--uik-motion-transition-colors),
      box-shadow var(--uik-motion-transition-shadow),
      background-color var(--uik-motion-transition-colors),
      color var(--uik-motion-transition-colors);
  }

  input:hover {
    border-color: oklch(var(--uik-component-combobox-base-border-hover));
  }

  input::placeholder {
    color: oklch(var(--uik-component-combobox-base-placeholder));
  }

  input::selection {
    color: oklch(var(--uik-component-combobox-base-selection-fg));
    background-color: oklch(var(--uik-component-combobox-base-selection-bg));
  }

  input:focus-visible {
    outline: none;
    border-color: oklch(var(--uik-component-combobox-base-border-focus));
    box-shadow:
      var(--uik-component-combobox-base-shadow),
      0 0 0 var(--uik-component-combobox-base-focus-ring-offset)
        oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0
        calc(
          var(--uik-component-combobox-base-focus-ring-offset) +
            var(--uik-component-combobox-base-focus-ring-width)
        )
        oklch(
          var(--uik-component-combobox-base-focus-ring) /
            var(--uik-component-combobox-base-focus-ring-opacity)
        );
  }

  input:disabled {
    cursor: not-allowed;
    opacity: var(--uik-component-combobox-base-disabled-opacity);
  }

  .panel {
    position: absolute;
    inset-inline: var(--uik-space-0);
    z-index: var(--uik-z-local-overlay);
    margin-top: var(--uik-component-combobox-panel-offset);
  }

  .panel[hidden] {
    display: none;
  }
`;
