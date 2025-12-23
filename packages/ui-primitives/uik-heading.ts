import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('uik-heading')
export class UikHeading extends LitElement {
  @property({type: Number, reflect: true, useDefault: true}) accessor level = 2;
  @property({type: String, reflect: true, useDefault: true}) accessor tone:
    | 'default'
    | 'strong'
    | 'muted'
    | 'danger'
    | 'success'
    | 'warning'
    | 'info' = 'strong';

  static override readonly styles = css`
    :host {
      display: block;
    }

    .heading {
      margin: var(--uik-space-0);
      font-family: var(--uik-typography-font-family-sans);
      font-size: var(--uik-component-heading-size-2);
      font-weight: var(--uik-component-heading-weight);
      line-height: var(--uik-component-heading-line-height-2);
      color: oklch(var(--uik-component-heading-color-strong));
    }

    :host([level='1']) .heading {
      font-size: var(--uik-component-heading-size-1);
      line-height: var(--uik-component-heading-line-height-1);
    }

    :host([level='2']) .heading {
      font-size: var(--uik-component-heading-size-2);
      line-height: var(--uik-component-heading-line-height-2);
    }

    :host([level='3']) .heading {
      font-size: var(--uik-component-heading-size-3);
      line-height: var(--uik-component-heading-line-height-3);
    }

    :host([level='4']) .heading {
      font-size: var(--uik-component-heading-size-4);
      line-height: var(--uik-component-heading-line-height-4);
    }

    :host([level='5']) .heading {
      font-size: var(--uik-component-heading-size-5);
      line-height: var(--uik-component-heading-line-height-5);
    }

    :host([level='6']) .heading {
      font-size: var(--uik-component-heading-size-6);
      line-height: var(--uik-component-heading-line-height-6);
    }

    :host([tone='default']) .heading {
      color: oklch(var(--uik-component-heading-color-default));
    }

    :host([tone='muted']) .heading {
      color: oklch(var(--uik-component-heading-color-muted));
    }

    :host([tone='danger']) .heading {
      color: oklch(var(--uik-component-heading-color-danger));
    }

    :host([tone='success']) .heading {
      color: oklch(var(--uik-component-heading-color-success));
    }

    :host([tone='warning']) .heading {
      color: oklch(var(--uik-component-heading-color-warning));
    }

    :host([tone='info']) .heading {
      color: oklch(var(--uik-component-heading-color-info));
    }
  `;

  private get resolvedLevel() {
    if (this.level < 1) return 1;
    if (this.level > 6) return 6;
    return this.level;
  }

  override render() {
    switch (this.resolvedLevel) {
      case 1:
        return html`
          <h1 part="base" class="heading">
            <slot></slot>
          </h1>
        `;
      case 2:
        return html`
          <h2 part="base" class="heading">
            <slot></slot>
          </h2>
        `;
      case 3:
        return html`
          <h3 part="base" class="heading">
            <slot></slot>
          </h3>
        `;
      case 4:
        return html`
          <h4 part="base" class="heading">
            <slot></slot>
          </h4>
        `;
      case 5:
        return html`
          <h5 part="base" class="heading">
            <slot></slot>
          </h5>
        `;
      case 6:
      default:
        return html`
          <h6 part="base" class="heading">
            <slot></slot>
          </h6>
        `;
    }
  }
}
