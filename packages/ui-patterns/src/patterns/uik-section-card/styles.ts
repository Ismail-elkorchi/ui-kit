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
    gap: var(--uik-component-section-card-gap);
  }

  .header {
    display: flex;
    flex-wrap: wrap;
    gap: var(--uik-component-section-card-gap);
    align-items: center;
    justify-content: space-between;
  }

  .title {
    display: flex;
    flex-direction: column;
    gap: var(--uik-component-section-card-gap);
    min-width: 0;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--uik-component-section-card-gap);
    align-items: center;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: var(--uik-component-section-card-gap);
    min-width: 0;
  }
`;
