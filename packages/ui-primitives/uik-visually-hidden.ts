import {LitElement, css, html} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('uik-visually-hidden')
export class UikVisuallyHidden extends LitElement {
  static override readonly styles = css`
    :host {
      position: absolute;
      width: var(--uik-border-width-1);
      height: var(--uik-border-width-1);
      padding: var(--uik-space-0);
      margin: calc(var(--uik-border-width-1) * -1);
      overflow: hidden;
      white-space: nowrap;
      border: var(--uik-border-width-0) solid oklch(var(--uik-border-default) / var(--uik-opacity-0));
      clip-path: inset(50%);
    }

    span {
      display: inline-block;
    }
  `;

  override render() {
    return html`
      <span part="base"><slot></slot></span>
    `;
  }
}
