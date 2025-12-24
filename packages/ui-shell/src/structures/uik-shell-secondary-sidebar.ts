import {LitElement, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';

import '@ismail-elkorchi/ui-primitives/uik-button';
import '@ismail-elkorchi/ui-primitives/uik-separator';

import {ensureLightDomRoot, LightDomSlotController} from '../internal/light-dom-slot-controller';

@customElement('uik-shell-secondary-sidebar')
export class UikShellSecondarySidebar extends LitElement {
  @property({type: Boolean}) accessor isOpen = false;
  @property({type: String}) accessor heading = '';
  @state() private accessor hasFooter = false;
  private slotController?: LightDomSlotController;

  override connectedCallback() {
    super.connectedCallback();
    if (!this.style.display) this.style.display = 'block';
    if (!this.style.boxSizing) this.style.boxSizing = 'border-box';
    if (!this.style.height) this.style.height = '100%';
    this.slotController ??= new LightDomSlotController(
      this,
      '[data-shell-root]',
      [
        {name: null, containerSelector: '[data-shell-slot="default"]'},
        {name: 'footer', containerSelector: '[data-shell-slot="footer"]'},
      ],
      root => {
        const footerContainer = root.querySelector('[data-shell-slot="footer"]');
        const nextHasFooter = !!footerContainer?.querySelector('[slot="footer"]');
        if (nextHasFooter !== this.hasFooter) this.hasFooter = nextHasFooter;
      },
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

  private close = () => {
    this.dispatchEvent(new CustomEvent('secondary-sidebar-close', {bubbles: true, composed: true}));
  };

  override render() {
    if (!this.isOpen) return nothing;

    const sidebarStyles = {
      width: 'var(--uik-component-shell-secondary-sidebar-width)',
      backgroundColor: 'oklch(var(--uik-component-shell-secondary-sidebar-bg))',
      color: 'oklch(var(--uik-text-default))',
      borderLeft: 'var(--uik-border-width-1) solid oklch(var(--uik-component-shell-divider-color))',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: '0',
      height: '100%',
      boxSizing: 'border-box',
    };
    const headerStyles = {
      height: 'var(--uik-size-control-md)',
      paddingInline: 'var(--uik-space-4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: '0',
      userSelect: 'none',
    };
    const headingStyles = {
      fontSize: 'var(--uik-typography-font-size-1)',
      fontWeight: 'var(--uik-typography-font-weight-bold)',
      letterSpacing: 'var(--uik-typography-letter-spacing-wide)',
      lineHeight: 'var(--uik-typography-line-height-2)',
      color: 'oklch(var(--uik-text-muted))',
      textTransform: 'uppercase',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };
    const bodyContainerStyles = {
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1 auto',
      minHeight: 'var(--uik-space-0)',
    };
    const bodyStyles = {
      padding: 'var(--uik-space-4)',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1 auto',
      minHeight: 'var(--uik-space-0)',
      boxSizing: 'border-box',
      scrollbarColor:
        'oklch(var(--uik-component-shell-scrollbar-thumb)) oklch(var(--uik-component-shell-scrollbar-track))',
      scrollbarWidth: 'thin',
    };
    const footerStyles = {
      padding: 'var(--uik-space-3)',
      backgroundColor: 'oklch(var(--uik-surface-card))',
    };

    return html`
      <aside part="secondary-sidebar" data-region="secondary-sidebar" style=${styleMap(sidebarStyles)}>
        <div part="header" style=${styleMap(headerStyles)}>
          <span part="heading" style=${styleMap(headingStyles)}>${this.heading}</span>
          <uik-button
            part="close-button"
            variant="ghost"
            size="icon"
            muted
            aria-label="Close secondary sidebar"
            title="Close secondary sidebar"
            @click=${this.close}>
            <svg
              part="close-icon"
              aria-hidden="true"
              style=${styleMap({width: 'var(--uik-size-icon-sm)', height: 'var(--uik-size-icon-sm)'})}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="var(--uik-border-width-2)"
                d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </uik-button>
        </div>
        <uik-separator
          orientation="horizontal"
          style="--uik-separator-color: var(--uik-component-shell-divider-color);"></uik-separator>
        <div part="body-container" style=${styleMap(bodyContainerStyles)}>
          <div part="body" style=${styleMap(bodyStyles)} data-shell-slot="default">
          </div>
        </div>
        <div ?hidden=${!this.hasFooter}>
          <uik-separator
            orientation="horizontal"
            style="--uik-separator-color: var(--uik-component-shell-divider-color);"></uik-separator>
          <div part="footer" style=${styleMap(footerStyles)} data-shell-slot="footer">
          </div>
        </div>
      </aside>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uik-shell-secondary-sidebar': UikShellSecondarySidebar;
  }
}
