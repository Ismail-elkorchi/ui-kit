import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {styles} from './styles';

@customElement('uik-spinner')
export class UikSpinner extends LitElement {
  @property({type: String, reflect: true, useDefault: true}) accessor size: 'sm' | 'md' | 'lg' = 'md';
  @property({type: String, reflect: true, useDefault: true}) accessor tone:
    | 'default'
    | 'muted'
    | 'primary'
    | 'danger'
    | 'success'
    | 'warning'
    | 'info' = 'default';

  static override readonly styles = styles;

  override render() {
    return html`
      <span part="base" class="spinner" role="status" aria-live="polite"></span>
    `;
  }
}
