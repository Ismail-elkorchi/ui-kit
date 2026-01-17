import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { styles } from "./styles.js";

/**
 * Flex stack for layout spacing and alignment.
 * @attr direction (vertical | horizontal)
 * @attr gap (1-6)
 * @attr align
 * @attr justify
 * @slot default
 * @part base
 * @a11y Use semantic wrappers for landmark content.
 * @cssprop --uik-component-stack-gap-{1..6}
 */
@customElement("uik-stack")
export class UikStack extends LitElement {
  @property({ type: String, reflect: true, useDefault: true })
  accessor direction: "vertical" | "horizontal" = "vertical";
  @property({ type: String, reflect: true, useDefault: true }) accessor gap:
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6" = "3";
  @property({ type: String, reflect: true, useDefault: true }) accessor align:
    | "start"
    | "center"
    | "end"
    | "stretch" = "stretch";
  @property({ type: String, reflect: true, useDefault: true })
  accessor justify: "start" | "center" | "end" | "between" = "start";

  static override readonly styles = styles;

  override render() {
    return html`
      <div part="base" class="stack">
        <slot></slot>
      </div>
    `;
  }
}
