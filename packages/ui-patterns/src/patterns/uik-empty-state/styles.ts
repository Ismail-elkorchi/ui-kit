import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .surface {
    width: 100%;
  }

  .content {
    display: grid;
    gap: var(--uik-component-empty-state-gap);
    place-items: center;
    padding: var(--uik-component-empty-state-padding);
    text-align: center;
  }

  .body {
    display: block;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--uik-component-empty-state-gap);
    align-items: center;
    justify-content: center;
  }
`;
