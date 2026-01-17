import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { styles } from "./styles.js";

/**
 * Tokenized heading typography with semantic levels.
 * @attr level (1-6)
 * @attr tone (default | strong | muted | danger | success | warning | info)
 * @slot default
 * @part base
 * @a11y Renders the matching native heading element.
 * @cssprop --uik-component-heading-size-{1..6}
 * @cssprop --uik-component-heading-line-height-{1..6}
 * @cssprop --uik-component-heading-weight
 * @cssprop --uik-component-heading-color-{default|strong|muted|danger|success|warning|info}
 */
@customElement("uik-heading")
export class UikHeading extends LitElement {
  @property({ type: Number, reflect: true, useDefault: true }) accessor level =
    2;
  @property({ type: String, reflect: true, useDefault: true }) accessor tone:
    | "default"
    | "strong"
    | "muted"
    | "danger"
    | "success"
    | "warning"
    | "info" = "strong";

  static override readonly styles = styles;

  private get resolvedLevel() {
    if (this.level < 1) return 1;
    if (this.level > 6) return 6;
    return this.level;
  }

  override render() {
    switch (this.resolvedLevel) {
      case 1:
        return html`
          <h1 part="base" class="heading">
            <slot></slot>
          </h1>
        `;
      case 2:
        return html`
          <h2 part="base" class="heading">
            <slot></slot>
          </h2>
        `;
      case 3:
        return html`
          <h3 part="base" class="heading">
            <slot></slot>
          </h3>
        `;
      case 4:
        return html`
          <h4 part="base" class="heading">
            <slot></slot>
          </h4>
        `;
      case 5:
        return html`
          <h5 part="base" class="heading">
            <slot></slot>
          </h5>
        `;
      case 6:
      default:
        return html`
          <h6 part="base" class="heading">
            <slot></slot>
          </h6>
        `;
    }
  }
}
