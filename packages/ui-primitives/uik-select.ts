import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {buildDescribedBy, createId, hasSlotContent} from './internal';

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

  static override readonly styles = css`
    :host {
      display: block;
      min-width: 0;
    }

    .field {
      display: grid;
      gap: var(--uik-space-2);
    }

    .label {
      font-size: var(--uik-typography-font-size-2);
      font-weight: var(--uik-typography-font-weight-medium);
      line-height: var(--uik-typography-line-height-2);
      color: oklch(var(--uik-text-strong));
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

    :host([disabled]) .label {
      color: oklch(var(--uik-text-disabled));
    }

    select {
      width: 100%;
      height: var(--uik-size-control-md);
      padding: var(--uik-component-select-base-padding-y) var(--uik-component-select-base-padding-x);
      font-family: var(--uik-typography-font-family-sans);
      font-size: var(--uik-component-select-base-font-size);
      font-weight: var(--uik-typography-font-weight-regular);
      line-height: var(--uik-component-select-base-line-height);
      color: oklch(var(--uik-component-select-base-fg));
      background-color: oklch(var(--uik-component-select-base-bg));
      border-color: oklch(var(--uik-component-select-base-border-default));
      border-style: var(--uik-border-style-solid);
      border-width: var(--uik-border-width-1);
      border-radius: var(--uik-component-select-base-radius);
      box-shadow: var(--uik-component-select-base-shadow);
      transition:
        border-color var(--uik-motion-transition-colors),
        box-shadow var(--uik-motion-transition-shadow),
        background-color var(--uik-motion-transition-colors),
        color var(--uik-motion-transition-colors);
    }

    select:hover {
      border-color: oklch(var(--uik-component-select-base-border-hover));
    }

    select:focus-visible {
      outline: none;
      border-color: oklch(var(--uik-component-select-base-border-focus));
      box-shadow:
        var(--uik-component-select-base-shadow),
        0 0 0 var(--uik-focus-ring-offset-default) oklch(var(--uik-focus-ring-offset-bg)),
        0 0 0 calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
          oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
    }

    select:disabled {
      cursor: not-allowed;
      opacity: var(--uik-field-disabled-opacity);
    }

    @media (forced-colors: active) {
      select:focus-visible {
        outline: var(--uik-border-width-1) solid currentcolor;
        outline-offset: var(--uik-space-1);
        box-shadow: none;
      }
    }
  `;

  private get selectElement(): HTMLSelectElement | null {
    return this.renderRoot.querySelector('select');
  }

  override connectedCallback() {
    super.connectedCallback();
    this.defaultValue = this.value;
  }

  override firstUpdated() {
    this.defaultValue = this.value;
    this.syncFormValue();
    this.syncValidity();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('value') || changed.has('disabled')) {
      this.syncFormValue();
    }

    if (changed.has('required') || changed.has('invalid')) {
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
            @change=${this.onChange}>
            <slot></slot>
          </select>
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
