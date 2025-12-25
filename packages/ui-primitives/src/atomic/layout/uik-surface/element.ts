import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {styles} from './styles';

/**
 * Surface wrapper for background, border, and elevation tokens.
 * @attr variant (base | muted | card | elevated | popover)
 * @attr bordered (boolean)
 * @slot default
 * @part base
 * @a11y Use semantic HTML inside; does not add roles.
 * @cssprop --uik-component-surface-bg-{default|muted|card|elevated|popover}
 * @cssprop --uik-component-surface-shadow-{default|card|elevated|popover}
 * @cssprop --uik-component-surface-border-color-{default|bordered}
 * @cssprop --uik-component-surface-border-width-{default|bordered}
 * @cssprop --uik-component-surface-radius
 */
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
