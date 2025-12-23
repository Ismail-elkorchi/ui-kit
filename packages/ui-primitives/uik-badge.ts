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
      --uik-badge-bg: oklch(var(--uik-component-badge-default-bg));
      --uik-badge-fg: oklch(var(--uik-component-badge-default-fg));
      --uik-badge-border-color: oklch(var(--uik-component-badge-default-border));
      --uik-badge-shadow: var(--uik-component-badge-default-shadow);

      display: inline-flex;
      align-items: center;
      padding: var(--uik-component-badge-base-padding-y) var(--uik-component-badge-base-padding-x);
      font-size: var(--uik-component-badge-base-font-size);
      font-weight: var(--uik-component-badge-base-font-weight);
      line-height: var(--uik-component-badge-base-line-height);
      color: var(--uik-badge-fg);
      background-color: var(--uik-badge-bg);
      border-color: var(--uik-badge-border-color);
      border-style: var(--uik-border-style-solid);
      border-width: var(--uik-component-badge-base-border-width);
      border-radius: var(--uik-component-badge-base-radius);
      box-shadow: var(--uik-badge-shadow);
      transition:
        color var(--uik-motion-transition-colors),
        background-color var(--uik-motion-transition-colors),
        border-color var(--uik-motion-transition-colors),
        box-shadow var(--uik-motion-transition-shadow);
    }

    .variant-default {
      --uik-badge-bg: oklch(var(--uik-component-badge-default-bg));
      --uik-badge-fg: oklch(var(--uik-component-badge-default-fg));
      --uik-badge-border-color: oklch(var(--uik-component-badge-default-border));
      --uik-badge-shadow: var(--uik-component-badge-default-shadow);
    }

    .variant-secondary {
      --uik-badge-bg: oklch(var(--uik-component-badge-secondary-bg));
      --uik-badge-fg: oklch(var(--uik-component-badge-secondary-fg));
      --uik-badge-border-color: oklch(var(--uik-component-badge-secondary-border));
      --uik-badge-shadow: var(--uik-component-badge-secondary-shadow);
    }

    .variant-destructive {
      --uik-badge-bg: oklch(var(--uik-component-badge-danger-bg));
      --uik-badge-fg: oklch(var(--uik-component-badge-danger-fg));
      --uik-badge-border-color: oklch(var(--uik-component-badge-danger-border));
      --uik-badge-shadow: var(--uik-component-badge-danger-shadow);
    }

    .variant-outline {
      --uik-badge-bg: oklch(var(--uik-component-badge-outline-bg));
      --uik-badge-fg: oklch(var(--uik-component-badge-outline-fg));
      --uik-badge-border-color: oklch(var(--uik-component-badge-outline-border));
      --uik-badge-shadow: var(--uik-component-badge-outline-shadow);
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
