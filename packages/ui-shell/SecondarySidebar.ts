import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import '@ismail-elkorchi/ui-primitives/button';
import '@ismail-elkorchi/ui-primitives/separator';

@customElement('uik-shell-secondary-sidebar')
export class AppShellSecondarySidebar extends LitElement {
  @property({type: Boolean}) accessor open = false;
  @property({type: String}) accessor heading = '';
  @property({attribute: false}) accessor body: unknown = null;
  @property({attribute: false}) accessor footer: unknown = null;

  override createRenderRoot() {
    return this;
  }

  private close = () => {
    this.dispatchEvent(new CustomEvent('secondary-close', {bubbles: true, composed: true}));
  };

  override render() {
    if (!this.open) return nothing;

    return html`
      <aside
        data-region="secondary-sidebar"
        class="w-80 bg-card flex flex-col border-l border-border flex-shrink-0 h-full text-foreground">
        <div class="h-10 px-4 flex items-center justify-between bg-card select-none flex-shrink-0">
          <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
            ${this.heading || 'Secondary'}
          </span>
          <uik-button
            variant="ghost"
            size="icon"
            class="h-7 w-7"
            muted
            aria-label="Close secondary sidebar"
            title="Close secondary sidebar"
            @click=${this.close}>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </uik-button>
        </div>
        <uik-separator orientation="horizontal"></uik-separator>
        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar text-sm text-muted-foreground">
          ${this.body ?? html`<p class="text-xs italic">Secondary sidebar content</p>`}
        </div>
        ${this.footer
          ? html`
              <uik-separator orientation="horizontal"></uik-separator>
              <div class="p-3 border-t border-border bg-card">${this.footer}</div>
            `
          : nothing}
      </aside>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uik-shell-secondary-sidebar': AppShellSecondarySidebar;
  }
}
