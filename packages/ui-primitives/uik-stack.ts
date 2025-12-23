import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('uik-stack')
export class UikStack extends LitElement {
  @property({type: String, reflect: true, useDefault: true}) accessor direction: 'vertical' | 'horizontal' = 'vertical';
  @property({type: String, reflect: true, useDefault: true}) accessor gap: '1' | '2' | '3' | '4' | '5' | '6' = '3';
  @property({type: String, reflect: true, useDefault: true}) accessor align:
    | 'start'
    | 'center'
    | 'end'
    | 'stretch' = 'stretch';
  @property({type: String, reflect: true, useDefault: true}) accessor justify:
    | 'start'
    | 'center'
    | 'end'
    | 'between' = 'start';

  static override readonly styles = css`
    :host {
      --uik-stack-align: stretch;
      --uik-stack-justify: flex-start;
      --uik-stack-direction: column;

      display: block;
    }

    :host([direction='horizontal']) {
      --uik-stack-direction: row;
    }

    :host([align='start']) {
      --uik-stack-align: flex-start;
    }

    :host([align='center']) {
      --uik-stack-align: center;
    }

    :host([align='end']) {
      --uik-stack-align: flex-end;
    }

    :host([justify='start']) {
      --uik-stack-justify: flex-start;
    }

    :host([justify='center']) {
      --uik-stack-justify: center;
    }

    :host([justify='end']) {
      --uik-stack-justify: flex-end;
    }

    :host([justify='between']) {
      --uik-stack-justify: space-between;
    }

    .stack {
      display: flex;
      flex-direction: var(--uik-stack-direction);
      gap: var(--uik-component-stack-gap-3);
      align-items: var(--uik-stack-align);
      justify-content: var(--uik-stack-justify);
    }

    :host([gap='1']) .stack {
      gap: var(--uik-component-stack-gap-1);
    }

    :host([gap='2']) .stack {
      gap: var(--uik-component-stack-gap-2);
    }

    :host([gap='3']) .stack {
      gap: var(--uik-component-stack-gap-3);
    }

    :host([gap='4']) .stack {
      gap: var(--uik-component-stack-gap-4);
    }

    :host([gap='5']) .stack {
      gap: var(--uik-component-stack-gap-5);
    }

    :host([gap='6']) .stack {
      gap: var(--uik-component-stack-gap-6);
    }
  `;

  override render() {
    return html`
      <div part="base" class="stack">
        <slot></slot>
      </div>
    `;
  }
}
