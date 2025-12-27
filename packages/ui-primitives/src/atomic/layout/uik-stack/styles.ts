import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--uik-component-stack-gap-3);
    align-items: stretch;
    justify-content: flex-start;
  }

  :host([direction="horizontal"]) .stack {
    flex-direction: row;
  }

  :host([align="start"]) .stack {
    align-items: flex-start;
  }

  :host([align="center"]) .stack {
    align-items: center;
  }

  :host([align="end"]) .stack {
    align-items: flex-end;
  }

  :host([justify="start"]) .stack {
    justify-content: flex-start;
  }

  :host([justify="center"]) .stack {
    justify-content: center;
  }

  :host([justify="end"]) .stack {
    justify-content: flex-end;
  }

  :host([justify="between"]) .stack {
    justify-content: space-between;
  }

  :host([gap="1"]) .stack {
    gap: var(--uik-component-stack-gap-1);
  }

  :host([gap="2"]) .stack {
    gap: var(--uik-component-stack-gap-2);
  }

  :host([gap="3"]) .stack {
    gap: var(--uik-component-stack-gap-3);
  }

  :host([gap="4"]) .stack {
    gap: var(--uik-component-stack-gap-4);
  }

  :host([gap="5"]) .stack {
    gap: var(--uik-component-stack-gap-5);
  }

  :host([gap="6"]) .stack {
    gap: var(--uik-component-stack-gap-6);
  }
`;
