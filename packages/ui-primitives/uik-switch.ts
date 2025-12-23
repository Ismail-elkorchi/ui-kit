import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {buildDescribedBy, createId, hasSlotContent} from './internal';

type SlotName = 'label' | 'hint' | 'error';

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

    .switch {
      position: relative;
      flex-shrink: 0;
      width: var(--uik-component-switch-width);
      height: var(--uik-component-switch-height);
    }

    input {
      position: absolute;
      inset: 0;
      margin: var(--uik-space-0);
      cursor: pointer;
      opacity: var(--uik-opacity-0);
    }

    .track {
      position: absolute;
      inset: 0;
      background-color: oklch(var(--uik-component-switch-track-bg-default));
      border: var(--uik-border-width-1) solid oklch(var(--uik-component-switch-track-border-default));
      border-radius: var(--uik-radius-full);
      transition:
        background-color var(--uik-motion-transition-colors),
        border-color var(--uik-motion-transition-colors),
        box-shadow var(--uik-motion-transition-shadow);
    }

    .thumb {
      position: absolute;
      top: var(--uik-component-switch-padding);
      left: var(--uik-component-switch-padding);
      width: var(--uik-component-switch-thumb-size);
      height: var(--uik-component-switch-thumb-size);
      background-color: oklch(var(--uik-component-switch-thumb-bg));
      border-radius: var(--uik-radius-full);
      box-shadow: var(--uik-component-switch-thumb-shadow);
      transition: transform var(--uik-motion-transition-transform);
    }

    input:checked ~ .track {
      background-color: oklch(var(--uik-component-switch-track-bg-checked));
      border-color: oklch(var(--uik-component-switch-track-border-checked));
    }

    input:checked ~ .thumb {
      transform: translateX(
        calc(
          var(--uik-component-switch-width) - var(--uik-component-switch-thumb-size) -
            var(--uik-component-switch-padding) - var(--uik-component-switch-padding)
        )
      );
    }

    input:focus-visible ~ .track {
      box-shadow:
        0 0 0 var(--uik-focus-ring-offset-default) oklch(var(--uik-focus-ring-offset-bg)),
        0 0 0 calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
          oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
    }

    :host([disabled]) .control {
      cursor: not-allowed;
      opacity: var(--uik-field-disabled-opacity);
    }

    @media (prefers-reduced-motion: reduce) {
      .track,
      .thumb {
        transition: none;
      }
    }

    @media (forced-colors: active) {
      input:focus-visible ~ .track {
        outline: var(--uik-border-width-1) solid currentcolor;
        outline-offset: var(--uik-space-1);
        box-shadow: none;
      }
    }
  `;

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
