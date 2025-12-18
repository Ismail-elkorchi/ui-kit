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
      width: 100%;
      height: 1px;
    }

    .vertical {
      width: 1px;
      height: 100%;
    }
  `;

  override render() {
    const isHorizontal = this.orientation === 'horizontal';
    return html` <div part="base" class="separator ${isHorizontal ? 'horizontal' : 'vertical'}" role="none"></div> `;
  }
}
