import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('uik-badge')
export class Badge extends LitElement {
  @property({type: String}) accessor variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';

  static override styles = css`
    :host {
      display: inline-flex;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      border-radius: 0.375rem;
      border: 1px solid transparent;
      padding: 0.125rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 600;
      transition:
        color 0.15s,
        background-color 0.15s;
    }

    .variant-default {
      background-color: hsl(var(--primary, 0 0% 98%));
      color: hsl(var(--primary-foreground, 240 5.9% 10%));
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .variant-secondary {
      background-color: hsl(var(--secondary, 240 3.7% 15.9%));
      color: hsl(var(--secondary-foreground, 0 0% 98%));
    }

    .variant-destructive {
      background-color: hsl(var(--destructive, 0 62.8% 30.6%));
      color: hsl(var(--destructive-foreground, 0 0% 98%));
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .variant-outline {
      background-color: transparent;
      border-color: hsl(var(--border, 240 3.7% 15.9%));
      color: hsl(var(--foreground, 0 0% 98%));
    }
  `;

  override render() {
    return html`
      <div part="base" class="badge variant-${this.variant}">
        <slot></slot>
      </div>
    `;
  }
}
