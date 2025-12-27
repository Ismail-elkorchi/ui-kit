import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { styles } from "./styles";

/**
 * Progress indicator with determinate and indeterminate modes.
 * @attr value
 * @attr max
 * @attr indeterminate (boolean)
 * @part base
 * @a11y Forward aria-label and aria-labelledby to the internal <progress>.
 * @cssprop --uik-component-progress-track-bg
 * @cssprop --uik-component-progress-bar-bg
 * @cssprop --uik-component-progress-height
 * @cssprop --uik-component-progress-min-width
 * @cssprop --uik-component-progress-radius
 */
@customElement("uik-progress")
export class UikProgress extends LitElement {
  @property({ type: Number }) accessor value = 0;
  @property({ type: Number }) accessor max = 100;
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor indeterminate = false;
  @property({ attribute: "aria-label" }) accessor ariaLabelValue = "";
  @property({ attribute: "aria-labelledby" }) accessor ariaLabelledbyValue = "";

  static override readonly styles = styles;

  override render() {
    const value = this.indeterminate ? undefined : String(this.value);
    const ariaLabel =
      this.ariaLabelValue ||
      (this.ariaLabelledbyValue ? undefined : "Progress");
    return html`
      <progress
        part="base"
        value=${ifDefined(value)}
        max=${this.max}
        aria-label=${ifDefined(ariaLabel)}
        aria-labelledby=${ifDefined(this.ariaLabelledbyValue || undefined)}
      ></progress>
    `;
  }
}
