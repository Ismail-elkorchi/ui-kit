import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .timeline {
    display: flex;
    flex-direction: column;
    gap: var(--uik-component-timeline-gap);
    margin: var(--uik-space-0);
    padding: var(--uik-space-0);
    list-style: none;
  }

  :host([density="compact"]) .timeline {
    gap: var(--uik-component-timeline-gap-compact);
  }

  .item {
    position: relative;
    display: grid;
    grid-template-columns: var(--uik-component-timeline-marker-size) minmax(
        0,
        1fr
      );
    column-gap: var(--uik-component-timeline-item-gap);
    padding-block: var(--uik-component-timeline-item-padding-y);
    min-width: 0;
  }

  :host([density="compact"]) .item {
    column-gap: var(--uik-component-timeline-item-gap-compact);
    padding-block: var(--uik-component-timeline-item-padding-y-compact);
  }

  .item::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(
      var(--uik-component-timeline-marker-size) / 2 -
        var(--uik-component-timeline-line-width) / 2
    );
    width: var(--uik-component-timeline-line-width);
    background-color: oklch(var(--uik-component-timeline-line));
  }

  .item:first-child::before {
    top: calc(var(--uik-component-timeline-marker-size) / 2);
  }

  .item:last-child::before {
    bottom: calc(var(--uik-component-timeline-marker-size) / 2);
  }

  .marker {
    width: var(--uik-component-timeline-marker-size);
    height: var(--uik-component-timeline-marker-size);
    border-radius: var(--uik-radius-round);
    border: var(--uik-component-timeline-marker-border-width) solid
      oklch(var(--uik-component-timeline-marker-border));
    background-color: oklch(var(--uik-component-timeline-marker-bg));
    margin-top: var(--uik-space-1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  :host([density="compact"]) .marker {
    margin-top: var(--uik-space-0);
  }

  .content {
    display: grid;
    gap: var(--uik-space-1);
    min-width: 0;
  }

  .header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--uik-space-2);
  }

  .title {
    font-family: var(--uik-typography-font-family-sans);
    font-size: var(--uik-typography-font-size-2);
    font-weight: var(--uik-typography-font-weight-medium);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-component-timeline-title-fg));
  }

  .meta {
    font-family: var(--uik-typography-font-family-sans);
    font-size: var(--uik-typography-font-size-1);
    font-weight: var(--uik-typography-font-weight-medium);
    line-height: var(--uik-typography-line-height-1);
    color: oklch(var(--uik-component-timeline-meta-fg));
  }

  .description {
    font-family: var(--uik-typography-font-family-sans);
    font-size: var(--uik-typography-font-size-1);
    font-weight: var(--uik-typography-font-weight-regular);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-component-timeline-description-fg));
  }

  .status {
    font-family: var(--uik-typography-font-family-sans);
    font-size: var(--uik-typography-font-size-1);
    font-weight: var(--uik-typography-font-weight-medium);
    line-height: var(--uik-typography-line-height-1);
    color: oklch(var(--uik-component-timeline-meta-fg));
  }

  .error {
    padding: var(--uik-space-3);
    font-family: var(--uik-typography-font-family-sans);
    font-size: var(--uik-typography-font-size-2);
    font-weight: var(--uik-typography-font-weight-medium);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-text-danger));
    border: var(--uik-border-width-1) solid oklch(var(--uik-border-danger));
    border-radius: var(--uik-radius-3);
    background-color: oklch(var(--uik-surface-danger));
  }

  @media (forced-colors: active) {
    .item::before {
      background-color: CanvasText;
    }

    .marker {
      border-color: CanvasText;
      background-color: Canvas;
      forced-color-adjust: none;
    }

    .title,
    .meta,
    .description,
    .status {
      color: CanvasText;
    }

    .error {
      background-color: Canvas;
      border-color: CanvasText;
      color: CanvasText;
      forced-color-adjust: none;
    }
  }
`;
