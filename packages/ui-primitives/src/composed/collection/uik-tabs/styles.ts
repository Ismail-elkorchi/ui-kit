import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .tablist {
    display: flex;
    gap: var(--uik-component-tabs-gap);
    align-items: center;
    border-bottom: var(--uik-component-tabs-border-width) solid
      oklch(var(--uik-component-tabs-border));
  }

  :host([orientation="vertical"]) .tablist {
    flex-direction: column;
    align-items: stretch;
    border-inline-end: var(--uik-component-tabs-border-width) solid
      oklch(var(--uik-component-tabs-border));
    border-bottom: none;
  }

  .panels {
    padding: var(--uik-space-0);
  }
`;
