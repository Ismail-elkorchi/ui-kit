import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {styles} from './styles';

@customElement('uik-surface')
export class UikSurface extends LitElement {
  @property({type: String, reflect: true, useDefault: true}) accessor variant:
    | 'base'
    | 'muted'
    | 'card'
    | 'elevated'
    | 'popover' = 'base';
  @property({type: Boolean, reflect: true, useDefault: true}) accessor bordered = false;

  static override readonly styles = styles;

  override render() {
    return html`
      <div part="base" class="surface">
        <slot></slot>
      </div>
    `;
  }
}
