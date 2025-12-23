import {css} from 'lit';
import type {CSSResultGroup} from 'lit';

import {styles as popoverStyles} from '../../../atomic/overlay/uik-popover/styles';

export const styles: CSSResultGroup = [
  popoverStyles,
  css`
    .panel {
      z-index: var(--uik-z-local-tooltip);
      padding: var(--uik-space-2) var(--uik-space-3);
      font-size: var(--uik-typography-font-size-2);
      line-height: var(--uik-typography-line-height-3);
      color: oklch(var(--uik-text-inverse));
      pointer-events: none;
      background-color: oklch(var(--uik-text-strong));
      border-color: oklch(var(--uik-border-default) / var(--uik-opacity-0));
      box-shadow: var(--uik-shadow-2);
    }
  `,
];
