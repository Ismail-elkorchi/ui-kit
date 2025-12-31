import { css } from "lit";

export const itemStyles = css`
  :host {
    display: block;
    outline: none;
  }

  .item {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    width: 100%;
    min-height: var(--uik-component-menu-item-height);
    padding-block: var(--uik-component-menu-item-padding-y);
    padding-inline: var(--uik-component-menu-item-padding-x);
    color: oklch(var(--uik-component-menu-item-fg));
    cursor: pointer;
    user-select: none;
    background-color: oklch(var(--uik-component-menu-item-bg));
    border-radius: var(--uik-component-menu-item-radius);
  }

  :host(:not([disabled])) .item:hover {
    background-color: oklch(var(--uik-component-menu-item-hover-bg));
  }

  :host([active]) .item {
    background-color: oklch(var(--uik-component-menu-item-active-bg));
  }

  :host([disabled]) .item {
    color: oklch(var(--uik-component-menu-item-disabled-fg));
    cursor: not-allowed;
  }

  :host(:focus-visible) .item {
    outline: none;
    box-shadow:
      0 0 0 var(--uik-focus-ring-offset-default)
        oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0
        calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
        oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
  }

  @media (forced-colors: active) {
    :host(:focus-visible) .item {
      outline: var(--uik-border-width-1) solid currentcolor;
      outline-offset: var(--uik-space-1);
      box-shadow: none;
    }
  }
`;
