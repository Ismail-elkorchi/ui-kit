import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { styles } from "./styles.js";
import {
  dispatchFormFallbackEvent,
  getElementInternals,
  reflectFormValue,
} from "../../../internal/form.js";
import {
  buildDescribedBy,
  createId,
  hasSlotContent,
} from "../../../internal/index.js";

type SlotName = "label" | "hint" | "error";

/**
 * Form-associated radio control with label, hint, and error slots.
 * @attr name
 * @attr value
 * @attr checked
 * @attr disabled
 * @attr required
 * @attr invalid
 * @slot label
 * @slot hint
 * @slot error
 * @part base
 * @part control
 * @part label
 * @part hint
 * @part error
 * @event Native change bubbles from the internal <input>.
 * @a11y Provide a label slot or aria-label; hint/error are wired via aria-describedby.
 * @cssprop --uik-component-radio-accent
 * @cssprop --uik-component-radio-size
 */
@customElement("uik-radio")
export class UikRadio extends LitElement {
  static formAssociated = true;

  @property({ type: String }) accessor value = "on";
  @property({ type: String, reflect: true, useDefault: true }) accessor name =
    "";
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor checked = false;
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor disabled = false;
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor required = false;
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor invalid = false;
  @property({ type: Number }) accessor tabIndexValue = 0;
  @property({ type: Boolean }) accessor groupDisabled = false;
  @property({ attribute: "aria-label" }) accessor ariaLabelValue = "";
  @property({ attribute: "aria-labelledby" }) accessor ariaLabelledbyValue = "";
  @property({ attribute: "aria-describedby" }) accessor ariaDescribedbyValue =
    "";

  private readonly internals = getElementInternals(this);
  private readonly controlId = createId("uik-radio");
  private readonly hintId = `${this.controlId}-hint`;
  private readonly errorId = `${this.controlId}-error`;
  private defaultChecked = false;

  static override readonly styles = styles;

  private get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector("input");
  }

  private get isGrouped() {
    return Boolean(this.closest("uik-radio-group"));
  }

  override connectedCallback() {
    super.connectedCallback();
    this.defaultChecked = this.checked;
  }

  override firstUpdated() {
    this.defaultChecked = this.checked;
    this.syncFormValue();
    this.syncValidity();
  }

  override updated(changed: Map<string, unknown>) {
    if (
      changed.has("checked") ||
      changed.has("disabled") ||
      changed.has("value")
    ) {
      this.syncFormValue();
    }

    if (
      changed.has("required") ||
      changed.has("invalid") ||
      changed.has("checked")
    ) {
      this.syncValidity();
    }
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  formResetCallback() {
    this.checked = this.defaultChecked;
    this.syncFormValue();
    this.syncValidity();
  }

  formStateRestoreCallback(state: string | File | FormData | null) {
    if (state === null) {
      this.checked = false;
    } else if (typeof state === "string") {
      this.checked = true;
      this.value = state;
    }
    this.syncFormValue();
    this.syncValidity();
  }

  private syncFormValue() {
    const value =
      this.disabled || this.groupDisabled || !this.checked || this.isGrouped
        ? null
        : this.value;
    if (this.internals) {
      this.internals.setFormValue(value);
    } else {
      reflectFormValue(this, value);
    }
  }

  private syncValidity() {
    if (!this.internals) return;
    const input = this.inputElement;
    if (!input) return;

    if (this.isGrouped || this.groupDisabled) {
      this.internals.setValidity({});
      return;
    }

    if (this.invalid || this.hasSlotContent("error")) {
      this.internals.setValidity({ customError: true }, "Invalid", input);
      return;
    }

    if (input.checkValidity()) {
      this.internals.setValidity({});
    } else {
      this.internals.setValidity(
        input.validity,
        input.validationMessage,
        input,
      );
    }
  }

  private hasSlotContent(name: SlotName): boolean {
    return hasSlotContent(this, name);
  }

  private onSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    if (slot.name === "error") {
      this.syncValidity();
    }
    this.requestUpdate();
  };

  private onChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.checked = input.checked;
    this.syncFormValue();
    this.syncValidity();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    dispatchFormFallbackEvent(this, this.internals, "change", event);
  };

  override focus(options?: FocusOptions) {
    this.inputElement?.focus(options);
  }

  override render() {
    const hasLabel = this.hasSlotContent("label");
    const hasHint = this.hasSlotContent("hint");
    const hasError = this.hasSlotContent("error");
    const describedBy = buildDescribedBy(
      this.ariaDescribedbyValue,
      hasHint ? this.hintId : null,
      hasError ? this.errorId : null,
    );

    const ariaInvalid = this.invalid || hasError ? "true" : undefined;
    const ariaLabel = hasLabel ? undefined : this.ariaLabelValue || undefined;
    const ariaLabelledby = hasLabel
      ? undefined
      : this.ariaLabelledbyValue || undefined;

    return html`
      <div class="field">
        <label part="control" class="control">
          <input
            part="base"
            id=${this.controlId}
            type="radio"
            name=${this.name}
            .value=${this.value}
            .checked=${this.checked}
            tabindex=${this.tabIndexValue}
            ?disabled=${this.disabled || this.groupDisabled}
            ?required=${this.required}
            aria-invalid=${ifDefined(ariaInvalid)}
            aria-describedby=${ifDefined(describedBy)}
            aria-label=${ifDefined(ariaLabel)}
            aria-labelledby=${ifDefined(ariaLabelledby)}
            @change=${this.onChange}
          />
          <span part="label" class="control-text" ?hidden=${!hasLabel}>
            <slot name="label" @slotchange=${this.onSlotChange}></slot>
          </span>
        </label>
        <div part="hint" class="hint" id=${this.hintId} ?hidden=${!hasHint}>
          <slot name="hint" @slotchange=${this.onSlotChange}></slot>
        </div>
        <div part="error" class="error" id=${this.errorId} ?hidden=${!hasError}>
          <slot name="error" @slotchange=${this.onSlotChange}></slot>
        </div>
      </div>
    `;
  }
}
