import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .surface {
    width: 100%;
  }

  uik-surface::part(base) {
    overflow: hidden;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--uik-component-example-header-gap);
    padding: var(--uik-component-example-header-padding-y)
      var(--uik-component-example-header-padding-x);
    border-bottom: var(--uik-component-example-border-width) solid
      oklch(var(--uik-component-example-border));
  }

  .title {
    display: flex;
    align-items: center;
    gap: var(--uik-component-example-header-gap);
    min-width: 0;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: var(--uik-component-example-header-gap);
    flex-shrink: 0;
  }

  .tabs {
    --uik-component-tabs-gap: var(--uik-component-example-header-gap);
    --uik-component-tabs-border: var(--uik-component-example-border);
    --uik-component-tabs-border-width: var(
      --uik-component-example-border-width
    );
    --uik-component-tabs-panel-padding: var(
      --uik-component-example-panel-padding
    );
  }

  .panel {
    box-sizing: border-box;
  }

  .preview {
    padding: var(--uik-component-example-preview-padding-y)
      var(--uik-component-example-preview-padding-x);
    background-color: oklch(var(--uik-component-example-preview-bg));
  }

  .code {
    padding: var(--uik-component-example-code-padding-y)
      var(--uik-component-example-code-padding-x);
  }

  @media (forced-colors: active) {
    :host {
      --uik-component-example-border: CanvasText;
      --uik-component-example-preview-bg: Canvas;
    }
  }
`;
