import { css } from "lit";
import type { CSSResultGroup } from "lit";

export const styles: CSSResultGroup = css`
  :host {
    position: relative;
    display: inline-flex;
  }

  .trigger {
    display: inline-flex;
  }

  .panel {
    position: absolute;
    z-index: var(--uik-component-popover-z-local-overlay);
    min-width: max-content;
    padding: var(--uik-component-popover-padding-y)
      var(--uik-component-popover-padding-x);
    color: oklch(var(--uik-component-popover-fg));
    background-color: oklch(var(--uik-component-popover-bg));
    border: var(--uik-border-width-1) solid
      oklch(var(--uik-component-popover-border));
    border-radius: var(--uik-component-popover-radius);
    box-shadow: var(--uik-component-popover-shadow);
  }

  .panel[data-placement="bottom-start"],
  .panel[data-placement="bottom"],
  .panel[data-placement="bottom-end"] {
    top: calc(100% + var(--uik-component-popover-offset));
  }

  .panel[data-placement="top-start"],
  .panel[data-placement="top"],
  .panel[data-placement="top-end"] {
    bottom: calc(100% + var(--uik-component-popover-offset));
  }

  .panel[data-placement="bottom-start"],
  .panel[data-placement="top-start"] {
    left: 0;
  }

  .panel[data-placement="bottom"],
  .panel[data-placement="top"] {
    left: 50%;
    transform: translateX(-50%);
  }

  .panel[data-placement="bottom-end"],
  .panel[data-placement="top-end"] {
    right: 0;
  }

  .panel[hidden] {
    display: none;
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
