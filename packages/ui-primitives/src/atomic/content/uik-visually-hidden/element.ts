import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';

import {styles} from './styles';

@customElement('uik-visually-hidden')
export class UikVisuallyHidden extends LitElement {
  static override readonly styles = styles;

  override render() {
    return html`
      <span part="base"><slot></slot></span>
    `;
  }
}
