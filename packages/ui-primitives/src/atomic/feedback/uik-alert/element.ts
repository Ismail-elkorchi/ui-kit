import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {styles} from './styles';
import {hasSlotContent} from '../../../internal';

@customElement('uik-alert')
export class UikAlert extends LitElement {
  @property({type: String, reflect: true, useDefault: true}) accessor variant:
    | 'neutral'
    | 'info'
    | 'success'
    | 'warning'
    | 'danger' = 'neutral';

  static override readonly styles = styles;

  override render() {
    const role = this.variant === 'warning' || this.variant === 'danger' ? 'alert' : 'status';
    return html`
      <div part="base" class="alert" role=${role}>
        <div part="title" class="title" ?hidden=${!this.hasTitleSlot}>
          <slot name="title"></slot>
        </div>
        <div part="body" class="body">
          <slot></slot>
        </div>
      </div>
    `;
  }

  private get hasTitleSlot() {
    return hasSlotContent(this, 'title');
  }
}
