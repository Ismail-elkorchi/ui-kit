import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { comboboxStyles } from "./combobox-styles.js";
import type { UikListbox } from "./element.js";
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
import { createOutsideDismissController } from "../../../internal/overlay/dismiss.js";
import "./element.js";
import "./uik-option.js";

type SlotName = "label" | "hint" | "error";

export interface UikComboboxItem {
  id: string;
  label: string;
  value?: string;
  isDisabled?: boolean;
}

export interface UikComboboxSelectDetail {
  value: string;
  item: UikComboboxItem | null;
}

/**
 * Combobox with input + listbox popup.
 * @attr value
 * @attr open (boolean)
 * @attr name
 * @attr placeholder
 * @attr disabled
 * @attr required
 * @attr readonly
 * @attr invalid
 * @slot label
 * @slot hint
 * @slot error
 * @part base
 * @part control
 * @part label
 * @part hint
 * @part error
 * @part panel
 * @event combobox-select (detail: {value, item})
 * @a11y Input uses role="combobox" with aria-controls + aria-activedescendant.
 * @cssprop --uik-component-combobox-base-* (bg, border, fg, padding, radius, shadow)
 * @cssprop --uik-component-combobox-panel-offset
 * @cssprop --uik-component-combobox-panel-z-local
 */
@customElement("uik-combobox")
export class UikCombobox extends LitElement {
  static formAssociated = true;

  @property({ type: String }) accessor value = "";
  @property({ type: Boolean, reflect: true, useDefault: true }) accessor open =
    false;
  @property({ type: String, reflect: true, useDefault: true }) accessor name =
    "";
  @property({ type: String }) accessor placeholder = "";
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor disabled = false;
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor required = false;
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor readonly = false;
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor invalid = false;
  @property({ attribute: false }) accessor items: UikComboboxItem[] = [];
  @property({ attribute: "aria-label" }) accessor ariaLabelValue = "";
  @property({ attribute: "aria-labelledby" }) accessor ariaLabelledbyValue = "";
  @property({ attribute: "aria-describedby" }) accessor ariaDescribedbyValue =
    "";
  @property({ attribute: "autocomplete" }) accessor autocomplete = "";
  @property({ attribute: "inputmode" }) override accessor inputMode = "";
  @property({ attribute: "enterkeyhint" }) override accessor enterKeyHint = "";

  @state() private accessor activeId = "";

  private readonly internals = getElementInternals(this);
  private readonly controlId = createId("uik-combobox");
  private readonly labelId = `${this.controlId}-label`;
  private readonly hintId = `${this.controlId}-hint`;
  private readonly errorId = `${this.controlId}-error`;
  private readonly listboxId = `${this.controlId}-listbox`;
  private defaultValue = "";

  private readonly outsideDismiss = createOutsideDismissController(this, () => {
    this.open = false;
  });

  static override readonly styles = comboboxStyles;

