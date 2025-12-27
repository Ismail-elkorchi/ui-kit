import { css } from "lit";

export const panelStyles = css`
  :host {
    display: block;
  }

  :host([hidden]) {
    display: none;
  }

  .panel {
    box-sizing: border-box;
    padding: var(--uik-component-tabs-panel-padding);
  }
`;
