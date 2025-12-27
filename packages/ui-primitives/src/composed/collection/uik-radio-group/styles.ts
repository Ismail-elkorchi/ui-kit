import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .field {
    display: grid;
    gap: var(--uik-space-2);
  }

  .label {
    font-size: var(--uik-typography-font-size-2);
    font-weight: var(--uik-typography-font-weight-medium);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-text-strong));
  }

  .control {
    display: flex;
    flex-direction: column;
    gap: var(--uik-component-radio-group-gap);
  }

  :host([orientation="horizontal"]) .control {
    flex-flow: row wrap;
    align-items: center;
  }

  .hint {
    font-size: var(--uik-typography-font-size-1);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-text-muted));
  }

  .error {
    font-size: var(--uik-typography-font-size-1);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-text-danger));
  }

  :host([disabled]) .label {
    color: oklch(var(--uik-text-disabled));
  }
`;
