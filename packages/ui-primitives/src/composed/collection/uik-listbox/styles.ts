import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .listbox {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--uik-component-listbox-gap);
    max-height: var(--uik-component-listbox-max-height);
    padding: var(--uik-component-listbox-padding);
    overflow-y: auto;
    color: oklch(var(--uik-component-listbox-fg));
    background-color: oklch(var(--uik-component-listbox-bg));
    border: var(--uik-component-listbox-border-width) solid
      oklch(var(--uik-component-listbox-border));
    border-radius: var(--uik-component-listbox-radius);
    box-shadow: var(--uik-component-listbox-shadow);
  }

  :host([data-empty]) .listbox {
    padding: var(--uik-component-listbox-empty-padding);
  }

  @media (forced-colors: active) {
    .listbox {
      border-color: CanvasText;
      box-shadow: none;
    }
  }
`;
