import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {styles} from './styles';
import {buildDescribedBy, createId, hasSlotContent} from '../../../internal';

type SlotName = 'label' | 'hint' | 'error';

@customElement('uik-select')
export class UikSelect extends LitElement {
  static formAssociated = true;

  @property({type: String}) accessor value = '';
  @property({type: String, reflect: true, useDefault: true}) accessor name = '';
  @property({type: Boolean, reflect: true, useDefault: true}) accessor disabled = false;
  @property({type: Boolean, reflect: true, useDefault: true}) accessor required = false;
  @property({type: Boolean, reflect: true, useDefault: true}) accessor invalid = false;
  @property({attribute: 'aria-label'}) accessor ariaLabelValue = '';
  @property({attribute: 'aria-labelledby'}) accessor ariaLabelledbyValue = '';
  @property({attribute: 'aria-describedby'}) accessor ariaDescribedbyValue = '';

  private readonly internals = this.attachInternals();
  private readonly controlId = createId('uik-select');
  private readonly labelId = `${this.controlId}-label`;
  private readonly hintId = `${this.controlId}-hint`;
  private readonly errorId = `${this.controlId}-error`;
  private defaultValue = '';
  private hasInitializedDefault = false;

  static override readonly styles = styles;

  private get selectElement(): HTMLSelectElement | null {
    return this.renderRoot.querySelector('select');
  }

  private get optionsSlot(): HTMLSlotElement | null {
    return this.renderRoot.querySelector('slot[data-options]');
  }

  private syncOptions() {
    const select = this.selectElement;
    if (!select) return;
    const slot = this.optionsSlot;
    const assigned = slot?.assignedElements({flatten: true}) ?? [];
    const options = assigned.filter(
      element => element instanceof HTMLOptionElement || element instanceof HTMLOptGroupElement,
    );
    const clones = options.map(option => option.cloneNode(true));
    select.replaceChildren(...clones);
    if (!this.hasInitializedDefault && this.value === '' && select.value) {
      this.value = select.value;
      this.defaultValue = this.value;
      this.hasInitializedDefault = true;
    }
    this.syncControlValue();
    this.syncValidity();
  }

  private syncControlValue() {
    const select = this.selectElement;
    if (!select) return;
    select.value = this.value;
  }

  override connectedCallback() {
    super.connectedCallback();
    const firstOption = this.querySelector('option');
    if (this.value === '' && firstOption) {
      this.value = firstOption.value;
      this.defaultValue = this.value;
      this.hasInitializedDefault = true;
      return;
    }
    this.defaultValue = this.value;
    this.hasInitializedDefault = this.value !== '' || Boolean(firstOption);
  }

  override firstUpdated() {
    this.syncOptions();
    this.syncFormValue();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('value') || changed.has('disabled')) {
      this.syncFormValue();
      this.syncControlValue();
    }

    if (changed.has('required') || changed.has('invalid') || changed.has('value')) {
      this.syncValidity();
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
    if (typeof state === 'string') {
      this.value = state;
      this.syncFormValue();
      this.syncValidity();
    }
  }

  private syncFormValue() {
    this.internals.setFormValue(this.disabled ? null : this.value);
  }

  private syncValidity() {
    const select = this.selectElement;
    if (!select) return;

    if (this.invalid || this.hasSlotContent('error')) {
      this.internals.setValidity({customError: true}, 'Invalid', select);
      return;
    }

    if (select.checkValidity()) {
      this.internals.setValidity({});
    } else {
      this.internals.setValidity(select.validity, select.validationMessage, select);
    }
  }

  private hasSlotContent(name: SlotName): boolean {
    return hasSlotContent(this, name);
  }

  private onSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    if (slot.name === 'error') {
      this.syncValidity();
    }
    this.requestUpdate();
  };

  private onOptionsSlotChange = () => {
    this.syncOptions();
  };

  private onChange = (event: Event) => {
    const select = event.target as HTMLSelectElement;
    this.value = select.value;
    this.syncFormValue();
    this.syncValidity();
  };

  override render() {
    const hasLabel = this.hasSlotContent('label');
    const hasHint = this.hasSlotContent('hint');
    const hasError = this.hasSlotContent('error');
    const describedBy = buildDescribedBy(
      this.ariaDescribedbyValue,
      hasHint ? this.hintId : null,
      hasError ? this.errorId : null,
    );

    const ariaInvalid = this.invalid || hasError ? 'true' : undefined;
    const ariaLabel = hasLabel ? undefined : this.ariaLabelValue || undefined;
    const ariaLabelledby = hasLabel ? undefined : this.ariaLabelledbyValue || undefined;

    return html`
      <div class="field">
        <label part="label" class="label" id=${this.labelId} for=${this.controlId} ?hidden=${!hasLabel}>
          <slot name="label" @slotchange=${this.onSlotChange}></slot>
        </label>
        <div part="control" class="control">
          <select
            part="base"
            id=${this.controlId}
            name=${this.name}
            .value=${this.value}
            ?disabled=${this.disabled}
            ?required=${this.required}
            aria-invalid=${ifDefined(ariaInvalid)}
            aria-describedby=${ifDefined(describedBy)}
            aria-label=${ifDefined(ariaLabel)}
            aria-labelledby=${ifDefined(ariaLabelledby)}
            @change=${this.onChange}></select>
        </div>
        <div hidden>
          <slot data-options @slotchange=${this.onOptionsSlotChange}></slot>
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
