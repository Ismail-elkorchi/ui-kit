import { css } from "lit";

export const styles = css`
  :host {
    --uik-component-popover-offset: var(--uik-component-menu-offset);
  }

  .panel {
    display: flex;
    flex-direction: column;
    gap: var(--uik-component-menu-gap);
    padding: var(--uik-component-menu-padding);
    color: oklch(var(--uik-component-menu-fg));
    background-color: oklch(var(--uik-component-menu-bg));
    border: var(--uik-component-menu-border-width) solid
      oklch(var(--uik-component-menu-border));
    border-radius: var(--uik-component-menu-radius);
    box-shadow: var(--uik-component-menu-shadow);
  }

  @media (forced-colors: active) {
    .panel {
      color: CanvasText;
      background-color: Canvas;
      border-color: CanvasText;
      box-shadow: none;
    }
  }
`;
