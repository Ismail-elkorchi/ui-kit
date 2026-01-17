import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { itemStyles } from "./item-styles.js";
import { createId } from "../../../internal/index.js";

/**
 * Menu item for use inside uik-menu.
 * @attr value
 * @attr disabled (boolean)
 * @attr active (boolean)
 * @attr tabIndexValue (number)
 * @slot default (label)
 * @part base
 * @cssprop --uik-component-menu-item-* (bg, fg, padding, radius, height, state colors)
 */
@customElement("uik-menu-item")
export class UikMenuItem extends LitElement {
  @property({ type: String, reflect: true }) accessor value = "";
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor disabled = false;
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor active = false;
  @property({ type: Number }) accessor tabIndexValue = -1;

  private readonly itemId = createId("uik-menu-item");

  static override readonly styles = itemStyles;

  override connectedCallback() {
    super.connectedCallback();
    if (!this.id) this.id = this.itemId;
    if (!this.hasAttribute("role")) this.setAttribute("role", "menuitem");
    this.syncAccessibility();
  }

  override updated() {
    this.syncAccessibility();
  }

  private syncAccessibility() {
    this.tabIndex = this.disabled ? -1 : this.tabIndexValue;
    if (this.disabled) {
      this.setAttribute("aria-disabled", "true");
    } else {
      this.removeAttribute("aria-disabled");
    }
  }

  override render() {
    return html`<div part="base" class="item"><slot></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-menu-item": UikMenuItem;
  }
}
