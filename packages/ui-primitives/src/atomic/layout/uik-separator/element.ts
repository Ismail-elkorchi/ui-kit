import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { styles } from "./styles";

/**
 * Horizontal or vertical separator line.
 * @attr orientation (horizontal | vertical)
 * @part base
 * @a11y Horizontal renders <hr>; vertical uses role="separator".
 * @cssprop --uik-separator-color
 * @cssprop --uik-separator-thickness
 * @cssprop --uik-separator-radius
 */
@customElement("uik-separator")
export class UikSeparator extends LitElement {
  @property({ type: String, reflect: true }) accessor orientation:
    | "horizontal"
    | "vertical" = "horizontal";

  static override readonly styles = styles;

  override render() {
    const isHorizontal = this.orientation === "horizontal";
    if (isHorizontal) {
      return html`<hr part="base" class="separator horizontal" />`;
    }
    return html`<div
      part="base"
      class="separator vertical"
      role="separator"
      aria-orientation="vertical"
    ></div>`;
  }
}
