import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('uik-surface')
export class UikSurface extends LitElement {
  @property({type: String, reflect: true, useDefault: true}) accessor variant:
    | 'base'
    | 'muted'
    | 'card'
    | 'elevated'
    | 'popover' = 'base';
  @property({type: Boolean, reflect: true, useDefault: true}) accessor bordered = false;

  static override readonly styles = css`
    :host {
      display: block;
    }

    .surface {
      background-color: oklch(var(--uik-component-surface-bg-default));
      border-color: oklch(var(--uik-component-surface-border-color-default));
      border-style: var(--uik-border-style-solid);
      border-width: var(--uik-component-surface-border-width-default);
      border-radius: var(--uik-component-surface-radius);
      box-shadow: var(--uik-component-surface-shadow-default);
    }

    :host([variant='muted']) .surface {
      background-color: oklch(var(--uik-component-surface-bg-muted));
    }

    :host([variant='card']) .surface {
      background-color: oklch(var(--uik-component-surface-bg-card));
      box-shadow: var(--uik-component-surface-shadow-card);
    }

    :host([variant='elevated']) .surface {
      background-color: oklch(var(--uik-component-surface-bg-elevated));
      box-shadow: var(--uik-component-surface-shadow-elevated);
    }

    :host([variant='popover']) .surface {
      background-color: oklch(var(--uik-component-surface-bg-popover));
      box-shadow: var(--uik-component-surface-shadow-popover);
    }

    :host([bordered]) .surface {
      border-color: oklch(var(--uik-component-surface-border-color-bordered));
      border-width: var(--uik-component-surface-border-width-bordered);
    }
  `;

  override render() {
    return html`
      <div part="base" class="surface">
        <slot></slot>
      </div>
    `;
  }
}
