import {css} from 'lit';
import type {CSSResultGroup} from 'lit';

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
    z-index: var(--uik-z-local-overlay);
    min-width: max-content;
    padding: var(--uik-space-3) var(--uik-space-4);
    color: oklch(var(--uik-text-default));
    background-color: oklch(var(--uik-surface-popover));
    border: var(--uik-border-width-1) solid oklch(var(--uik-border-default));
    border-radius: var(--uik-radius-3);
    box-shadow: var(--uik-elevation-popover-shadow);
  }

  .panel[data-placement='bottom-start'],
  .panel[data-placement='bottom'],
  .panel[data-placement='bottom-end'] {
    top: calc(100% + var(--uik-space-2));
  }

  .panel[data-placement='top-start'],
  .panel[data-placement='top'],
  .panel[data-placement='top-end'] {
    bottom: calc(100% + var(--uik-space-2));
  }

  .panel[data-placement='bottom-start'],
  .panel[data-placement='top-start'] {
    left: 0;
  }

  .panel[data-placement='bottom'],
  .panel[data-placement='top'] {
    left: 50%;
    transform: translateX(-50%);
  }

  .panel[data-placement='bottom-end'],
  .panel[data-placement='top-end'] {
    right: 0;
  }

  .panel[hidden] {
    display: none;
  }
`;
