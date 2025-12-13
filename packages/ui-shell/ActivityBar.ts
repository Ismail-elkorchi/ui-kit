import {LitElement, html, nothing, svg} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import '@ismail-elkorchi/ui-primitives/button';

export type ActivityBarIcon = string | ReturnType<typeof svg>;

export interface ActivityBarItem {
  id: string;
  label: string;
  icon?: ActivityBarIcon;
  tooltip?: string;
}

@customElement('uik-shell-activity-bar')
export class AppShellActivityBar extends LitElement {
  @property({attribute: false}) accessor items: ActivityBarItem[] = [];
  @property({type: String}) accessor activeId = '';
  @property({attribute: false}) accessor footer: unknown = null;

  override createRenderRoot() {
    return this;
  }

  private emitSelect(id: string) {
    this.dispatchEvent(new CustomEvent('activity-select', {detail: {id}, bubbles: true, composed: true}));
  }

  private renderIcon(item: ActivityBarItem) {
    if (!item.icon) return html`<span class="text-xs font-semibold">${item.label.charAt(0).toUpperCase()}</span>`;
    if (typeof item.icon === 'string') {
      return svg`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="${item.icon}"></path>`;
    }
    return item.icon;
  }

  private renderItem(item: ActivityBarItem) {
    const isActive = this.activeId === item.id;
    return html`
      <div class="relative w-12 h-12 flex items-center justify-center">
        <div class="${isActive ? 'absolute left-0 w-[2px] h-full bg-primary rounded-r-sm' : 'hidden'}"></div>
        <uik-button
          variant="ghost"
          size="icon"
          class="w-12 h-12"
          ?muted=${!isActive}
          ?active=${isActive}
          aria-pressed=${isActive ? 'true' : 'false'}
          aria-label=${item.label}
          title=${item.tooltip ?? item.label}
          @click=${() => {
            this.emitSelect(item.id);
          }}>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">${this.renderIcon(item)}</svg>
        </uik-button>
      </div>
    `;
  }

  override render() {
    return html`
      <aside
        data-region="activity-bar"
        class="w-12 bg-secondary flex flex-col items-center py-2 flex-shrink-0 text-muted-foreground h-full">
        ${this.items.map(item => this.renderItem(item))}
        <div class="flex-1"></div>
        ${this.footer ?? nothing}
      </aside>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uik-shell-activity-bar': AppShellActivityBar;
  }
}
