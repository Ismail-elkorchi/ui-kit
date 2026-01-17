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
    gap: var(--uik-space-3);
    place-items: center;
    padding: var(--uik-space-6);
    text-align: center;
  }

  .body {
    display: block;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--uik-space-2);
    align-items: center;
    justify-content: center;
  }
`;
