import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  :host([inline]) {
    display: inline-flex;
  }

  .wrapper {
    position: relative;
    padding: var(--uik-component-code-block-padding-y)
      var(--uik-component-code-block-padding-x);
    background-color: oklch(var(--uik-component-code-block-bg));
    border: var(--uik-component-code-block-border-width) solid
      oklch(var(--uik-component-code-block-border));
    border-radius: var(--uik-component-code-block-radius);
  }

  .content {
    max-height: var(--uik-component-code-block-max-height);
    margin: var(--uik-space-0);
    overflow: auto;
    font-family: var(--uik-component-code-block-font-family);
    font-size: var(--uik-component-code-block-font-size);
    font-weight: var(--uik-component-code-block-font-weight);
    line-height: var(--uik-component-code-block-line-height);
    color: oklch(var(--uik-component-code-block-fg));
    white-space: pre;
  }

  .code {
    font-family: inherit;
  }

  .inline {
    display: inline-flex;
    align-items: center;
    padding: var(--uik-component-code-block-padding-y)
      var(--uik-component-code-block-padding-x);
    font-family: var(--uik-component-code-block-font-family);
    font-size: var(--uik-component-code-block-font-size);
    font-weight: var(--uik-component-code-block-font-weight);
    line-height: var(--uik-component-code-block-line-height);
    color: oklch(var(--uik-component-code-block-fg));
    white-space: pre-wrap;
    background-color: oklch(var(--uik-component-code-block-bg));
    border: var(--uik-component-code-block-border-width) solid
      oklch(var(--uik-component-code-block-border));
    border-radius: var(--uik-component-code-block-radius);
  }

  .copy {
    position: absolute;
    inset-block-start: var(--uik-component-code-block-copy-offset);
    inset-inline-end: var(--uik-component-code-block-copy-offset);
    display: inline-flex;
    align-items: center;
    padding: var(--uik-component-code-block-copy-padding-y)
      var(--uik-component-code-block-copy-padding-x);
    font-family: var(--uik-component-code-block-font-family);
    font-size: var(--uik-component-code-block-copy-font-size);
    font-weight: var(--uik-component-code-block-copy-font-weight);
    line-height: var(--uik-component-code-block-copy-line-height);
    color: oklch(var(--uik-component-code-block-copy-fg));
    cursor: pointer;
    background-color: oklch(var(--uik-component-code-block-copy-bg));
    border: var(--uik-component-code-block-copy-border-width) solid
      oklch(var(--uik-component-code-block-copy-border));
    border-radius: var(--uik-component-code-block-copy-radius);
  }

  .copy:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 var(--uik-component-code-block-copy-focus-offset)
        oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0
        calc(
          var(--uik-component-code-block-copy-focus-offset) +
            var(--uik-component-code-block-copy-focus-width)
        )
        oklch(var(--uik-focus-ring));
  }

  .copy:disabled {
    cursor: default;
    opacity: var(--uik-component-code-block-copy-disabled-opacity);
  }

  @media (forced-colors: active) {
    .wrapper,
    .inline {
      color: CanvasText;
      background-color: Canvas;
      border-color: CanvasText;
    }

    .copy {
      forced-color-adjust: none;
      color: ButtonText;
      background-color: ButtonFace;
      border-color: ButtonText;
    }

    .copy:focus-visible {
      box-shadow: none;
      outline: var(--uik-component-code-block-copy-focus-width) solid Highlight;
      outline-offset: var(--uik-component-code-block-copy-focus-offset);
    }
  }
`;
