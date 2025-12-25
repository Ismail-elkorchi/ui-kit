import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {styles} from './styles';

/**
 * Compact label for status or counts.
 * @attr variant (default | secondary | danger | outline)
 * @slot default (label)
 * @part base
 * @a11y Inline element; provide meaningful text content.
 * @cssprop --uik-component-badge-base-* (padding, radius, font, border)
 * @cssprop --uik-component-badge-{default|secondary|danger|outline}-{bg|border|fg|shadow}
 */
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
