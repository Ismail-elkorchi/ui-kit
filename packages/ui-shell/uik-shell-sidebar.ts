import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import '@ismail-elkorchi/ui-primitives/separator';

@customElement('uik-shell-sidebar')
export class UikShellSidebar extends LitElement {
  @property({type: String}) accessor heading = '';
  @property({type: String}) accessor subtitle = '';
  @property({type: Boolean}) accessor paddedBody = true;
  @property({type: Boolean}) accessor scrollBody = true;
  @property({attribute: false}) accessor actions: unknown = undefined;
  @property({attribute: false}) accessor body: unknown = undefined;
  @property({attribute: false}) accessor footer: unknown = undefined;

  override createRenderRoot() {
    return this;
  }

  private getBodyClasses() {
    return [
      'flex-1',
      'min-h-0',
      'flex',
      'flex-col',
      this.paddedBody ? 'p-3' : '',
      this.scrollBody ? 'overflow-y-auto custom-scrollbar' : '',
      'gap-3',
    ]
      .filter(Boolean)
      .join(' ');
  }

  override render() {
    return html`
      <aside
        data-region="primary-sidebar"
        class="w-80 bg-background flex flex-col border-r border-border flex-shrink-0 h-full">
        <div class="h-10 px-4 flex items-center justify-between bg-background select-none flex-shrink-0">
          <div class="min-w-0">
            ${this.heading
              ? html`<div class="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
                  ${this.heading}
                </div>`
              : nothing}
            ${this.subtitle
              ? html`<div class="text-[11px] text-muted-foreground truncate">${this.subtitle}</div>`
              : nothing}
          </div>
          <div class="flex items-center gap-1">${this.actions ?? nothing}</div>
        </div>
        <uik-separator orientation="horizontal"></uik-separator>
        <div class="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div class=${this.getBodyClasses()}>${this.body ?? nothing}</div>
          ${this.footer
            ? html`
                <uik-separator orientation="horizontal"></uik-separator>
                <div class="p-3 border-t border-border bg-card">${this.footer}</div>
              `
            : nothing}
        </div>
      </aside>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uik-shell-sidebar': UikShellSidebar;
  }
}
