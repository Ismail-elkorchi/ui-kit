import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { styles } from "./styles.js";

/**
 * Simple padded container with background and border hooks.
 * @attr padding (0-6)
 * @attr inline (boolean)
 * @slot default
 * @part base
 * @a11y Presentational wrapper; use semantic HTML inside.
 * @cssprop --uik-component-box-padding-{0..6}
 * @cssprop --uik-component-box-bg
 * @cssprop --uik-component-box-bg-opacity
 * @cssprop --uik-component-box-border-color
 * @cssprop --uik-component-box-border-opacity
 * @cssprop --uik-component-box-border-width
 * @cssprop --uik-component-box-radius
 */
@customElement("uik-box")
export class UikBox extends LitElement {
  @property({ type: String, reflect: true, useDefault: true })
  accessor padding: "0" | "1" | "2" | "3" | "4" | "5" | "6" = "0";
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor inline = false;

  static override readonly styles = styles;

  override render() {
    return html`
      <div part="base" class="box">
        <slot></slot>
      </div>
    `;
  }
}
