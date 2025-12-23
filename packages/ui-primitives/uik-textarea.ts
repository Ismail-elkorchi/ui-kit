import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {buildDescribedBy, createId, hasSlotContent} from './internal';

type SlotName = 'label' | 'hint' | 'error';

@customElement('uik-textarea')
export class UikTextarea extends LitElement {
  static formAssociated = true;

  @property({type: String}) accessor placeholder = '';
  @property({type: String}) accessor value = '';
  @property({type: String, reflect: true, useDefault: true}) accessor name = '';
  @property({type: Number}) accessor rows = 3;
  @property({type: Boolean, reflect: true, useDefault: true}) accessor disabled = false;
  @property({type: Boolean, reflect: true, useDefault: true}) accessor required = false;
  @property({type: Boolean, reflect: true, useDefault: true}) accessor readonly = false;
  @property({type: Boolean, reflect: true, useDefault: true}) accessor invalid = false;
  @property({attribute: 'aria-label'}) accessor ariaLabelValue = '';
  @property({attribute: 'aria-labelledby'}) accessor ariaLabelledbyValue = '';
  @property({attribute: 'aria-describedby'}) accessor ariaDescribedbyValue = '';

  private readonly internals = this.attachInternals();
  private readonly controlId = createId('uik-textarea');
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

    textarea {
      width: 100%;
      min-height: var(--uik-component-textarea-base-min-height);
      padding: var(--uik-component-textarea-base-padding-y) var(--uik-component-textarea-base-padding-x);
      font-family: var(--uik-typography-font-family-sans);
      font-size: var(--uik-component-textarea-base-font-size);
      font-weight: var(--uik-typography-font-weight-regular);
      line-height: var(--uik-component-textarea-base-line-height);
      color: oklch(var(--uik-component-textarea-base-fg));
      resize: vertical;
      background-color: oklch(var(--uik-component-textarea-base-bg));
      border-color: oklch(var(--uik-component-textarea-base-border-default));
      border-style: var(--uik-border-style-solid);
      border-width: var(--uik-border-width-1);
      border-radius: var(--uik-component-textarea-base-radius);
      box-shadow: var(--uik-component-textarea-base-shadow);
      transition:
        border-color var(--uik-motion-transition-colors),
        box-shadow var(--uik-motion-transition-shadow),
        background-color var(--uik-motion-transition-colors),
        color var(--uik-motion-transition-colors);
    }

    textarea:hover {
      border-color: oklch(var(--uik-component-textarea-base-border-hover));
    }

    textarea::placeholder {
      color: oklch(var(--uik-component-textarea-base-placeholder));
    }

    textarea::selection {
      color: oklch(var(--uik-selection-fg));
      background-color: oklch(var(--uik-selection-bg));
    }

    textarea:focus-visible {
      outline: none;
      border-color: oklch(var(--uik-component-textarea-base-border-focus));
      box-shadow:
        var(--uik-component-textarea-base-shadow),
        0 0 0 var(--uik-focus-ring-offset-default) oklch(var(--uik-focus-ring-offset-bg)),
        0 0 0 calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
          oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
    }

    textarea:disabled {
      cursor: not-allowed;
      opacity: var(--uik-field-disabled-opacity);
    }

    @media (forced-colors: active) {
      textarea:focus-visible {
        outline: var(--uik-border-width-1) solid currentcolor;
        outline-offset: var(--uik-space-1);
        box-shadow: none;
      }
    }
  `;

  private get textareaElement(): HTMLTextAreaElement | null {
    return this.renderRoot.querySelector('textarea');
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
    const textarea = this.textareaElement;
    if (!textarea) return;

    if (this.invalid || this.hasSlotContent('error')) {
      this.internals.setValidity({customError: true}, 'Invalid', textarea);
      return;
    }

    if (textarea.checkValidity()) {
      this.internals.setValidity({});
    } else {
      this.internals.setValidity(textarea.validity, textarea.validationMessage, textarea);
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
    const textarea = event.target as HTMLTextAreaElement;
    this.value = textarea.value;
    this.syncFormValue();
    this.syncValidity();
  };

  private onInput = (event: Event) => {
    const textarea = event.target as HTMLTextAreaElement;
    this.value = textarea.value;
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
          <textarea
            part="base"
            id=${this.controlId}
            name=${this.name}
            placeholder=${this.placeholder}
            rows=${this.rows}
            .value=${this.value}
            ?disabled=${this.disabled}
            ?required=${this.required}
            ?readonly=${this.readonly}
            aria-invalid=${ifDefined(ariaInvalid)}
            aria-describedby=${ifDefined(describedBy)}
            aria-label=${ifDefined(ariaLabel)}
            aria-labelledby=${ifDefined(ariaLabelledby)}
            @change=${this.onChange}
            @input=${this.onInput}></textarea>
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
