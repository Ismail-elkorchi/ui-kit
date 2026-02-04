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
    align-items: center;
    flex-wrap: wrap;
    gap: var(--uik-component-tag-input-base-gap);
    min-height: var(--uik-component-tag-input-base-height);
    padding: var(--uik-component-tag-input-base-padding-y)
      var(--uik-component-tag-input-base-padding-x);
    font-size: var(--uik-component-tag-input-base-font-size);
    font-weight: var(--uik-component-tag-input-base-font-weight);
    line-height: var(--uik-component-tag-input-base-line-height);
    color: oklch(var(--uik-component-tag-input-base-fg));
    background-color: oklch(var(--uik-component-tag-input-base-bg));
    border: var(--uik-component-tag-input-base-border-width) solid
      oklch(var(--uik-component-tag-input-base-border-default));
    border-radius: var(--uik-component-tag-input-base-radius);
    box-shadow: var(--uik-component-tag-input-base-shadow);
    transition:
      border-color var(--uik-motion-transition-colors),
      box-shadow var(--uik-motion-transition-shadow),
      background-color var(--uik-motion-transition-colors),
      color var(--uik-motion-transition-colors);
  }

  :host(:not([disabled])) .base:hover {
    border-color: oklch(var(--uik-component-tag-input-base-border-hover));
  }

  .base:focus-within {
    outline: none;
    border-color: oklch(var(--uik-component-tag-input-base-border-focus));
    box-shadow:
      var(--uik-component-tag-input-base-shadow),
      0 0 0 var(--uik-component-tag-input-base-focus-ring-offset)
        oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0
        calc(
          var(--uik-component-tag-input-base-focus-ring-offset) +
            var(--uik-component-tag-input-base-focus-ring-width)
        )
        oklch(
          var(--uik-component-tag-input-base-focus-ring) /
            var(--uik-component-tag-input-base-focus-ring-opacity)
        );
  }

  :host([disabled]) .base {
    cursor: not-allowed;
    opacity: var(--uik-component-tag-input-base-disabled-opacity);
  }

  .tags {
    display: flex;
    flex: 1;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--uik-component-tag-input-base-gap);
    min-width: 0;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: var(--uik-space-1);
    padding: var(--uik-component-tag-input-tag-padding-y)
      var(--uik-component-tag-input-tag-padding-x);
    border-radius: var(--uik-component-tag-input-tag-radius);
    border: var(--uik-component-tag-input-base-border-width) solid
      oklch(var(--uik-component-tag-input-tag-border));
    background-color: oklch(var(--uik-component-tag-input-tag-bg));
    color: oklch(var(--uik-component-tag-input-tag-fg));
    font-size: var(--uik-component-tag-input-tag-font-size);
    font-weight: var(--uik-component-tag-input-tag-font-weight);
    line-height: var(--uik-component-tag-input-tag-line-height);
    cursor: pointer;
  }

  .tag[aria-disabled="true"],
  .tag:disabled {
    cursor: default;
    opacity: var(--uik-component-tag-input-base-disabled-opacity);
  }

  .tag:focus-visible {
    outline: var(--uik-component-tag-input-base-border-width) solid
      oklch(var(--uik-component-tag-input-base-border-focus));
    outline-offset: var(--uik-space-1);
  }

  .tag-label {
    display: inline-flex;
  }

  .tag-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: oklch(var(--uik-component-tag-input-tag-remove-fg));
    border-radius: var(--uik-radius-1);
    padding: 0 var(--uik-space-1);
  }

  .tag:hover .tag-remove,
  .tag:focus-visible .tag-remove {
    color: oklch(var(--uik-component-tag-input-tag-remove-hover-fg));
    background-color: oklch(var(--uik-component-tag-input-tag-remove-hover-bg));
  }

  .input {
    flex: 1 1 8rem;
    min-width: 8rem;
    padding: 0;
    margin: 0;
    border: none;
    background: transparent;
    color: oklch(var(--uik-component-tag-input-base-fg));
    font: inherit;
    line-height: inherit;
  }

  .input::placeholder {
    color: oklch(var(--uik-component-tag-input-base-placeholder));
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
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (forced-colors: active) {
    .base {
      background-color: Canvas;
      border-color: CanvasText;
      color: CanvasText;
    }

    .tag {
      background-color: Canvas;
      border-color: CanvasText;
      color: CanvasText;
      forced-color-adjust: none;
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
