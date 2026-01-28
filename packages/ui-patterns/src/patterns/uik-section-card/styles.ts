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
  }

  .header {
    display: flex;
    flex-wrap: wrap;
    gap: var(--uik-space-3);
    align-items: center;
    justify-content: space-between;
  }

  .title {
    display: flex;
    flex-direction: column;
    gap: var(--uik-space-2);
    min-width: 0;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--uik-space-2);
    align-items: center;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: var(--uik-space-3);
    min-width: 0;
  }
`;
