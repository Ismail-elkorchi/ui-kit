import { css } from "lit";

export const optionStyles = css`
  :host {
    display: block;
    outline: none;
  }

  .option {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    width: 100%;
    min-height: var(--uik-component-listbox-item-height);
    padding-block: var(--uik-component-listbox-item-padding-y);
    padding-inline: var(--uik-component-listbox-item-padding-x);
    color: oklch(var(--uik-component-listbox-item-fg));
    cursor: pointer;
    user-select: none;
    background-color: oklch(var(--uik-component-listbox-item-bg));
    border-radius: var(--uik-component-listbox-item-radius);
  }

  :host(:not([disabled])) .option:hover {
    background-color: oklch(var(--uik-component-listbox-item-hover-bg));
  }

  :host([active]) .option {
    background-color: oklch(var(--uik-component-listbox-item-active-bg));
  }

  :host([selected]) .option {
    color: oklch(var(--uik-component-listbox-item-selected-fg));
    background-color: oklch(var(--uik-component-listbox-item-selected-bg));
  }

  :host([disabled]) .option {
    color: oklch(var(--uik-component-listbox-item-disabled-fg));
    cursor: not-allowed;
  }

  :host(:focus-visible) .option {
    outline: none;
    box-shadow:
      0 0 0 var(--uik-focus-ring-offset-default)
        oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0
        calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
        oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
  }

  @media (forced-colors: active) {
    :host(:focus-visible) .option {
      outline: var(--uik-border-width-1) solid currentcolor;
      outline-offset: var(--uik-space-1);
      box-shadow: none;
    }
  }
`;
