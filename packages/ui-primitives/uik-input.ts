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
      height: 2.25rem;
      padding: 0.25rem 0.75rem;
      font-size: 0.875rem;
      color: hsl(var(--foreground, 0 0% 98%));
      background-color: transparent;
      border: 1px solid hsl(var(--input, 240 3.7% 15.9%));
      border-radius: 0.375rem;
      box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
      transition:
        border-color 0.15s,
        box-shadow 0.15s;
    }

    input::placeholder {
      color: hsl(var(--muted-foreground, 240 5% 64.9%));
    }

    input:focus-visible {
      outline: none;
      box-shadow: 0 0 0 1px hsl(var(--ring, 240 4.9% 83.9%));
    }

    input:disabled {
      cursor: not-allowed;
      opacity: 0.5;
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
