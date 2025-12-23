import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('uik-text')
export class UikText extends LitElement {
  @property({type: String}) accessor as: 'p' | 'span' | 'div' | 'label' = 'span';
  @property({type: String, reflect: true, useDefault: true}) accessor size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @property({type: String, reflect: true, useDefault: true}) accessor weight:
    | 'regular'
    | 'medium'
    | 'semibold'
    | 'bold' = 'regular';
  @property({type: String, reflect: true, useDefault: true}) accessor tone:
    | 'default'
    | 'muted'
    | 'strong'
    | 'danger'
    | 'success'
    | 'warning'
    | 'info' = 'default';
  @property({type: Boolean, reflect: true, useDefault: true}) accessor truncate = false;

  static override readonly styles = css`
    :host {
      display: block;
    }

    .text {
      margin: var(--uik-space-0);
      font-family: var(--uik-typography-font-family-sans);
      font-size: var(--uik-component-text-size-md);
      font-weight: var(--uik-component-text-weight-regular);
      line-height: var(--uik-component-text-line-height-md);
      color: oklch(var(--uik-component-text-color-default));
    }

    :host([size='sm']) .text {
      font-size: var(--uik-component-text-size-sm);
      line-height: var(--uik-component-text-line-height-sm);
    }

    :host([size='lg']) .text {
      font-size: var(--uik-component-text-size-lg);
      line-height: var(--uik-component-text-line-height-lg);
    }

    :host([size='xl']) .text {
      font-size: var(--uik-component-text-size-xl);
      line-height: var(--uik-component-text-line-height-xl);
    }

    :host([weight='medium']) .text {
      font-weight: var(--uik-component-text-weight-medium);
    }

    :host([weight='semibold']) .text {
      font-weight: var(--uik-component-text-weight-semibold);
    }

    :host([weight='bold']) .text {
      font-weight: var(--uik-component-text-weight-bold);
    }

    :host([tone='muted']) .text {
      color: oklch(var(--uik-component-text-color-muted));
    }

    :host([tone='strong']) .text {
      color: oklch(var(--uik-component-text-color-strong));
    }

    :host([tone='danger']) .text {
      color: oklch(var(--uik-component-text-color-danger));
    }

    :host([tone='success']) .text {
      color: oklch(var(--uik-component-text-color-success));
    }

    :host([tone='warning']) .text {
      color: oklch(var(--uik-component-text-color-warning));
    }

    :host([tone='info']) .text {
      color: oklch(var(--uik-component-text-color-info));
    }

    :host([truncate]) .text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `;

  override render() {
    switch (this.as) {
      case 'p':
        return html`
          <p part="base" class="text">
            <slot></slot>
          </p>
        `;
      case 'div':
        return html`
          <div part="base" class="text">
            <slot></slot>
          </div>
        `;
      case 'label':
        return html`
          <label part="base" class="text">
            <slot></slot>
          </label>
        `;
      case 'span':
      default:
        return html`
          <span part="base" class="text">
            <slot></slot>
          </span>
        `;
    }
  }
}
