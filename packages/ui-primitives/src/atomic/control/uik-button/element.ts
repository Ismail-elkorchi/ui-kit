import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { styles } from "./styles";
import { getElementInternals } from "../../../internal/form";

/**
 * Primary action control with variants and sizes.
 * @attr variant (solid | danger | outline | secondary | ghost | link)
 * @attr size (default | sm | lg | icon)
 * @attr type (button | submit | reset)
 * @attr tabIndexValue (number)
 * @attr active (boolean)
 * @attr muted (boolean)
 * @attr disabled (boolean)
 * @slot default (label or icon)
 * @part base
 * @event Native button events bubble from the internal <button>.
 * @a11y Forward aria-label, aria-labelledby, aria-describedby, and aria-pressed to the internal button.
 * @a11y Icon-only buttons should provide an accessible name.
 * @cssprop --uik-component-button-base-* (gap, font, focus ring, border)
 * @cssprop --uik-component-button-{solid|ghost|outline|secondary|danger|link}-*
 * @cssprop --uik-component-button-{sm|md|lg}-*
 */
@customElement("uik-button")
export class UikButton extends LitElement {
  static formAssociated = true;

  @property({ type: String, reflect: true }) accessor variant:
    | "solid"
    | "danger"
    | "outline"
    | "secondary"
    | "ghost"
    | "link" = "solid";
  @property({ type: String, reflect: true }) accessor size:
    | "default"
    | "sm"
    | "lg"
    | "icon" = "default";
  @property({ type: String }) accessor type: "button" | "submit" | "reset" =
    "button";
  @property({ type: Number }) accessor tabIndexValue = 0;
  @property({ type: Boolean, reflect: true }) accessor disabled = false;
  @property({ type: Boolean, reflect: true }) accessor active = false;
  @property({ type: Boolean, reflect: true }) accessor muted = false;
  @property({ attribute: "aria-label" }) accessor ariaLabelValue = "";
  @property({ attribute: "aria-labelledby" }) accessor ariaLabelledbyValue = "";
  @property({ attribute: "aria-pressed" }) accessor ariaPressedValue = "";
  @property({ attribute: "aria-describedby" }) accessor ariaDescribedbyValue =
    "";

  private readonly internals = getElementInternals(this);

  static override readonly styles = styles;

  private get buttonElement(): HTMLButtonElement | null {
    return this.renderRoot.querySelector("button");
  }

  override focus(options?: FocusOptions) {
    const button = this.buttonElement;
    if (button) {
      button.focus(options);
      return;
    }

    void this.updateComplete.then(() => {
      this.buttonElement?.focus(options);
    });
  }

  override render() {
    return html`
      <button
        part="base"
        class="variant-${this.variant} size-${this.size}"
        type=${this.type}
        tabindex=${this.tabIndexValue}
        aria-label=${ifDefined(this.ariaLabelValue || undefined)}
        aria-labelledby=${ifDefined(this.ariaLabelledbyValue || undefined)}
        aria-pressed=${ifDefined(this.ariaPressedValue || undefined)}
        aria-describedby=${ifDefined(this.ariaDescribedbyValue || undefined)}
        ?disabled=${this.disabled}
        @click=${this.onClick}
      >
        <slot></slot>
      </button>
    `;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  private onClick = (event: MouseEvent) => {
    if (this.disabled) return;
    const form = this.internals?.form ?? this.closest("form");
    if (!(form instanceof HTMLFormElement)) return;

    if (this.type === "submit") {
      event.preventDefault();
      form.requestSubmit();
    } else if (this.type === "reset") {
      event.preventDefault();
      form.reset();
    }
  };
}
