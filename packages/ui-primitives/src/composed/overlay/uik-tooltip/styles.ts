import { css } from "lit";
import type { CSSResultGroup } from "lit";

import { styles as popoverStyles } from "../../../atomic/overlay/uik-popover/styles.js";

export const styles: CSSResultGroup = [
  popoverStyles,
  css`
    .panel {
      z-index: var(--uik-z-local-tooltip);
      padding: var(--uik-component-tooltip-padding-y)
        var(--uik-component-tooltip-padding-x);
      font-size: var(--uik-typography-font-size-2);
      line-height: var(--uik-typography-line-height-3);
      color: oklch(var(--uik-component-tooltip-fg));
      pointer-events: none;
      background-color: oklch(var(--uik-component-tooltip-bg));
      border-color: oklch(
        var(--uik-component-tooltip-bg) / var(--uik-opacity-0)
      );
      border-radius: var(--uik-component-tooltip-radius);
      box-shadow: var(--uik-component-tooltip-shadow);

      --uik-component-popover-offset: var(--uik-component-tooltip-offset);
    }
  `,
];