  private get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector("input");
  }

  private get listboxElement(): UikListbox | null {
    return this.renderRoot.querySelector("uik-listbox");
  }

  override connectedCallback() {
    super.connectedCallback();
    this.defaultValue = this.value;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.outsideDismiss.disconnect();
  }

  override firstUpdated() {
    this.syncFormValue();
    this.syncValidity();
    this.syncDismissListeners();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has("value") || changed.has("disabled")) {
      this.syncFormValue();
    }

    if (
      changed.has("required") ||
      changed.has("invalid") ||
      changed.has("value")
    ) {
      this.syncValidity();
    }

    if (changed.has("open")) {
      this.syncDismissListeners();
      if (this.open) {
        const listbox = this.listboxElement;
        if (listbox) this.activeId = listbox.activeId;
      }
    }

    if (changed.has("items") && this.open && this.items.length === 0) {
      this.open = false;
    }
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  formResetCallback() {
    this.value = this.defaultValue;
    this.syncFormValue();
    this.syncValidity();
  }

  formStateRestoreCallback(state: string | File | FormData | null) {
    if (typeof state === "string") {
      this.value = state;
      this.syncFormValue();
      this.syncValidity();
    }
  }

  private syncFormValue() {
    const value = this.disabled ? null : this.value;
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

  private syncDismissListeners() {
    if (this.open) {
      this.outsideDismiss.connect();
    } else {
      this.outsideDismiss.disconnect();
    }
  }

  private findItem(value: string): UikComboboxItem | null {
    return this.items.find((item) => (item.value ?? item.id) === value) ?? null;
  }

  private onInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    if (!this.open && !this.disabled && !this.readonly) {
      this.open = true;
    }
    this.syncFormValue();
    dispatchFormFallbackEvent(this, this.internals, "input", event);
  };

  private onChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.syncFormValue();
    dispatchFormFallbackEvent(this, this.internals, "change", event);
  };

  private onFocus = () => {
    if (!this.open && !this.disabled && !this.readonly) {
      this.open = true;
    }
  };

  private onBlur = (event: FocusEvent) => {
    const related = event.relatedTarget as Node | null;
    if (related && this.contains(related)) return;
    this.open = false;
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || this.disabled || this.readonly) return;
    const listbox = this.listboxElement;

    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      if (!this.open) this.open = true;
      if (listbox?.moveActiveByKey(event.key)) {
        this.activeId = listbox.activeId;
      }
      event.preventDefault();
      return;
    }

    if (event.key === "Enter") {
      if (!this.open) return;
      event.preventDefault();
      listbox?.selectActive();
      return;
    }

    if (event.key === "Escape") {
      if (!this.open) return;
      event.preventDefault();
      this.open = false;
    }
  };

  private onListboxActive = (event: Event) => {
    const detail = (event as CustomEvent<{ id: string }>).detail;
    this.activeId = detail.id;
  };

  private onListboxSelect = (event: Event) => {
    const detail = (event as CustomEvent<{ value: string }>).detail;
    this.value = detail.value;
    this.syncFormValue();
    dispatchFormFallbackEvent(this, this.internals, "change");
    this.open = false;
    const item = this.findItem(detail.value);
    const payload: UikComboboxSelectDetail = { value: this.value, item };
    this.dispatchEvent(
      new CustomEvent("combobox-select", {
        detail: payload,
        bubbles: true,
        composed: true,
      }),
    );
  };

  private onSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    if (slot.name === "error") {
      this.syncValidity();
    }
    this.requestUpdate();
  };

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
    const ariaActive = this.open && this.activeId ? this.activeId : undefined;
    const hasItems = this.items.length > 0;
    const listboxControlId = `${this.listboxId}-panel`;

    return html`
      <div class="field">
        <label
          part="label"
          class="label"
          id=${this.labelId}
          for=${this.controlId}
          ?hidden=${!hasLabel}
        >
          <slot name="label" @slotchange=${this.onSlotChange}></slot>
        </label>
        <div part="control" class="control">
          <input
            part="base"
            id=${this.controlId}
            type="text"
            role="combobox"
            name=${this.name}
            autocomplete=${ifDefined(this.autocomplete || undefined)}
            inputmode=${ifDefined(this.inputMode || undefined)}
            enterkeyhint=${ifDefined(this.enterKeyHint || undefined)}
            placeholder=${this.placeholder}
            .value=${this.value}
            ?disabled=${this.disabled}
            ?required=${this.required}
            ?readonly=${this.readonly}
            aria-invalid=${ifDefined(ariaInvalid)}
            aria-describedby=${ifDefined(describedBy ?? undefined)}
            aria-label=${ifDefined(ariaLabel)}
            aria-labelledby=${ifDefined(ariaLabelledby)}
            aria-controls=${listboxControlId}
            aria-activedescendant=${ifDefined(ariaActive)}
            aria-expanded=${this.open && hasItems ? "true" : "false"}
            aria-autocomplete="list"
            aria-haspopup="listbox"
            @input=${this.onInput}
            @change=${this.onChange}
            @focus=${this.onFocus}
            @blur=${this.onBlur}
            @keydown=${this.onKeyDown}
          />
        </div>
        <div part="panel" class="panel" ?hidden=${!this.open || !hasItems}>
          <uik-listbox
            id=${this.listboxId}
            .value=${this.value}
            .activeId=${this.activeId}
            focus-mode="activedescendant"
            aria-label=${ifDefined(this.ariaLabelValue || undefined)}
            @listbox-active=${this.onListboxActive}
            @listbox-select=${this.onListboxSelect}
          >
            ${this.items.map((item) => {
              const optionValue = item.value ?? item.id;
              return html`
                <uik-option
                  value=${optionValue}
                  ?disabled=${item.isDisabled ?? false}
                  id=${item.id}
                  role="option"
                  aria-selected=${optionValue === this.value ? "true" : "false"}
                >
                  ${item.label}
                </uik-option>
              `;
            })}
          </uik-listbox>
        </div>
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

declare global {
  interface HTMLElementTagNameMap {
    "uik-combobox": UikCombobox;
  }
}
