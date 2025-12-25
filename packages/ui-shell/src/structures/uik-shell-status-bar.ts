import {LitElement, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';

import '@ismail-elkorchi/ui-primitives/uik-badge';

import {ensureLightDomRoot, LightDomSlotController} from '../internal/light-dom-slot-controller';

type StatusBarTone = 'info' | 'success' | 'danger' | 'muted';

/**
 * Status bar for global status and actions.
 * @attr message
 * @attr tone (info | success | danger | muted)
 * @attr meta
 * @slot actions
 * @slot meta
 * @part status-bar
 * @part message
 * @part actions
 * @part meta
 * @a11y Use short status text; provide accessible names for actions.
 * @cssprop --uik-component-shell-status-bar-bg
 * @cssprop --uik-component-shell-status-bar-fg
 * @cssprop --uik-component-shell-status-bar-height
 */
@customElement('uik-shell-status-bar')
export class UikShellStatusBar extends LitElement {
  @property({type: String}) accessor message = 'Ready';
  @property({type: String}) accessor tone: StatusBarTone = 'info';
  @property({type: String}) accessor meta = '';
  @state() private accessor hasMetaSlot = false;
  private slotController?: LightDomSlotController;

  override connectedCallback() {
    super.connectedCallback();
    if (!this.style.display) this.style.display = 'block';
    if (!this.style.boxSizing) this.style.boxSizing = 'border-box';
    if (!this.style.width) this.style.width = '100%';
    this.slotController ??= new LightDomSlotController(
      this,
      '[data-shell-root]',
      [
        {name: 'actions', containerSelector: '[data-shell-slot="actions"]'},
        {name: 'meta', containerSelector: '[data-shell-slot="meta"]'},
      ],
      root => {
        const metaContainer = root.querySelector('[data-shell-slot="meta"]');
        const hasMeta = !!metaContainer?.querySelector('[slot="meta"]');
        if (hasMeta !== this.hasMetaSlot) this.hasMetaSlot = hasMeta;
        if (hasMeta) {
          const fallback = root.querySelector('[data-shell-fallback="meta"]');
          fallback?.remove();
        }
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

  private getToneColor() {
    switch (this.tone) {
      case 'info': {
        return 'oklch(var(--uik-text-info))';
      }
      case 'success': {
        return 'oklch(var(--uik-text-success))';
      }
      case 'danger': {
        return 'oklch(var(--uik-text-danger))';
      }
      case 'muted': {
        return 'oklch(var(--uik-text-muted))';
      }
      default: {
        const _exhaustive: never = this.tone;
        return _exhaustive;
      }
    }
  }

  override render() {
    const showMetaFallback = !this.hasMetaSlot && this.meta !== '';
    const metaContent = showMetaFallback ? html`<uik-badge variant="outline">${this.meta}</uik-badge>` : nothing;
    const statusBarStyles = {
      height: 'var(--uik-component-shell-status-bar-height)',
      backgroundColor: 'oklch(var(--uik-component-shell-status-bar-bg))',
      color: 'oklch(var(--uik-component-shell-status-bar-fg))',
      paddingInline: 'var(--uik-space-3)',
      borderTop: 'var(--uik-border-width-1) solid oklch(var(--uik-component-shell-divider-color))',
      fontSize: 'var(--uik-typography-font-size-1)',
      lineHeight: 'var(--uik-typography-line-height-2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: '0',
      userSelect: 'none',
      boxSizing: 'border-box',
    };
    const groupStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--uik-space-3)',
    };
    const messageStyles = {
      color: this.getToneColor(),
      fontWeight: 'var(--uik-typography-font-weight-medium)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--uik-space-2)',
    };
    const metaStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--uik-space-2)',
      color: 'oklch(var(--uik-text-muted))',
    };

    return html`
      <footer part="status-bar" data-region="status-bar" style=${styleMap(statusBarStyles)}>
        <div part="status-main" style=${styleMap(groupStyles)}>
          <span part="message" style=${styleMap(messageStyles)}>${this.message}</span>
          <span part="actions" data-shell-slot="actions"></span>
        </div>
        <div part="meta" style=${styleMap(metaStyles)} data-shell-slot="meta">
          ${showMetaFallback ? html`<span data-shell-fallback="meta">${metaContent}</span>` : nothing}
        </div>
      </footer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uik-shell-status-bar': UikShellStatusBar;
  }
}
