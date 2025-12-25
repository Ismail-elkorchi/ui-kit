import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';

import {styles} from './styles';

/**
 * Utility to hide content visually while keeping it accessible.
 * @slot default
 * @part base
 * @a11y Use for screen-reader-only labels or descriptions.
 */
@customElement('uik-visually-hidden')
export class UikVisuallyHidden extends LitElement {
  static override readonly styles = styles;

  override render() {
    return html`
      <span part="base"><slot></slot></span>
    `;
  }
}
