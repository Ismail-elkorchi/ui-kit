import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { styles } from "./styles";

/**
 * Loading spinner with tone and size variations.
 * @attr size (sm | md | lg)
 * @attr tone (default | muted | primary | danger | success | warning | info)
 * @part base
 * @a11y Add aria-label if the spinner is meaningful.
 * @cssprop --uik-component-spinner-size-{sm|md|lg}
 * @cssprop --uik-component-spinner-track
 * @cssprop --uik-component-spinner-indicator-{default|muted|primary|danger|success|warning|info}
 */
@customElement("uik-spinner")
export class UikSpinner extends LitElement {
  @property({ type: String, reflect: true, useDefault: true }) accessor size:
    | "sm"
    | "md"
    | "lg" = "md";
  @property({ type: String, reflect: true, useDefault: true }) accessor tone:
    | "default"
    | "muted"
    | "primary"
    | "danger"
    | "success"
    | "warning"
    | "info" = "default";

  static override readonly styles = styles;

  override render() {
    return html`
      <span part="base" class="spinner" role="status" aria-live="polite"></span>
    `;
  }
}
