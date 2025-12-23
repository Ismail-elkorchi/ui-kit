import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {styles} from './styles';

@customElement('uik-box')
export class UikBox extends LitElement {
  @property({type: String, reflect: true, useDefault: true}) accessor padding: '0' | '1' | '2' | '3' | '4' | '5' | '6' = '0';
  @property({type: Boolean, reflect: true, useDefault: true}) accessor inline = false;

  static override readonly styles = styles;

  override render() {
    return html`
      <div part="base" class="box">
        <slot></slot>
      </div>
    `;
  }
}
