import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {styles} from './styles';

@customElement('uik-progress')
export class UikProgress extends LitElement {
  @property({type: Number}) accessor value = 0;
  @property({type: Number}) accessor max = 100;
  @property({type: Boolean, reflect: true, useDefault: true}) accessor indeterminate = false;
  @property({attribute: 'aria-label'}) accessor ariaLabelValue = '';
  @property({attribute: 'aria-labelledby'}) accessor ariaLabelledbyValue = '';

  static override readonly styles = styles;

  override render() {
    const value = this.indeterminate ? undefined : String(this.value);
    return html`
      <progress
        part="base"
        value=${ifDefined(value)}
        max=${this.max}
        aria-label=${ifDefined(this.ariaLabelValue || undefined)}
        aria-labelledby=${ifDefined(this.ariaLabelledbyValue || undefined)}></progress>
    `;
  }
}
