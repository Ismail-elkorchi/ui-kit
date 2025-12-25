import '@ismail-elkorchi/ui-primitives/uik-nav-rail';
import {LitElement, html, nothing, type PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';

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

  override updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('items')) {
      this.slotController?.sync();
    }
  }

  override createRenderRoot() {
    return ensureLightDomRoot(this);
  }

  private emitSelect(id: string) {
    this.dispatchEvent(new CustomEvent('activity-bar-select', {detail: {id}, bubbles: true, composed: true}));
  }

  private onNavRailSelect = (event: CustomEvent<{id: string}>) => {
    this.emitSelect(event.detail.id);
  };

  override render() {
    const ariaLabelledby = this.getAttribute('aria-labelledby');
    const ariaLabel = this.getAttribute('aria-label');
    const hasLabelledby = Boolean(ariaLabelledby);
    const hasLabel = typeof ariaLabel === 'string' && ariaLabel.trim().length > 0;
    const resolvedLabel = hasLabel ? ariaLabel : hasLabelledby ? null : 'Activity bar';

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

    const navRailStyles = {
      '--uik-component-nav-rail-bg': 'var(--uik-component-shell-activity-bar-bg)',
      '--uik-component-nav-rail-fg': 'var(--uik-component-shell-activity-bar-fg)',
      '--uik-component-nav-rail-width': 'var(--uik-component-shell-activity-bar-width)',
      '--uik-component-nav-rail-gap': 'var(--uik-space-0)',
      '--uik-component-nav-rail-padding-y': 'var(--uik-space-0)',
      '--uik-component-nav-rail-item-size': 'var(--uik-component-shell-activity-bar-item-size)',
      '--uik-component-nav-rail-icon-size': 'var(--uik-component-shell-activity-bar-item-icon-size)',
      '--uik-component-nav-rail-item-indicator-width': 'var(--uik-component-shell-activity-bar-item-indicator-width)',
      '--uik-component-nav-rail-item-indicator-radius': 'var(--uik-component-shell-activity-bar-item-indicator-radius)',
      '--uik-component-nav-rail-item-indicator-bg': 'var(--uik-component-shell-activity-bar-item-indicator-bg)',
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

    return html`
      <aside
        part="activity-bar"
        data-region="activity-bar"
        aria-label=${resolvedLabel ?? nothing}
        aria-labelledby=${ariaLabelledby ?? nothing}
        style=${styleMap(containerStyles)}>
        <uik-nav-rail
          .items=${this.items}
          .activeId=${this.activeId}
          style=${styleMap(navRailStyles)}
          aria-label=${resolvedLabel ?? nothing}
          aria-labelledby=${ariaLabelledby ?? nothing}
          @nav-rail-select=${this.onNavRailSelect}></uik-nav-rail>
        <div part="spacer" style=${styleMap(spacerStyles)}></div>
        <div part="footer" style=${styleMap(footerStyles)} data-shell-slot="footer"></div>
      </aside>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uik-shell-activity-bar': UikShellActivityBar;
  }
}
