import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('uik-shell-layout')
export class AppShellLayout extends LitElement {
  @property({attribute: false}) accessor activityBar: unknown = null;
  @property({attribute: false}) accessor primarySidebar: unknown = null;
  @property({attribute: false}) accessor mainContent: unknown = null;
  @property({attribute: false}) accessor secondarySidebar: unknown = null;
  @property({attribute: false}) accessor statusBar: unknown = null;
  @property({type: Boolean}) accessor showSecondary = false;

  override createRenderRoot() {
    return this;
  }

  override render() {
    return html`
      <div class="flex flex-col h-full w-full bg-background text-foreground" data-layout-layer="shell">
        <div class="flex flex-1 min-h-0 overflow-hidden">
          ${this.activityBar ?? nothing} ${this.primarySidebar ?? nothing}
          <div class="flex-1 min-w-0 h-full flex flex-col" data-region="main">${this.mainContent ?? nothing}</div>
          ${this.showSecondary ? (this.secondarySidebar ?? nothing) : nothing}
        </div>
        ${this.statusBar ? html`<div class="flex-shrink-0">${this.statusBar}</div>` : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uik-shell-layout': AppShellLayout;
  }
}
