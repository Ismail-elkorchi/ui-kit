import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('uik-separator')
export class UikSeparator extends LitElement {
  @property({type: String, reflect: true}) accessor orientation: 'horizontal' | 'vertical' = 'horizontal';

  static override readonly styles = css`
    :host {
      display: block;
      flex-shrink: 0;
    }

    .separator {
      border: none;
      background-color: oklch(var(--uik-separator-color));
      border-radius: var(--uik-separator-radius);
    }

    .horizontal {
      width: 100%;
      height: var(--uik-separator-thickness);
    }

    .vertical {
      width: var(--uik-separator-thickness);
      height: 100%;
      min-height: var(--uik-size-control-md);
    }
  `;

  override render() {
    const isHorizontal = this.orientation === 'horizontal';
    if (isHorizontal) {
      return html`<hr part="base" class="separator horizontal" />`;
    }
    return html`<div part="base" class="separator vertical" role="separator" aria-orientation="vertical"></div>`;
  }
}
