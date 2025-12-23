import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import '@ismail-elkorchi/ui-primitives/uik-badge';

type StatusBarTone = 'info' | 'success' | 'danger' | 'muted';

@customElement('uik-shell-status-bar')
export class UikShellStatusBar extends LitElement {
  @property({type: String}) accessor message = 'Ready';
  @property({type: String}) accessor tone: StatusBarTone = 'info';
  @property({attribute: false}) accessor meta: unknown = undefined;
  @property({attribute: false}) accessor actions: unknown = undefined;

  override createRenderRoot() {
    return this;
  }

  private getToneClass() {
    switch (this.tone) {
      case 'info': {
        return 'text-[oklch(var(--uik-text-info))]';
      }
      case 'success': {
        return 'text-[oklch(var(--uik-text-success))]';
      }
      case 'danger': {
        return 'text-[oklch(var(--uik-text-danger))]';
      }
      case 'muted': {
        return 'text-[oklch(var(--uik-text-muted))]';
      }
      default: {
        const _exhaustive: never = this.tone;
        return _exhaustive;
      }
    }
  }

  override render() {
    const metaContent =
      typeof this.meta === 'string' ? html`<uik-badge variant="outline">${this.meta}</uik-badge>` : this.meta;

    return html`
      <footer
        data-region="status-bar"
        class="h-6 bg-secondary text-secondary-foreground flex items-center justify-between text-xs select-none px-3 flex-shrink-0 border-t border-border">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1.5 font-medium ${this.getToneClass()}">${this.message}</span>
          ${this.actions ?? nothing}
        </div>
        <div class="flex items-center gap-2 text-muted-foreground">${metaContent ?? nothing}</div>
      </footer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uik-shell-status-bar': UikShellStatusBar;
  }
}
