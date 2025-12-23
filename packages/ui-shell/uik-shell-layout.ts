import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('uik-shell-layout')
export class UikShellLayout extends LitElement {
  @property({attribute: false}) accessor activityBar: unknown = undefined;
  @property({attribute: false}) accessor primarySidebar: unknown = undefined;
  @property({attribute: false}) accessor mainContent: unknown = undefined;
  @property({attribute: false}) accessor secondarySidebar: unknown = undefined;
  @property({attribute: false}) accessor statusBar: unknown = undefined;
  @property({type: Boolean}) accessor isSecondarySidebarVisible = false;

  override createRenderRoot() {
    return this;
  }

  override render() {
    return html`
      <div class="flex flex-col h-full w-full bg-background text-foreground" data-layout-layer="shell">
        <div class="flex flex-1 min-h-0 overflow-hidden">
          ${this.activityBar ?? nothing} ${this.primarySidebar ?? nothing}
          <div class="flex-1 min-w-0 h-full flex flex-col" data-region="main-content">
            ${this.mainContent ?? nothing}
          </div>
          ${this.isSecondarySidebarVisible ? (this.secondarySidebar ?? nothing) : nothing}
        </div>
        ${this.statusBar ? html`<div class="flex-shrink-0">${this.statusBar}</div>` : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uik-shell-layout': UikShellLayout;
  }
}
