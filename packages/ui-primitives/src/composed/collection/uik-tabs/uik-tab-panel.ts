import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { panelStyles } from "./panel-styles";

/**
 * Tab panel for use inside uik-tabs.
 * @attr value
 * @slot default (panel content)
 * @part base
 * @cssprop --uik-component-tabs-panel-padding
 */
@customElement("uik-tab-panel")
export class UikTabPanel extends LitElement {
  @property({ type: String, reflect: true }) accessor value = "";

  static override readonly styles = panelStyles;

  override connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute("role")) this.setAttribute("role", "tabpanel");
    if (!this.slot) this.slot = "panel";
    if (!this.hasAttribute("tabindex")) this.tabIndex = 0;
  }

  override render() {
    return html`<div part="base" class="panel"><slot></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-tab-panel": UikTabPanel;
  }
}
