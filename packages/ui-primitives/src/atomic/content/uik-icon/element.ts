import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {styles} from './styles';

@customElement('uik-icon')
export class UikIcon extends LitElement {
  @property({type: String, reflect: true, useDefault: true}) accessor size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
  @property({type: String, reflect: true, useDefault: true}) accessor tone:
    | 'default'
    | 'muted'
    | 'danger'
    | 'success'
    | 'warning'
    | 'info'
    | 'inverse' = 'default';
  @property({attribute: 'aria-label'}) accessor ariaLabelValue = '';
  @property({attribute: 'aria-hidden'}) accessor ariaHiddenValue = '';

  static override readonly styles = styles;

  override render() {
    return html`
      <span
        part="base"
        class="icon"
        role=${ifDefined(this.ariaLabelValue ? 'img' : undefined)}
        aria-label=${ifDefined(this.ariaLabelValue || undefined)}
        aria-hidden=${ifDefined(this.ariaHiddenValue || undefined)}>
        <slot></slot>
      </span>
    `;
  }
}
