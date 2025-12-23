import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {styles} from './styles';

let inputId = 0;

type SlotName = 'label' | 'hint' | 'error';

@customElement('uik-input')
export class UikInput extends LitElement {
  static formAssociated = true;

  @property({type: String}) accessor type = 'text';
  @property({type: String}) accessor placeholder = '';
  @property({type: String}) accessor value = '';
  @property({type: String, reflect: true}) accessor name = '';
  @property({attribute: 'autocomplete'}) accessor autocomplete = '';
  @property({attribute: 'inputmode'}) override accessor inputMode = '';
  @property({attribute: 'enterkeyhint'}) override accessor enterKeyHint = '';
  @property({type: Boolean, reflect: true}) accessor disabled = false;
  @property({type: Boolean, reflect: true}) accessor required = false;
  @property({type: Boolean, reflect: true}) accessor readonly = false;
  @property({type: Boolean, reflect: true}) accessor invalid = false;
  @property({attribute: 'aria-label'}) accessor ariaLabelValue = '';
  @property({attribute: 'aria-labelledby'}) accessor ariaLabelledbyValue = '';
  @property({attribute: 'aria-describedby'}) accessor ariaDescribedbyValue = '';

  private readonly internals = this.attachInternals();
  private readonly controlId = `uik-input-${String(++inputId)}`;
  private readonly labelId = `${this.controlId}-label`;
  private readonly hintId = `${this.controlId}-hint`;
  private readonly errorId = `${this.controlId}-error`;

  static override readonly styles = styles;

  private get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector('input');
  }

  override firstUpdated() {
    this.syncFormValue();
    this.syncValidity();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('value') || changed.has('disabled')) {
      this.syncFormValue();
    }

    if (changed.has('required') || changed.has('type') || changed.has('invalid')) {
      this.syncValidity();
    }
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  formResetCallback() {
    this.value = '';
    this.syncFormValue();
  }

  formStateRestoreCallback(state: string | File | FormData | null) {
    if (typeof state === 'string') {
      this.value = state;
      this.syncFormValue();
    }
  }

  private syncFormValue() {
    this.internals.setFormValue(this.disabled ? null : this.value);
  }

  private syncValidity() {
    const input = this.inputElement;
    if (!input) return;
    if (this.invalid || this.hasSlotContent('error')) {
      this.internals.setValidity({customError: true}, 'Invalid', input);
      return;
    }
    if (input.checkValidity()) {
      this.internals.setValidity({});
    } else {
      this.internals.setValidity(input.validity, input.validationMessage, input);
    }
  }

  private hasSlotContent(name: SlotName): boolean {
    const elements = Array.from(this.querySelectorAll(`[slot="${name}"]`));
    if (elements.length === 0) return false;
    return elements.some(element => {
      const text = element.textContent;
      return text.trim().length > 0 || element.childElementCount > 0;
    });
  }

  private onSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    if (slot.name === 'error') {
      this.syncValidity();
    }
    this.requestUpdate();
  };

  private onChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.syncFormValue();
    this.syncValidity();
  };

  private onInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.syncFormValue();
    this.syncValidity();
  };

  override render() {
    const hasLabel = this.hasSlotContent('label');
    const hasHint = this.hasSlotContent('hint');
    const hasError = this.hasSlotContent('error');
    const describedBy = [
      this.ariaDescribedbyValue,
      hasHint ? this.hintId : null,
      hasError ? this.errorId : null,
    ]
      .filter(Boolean)
      .join(' ');

    const ariaInvalid = this.invalid || hasError ? 'true' : undefined;
    const ariaLabel = hasLabel ? undefined : this.ariaLabelValue || undefined;
    const ariaLabelledby = hasLabel ? undefined : this.ariaLabelledbyValue || undefined;

    return html`
      <div class="field">
        <label part="label" class="label" id=${this.labelId} for=${this.controlId} ?hidden=${!hasLabel}>
          <slot name="label" @slotchange=${this.onSlotChange}></slot>
        </label>
        <div part="control" class="control">
          <input
            part="base"
            id=${this.controlId}
            type=${this.type}
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
            aria-describedby=${ifDefined(describedBy || undefined)}
            aria-label=${ifDefined(ariaLabel)}
            aria-labelledby=${ifDefined(ariaLabelledby)}
            @change=${this.onChange}
            @input=${this.onInput} />
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
