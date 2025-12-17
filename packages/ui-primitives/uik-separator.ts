import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('uik-separator')
export class UikSeparator extends LitElement {
  @property({type: String}) accessor orientation: 'horizontal' | 'vertical' = 'horizontal';

  static override readonly styles = css`
    :host {
      display: block;
      flex-shrink: 0;
    }

    .separator {
      background-color: hsl(var(--border, 240 3.7% 15.9%));
    }

    .horizontal {
      height: 1px;
      width: 100%;
    }

    .vertical {
      height: 100%;
      width: 1px;
    }
  `;

  override render() {
    const isHorizontal = this.orientation === 'horizontal';
    return html` <div part="base" class="separator ${isHorizontal ? 'horizontal' : 'vertical'}" role="none"></div> `;
  }
}
