import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .surface {
    width: 100%;
  }

  .content {
    width: 100%;
  }

  .layout {
    display: grid;
    gap: var(--uik-space-5);
    align-items: start;
  }

  .layout[data-has-panel="true"] {
    grid-template-columns: repeat(
      auto-fit,
      minmax(min(100%, var(--uik-layout-panel-width-md)), 1fr)
    );
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: var(--uik-space-4);
    min-width: 0;
  }

  .eyebrow {
    display: flex;
    flex-wrap: wrap;
    gap: var(--uik-space-2);
    align-items: center;
  }

  .title {
    display: flex;
    flex-direction: column;
    gap: var(--uik-space-2);
  }

  .summary {
    display: flex;
    flex-direction: column;
    gap: var(--uik-space-2);
    max-inline-size: var(--uik-layout-panel-width-lg);
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--uik-space-2);
  }

  .panel {
    display: flex;
    flex-direction: column;
    gap: var(--uik-space-3);
  }

  .panel-surface {
    width: 100%;
  }

  .panel-content {
    display: flex;
    flex-direction: column;
    gap: var(--uik-space-3);
  }
`;
