import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { styles } from "./styles.js";

/**
 * Sized icon wrapper for inline SVG content.
 * @attr size (xs | sm | md | lg)
 * @attr tone (default | muted | danger | success | warning | info | inverse)
 * @slot default (svg)
 * @part base
 * @a11y Use aria-label for meaningful icons; icons are aria-hidden by default when unlabeled.
 * @cssprop --uik-component-icon-size-{xs|sm|md|lg}
 * @cssprop --uik-component-icon-color-{default|muted|danger|success|warning|info|inverse}
 */
@customElement("uik-icon")
export class UikIcon extends LitElement {
  @property({ type: String, reflect: true, useDefault: true }) accessor size:
    | "xs"
    | "sm"
    | "md"
    | "lg" = "md";
  @property({ type: String, reflect: true, useDefault: true }) accessor tone:
    | "default"
    | "muted"
    | "danger"
    | "success"
    | "warning"
    | "info"
    | "inverse" = "default";
  @property({ attribute: "aria-label" }) accessor ariaLabelValue = "";
  @property({ attribute: "aria-hidden" }) accessor ariaHiddenValue = "";

  static override readonly styles = styles;

  override render() {
    const hasLabel = this.ariaLabelValue.trim().length > 0;
    const hasHidden = this.ariaHiddenValue.trim().length > 0;
    const resolvedHidden = hasHidden
      ? this.ariaHiddenValue
      : hasLabel
        ? undefined
        : "true";
    const resolvedRole = hasLabel ? "img" : undefined;
    return html`
      <span
        part="base"
        class="icon"
        role=${ifDefined(resolvedRole)}
        aria-label=${ifDefined(hasLabel ? this.ariaLabelValue : undefined)}
        aria-hidden=${ifDefined(resolvedHidden)}
      >
        <slot></slot>
      </span>
    `;
  }
}
