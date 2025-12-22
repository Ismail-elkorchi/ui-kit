import {LitElement, html, nothing, svg} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import '@ismail-elkorchi/ui-primitives/uik-button';

import type {UikShellActivityBarItem} from './uik-activity-bar-types';
export type {UikShellActivityBarIcon, UikShellActivityBarItem} from './uik-activity-bar-types';

@customElement('uik-shell-activity-bar')
export class UikShellActivityBar extends LitElement {
  @property({attribute: false}) accessor items: UikShellActivityBarItem[] = [];
  @property({type: String}) accessor activeId = '';
  @property({attribute: false}) accessor footer: unknown = undefined;

  override createRenderRoot() {
    return this;
  }

  private emitSelect(id: string) {
    this.dispatchEvent(new CustomEvent('activity-select', {detail: {id}, bubbles: true, composed: true}));
  }

  private renderIcon(item: UikShellActivityBarItem) {
    if (!item.icon) return html`<span class="text-xs font-semibold">${item.label.charAt(0).toUpperCase()}</span>`;
    if (typeof item.icon === 'string') {
      return svg`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d=${item.icon}></path>`;
    }
    return item.icon;
  }

  private readonly onItemClick = (event: Event) => {
    const currentTarget = event.currentTarget;
    if (!(currentTarget instanceof HTMLElement)) return;

    const {id} = currentTarget.dataset;
    if (!id) return;

    this.emitSelect(id);
  };

  private renderItem(item: UikShellActivityBarItem) {
    const isActive = this.activeId === item.id;
    return html`
      <div class="relative w-12 h-12 flex items-center justify-center">
        <div class=${isActive ? 'absolute left-0 w-[2px] h-full bg-primary rounded-r-sm' : 'hidden'}></div>
        <uik-button
          data-id=${item.id}
          variant="ghost"
          size="icon"
          class="w-12 h-12"
          ?muted=${!isActive}
          ?active=${isActive}
          aria-pressed=${isActive ? 'true' : 'false'}
          aria-label=${item.label}
          title=${item.tooltip ?? item.label}
          @click=${this.onItemClick}>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">${this.renderIcon(item)}</svg>
        </uik-button>
      </div>
    `;
  }

  override render() {
    const items = this.items.map(item => this.renderItem(item));
    return html`
      <aside
        data-region="activity-bar"
        class="w-12 bg-secondary flex flex-col items-center py-2 flex-shrink-0 text-muted-foreground h-full">
        ${items}
        <div class="flex-1"></div>
        ${this.footer ?? nothing}
      </aside>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uik-shell-activity-bar': UikShellActivityBar;
  }
}
