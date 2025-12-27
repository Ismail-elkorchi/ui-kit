import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    flex-shrink: 0;
  }

  .separator {
    background-color: oklch(var(--uik-separator-color));
    border: none;
    border-radius: var(--uik-separator-radius);
  }

  .horizontal {
    width: 100%;
    height: var(--uik-separator-thickness);
  }

  .vertical {
    width: var(--uik-separator-thickness);
    height: 100%;
    min-height: var(--uik-size-control-md);
  }
`;
