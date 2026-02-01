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
    gap: var(--uik-component-section-card-gap-md);
  }

  .header {
    display: flex;
    flex-wrap: wrap;
    gap: var(--uik-component-section-card-gap-md);
    align-items: center;
    justify-content: space-between;
  }

  .title {
    display: flex;
    flex-direction: column;
    gap: var(--uik-component-section-card-gap-sm);
    min-width: 0;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--uik-component-section-card-gap-sm);
    align-items: center;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: var(--uik-component-section-card-gap-md);
    min-width: 0;
  }
`;
