import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    min-width: 0;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .base {
    display: flex;
    flex-wrap: wrap;
    gap: var(--uik-space-2);
    align-items: center;
    min-height: var(--uik-size-control-md);
    padding: var(--uik-layout-control-padding-y-2)
      var(--uik-layout-control-padding-x-3);
    font-size: var(--uik-typography-font-size-2);
    font-weight: var(--uik-typography-font-weight-regular);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-component-input-base-fg));
    background-color: oklch(var(--uik-component-input-base-bg));
    border: var(--uik-border-width-1) solid
      oklch(var(--uik-component-input-base-border-default));
    border-radius: var(--uik-radius-3);
    box-shadow: var(--uik-shadow-0);
    transition:
      border-color var(--uik-motion-transition-colors),
      box-shadow var(--uik-motion-transition-shadow),
      background-color var(--uik-motion-transition-colors),
      color var(--uik-motion-transition-colors);
  }

  :host(:not([disabled])) .base:hover {
    border-color: oklch(var(--uik-component-input-base-border-hover));
  }

  .base:focus-within {
    outline: none;
    border-color: oklch(var(--uik-component-input-base-border-focus));
    box-shadow:
      var(--uik-shadow-0),
      0 0 0 var(--uik-focus-ring-offset-default)
        oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0
        calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
        oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
  }

  :host([disabled]) .base {
    cursor: not-allowed;
    opacity: var(--uik-field-disabled-opacity);
  }

  .tags {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: var(--uik-space-2);
    align-items: center;
    min-width: 0;
  }

  .tag {
    display: inline-flex;
    gap: var(--uik-space-1);
    align-items: center;
    padding: var(--uik-space-1) var(--uik-space-2);
    font-size: var(--uik-typography-font-size-1);
    font-weight: var(--uik-typography-font-weight-medium);
    line-height: var(--uik-typography-line-height-1);
    color: oklch(var(--uik-component-badge-secondary-fg));
    cursor: pointer;
    background-color: oklch(var(--uik-component-tag-input-tag-bg));
    border: var(--uik-border-width-1) solid
      oklch(var(--uik-component-badge-secondary-border));
    border-radius: var(--uik-radius-2);
  }

  .tag[aria-disabled="true"],
  .tag:disabled {
    cursor: default;
    opacity: var(--uik-field-disabled-opacity);
  }

  .tag:focus-visible {
    outline: var(--uik-border-width-1) solid
      oklch(var(--uik-component-input-base-border-focus));
    outline-offset: var(--uik-space-1);
  }

  .tag-label {
    display: inline-flex;
  }

  .tag-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 var(--uik-space-1);
    color: oklch(var(--uik-text-muted));
    border-radius: var(--uik-radius-1);
  }

  .tag:hover .tag-remove,
  .tag:focus-visible .tag-remove {
    color: oklch(var(--uik-text-default));
    background-color: oklch(var(--uik-surface-bg));
  }

  .input {
    flex: 1 1 8rem;
    min-width: 8rem;
    padding: 0;
    margin: 0;
    font: inherit;
    line-height: inherit;
    color: oklch(var(--uik-component-input-base-fg));
    background: transparent;
    border: none;
  }

  .input::placeholder {
    color: oklch(var(--uik-component-input-base-placeholder));
  }

  .input:focus {
    outline: none;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    white-space: nowrap;
    border: 0;
    clip-path: inset(50%);
  }

  @media (forced-colors: active) {
    .base {
      color: CanvasText;
      background-color: Canvas;
      border-color: CanvasText;
    }

    .tag {
      color: CanvasText;
      forced-color-adjust: none;
      background-color: Canvas;
      border-color: CanvasText;
    }

    .tag-remove {
      color: ButtonText;
      background-color: ButtonFace;
    }

    .tag:focus-visible {
      outline: var(--uik-border-width-1) solid CanvasText;
      outline-offset: var(--uik-space-1);
    }
  }
`;
