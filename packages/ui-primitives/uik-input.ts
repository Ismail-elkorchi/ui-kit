import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

type InputEventName = 'input' | 'change';

@customElement('uik-input')
export class UikInput extends LitElement {
  @property({type: String}) accessor type = 'text';
  @property({type: String}) accessor placeholder = '';
  @property({type: String}) accessor value = '';
  @property({type: Boolean}) accessor disabled = false;
  @property({type: String}) accessor label = '';

  static override readonly styles = css`
    :host {
      display: block;
      flex: 1;
      min-width: 0;
    }

    input {
      display: flex;
      width: 100%;
      height: var(--uik-component-input-base-height);
      padding: var(--uik-component-input-base-padding-y) var(--uik-component-input-base-padding-x);
      font-size: var(--uik-component-input-base-font-size);
      font-weight: var(--uik-component-input-base-font-weight);
      line-height: var(--uik-component-input-base-line-height);
      color: oklch(var(--uik-component-input-base-fg));
      background-color: oklch(var(--uik-component-input-base-bg));
      border-style: var(--uik-border-style-solid);
      border-width: var(--uik-component-input-base-border-width);
      border-color: oklch(var(--uik-component-input-base-border-default));
      border-radius: var(--uik-component-input-base-radius);
      box-shadow: var(--uik-component-input-base-shadow);
      transition:
        border-color var(--uik-motion-transition-colors),
        box-shadow var(--uik-motion-transition-shadow),
        background-color var(--uik-motion-transition-colors),
        color var(--uik-motion-transition-colors);
    }

    input:hover {
      border-color: oklch(var(--uik-component-input-base-border-hover));
    }

    input::placeholder {
      color: oklch(var(--uik-component-input-base-placeholder));
    }

    input::selection {
      color: oklch(var(--uik-component-input-base-selection-fg));
      background-color: oklch(var(--uik-component-input-base-selection-bg));
    }

    input:focus-visible {
      outline: none;
      border-color: oklch(var(--uik-component-input-base-border-focus));
      box-shadow:
        var(--uik-component-input-base-shadow),
        0 0 0 var(--uik-component-input-base-focus-ring-offset) oklch(var(--uik-focus-ring-offset-bg)),
        0 0 0 calc(var(--uik-component-input-base-focus-ring-offset) + var(--uik-component-input-base-focus-ring-width))
          oklch(var(--uik-component-input-base-focus-ring) / var(--uik-component-input-base-focus-ring-opacity));
    }

    input:disabled {
      cursor: not-allowed;
      opacity: var(--uik-component-input-base-disabled-opacity);
    }
  `;

  private emitValue(name: InputEventName, originalEvent: Event) {
    this.dispatchEvent(new CustomEvent(name, {detail: {value: this.value, originalEvent}, bubbles: true, composed: true}));
  }

  private onChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    event.stopPropagation();
    this.emitValue('change', event);
  };

  private onInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    event.stopPropagation();
    this.emitValue('input', event);
  };

  override render() {
    return html`
      <input
        part="base"
        type=${this.type}
        aria-label=${this.label}
        placeholder=${this.placeholder}
        .value=${this.value}
        ?disabled=${this.disabled}
        @change=${this.onChange}
        @input=${this.onInput} />
    `;
  }
}
