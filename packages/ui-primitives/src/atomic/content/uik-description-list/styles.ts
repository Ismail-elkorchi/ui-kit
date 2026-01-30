import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .list {
    display: grid;
    grid-template-columns:
      minmax(0, var(--uik-component-description-list-term-width))
      minmax(0, 1fr);
    gap: var(--uik-component-description-list-row-gap)
      var(--uik-component-description-list-column-gap);
    margin: var(--uik-space-0);
  }

  .group {
    display: contents;
  }

  :host([layout="stacked"]) .list,
  :host([data-uik-layout-stacked]) .list {
    grid-template-columns: minmax(0, 1fr);
    column-gap: var(--uik-space-0);
  }

  :host([density="compact"]) .list {
    gap: var(--uik-component-description-list-row-gap-compact)
      var(--uik-component-description-list-column-gap-compact);
  }

  ::slotted(dt) {
    margin: var(--uik-space-0);
    font-family: var(--uik-component-description-list-term-font-family);
    font-size: var(--uik-component-description-list-term-font-size);
    font-weight: var(--uik-component-description-list-term-font-weight);
    line-height: var(--uik-component-description-list-term-line-height);
    color: oklch(var(--uik-component-description-list-term-color));
  }

  ::slotted(dd) {
    min-width: 0;
    margin: var(--uik-space-0);
    font-family: var(--uik-component-description-list-value-font-family);
    font-size: var(--uik-component-description-list-value-font-size);
    font-weight: var(--uik-component-description-list-value-font-weight);
    line-height: var(--uik-component-description-list-value-line-height);
    color: oklch(var(--uik-component-description-list-value-color));
    overflow-wrap: anywhere;
  }
`;
