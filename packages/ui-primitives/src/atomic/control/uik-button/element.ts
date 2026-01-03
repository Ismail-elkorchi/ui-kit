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
 * @attr role
 * @attr aria-haspopup
 * @attr aria-expanded
 * @attr aria-controls
 * @slot default (label or icon)
 * @part base
 * @event Native button events bubble from the internal <button>.
 * @a11y Forward aria-label, aria-labelledby, aria-describedby, aria-pressed, aria-haspopup, aria-expanded, and aria-controls to the internal button.
 * @a11y Roles remain on the host for Shadow DOM parentage-sensitive patterns (menus/menubars).
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
  @property({ attribute: "role", reflect: true }) accessor roleValue = "";
  @property({ attribute: "aria-label" }) accessor ariaLabelValue = "";
  @property({ attribute: "aria-labelledby" }) accessor ariaLabelledbyValue = "";
  @property({ attribute: "aria-pressed" }) accessor ariaPressedValue = "";
  @property({ attribute: "aria-describedby" }) accessor ariaDescribedbyValue =
    "";
  @property({ attribute: "aria-haspopup" }) accessor ariaHaspopupValue = "";
  @property({ attribute: "aria-expanded" }) accessor ariaExpandedValue = "";
  @property({ attribute: "aria-controls" }) accessor ariaControlsValue = "";

  private readonly internals = getElementInternals(this);
  private autoLabel = false;
  private slotElement: HTMLSlotElement | null = null;

  static override readonly styles = styles;

  private get useHostRole() {
    return this.roleValue !== "";
  }

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("keydown", this.onHostKeyDown);
  }

  override firstUpdated() {
    this.slotElement = this.renderRoot.querySelector("slot");
    this.slotElement?.addEventListener("slotchange", this.onSlotChange);
    this.syncHostAccessibility();
  }

  override disconnectedCallback() {
    this.slotElement?.removeEventListener("slotchange", this.onSlotChange);
    this.slotElement = null;
    this.removeEventListener("keydown", this.onHostKeyDown);
    super.disconnectedCallback();
  }

  private get buttonElement(): HTMLButtonElement | null {
    return this.renderRoot.querySelector("button");
  }

  override updated(changed: Map<string, unknown>) {
    if (
      changed.has("roleValue") ||
      changed.has("tabIndexValue") ||
      changed.has("disabled")
    ) {
      this.syncHostAccessibility();
    }
  }

  override focus(options?: FocusOptions) {
    if (this.useHostRole) {
      super.focus(options);
      return;
    }
    const button = this.buttonElement;
    if (button) {
      button.focus(options);
      return;
    }

    void this.updateComplete.then(() => {
      this.buttonElement?.focus(options);
    });
  }

  private syncHostAccessibility() {
    if (!this.useHostRole) {
      this.removeAttribute("aria-disabled");
      this.removeAttribute("tabindex");
      if (this.autoLabel) {
        this.removeAttribute("aria-label");
        this.autoLabel = false;
      }
      return;
    }

    if (this.disabled) {
      this.setAttribute("aria-disabled", "true");
      this.tabIndex = -1;
    } else {
      this.removeAttribute("aria-disabled");
      this.tabIndex = this.tabIndexValue;
    }

    if (
      !this.hasAttribute("aria-label") &&
      !this.hasAttribute("aria-labelledby")
    ) {
      const fallbackLabel = this.textContent.trim();
      if (fallbackLabel) {
        this.setAttribute("aria-label", fallbackLabel);
        this.autoLabel = true;
      }
    } else if (this.autoLabel) {
      this.autoLabel = false;
    }
  }

  private onSlotChange = () => {
    if (this.useHostRole) {
      this.syncHostAccessibility();
    }
  };

  private onHostKeyDown = (event: KeyboardEvent) => {
    if (!this.useHostRole || this.disabled) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    this.buttonElement?.click();
  };

  override render() {
    const useHostRole = this.useHostRole;
    const buttonTabIndex = useHostRole ? -1 : this.tabIndexValue;
    const ariaHidden = useHostRole ? "true" : undefined;

    return html`
      <button
        part="base"
        class="variant-${this.variant} size-${this.size}"
        type=${this.type}
        tabindex=${buttonTabIndex}
        aria-hidden=${ifDefined(ariaHidden)}
        aria-label=${ifDefined(this.ariaLabelValue || undefined)}
        aria-labelledby=${ifDefined(this.ariaLabelledbyValue || undefined)}
        aria-pressed=${ifDefined(this.ariaPressedValue || undefined)}
        aria-describedby=${ifDefined(this.ariaDescribedbyValue || undefined)}
        aria-haspopup=${ifDefined(this.ariaHaspopupValue || undefined)}
        aria-expanded=${ifDefined(this.ariaExpandedValue || undefined)}
        aria-controls=${ifDefined(this.ariaControlsValue || undefined)}
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
