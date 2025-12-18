import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('uik-button')
export class UikButton extends LitElement {
  @property({type: String, reflect: true}) accessor variant:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link' = 'default';
  @property({type: String, reflect: true}) accessor size: 'default' | 'sm' | 'lg' | 'icon' = 'default';
  @property({type: String}) accessor type: 'button' | 'submit' | 'reset' = 'button';
  @property({type: Boolean}) accessor disabled = false;
  @property({type: Boolean, reflect: true}) accessor active = false;
  @property({type: Boolean, reflect: true}) accessor muted = false;

  static override readonly styles = css`
    :host {
      display: inline-flex;
    }

    /* Size variants on host */
    :host([size='default']) {
      height: 2.25rem;
    }

    :host([size='sm']) {
      height: 2rem;
    }

    :host([size='lg']) {
      height: 2.5rem;
    }

    :host([size='icon']) {
      width: 2.25rem;
      height: 2.25rem;
    }

    button {
      display: inline-flex;
      gap: 0.5rem;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 0;
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
      cursor: pointer;
      border: none;
      border-radius: 0.375rem;
      transition:
        color 0.15s,
        background-color 0.15s;
    }

    /* Padding applied to internal button based on size prop of host (mirrored via class or just explicit here) 
   Actually, to keep it simple, we can use the classes on the button as before for padding, 
   but height/width are now 100% to fill host. 
*/
    .size-default {
      padding: 0.5rem 1rem;
    }

    .size-sm {
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
    }

    .size-lg {
      padding: 0.5rem 2rem;
    }

    .size-icon {
      padding: 0;
    }

    button:focus-visible {
      outline: none;
      box-shadow: 0 0 0 1px hsl(var(--ring, 240 4.9% 83.9%));
    }

    button:disabled {
      pointer-events: none;
      opacity: 0.5;
    }

    /* Color variants using CSS variables */
    .variant-default {
      color: hsl(var(--primary-foreground, 240 5.9% 10%));
      background-color: hsl(var(--primary, 0 0% 98%));
      box-shadow: 0 1px 2px rgb(0 0 0 / 10%);
    }

    .variant-default:hover {
      background-color: hsl(var(--primary, 0 0% 98%) / 90%);
    }

    .variant-destructive {
      color: hsl(var(--destructive-foreground, 0 0% 98%));
      background-color: hsl(var(--destructive, 0 62.8% 30.6%));
      box-shadow: 0 1px 2px rgb(0 0 0 / 10%);
    }

    .variant-destructive:hover {
      background-color: hsl(var(--destructive, 0 62.8% 30.6%) / 90%);
    }

    .variant-outline {
      color: hsl(var(--foreground, 0 0% 98%));
      background-color: transparent;
      border: 1px solid hsl(var(--border, 240 3.7% 15.9%));
      box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
    }

    .variant-outline:hover {
      color: hsl(var(--accent-foreground, 0 0% 98%));
      background-color: hsl(var(--accent, 240 3.7% 15.9%));
    }

    .variant-secondary {
      color: hsl(var(--secondary-foreground, 0 0% 98%));
      background-color: hsl(var(--secondary, 240 3.7% 15.9%));
      box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
    }

    .variant-secondary:hover {
      background-color: hsl(var(--secondary, 240 3.7% 15.9%) / 80%);
    }

    .variant-ghost {
      color: hsl(var(--foreground, 0 0% 98%));
      background-color: transparent;
    }

    .variant-ghost:hover {
      color: hsl(var(--accent-foreground, 0 0% 98%));
      background-color: hsl(var(--accent, 240 3.7% 15.9%));
    }

    /* Active/Muted States for Ghost (and others if needed) */
    :host([muted]) .variant-ghost {
      color: hsl(var(--muted-foreground, 240 5% 64.9%));
    }

    :host([muted]) .variant-ghost:hover {
      color: hsl(var(--foreground, 0 0% 98%));
    }

    :host([active]) .variant-ghost {
      color: hsl(var(--accent-foreground, 0 0% 98%));
      background-color: hsl(var(--accent, 240 3.7% 15.9%));
    }

    .variant-link {
      color: hsl(var(--primary, 0 0% 98%));
      background-color: transparent;
      text-decoration-offset: 4px;
    }

    .variant-link:hover {
      text-decoration: underline;
    }
  `;

  override render() {
    return html`
      <button
        part="base"
        class="variant-${this.variant} size-${this.size}"
        type=${this.type}
        ?disabled=${this.disabled}>
        <slot></slot>
      </button>
    `;
  }
}
