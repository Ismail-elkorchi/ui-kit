import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {styles} from './styles';

/**
 * Anchor wrapper with tokenized colors and underline styling.
 * @attr href
 * @attr target
 * @attr rel
 * @attr download
 * @slot default (link text)
 * @part base
 * @event Native anchor events bubble from the internal <a>.
 * @a11y Forward aria-* attributes to <a>.
 * @cssprop --uik-component-link-fg-default
 * @cssprop --uik-component-link-fg-hover
 * @cssprop --uik-component-link-underline-offset
 */
@customElement('uik-link')
export class UikLink extends LitElement {
  @property({type: String}) accessor href = '';
  @property({type: String}) accessor target = '';
  @property({type: String}) accessor rel = '';
  @property({type: String}) accessor download = '';
  @property({attribute: 'aria-label'}) accessor ariaLabelValue = '';
  @property({attribute: 'aria-labelledby'}) accessor ariaLabelledbyValue = '';
  @property({attribute: 'aria-describedby'}) accessor ariaDescribedbyValue = '';

  static override readonly styles = styles;

  override render() {
    return html`
      <a
        part="base"
        href=${ifDefined(this.href || undefined)}
        target=${ifDefined(this.target || undefined)}
        rel=${ifDefined(this.rel || undefined)}
        download=${ifDefined(this.download || undefined)}
        aria-label=${ifDefined(this.ariaLabelValue || undefined)}
        aria-labelledby=${ifDefined(this.ariaLabelledbyValue || undefined)}
        aria-describedby=${ifDefined(this.ariaDescribedbyValue || undefined)}>
        <slot></slot>
      </a>
    `;
  }
}
