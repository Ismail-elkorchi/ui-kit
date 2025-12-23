import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {hasSlotContent} from './internal';

@customElement('uik-alert')
export class UikAlert extends LitElement {
  @property({type: String, reflect: true, useDefault: true}) accessor variant:
    | 'neutral'
    | 'info'
    | 'success'
    | 'warning'
    | 'danger' = 'neutral';

  static override readonly styles = css`
    :host {
      display: block;
    }

    .alert {
      display: grid;
      gap: var(--uik-space-2);
      padding: var(--uik-space-4);
      color: oklch(var(--uik-component-alert-neutral-fg));
      background-color: oklch(var(--uik-component-alert-neutral-bg));
      border: var(--uik-border-width-1) solid oklch(var(--uik-component-alert-neutral-border));
      border-radius: var(--uik-radius-3);
      box-shadow: var(--uik-shadow-0);
    }

    :host([variant='info']) .alert {
      color: oklch(var(--uik-component-alert-info-fg));
      background-color: oklch(var(--uik-component-alert-info-bg));
      border-color: oklch(var(--uik-component-alert-info-border));
    }

    :host([variant='success']) .alert {
      color: oklch(var(--uik-component-alert-success-fg));
      background-color: oklch(var(--uik-component-alert-success-bg));
      border-color: oklch(var(--uik-component-alert-success-border));
    }

    :host([variant='warning']) .alert {
      color: oklch(var(--uik-component-alert-warning-fg));
      background-color: oklch(var(--uik-component-alert-warning-bg));
      border-color: oklch(var(--uik-component-alert-warning-border));
    }

    :host([variant='danger']) .alert {
      color: oklch(var(--uik-component-alert-danger-fg));
      background-color: oklch(var(--uik-component-alert-danger-bg));
      border-color: oklch(var(--uik-component-alert-danger-border));
    }

    .title {
      font-size: var(--uik-typography-font-size-3);
      font-weight: var(--uik-typography-font-weight-semibold);
      line-height: var(--uik-typography-line-height-3);
    }

    .body {
      font-size: var(--uik-typography-font-size-2);
      line-height: var(--uik-typography-line-height-3);
    }
  `;

  override render() {
    const role = this.variant === 'warning' || this.variant === 'danger' ? 'alert' : 'status';
    return html`
      <div part="base" class="alert" role=${role}>
        <div part="title" class="title" ?hidden=${!this.hasTitleSlot}>
          <slot name="title"></slot>
        </div>
        <div part="body" class="body">
          <slot></slot>
        </div>
      </div>
    `;
  }

  private get hasTitleSlot() {
    return hasSlotContent(this, 'title');
  }
}
