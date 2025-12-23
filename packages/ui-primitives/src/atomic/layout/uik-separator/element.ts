import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {styles} from './styles';

@customElement('uik-separator')
export class UikSeparator extends LitElement {
  @property({type: String, reflect: true}) accessor orientation: 'horizontal' | 'vertical' = 'horizontal';

  static override readonly styles = styles;

  override render() {
    const isHorizontal = this.orientation === 'horizontal';
    if (isHorizontal) {
      return html`<hr part="base" class="separator horizontal" />`;
    }
    return html`<div part="base" class="separator vertical" role="separator" aria-orientation="vertical"></div>`;
  }
}
