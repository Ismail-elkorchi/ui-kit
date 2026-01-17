import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { styles } from "./styles.js";

/**
 * Tokenized text wrapper for size, weight, tone, and truncation.
 * @attr as (span | p | div | label)
 * @attr size (sm | md | lg | xl)
 * @attr weight
 * @attr tone
 * @attr truncate (boolean)
 * @slot default
 * @part base
 * @a11y Use as=label for form labels when needed.
 * @cssprop --uik-component-text-size-{sm|md|lg|xl}
 * @cssprop --uik-component-text-line-height-{sm|md|lg|xl}
 * @cssprop --uik-component-text-weight-{regular|medium|semibold|bold}
 * @cssprop --uik-component-text-color-{default|muted|strong|danger|success|warning|info}
 */
@customElement("uik-text")
export class UikText extends LitElement {
  @property({ type: String }) accessor as: "p" | "span" | "div" | "label" =
    "span";
  @property({ type: String, reflect: true, useDefault: true }) accessor size:
    | "sm"
    | "md"
    | "lg"
    | "xl" = "md";
  @property({ type: String, reflect: true, useDefault: true }) accessor weight:
    | "regular"
    | "medium"
    | "semibold"
    | "bold" = "regular";
  @property({ type: String, reflect: true, useDefault: true }) accessor tone:
    | "default"
    | "muted"
    | "strong"
    | "danger"
    | "success"
    | "warning"
    | "info" = "default";
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor truncate = false;

  static override readonly styles = styles;

  override render() {
    switch (this.as) {
      case "p":
        return html`
          <p part="base" class="text">
            <slot></slot>
          </p>
        `;
      case "div":
        return html`
          <div part="base" class="text">
            <slot></slot>
          </div>
        `;
      case "label":
        return html`
          <label part="base" class="text">
            <slot></slot>
          </label>
        `;
      case "span":
      default:
        return html`
          <span part="base" class="text">
            <slot></slot>
          </span>
        `;
    }
  }
}
