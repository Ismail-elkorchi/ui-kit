import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .menubar {
    display: inline-flex;
    gap: var(--uik-component-menubar-gap);
    align-items: center;
    padding: var(--uik-component-menubar-padding-y)
      var(--uik-component-menubar-padding-x);
    color: oklch(var(--uik-component-menubar-fg));
    background-color: oklch(var(--uik-component-menubar-bg));
    border: var(--uik-component-menubar-border-width) solid
      oklch(var(--uik-component-menubar-border));
    border-radius: var(--uik-component-menubar-radius);
  }

  @media (forced-colors: active) {
    .menubar {
      color: CanvasText;
      background-color: Canvas;
      border-color: CanvasText;
    }
  }
`;
