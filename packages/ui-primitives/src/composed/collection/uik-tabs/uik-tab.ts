import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { tabStyles } from "./tab-styles";

/**
 * Tab element for use inside uik-tabs.
 * @attr value
 * @attr selected (boolean)
 * @attr disabled (boolean)
 * @attr tabIndexValue (number)
 * @slot default (label)
 * @part base
 * @part indicator
 * @cssprop --uik-component-tabs-tab-* (bg, fg, padding, radius, indicator)
 */
@customElement("uik-tab")
export class UikTab extends LitElement {
  @property({ type: String, reflect: true }) accessor value = "";
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor selected = false;
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor disabled = false;
  @property({ type: Number }) accessor tabIndexValue = -1;

  static override readonly styles = tabStyles;

  override connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute("role")) this.setAttribute("role", "tab");
    if (!this.slot) this.slot = "tab";
    this.syncAccessibility();
  }

  override updated() {
    this.syncAccessibility();
  }

  private syncAccessibility() {
    this.tabIndex = this.disabled ? -1 : this.tabIndexValue;
    this.setAttribute("aria-selected", this.selected ? "true" : "false");
    if (this.disabled) {
      this.setAttribute("aria-disabled", "true");
    } else {
      this.removeAttribute("aria-disabled");
    }
  }

  override render() {
    return html`
      <div part="base" class="tab">
        <slot></slot>
        <span part="indicator" class="indicator"></span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-tab": UikTab;
  }
}
