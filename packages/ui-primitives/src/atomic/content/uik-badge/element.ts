import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {styles} from './styles';

@customElement('uik-badge')
export class UikBadge extends LitElement {
  @property({type: String}) accessor variant: 'default' | 'secondary' | 'danger' | 'outline' = 'default';

  static override readonly styles = styles;

  override render() {
    return html`
      <div part="base" class="badge variant-${this.variant}">
        <slot></slot>
      </div>
    `;
  }
}
