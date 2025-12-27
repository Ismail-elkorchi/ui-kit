import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
  }

  a {
    font-family: var(--uik-typography-font-family-sans);
    font-size: var(--uik-typography-font-size-3);
    line-height: var(--uik-typography-line-height-3);
    color: oklch(var(--uik-component-link-fg-default));
    text-decoration: none;
    text-decoration-thickness: var(--uik-border-width-1);
    text-decoration-color: currentcolor;
    text-underline-offset: var(--uik-component-link-underline-offset);
    transition:
      color var(--uik-motion-transition-colors),
      text-decoration-color var(--uik-motion-transition-colors),
      box-shadow var(--uik-motion-transition-shadow);
  }

  a:hover {
    color: oklch(var(--uik-component-link-fg-hover));
    text-decoration-line: underline;
  }

  a:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 var(--uik-focus-ring-offset-default)
        oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0
        calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
        oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
  }

  @media (forced-colors: active) {
    a:focus-visible {
      outline: var(--uik-border-width-1) solid currentcolor;
      outline-offset: var(--uik-space-1);
      box-shadow: none;
    }
  }
`;
