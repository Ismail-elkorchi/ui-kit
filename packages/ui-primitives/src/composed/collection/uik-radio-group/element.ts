import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {styles} from './styles';
import type {UikRadio} from '../../../atomic/control/uik-radio';
import {buildDescribedBy, createId, hasSlotContent} from '../../../internal';

type SlotName = 'label' | 'hint' | 'error';

@customElement('uik-radio-group')
export class UikRadioGroup extends LitElement {
  static formAssociated = true;

  @property({type: String}) accessor value = '';
  @property({type: String, reflect: true, useDefault: true}) accessor name = '';
  @property({type: String, reflect: true, useDefault: true}) accessor orientation: 'vertical' | 'horizontal' = 'vertical';
  @property({type: Boolean, reflect: true, useDefault: true}) accessor disabled = false;
  @property({type: Boolean, reflect: true, useDefault: true}) accessor required = false;
  @property({type: Boolean, reflect: true, useDefault: true}) accessor invalid = false;
  @property({attribute: 'aria-label'}) accessor ariaLabelValue = '';
  @property({attribute: 'aria-labelledby'}) accessor ariaLabelledbyValue = '';
  @property({attribute: 'aria-describedby'}) accessor ariaDescribedbyValue = '';

  private readonly internals = this.attachInternals();
  private readonly controlId = createId('uik-radio-group');
  private readonly labelId = `${this.controlId}-label`;
  private readonly hintId = `${this.controlId}-hint`;
  private readonly errorId = `${this.controlId}-error`;
  private defaultValue = '';
  private hasResolvedInitialValue = false;

  static override readonly styles = styles;

  private get controlElement(): HTMLElement | null {
    return this.renderRoot.querySelector('.control');
  }

  override connectedCallback() {
    super.connectedCallback();
    if (!this.hasResolvedInitialValue && this.value === '') {
      const radios = this.getRadios();
      if (radios.length > 0) {
        const checkedRadio = radios.find(radio => radio.checked);
        if (checkedRadio) {
          this.value = checkedRadio.value;
        }
        this.hasResolvedInitialValue = true;
      }
    }
    this.defaultValue = this.value;
  }

  override firstUpdated() {
    this.defaultValue = this.value;
    this.syncRadios();
    this.syncFormValue();
    this.syncValidity();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('value') || changed.has('name') || changed.has('disabled')) {
      this.syncRadios();
      this.syncFormValue();
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
    this.syncRadios();
    this.syncFormValue();
    this.syncValidity();
  }

  formStateRestoreCallback(state: string | File | FormData | null) {
    if (typeof state === 'string') {
      this.value = state;
      this.syncRadios();
      this.syncFormValue();
      this.syncValidity();
    }
  }

  private getRadios(): UikRadio[] {
    return Array.from(this.querySelectorAll<UikRadio>('uik-radio'));
  }

  private syncRadios() {
    const radios = this.getRadios();
    if (radios.length === 0) return;

    const selected = this.value;

    radios.forEach(radio => {
      radio.name = this.name;
      radio.groupDisabled = this.disabled;
      radio.checked = selected !== '' && radio.value === selected;
    });

    const enabledRadios = radios.filter(radio => !radio.disabled && !radio.groupDisabled);
    if (enabledRadios.length === 0) return;

    const current = enabledRadios.find(radio => radio.checked) ?? enabledRadios[0];
    enabledRadios.forEach(radio => {
      radio.tabIndexValue = radio === current ? 0 : -1;
    });
  }

  private syncFormValue() {
    const value = this.disabled || !this.value ? null : this.value;
    this.internals.setFormValue(value);
  }

  private syncValidity() {
    const control = this.controlElement;
    if (!control) return;

    if (this.invalid || this.hasSlotContent('error')) {
      this.internals.setValidity({customError: true}, 'Invalid', control);
      return;
    }

    if (this.required && !this.value) {
      this.internals.setValidity({valueMissing: true}, 'Please select an option.', control);
      return;
    }

    this.internals.setValidity({});
  }

  private hasSlotContent(name: SlotName): boolean {
    return hasSlotContent(this, name);
  }

  private onSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    if (slot.name === 'error') {
      this.syncValidity();
    } else {
      if (!this.hasResolvedInitialValue && this.value === '') {
        const checkedRadio = this.getRadios().find(radio => radio.checked);
        if (checkedRadio) {
          this.value = checkedRadio.value;
        }
        this.hasResolvedInitialValue = true;
      }
      this.syncRadios();
    }
    this.requestUpdate();
  };

  private onRadioChange = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || target.tagName.toLowerCase() !== 'uik-radio') return;
    const radio = target as UikRadio;
    if (!radio.checked) return;

    this.value = radio.value;
    this.syncRadios();
    this.syncFormValue();
    this.syncValidity();
  };

  private onKeyDown = (event: KeyboardEvent) => {
    const nextKeys = this.orientation === 'horizontal' ? ['ArrowRight'] : ['ArrowDown'];
    const prevKeys = this.orientation === 'horizontal' ? ['ArrowLeft'] : ['ArrowUp'];
    if (![...nextKeys, ...prevKeys].includes(event.key)) return;

    const radios = this.getRadios().filter(radio => !radio.disabled && !radio.groupDisabled);
    if (radios.length === 0) return;

    const currentIndex = Math.max(
      0,
      radios.findIndex(radio => radio.checked || radio.tabIndexValue === 0),
    );
    const delta = nextKeys.includes(event.key) ? 1 : -1;
    const nextIndex = (currentIndex + delta + radios.length) % radios.length;
    const nextRadio = radios[nextIndex];
    if (!nextRadio) return;

    event.preventDefault();
    nextRadio.checked = true;
    this.value = nextRadio.value;
    this.syncRadios();
    this.syncFormValue();
    this.syncValidity();
    nextRadio.focus();
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
    const ariaLabelledby = hasLabel ? this.labelId : this.ariaLabelledbyValue || undefined;

    return html`
      <div class="field">
        <label part="label" class="label" id=${this.labelId} ?hidden=${!hasLabel}>
          <slot name="label" @slotchange=${this.onSlotChange}></slot>
        </label>
        <div
          part="base control"
          class="control"
          role="radiogroup"
          aria-invalid=${ifDefined(ariaInvalid)}
          aria-describedby=${ifDefined(describedBy)}
          aria-label=${ifDefined(ariaLabel)}
          aria-labelledby=${ifDefined(ariaLabelledby)}
          @change=${this.onRadioChange}
          @keydown=${this.onKeyDown}>
          <slot @slotchange=${this.onSlotChange}></slot>
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
