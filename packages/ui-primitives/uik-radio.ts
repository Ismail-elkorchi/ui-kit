import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {buildDescribedBy, createId, hasSlotContent} from './internal';

type SlotName = 'label' | 'hint' | 'error';

@customElement('uik-radio')
export class UikRadio extends LitElement {
  static formAssociated = true;

  @property({type: String}) accessor value = 'on';
  @property({type: String, reflect: true, useDefault: true}) accessor name = '';
  @property({type: Boolean, reflect: true, useDefault: true}) accessor checked = false;
  @property({type: Boolean, reflect: true, useDefault: true}) accessor disabled = false;
  @property({type: Boolean, reflect: true, useDefault: true}) accessor required = false;
  @property({type: Boolean, reflect: true, useDefault: true}) accessor invalid = false;
  @property({type: Number}) accessor tabIndexValue = 0;
  @property({type: Boolean}) accessor groupDisabled = false;
  @property({attribute: 'aria-label'}) accessor ariaLabelValue = '';
  @property({attribute: 'aria-labelledby'}) accessor ariaLabelledbyValue = '';
  @property({attribute: 'aria-describedby'}) accessor ariaDescribedbyValue = '';

  private readonly internals = this.attachInternals();
  private readonly controlId = createId('uik-radio');
  private readonly hintId = `${this.controlId}-hint`;
  private readonly errorId = `${this.controlId}-error`;
  private defaultChecked = false;

  static override readonly styles = css`
    :host {
      display: block;
    }

    .field {
      display: grid;
      gap: var(--uik-space-2);
    }

    .control {
      display: inline-flex;
      gap: var(--uik-space-2);
      align-items: center;
      font-size: var(--uik-typography-font-size-3);
      line-height: var(--uik-typography-line-height-4);
      color: oklch(var(--uik-text-default));
      cursor: pointer;
    }

    .control-text {
      color: oklch(var(--uik-text-default));
    }

    .hint {
      font-size: var(--uik-typography-font-size-1);
      line-height: var(--uik-typography-line-height-2);
      color: oklch(var(--uik-text-muted));
    }

    .error {
      font-size: var(--uik-typography-font-size-1);
      line-height: var(--uik-typography-line-height-2);
      color: oklch(var(--uik-text-danger));
    }

    input {
      width: var(--uik-component-radio-size);
      height: var(--uik-component-radio-size);
      margin: var(--uik-space-0);
      accent-color: oklch(var(--uik-component-radio-accent));
    }

    input:focus-visible {
      outline: none;
      box-shadow:
        0 0 0 var(--uik-focus-ring-offset-default) oklch(var(--uik-focus-ring-offset-bg)),
        0 0 0 calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
          oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
    }

    :host([disabled]) .control {
      cursor: not-allowed;
      opacity: var(--uik-field-disabled-opacity);
    }

    @media (forced-colors: active) {
      input:focus-visible {
        outline: var(--uik-border-width-1) solid currentcolor;
        outline-offset: var(--uik-space-1);
        box-shadow: none;
      }
    }
  `;

  private get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector('input');
  }

  private get isGrouped() {
    return Boolean(this.closest('uik-radio-group'));
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
    const value = this.disabled || this.groupDisabled || !this.checked || this.isGrouped ? null : this.value;
    this.internals.setFormValue(value);
  }

  private syncValidity() {
    const input = this.inputElement;
    if (!input) return;

    if (this.isGrouped || this.groupDisabled) {
      this.internals.setValidity({});
      return;
    }

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

  override focus(options?: FocusOptions) {
    this.inputElement?.focus(options);
  }

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
            @change=${this.onChange} />
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
