import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }

  .base {
    display: flex;
    width: 100%;
    min-width: var(--uik-space-0);
    height: 100%;
    min-height: var(--uik-space-0);
  }

  :host([orientation="vertical"]) .base {
    flex-direction: column;
  }

  .panel {
    display: block;
    min-width: var(--uik-space-0);
    min-height: var(--uik-space-0);
  }

  .panel-start {
    flex: 0 0
      var(
        --uik-resizable-panels-start-size,
        var(--uik-component-resizable-panels-panel-start-size)
      );
    min-width: var(
      --uik-resizable-panels-min-start,
      var(--uik-component-resizable-panels-panel-min-size)
    );
  }

  .panel-end {
    flex: 1 1 auto;
    min-width: var(
      --uik-resizable-panels-min-end,
      var(--uik-component-resizable-panels-panel-min-size)
    );
  }

  :host([orientation="vertical"]) .panel-start,
  :host([orientation="vertical"]) .panel-end {
    min-width: var(--uik-space-0);
  }

  :host([orientation="vertical"]) .panel-start {
    min-height: var(
      --uik-resizable-panels-min-start,
      var(--uik-component-resizable-panels-panel-min-size)
    );
  }

  :host([orientation="vertical"]) .panel-end {
    min-height: var(
      --uik-resizable-panels-min-end,
      var(--uik-component-resizable-panels-panel-min-size)
    );
  }

  .handle {
    display: flex;
    flex: 0 0 var(--uik-component-resizable-panels-handle-hit);
    align-items: center;
    justify-content: center;
    touch-action: none;
    cursor: col-resize;
    user-select: none;
  }

  :host([orientation="vertical"]) .handle {
    cursor: row-resize;
  }

  .handle-grip {
    width: var(--uik-component-resizable-panels-handle-size);
    height: 100%;
    background-color: oklch(var(--uik-component-resizable-panels-handle-bg));
    border-radius: var(--uik-component-resizable-panels-handle-radius);
    transition: background-color var(--uik-motion-transition-colors);
  }

  :host([orientation="vertical"]) .handle-grip {
    width: 100%;
    height: var(--uik-component-resizable-panels-handle-size);
  }

  .handle:hover .handle-grip {
    background-color: oklch(
      var(--uik-component-resizable-panels-handle-hover-bg)
    );
  }

  .handle:active .handle-grip,
  .base.dragging .handle-grip {
    background-color: oklch(
      var(--uik-component-resizable-panels-handle-active-bg)
    );
  }

  .handle:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 var(--uik-focus-ring-offset-default)
        oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0
        calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
        oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
  }

  @media (forced-colors: active) {
    .handle-grip {
      background-color: CanvasText;
    }

    .handle:focus-visible {
      outline: var(--uik-border-width-1) solid currentcolor;
      outline-offset: var(--uik-space-1);
      box-shadow: none;
    }
  }
`;
