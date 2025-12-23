import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {styles} from './styles';

@customElement('uik-button')
export class UikButton extends LitElement {
  static formAssociated = true;

  @property({type: String, reflect: true}) accessor variant:
    | 'solid'
    | 'danger'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link' = 'solid';
  @property({type: String, reflect: true}) accessor size: 'default' | 'sm' | 'lg' | 'icon' = 'default';
  @property({type: String}) accessor type: 'button' | 'submit' | 'reset' = 'button';
  @property({type: Boolean, reflect: true}) accessor disabled = false;
  @property({type: Boolean, reflect: true}) accessor active = false;
  @property({type: Boolean, reflect: true}) accessor muted = false;
  @property({attribute: 'aria-label'}) accessor ariaLabelValue = '';
  @property({attribute: 'aria-labelledby'}) accessor ariaLabelledbyValue = '';

  private readonly internals = this.attachInternals();

  static override readonly styles = styles;

  override render() {
    return html`
      <button
        part="base"
        class="variant-${this.variant} size-${this.size}"
        type=${this.type}
        aria-label=${ifDefined(this.ariaLabelValue || undefined)}
        aria-labelledby=${ifDefined(this.ariaLabelledbyValue || undefined)}
        ?disabled=${this.disabled}
        @click=${this.onClick}>
        <slot></slot>
      </button>
    `;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  private onClick = (event: MouseEvent) => {
    if (this.disabled) return;
    const form = this.internals.form;
    if (!form) return;

    if (this.type === 'submit') {
      event.preventDefault();
      form.requestSubmit();
    } else if (this.type === 'reset') {
      event.preventDefault();
      form.reset();
    }
  };
}
