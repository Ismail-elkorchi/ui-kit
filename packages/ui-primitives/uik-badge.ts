import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('uik-badge')
export class UikBadge extends LitElement {
  @property({type: String}) accessor variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';

  static override readonly styles = css`
    :host {
      display: inline-flex;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid transparent;
      border-radius: 0.375rem;
      transition:
        color 0.15s,
        background-color 0.15s;
    }

    .variant-default {
      color: hsl(var(--primary-foreground, 240 5.9% 10%));
      background-color: hsl(var(--primary, 0 0% 98%));
      box-shadow: 0 1px 2px rgb(0 0 0 / 10%);
    }

    .variant-secondary {
      color: hsl(var(--secondary-foreground, 0 0% 98%));
      background-color: hsl(var(--secondary, 240 3.7% 15.9%));
    }

    .variant-destructive {
      color: hsl(var(--destructive-foreground, 0 0% 98%));
      background-color: hsl(var(--destructive, 0 62.8% 30.6%));
      box-shadow: 0 1px 2px rgb(0 0 0 / 10%);
    }

    .variant-outline {
      color: hsl(var(--foreground, 0 0% 98%));
      background-color: transparent;
      border-color: hsl(var(--border, 240 3.7% 15.9%));
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
