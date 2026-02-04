import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { styles } from "./styles.js";
import {
  dispatchFormFallbackEvent,
  getElementInternals,
  reflectFormValue,
} from "../../../internal/form.js";

export interface TagInputChangeDetail {
  value: string;
  values: string[];
}

export interface TagInputAddDetail {
  value: string;
  values: string[];
  index: number;
}

export interface TagInputRemoveDetail {
  value: string;
  values: string[];
  index: number;
}

const parseValues = (value: string | null) => {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const valuesConverter = {
  fromAttribute: (value: string | null) => parseValues(value),
  toAttribute: (value: string[] | null) => {
    if (!value || value.length === 0) return null;
    return value.join(", ");
  },
};

const clampIndex = (index: number, length: number) => {
  if (length <= 0) return -1;
  if (index < 0) return 0;
  if (index >= length) return length - 1;
  return index;
};

/**
 * Token-driven tag input control with add/remove keyboard support.
 * @attr values
 * @attr placeholder
 * @attr name
 * @attr disabled
 * @attr readonly
 * @part base
 * @part tags
 * @part tag
 * @part tag-label
 * @part tag-remove
 * @part input
 * @part status
 * @event tag-input-add (detail: {value, values, index})
 * @event tag-input-remove (detail: {value, values, index})
 * @event tag-input-change (detail: {value, values})
 * @a11y Input remains the primary focus target; ArrowLeft/Right moves between tags; Enter adds; Backspace/Delete removes.
 * @cssprop --uik-component-tag-input-base-* (bg, border, fg, padding, radius, shadow, focus ring)
 * @cssprop --uik-component-tag-input-tag-* (bg, border, fg, radius, remove)
 */
@customElement("uik-tag-input")
export class UikTagInput extends LitElement {
  static formAssociated = true;

  @property({ attribute: "values", converter: valuesConverter })
  accessor values: string[] = [];
  @property({ type: String }) accessor placeholder = "";
  @property({ type: String, reflect: true, useDefault: true }) accessor name =
    "";
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor disabled = false;
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor readonly = false;
  @property({ attribute: "aria-label" }) accessor ariaLabelValue = "";
  @property({ attribute: "aria-labelledby" }) accessor ariaLabelledbyValue =
    "";
  @property({ attribute: "aria-describedby" }) accessor ariaDescribedbyValue =
    "";

  @state() private accessor inputValue = "";
  @state() private accessor activeIndex = -1;
  @state() private accessor statusMessage = "";

  private readonly internals = getElementInternals(this);
  private defaultValues: string[] = [];

  static override readonly styles = styles;

  private get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector("input");
  }

  private get tagButtons(): HTMLButtonElement[] {
    return Array.from(
      this.renderRoot.querySelectorAll<HTMLButtonElement>("button.tag"),
    );
  }

  override connectedCallback() {
    super.connectedCallback();
    this.defaultValues = [...this.values];
  }

  override firstUpdated() {
    this.syncFormValue();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has("values") || changed.has("disabled") || changed.has("name")) {
      this.syncFormValue();
      this.activeIndex = clampIndex(this.activeIndex, this.values.length);
    }
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  formResetCallback() {
    this.values = [...this.defaultValues];
    this.inputValue = "";
    this.activeIndex = -1;
    this.syncFormValue();
  }

  formStateRestoreCallback(state: string | File | FormData | null) {
    if (state instanceof FormData && this.name) {
      const values = state.getAll(this.name).map((entry) => String(entry));
      this.values = values;
      this.syncFormValue();
      return;
    }
    if (typeof state === "string") {
      this.values = parseValues(state);
      this.syncFormValue();
    }
  }

  private syncFormValue() {
    if (!this.name || this.disabled) {
      if (this.internals) {
        this.internals.setFormValue(null);
      } else {
        reflectFormValue(this, null);
      }
      return;
    }

    const formValue = this.values.join(",");
    if (this.internals) {
      const formData = new FormData();
      this.values.forEach((value) => formData.append(this.name, value));
      this.internals.setFormValue(formData);
    } else {
      reflectFormValue(this, formValue);
    }
  }

  private emitChange(value: string, values: string[]) {
    const detail: TagInputChangeDetail = { value, values };
    this.dispatchEvent(
      new CustomEvent("tag-input-change", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private emitAdd(value: string, values: string[], index: number) {
    const detail: TagInputAddDetail = { value, values, index };
    this.dispatchEvent(
      new CustomEvent("tag-input-add", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private emitRemove(value: string, values: string[], index: number) {
    const detail: TagInputRemoveDetail = { value, values, index };
    this.dispatchEvent(
      new CustomEvent("tag-input-remove", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private updateStatus(message: string) {
    this.statusMessage = message;
  }

  private commitInput() {
    if (this.disabled || this.readonly) return;
    const nextValue = this.inputValue.trim();
    if (!nextValue) return;
    if (this.values.includes(nextValue)) {
      this.updateStatus(`Tag ${nextValue} already added.`);
      this.inputValue = "";
      return;
    }
    const nextValues = [...this.values, nextValue];
    this.values = nextValues;
    this.inputValue = "";
    this.activeIndex = -1;
    this.updateStatus(`Added tag ${nextValue}.`);
    this.emitAdd(nextValue, nextValues, nextValues.length - 1);
    this.emitChange(nextValue, nextValues);
    dispatchFormFallbackEvent(this, this.internals, "change");
  }

  private removeTagAt(index: number) {
    if (this.disabled || this.readonly) return;
    const target = this.values[index];
    if (!target) return;
    const nextValues = this.values.filter((_, i) => i !== index);
    this.values = nextValues;
    this.updateStatus(`Removed tag ${target}.`);
    this.emitRemove(target, nextValues, index);
    this.emitChange(target, nextValues);
    dispatchFormFallbackEvent(this, this.internals, "change");

    if (nextValues.length === 0) {
      this.focusInput();
      return;
    }

    const nextIndex = clampIndex(index, nextValues.length);
    this.focusTag(nextIndex);
  }

  private focusTag(index: number) {
    this.activeIndex = clampIndex(index, this.values.length);
    void this.updateComplete.then(() => {
      const button = this.tagButtons[this.activeIndex];
      if (button) button.focus();
    });
  }

  private focusInput() {
    this.activeIndex = -1;
    void this.updateComplete.then(() => this.inputElement?.focus());
  }

  private onInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.inputValue = input.value;
  };

  private onInputFocus = () => {
    this.activeIndex = -1;
  };

  private onInputKeyDown = (event: KeyboardEvent) => {
    if (this.disabled || this.readonly) return;
    const input = event.target as HTMLInputElement;
    switch (event.key) {
      case "Enter":
        event.preventDefault();
        this.commitInput();
        break;
      case "Backspace":
        if (input.value === "" && this.values.length > 0) {
          event.preventDefault();
          this.removeTagAt(this.values.length - 1);
        }
        break;
      case "ArrowLeft":
        if (input.selectionStart === 0 && this.values.length > 0) {
          event.preventDefault();
          this.focusTag(this.values.length - 1);
        }
        break;
      default:
        break;
    }
  };

  private onTagClick = (event: Event) => {
    if (this.disabled || this.readonly) return;
    const button = event.currentTarget as HTMLButtonElement;
    const index = Number(button.dataset.index);
    if (Number.isNaN(index)) return;
    this.removeTagAt(index);
  };

  private onTagFocus = (event: FocusEvent) => {
    const button = event.currentTarget as HTMLButtonElement;
    const index = Number(button.dataset.index);
    if (Number.isNaN(index)) return;
    this.activeIndex = index;
  };

  private onTagKeyDown = (event: KeyboardEvent) => {
    const button = event.currentTarget as HTMLButtonElement;
    const index = Number(button.dataset.index);
    if (Number.isNaN(index)) return;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        if (index === 0) {
          this.focusInput();
        } else {
          this.focusTag(index - 1);
        }
        break;
      case "ArrowRight":
        event.preventDefault();
        if (index >= this.values.length - 1) {
          this.focusInput();
        } else {
          this.focusTag(index + 1);
        }
        break;
      case "Home":
        event.preventDefault();
        this.focusTag(0);
        break;
      case "End":
        event.preventDefault();
        this.focusTag(this.values.length - 1);
        break;
      case "Backspace":
      case "Delete":
        event.preventDefault();
        this.removeTagAt(index);
        break;
      case "Escape":
        event.preventDefault();
        this.focusInput();
        break;
      default:
        break;
    }
  };

  override render() {
    const ariaLabel = this.ariaLabelValue || undefined;
    const ariaLabelledby = this.ariaLabelledbyValue || undefined;
    const ariaDescribedby = this.ariaDescribedbyValue || undefined;
    const isReadonly = this.readonly ? "true" : undefined;

    return html`
      <div part="base" class="base">
        <div part="tags" class="tags">
          ${this.values.map((value, index) => {
            const isDisabled = this.disabled;
            const isReadonlyTag = this.readonly;
            const ariaDisabled = isReadonlyTag ? "true" : undefined;
            const tabIndex =
              isDisabled || isReadonlyTag
                ? -1
                : index === this.activeIndex
                  ? 0
                  : -1;
            return html`
              <button
                part="tag"
                class="tag"
                type="button"
                data-index=${index}
                aria-label=${`Remove tag ${value}`}
                aria-disabled=${ifDefined(ariaDisabled)}
                tabindex=${tabIndex}
                ?disabled=${isDisabled}
                @click=${this.onTagClick}
                @focus=${this.onTagFocus}
                @keydown=${this.onTagKeyDown}
              >
                <span part="tag-label" class="tag-label">${value}</span>
                <span part="tag-remove" class="tag-remove" aria-hidden="true"
                  >×</span
                >
              </button>
            `;
          })}
          <input
            part="input"
            class="input"
            .value=${this.inputValue}
            placeholder=${this.placeholder}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            aria-label=${ifDefined(ariaLabel)}
            aria-labelledby=${ifDefined(ariaLabelledby)}
            aria-describedby=${ifDefined(ariaDescribedby)}
            aria-readonly=${ifDefined(isReadonly)}
            @input=${this.onInput}
            @focus=${this.onInputFocus}
            @keydown=${this.onInputKeyDown}
          />
        </div>
        <span part="status" class="sr-only" aria-live="polite">
          ${this.statusMessage}
        </span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-tag-input": UikTagInput;
  }
}
