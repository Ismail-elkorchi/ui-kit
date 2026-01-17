import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { optionStyles } from "./option-styles.js";
import { createId } from "../../../internal/index.js";

/**
 * Listbox option for use inside uik-listbox.
 * @attr value
 * @attr selected (boolean)
 * @attr disabled (boolean)
 * @attr active (boolean)
 * @attr tabIndexValue (number)
 * @slot default (label)
 * @part base
 * @cssprop --uik-component-listbox-item-* (bg, fg, padding, radius, height, state colors)
 */
@customElement("uik-option")
export class UikOption extends LitElement {
  @property({ type: String, reflect: true }) accessor value = "";
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor selected = false;
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor disabled = false;
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor active = false;
  @property({ type: Number }) accessor tabIndexValue = -1;

  private readonly optionId = createId("uik-option");

  static override readonly styles = optionStyles;

  override connectedCallback() {
    super.connectedCallback();
    if (!this.id) this.id = this.optionId;
    if (!this.hasAttribute("role")) this.setAttribute("role", "option");
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
    return html`<div part="base" class="option"><slot></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-option": UikOption;
  }
}
