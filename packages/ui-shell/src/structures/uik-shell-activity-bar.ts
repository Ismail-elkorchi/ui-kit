import {LitElement, html, nothing, svg} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';

import '@ismail-elkorchi/ui-primitives/uik-button';

import type {UikShellActivityBarItem} from './uik-shell-activity-bar-contract';
import {ensureLightDomRoot, LightDomSlotController} from '../internal/light-dom-slot-controller';

export type {UikShellActivityBarIcon, UikShellActivityBarItem} from './uik-shell-activity-bar-contract';

@customElement('uik-shell-activity-bar')
export class UikShellActivityBar extends LitElement {
  @property({attribute: false}) accessor items: UikShellActivityBarItem[] = [];
  @property({type: String}) accessor activeId = '';
  private slotController?: LightDomSlotController;

  override connectedCallback() {
    super.connectedCallback();
    if (!this.style.display) this.style.display = 'block';
    if (!this.style.boxSizing) this.style.boxSizing = 'border-box';
    if (!this.style.height) this.style.height = '100%';
    this.slotController ??= new LightDomSlotController(
      this,
      '[data-shell-root]',
      [{name: 'footer', containerSelector: '[data-shell-slot="footer"]'}],
    );
    this.slotController.connect();
  }

  override disconnectedCallback() {
    this.slotController?.disconnect();
    super.disconnectedCallback();
  }

  override firstUpdated() {
    this.slotController?.sync();
  }

  override createRenderRoot() {
    return ensureLightDomRoot(this);
  }

  private emitSelect(id: string) {
    this.dispatchEvent(new CustomEvent('activity-bar-select', {detail: {id}, bubbles: true, composed: true}));
  }

  private renderIcon(item: UikShellActivityBarItem) {
    if (!item.icon) {
      return html`<span
        part="item-icon"
        aria-hidden="true"
        style=${styleMap({
          fontSize: 'var(--uik-typography-font-size-1)',
          fontWeight: 'var(--uik-typography-font-weight-semibold)',
          lineHeight: 'var(--uik-typography-line-height-1)',
        })}>
        ${item.label.charAt(0).toUpperCase()}
      </span>`;
    }
    if (typeof item.icon === 'string') {
      return svg`<path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="var(--uik-border-width-1)"
        d=${item.icon}></path>`;
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
    const itemStyles = {
      width: 'var(--uik-size-control-lg)',
      height: 'var(--uik-size-control-lg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    };
    const indicatorStyles = {
      position: 'absolute',
      insetInlineStart: 'var(--uik-space-0)',
      insetBlock: 'var(--uik-space-0)',
      width: 'var(--uik-border-width-2)',
      backgroundColor: 'oklch(var(--uik-intent-primary-bg-default))',
      borderTopRightRadius: 'var(--uik-radius-1)',
      borderBottomRightRadius: 'var(--uik-radius-1)',
    };
    const buttonStyles = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };
    const iconStyles = {
      width: 'var(--uik-size-icon-md)',
      height: 'var(--uik-size-icon-md)',
    };
    const iconContent = this.renderIcon(item);
    const iconTemplate = item.icon
      ? html`<svg
          part="item-icon"
          aria-hidden="true"
          style=${styleMap(iconStyles)}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          ${iconContent}
        </svg>`
      : iconContent;

    return html`
      <div part="item" style=${styleMap(itemStyles)}>
        ${isActive ? html`<div part="item-indicator" style=${styleMap(indicatorStyles)}></div>` : nothing}
        <uik-button
          part="item-button"
          data-id=${item.id}
          variant="ghost"
          size="icon"
          style=${styleMap(buttonStyles)}
          ?muted=${!isActive}
          ?active=${isActive}
          aria-pressed=${isActive ? 'true' : 'false'}
          aria-label=${item.label}
          title=${item.tooltip ?? item.label}
          @click=${this.onItemClick}>
          ${iconTemplate}
        </uik-button>
      </div>
    `;
  }

  override render() {
    const containerStyles = {
      width: 'var(--uik-component-shell-activity-bar-width)',
      backgroundColor: 'oklch(var(--uik-component-shell-activity-bar-bg))',
      color: 'oklch(var(--uik-component-shell-activity-bar-fg))',
      paddingBlock: 'var(--uik-space-2)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      flexShrink: '0',
      height: '100%',
      boxSizing: 'border-box',
    };
    const spacerStyles = {
      flex: '1 1 auto',
      minHeight: 'var(--uik-space-0)',
    };
    const footerStyles = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
    };
    const items = this.items.map(item => this.renderItem(item));
    return html`
      <aside part="activity-bar" data-region="activity-bar" style=${styleMap(containerStyles)}>
        ${items}
        <div part="spacer" style=${styleMap(spacerStyles)}></div>
        <div part="footer" style=${styleMap(footerStyles)} data-shell-slot="footer">
        </div>
      </aside>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uik-shell-activity-bar': UikShellActivityBar;
  }
}
