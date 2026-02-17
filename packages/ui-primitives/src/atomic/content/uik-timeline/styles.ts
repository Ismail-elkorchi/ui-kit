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
    padding: var(--uik-space-0);
    margin: var(--uik-space-0);
    list-style: none;
  }

  :host([density="compact"]) .timeline {
    gap: var(--uik-component-timeline-gap-compact);
  }

  .item {
    position: relative;
    display: grid;
    grid-template-columns:
      var(--uik-component-timeline-marker-size)
      minmax(0, 1fr);
    column-gap: var(--uik-component-timeline-column-gap);
    min-width: 0;
    padding-block: var(--uik-component-timeline-item-padding-y);
  }

  :host([density="compact"]) .item {
    column-gap: var(--uik-component-timeline-column-gap-compact);
    padding-block: var(--uik-component-timeline-item-padding-y-compact);
  }

  .item::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(
      var(--uik-component-timeline-marker-size) /
        2 - var(--uik-component-timeline-line-thickness) / 2
    );
    width: var(--uik-component-timeline-line-thickness);
    content: "";
    background-color: oklch(var(--uik-component-timeline-line-color));
  }

  .item:first-child::before {
    top: calc(var(--uik-component-timeline-marker-size) / 2);
  }

  .item:last-child::before {
    bottom: calc(var(--uik-component-timeline-marker-size) / 2);
  }

  .marker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--uik-component-timeline-marker-size);
    height: var(--uik-component-timeline-marker-size);
    margin-top: var(--uik-component-timeline-marker-offset);
    background-color: oklch(var(--uik-component-timeline-marker-bg));
    border: var(--uik-component-timeline-marker-border-width) solid
      oklch(var(--uik-component-timeline-line-color));
    border-radius: var(--uik-radius-full);
  }

  :host([density="compact"]) .marker {
    margin-top: var(--uik-component-timeline-marker-offset-compact);
  }

  .content {
    display: grid;
    gap: var(--uik-space-1);
    min-width: 0;
  }

  .header {
    display: flex;
    flex-wrap: wrap;
    gap: var(--uik-space-2);
    align-items: baseline;
  }

  .title {
    font-family: var(--uik-typography-font-family-sans);
    font-size: var(--uik-typography-font-size-2);
    font-weight: var(--uik-typography-font-weight-medium);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-text-default));
  }

  .meta {
    font-family: var(--uik-typography-font-family-sans);
    font-size: var(--uik-typography-font-size-1);
    font-weight: var(--uik-typography-font-weight-medium);
    line-height: var(--uik-typography-line-height-1);
    color: oklch(var(--uik-text-muted));
  }

  .description {
    font-family: var(--uik-typography-font-family-sans);
    font-size: var(--uik-typography-font-size-1);
    font-weight: var(--uik-typography-font-weight-regular);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-text-default));
  }

  .status {
    font-family: var(--uik-typography-font-family-sans);
    font-size: var(--uik-typography-font-size-1);
    font-weight: var(--uik-typography-font-weight-medium);
    line-height: var(--uik-typography-line-height-1);
    color: oklch(var(--uik-text-muted));
  }

  .error {
    padding: var(--uik-space-3);
    font-family: var(--uik-typography-font-family-sans);
    font-size: var(--uik-typography-font-size-2);
    font-weight: var(--uik-typography-font-weight-medium);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-text-danger));
    background-color: oklch(var(--uik-surface-danger));
    border: var(--uik-border-width-1) solid oklch(var(--uik-border-danger));
    border-radius: var(--uik-radius-3);
  }

  @media (forced-colors: active) {
    .item::before {
      background-color: CanvasText;
    }

    .marker {
      forced-color-adjust: none;
      background-color: Canvas;
      border-color: CanvasText;
    }

    .title,
    .meta,
    .description,
    .status {
      color: CanvasText;
    }

    .error {
      color: CanvasText;
      forced-color-adjust: none;
      background-color: Canvas;
      border-color: CanvasText;
    }
  }
`;
