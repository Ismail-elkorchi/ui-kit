import { css } from "lit";

export const tabStyles = css`
  :host {
    display: inline-flex;
    outline: none;
  }

  .tab {
    position: relative;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: var(--uik-component-tabs-tab-height);
    padding-block: var(--uik-component-tabs-tab-padding-y);
    padding-inline: var(--uik-component-tabs-tab-padding-x);
    color: oklch(var(--uik-component-tabs-tab-fg));
    cursor: pointer;
    user-select: none;
    background-color: oklch(var(--uik-component-tabs-tab-bg));
    border-radius: var(--uik-component-tabs-tab-radius);
  }

  :host(:not([disabled])) .tab:hover {
    background-color: oklch(var(--uik-component-tabs-tab-hover-bg));
  }

  :host([selected]) .tab {
    color: oklch(var(--uik-component-tabs-tab-active-fg));
    background-color: oklch(var(--uik-component-tabs-tab-active-bg));
  }

  :host([disabled]) .tab {
    color: oklch(var(--uik-component-tabs-tab-disabled-fg));
    cursor: not-allowed;
  }

  .indicator {
    position: absolute;
    inset-block-end: var(--uik-space-0);
    inset-inline: var(--uik-space-0);
    height: var(--uik-component-tabs-tab-indicator-size);
    background-color: oklch(var(--uik-component-tabs-tab-indicator-bg));
    border-radius: var(--uik-component-tabs-tab-indicator-size);
    opacity: 0;
  }

  :host([selected]) .indicator {
    opacity: 1;
  }

  :host([data-orientation="vertical"]) .indicator {
    inset-block: var(--uik-space-0);
    inset-inline: var(--uik-space-0) auto;
    width: var(--uik-component-tabs-tab-indicator-size);
    height: auto;
  }

  :host(:focus-visible) .tab {
    outline: none;
    box-shadow:
      0 0 0 var(--uik-focus-ring-offset-default)
        oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0
        calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
        oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
  }

  @media (forced-colors: active) {
    :host(:focus-visible) .tab {
      outline: var(--uik-border-width-1) solid currentcolor;
      outline-offset: var(--uik-space-1);
      box-shadow: none;
    }

    .indicator {
      background-color: currentcolor;
    }
  }
`;
