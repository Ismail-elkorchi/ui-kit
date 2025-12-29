import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { styles } from "./styles";

/**
 * Definition list wrapper for label/value metadata.
 * @attr density (comfortable | compact)
 * @slot default (dt + dd pairs)
 * @part base
 * @a11y Use dt/dd pairs for correct definition list semantics.
 * @cssprop --uik-component-description-list-term-width
 * @cssprop --uik-component-description-list-row-gap
 * @cssprop --uik-component-description-list-column-gap
 * @cssprop --uik-component-description-list-row-gap-compact
 * @cssprop --uik-component-description-list-column-gap-compact
 * @cssprop --uik-component-description-list-term-font-family
 * @cssprop --uik-component-description-list-term-font-size
 * @cssprop --uik-component-description-list-term-line-height
 * @cssprop --uik-component-description-list-term-font-weight
 * @cssprop --uik-component-description-list-term-color
 * @cssprop --uik-component-description-list-value-font-family
 * @cssprop --uik-component-description-list-value-font-size
 * @cssprop --uik-component-description-list-value-line-height
 * @cssprop --uik-component-description-list-value-font-weight
 * @cssprop --uik-component-description-list-value-color
 */
@customElement("uik-description-list")
export class UikDescriptionList extends LitElement {
  @property({ type: String, reflect: true, useDefault: true })
  accessor density: "comfortable" | "compact" = "comfortable";

  static override readonly styles = styles;

  override render() {
    return html`
      <dl part="base" class="list">
        <div class="group">
          <slot></slot>
        </div>
      </dl>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-description-list": UikDescriptionList;
  }
}
