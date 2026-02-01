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
    gap: var(--uik-component-page-hero-gap-xl);
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
    gap: var(--uik-component-page-hero-gap-lg);
    min-width: 0;
  }

  .eyebrow {
    display: flex;
    flex-wrap: wrap;
    gap: var(--uik-component-page-hero-gap-sm);
    align-items: center;
  }

  .title {
    display: flex;
    flex-direction: column;
    gap: var(--uik-component-page-hero-gap-sm);
  }

  .summary {
    display: flex;
    flex-direction: column;
    gap: var(--uik-component-page-hero-gap-sm);
    max-inline-size: var(--uik-component-page-hero-summary-max-width);
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--uik-component-page-hero-gap-sm);
  }

  .panel {
    display: flex;
    flex-direction: column;
    gap: var(--uik-component-page-hero-gap-md);
  }

  .panel-surface {
    width: 100%;
  }

  .panel-content {
    display: flex;
    flex-direction: column;
    gap: var(--uik-component-page-hero-gap-md);
  }
`;
