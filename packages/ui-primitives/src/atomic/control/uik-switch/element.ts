import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {styles} from './styles';
import {buildDescribedBy, createId, hasSlotContent} from '../../../internal';

type SlotName = 'label' | 'hint' | 'error';

/**
 * Form-associated switch control with label, hint, and error slots.
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
 * @part track
 * @part thumb
 * @part label
 * @part hint
 * @part error
 * @event Native change bubbles from the internal <input>.
 * @a11y Uses role="switch" and supports label slot or aria-label.
 * @cssprop --uik-component-switch-height
 * @cssprop --uik-component-switch-width
 * @cssprop --uik-component-switch-padding
 * @cssprop --uik-component-switch-thumb-size
 * @cssprop --uik-component-switch-thumb-bg
 * @cssprop --uik-component-switch-thumb-shadow
 * @cssprop --uik-component-switch-track-bg-default
 * @cssprop --uik-component-switch-track-bg-checked
 * @cssprop --uik-component-switch-track-border-default
 * @cssprop --uik-component-switch-track-border-checked
 */
@customElement('uik-switch')
export class UikSwitch extends LitElement {
  static formAssociated = true;

  @property({type: String}) accessor value = 'on';
  @property({type: String, reflect: true, useDefault: true}) accessor name = '';
  @property({type: Boolean, reflect: true, useDefault: true}) accessor checked = false;
  @property({type: Boolean, reflect: true, useDefault: true}) accessor disabled = false;
  @property({type: Boolean, reflect: true, useDefault: true}) accessor required = false;
  @property({type: Boolean, reflect: true, useDefault: true}) accessor invalid = false;
  @property({attribute: 'aria-label'}) accessor ariaLabelValue = '';
  @property({attribute: 'aria-labelledby'}) accessor ariaLabelledbyValue = '';
  @property({attribute: 'aria-describedby'}) accessor ariaDescribedbyValue = '';

  private readonly internals = this.attachInternals();
  private readonly controlId = createId('uik-switch');
  private readonly hintId = `${this.controlId}-hint`;
  private readonly errorId = `${this.controlId}-error`;
  private defaultChecked = false;

  static override readonly styles = styles;

  private get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector('input');
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
    if (changed.has('checked') || changed.has('disabled') || changed.has('value')) {
      this.syncFormValue();
    }

    if (changed.has('required') || changed.has('invalid') || changed.has('checked')) {
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
    } else if (typeof state === 'string') {
      this.checked = true;
      this.value = state;
    }
    this.syncFormValue();
    this.syncValidity();
  }

  private syncFormValue() {
    const value = this.disabled || !this.checked ? null : this.value;
    this.internals.setFormValue(value);
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
    return hasSlotContent(this, name);
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
    this.checked = input.checked;
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
        <label part="control" class="control">
          <span class="switch">
            <input
              part="base"
              id=${this.controlId}
              type="checkbox"
              role="switch"
              name=${this.name}
              .value=${this.value}
              ?checked=${this.checked}
              ?disabled=${this.disabled}
              ?required=${this.required}
              aria-checked=${this.checked ? 'true' : 'false'}
              aria-invalid=${ifDefined(ariaInvalid)}
              aria-describedby=${ifDefined(describedBy)}
              aria-label=${ifDefined(ariaLabel)}
              aria-labelledby=${ifDefined(ariaLabelledby)}
              @change=${this.onChange} />
            <span part="track" class="track"></span>
            <span part="thumb" class="thumb"></span>
          </span>
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
