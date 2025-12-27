import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    min-width: var(--uik-component-progress-min-width);
  }

  progress {
    width: 100%;
    height: var(--uik-component-progress-height);
    overflow: hidden;
    background-color: oklch(var(--uik-component-progress-track-bg));
    border: none;
    border-radius: var(--uik-component-progress-radius);
  }

  progress::-webkit-progress-bar {
    background-color: oklch(var(--uik-component-progress-track-bg));
    border-radius: var(--uik-component-progress-radius);
  }

  progress::-webkit-progress-value {
    background-color: oklch(var(--uik-component-progress-bar-bg));
    border-radius: var(--uik-component-progress-radius);
  }

  progress::-moz-progress-bar {
    background-color: oklch(var(--uik-component-progress-bar-bg));
    border-radius: var(--uik-component-progress-radius);
  }
`;
