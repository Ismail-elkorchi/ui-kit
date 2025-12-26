import {LitElement, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';

import '@ismail-elkorchi/ui-primitives/uik-separator';

import {ensureLightDomRoot, LightDomSlotController} from '../internal/light-dom-slot-controller';

/**
 * Primary sidebar with heading, actions, body, and footer slots.
 * @attr heading
 * @attr subtitle
 * @attr isBodyPadded
 * @attr isBodyScrollable
 * @slot actions
 * @slot default
 * @slot footer
 * @part sidebar
 * @part header
 * @part heading
 * @part subtitle
 * @part actions
 * @part body
 * @part footer
 * @a11y Sidebar is an <aside>; ensure internal landmarks and labels.
 * @cssprop --uik-component-shell-sidebar-bg
 * @cssprop --uik-component-shell-sidebar-fg
 * @cssprop --uik-component-shell-sidebar-width
 */
@customElement('uik-shell-sidebar')
export class UikShellSidebar extends LitElement {
  @property({type: String}) accessor heading = '';
  @property({type: String}) accessor subtitle = '';
  @property({type: Boolean}) accessor isBodyPadded = true;
  @property({type: Boolean}) accessor isBodyScrollable = true;
  @state() private accessor hasFooter = false;
  private pendingFooterState: boolean | null = null;
  private footerUpdateTask: Promise<void> | null = null;
  private slotController?: LightDomSlotController;

  override connectedCallback() {
    super.connectedCallback();
    if (!this.style.display) this.style.display = 'block';
    if (!this.style.boxSizing) this.style.boxSizing = 'border-box';
    if (!this.style.height) this.style.height = '100%';
    ensureLightDomRoot(this);
    this.slotController ??= new LightDomSlotController(
      this,
      '[data-shell-root]',
      [
        {name: 'actions', containerSelector: '[data-shell-slot="actions"]'},
        {name: null, containerSelector: '[data-shell-slot="default"]'},
        {name: 'footer', containerSelector: '[data-shell-slot="footer"]'},
      ],
      root => {
        const footerContainer = root.querySelector('[data-shell-slot="footer"]');
        const nextHasFooter = !!footerContainer?.querySelector('[slot="footer"]');
        this.updateFooterState(nextHasFooter);
      },
    );
    this.slotController.connect();
  }

  override disconnectedCallback() {
    this.slotController?.disconnect();
    super.disconnectedCallback();
  }

  override createRenderRoot() {
    return ensureLightDomRoot(this);
  }

  private updateFooterState(nextHasFooter: boolean) {
    if (nextHasFooter === this.hasFooter) return;
    if (!this.hasUpdated || !this.isUpdatePending) {
      this.hasFooter = nextHasFooter;
      return;
    }
    this.pendingFooterState = nextHasFooter;
    if (this.footerUpdateTask) return;
    this.footerUpdateTask = this.updateComplete.then(() => {
      this.footerUpdateTask = null;
      if (this.pendingFooterState === null) return;
      const pending = this.pendingFooterState;
      this.pendingFooterState = null;
      if (pending !== this.hasFooter) this.hasFooter = pending;
    });
  }

  override render() {
    const sidebarStyles = {
      width: 'var(--uik-component-shell-sidebar-width)',
      backgroundColor: 'oklch(var(--uik-component-shell-sidebar-bg))',
      color: 'oklch(var(--uik-component-shell-sidebar-fg))',
      borderRight: 'var(--uik-border-width-1) solid oklch(var(--uik-component-shell-divider-color))',
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
    const subtitleStyles = {
      fontSize: 'var(--uik-typography-font-size-1)',
      lineHeight: 'var(--uik-typography-line-height-2)',
      color: 'oklch(var(--uik-text-muted))',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };
    const actionsStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--uik-space-1)',
    };
    const bodyContainerStyles = {
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1 auto',
      minHeight: 'var(--uik-space-0)',
      overflow: 'hidden',
    };
    const bodyStyles = {
      padding: this.isBodyPadded ? 'var(--uik-space-3)' : 'var(--uik-space-0)',
      gap: 'var(--uik-space-3)',
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1 auto',
      minHeight: 'var(--uik-space-0)',
      boxSizing: 'border-box',
      overflowY: this.isBodyScrollable ? 'auto' : 'visible',
      scrollbarColor: this.isBodyScrollable
        ? 'oklch(var(--uik-component-shell-scrollbar-thumb)) oklch(var(--uik-component-shell-scrollbar-track))'
        : '',
      scrollbarWidth: this.isBodyScrollable ? 'thin' : '',
    };
    const footerStyles = {
      padding: 'var(--uik-space-3)',
      backgroundColor: 'oklch(var(--uik-surface-card))',
    };

    const ariaLabelledby = this.getAttribute('aria-labelledby');
    const ariaLabel = this.getAttribute('aria-label');
    const hasLabelledby = Boolean(ariaLabelledby);
    const hasLabel = typeof ariaLabel === 'string' && ariaLabel.trim().length > 0;
    const resolvedLabel = hasLabel ? ariaLabel : hasLabelledby ? null : this.heading || 'Sidebar';

    return html`
      <aside
        part="sidebar"
        data-region="primary-sidebar"
        aria-label=${resolvedLabel ?? nothing}
        aria-labelledby=${ariaLabelledby ?? nothing}
        style=${styleMap(sidebarStyles)}>
        <div part="header" style=${styleMap(headerStyles)}>
          <div part="header-content" style=${styleMap({minWidth: 'var(--uik-space-0)'})}>
            ${this.heading ? html`<div part="heading" style=${styleMap(headingStyles)}>${this.heading}</div>` : nothing}
            ${this.subtitle ? html`<div part="subtitle" style=${styleMap(subtitleStyles)}>${this.subtitle}</div>` : nothing}
          </div>
          <div part="actions" style=${styleMap(actionsStyles)} data-shell-slot="actions">
          </div>
        </div>
        <uik-separator
          orientation="horizontal"
          style="--uik-separator-color: var(--uik-component-shell-divider-color);"></uik-separator>
        <div part="body-container" style=${styleMap(bodyContainerStyles)}>
          <div part="body" style=${styleMap(bodyStyles)} data-shell-slot="default">
          </div>
          <div ?hidden=${!this.hasFooter}>
            <uik-separator
              orientation="horizontal"
              style="--uik-separator-color: var(--uik-component-shell-divider-color);"></uik-separator>
            <div part="footer" style=${styleMap(footerStyles)} data-shell-slot="footer">
            </div>
          </div>
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
