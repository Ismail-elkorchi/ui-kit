import {LitElement, html, nothing, svg, type PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';

import '@ismail-elkorchi/ui-primitives/uik-button';

import type {UikShellActivityBarItem} from './uik-shell-activity-bar-contract';
import {ensureLightDomRoot, LightDomSlotController} from '../internal/light-dom-slot-controller';

export type {UikShellActivityBarIcon, UikShellActivityBarItem} from './uik-shell-activity-bar-contract';

@customElement('uik-shell-activity-bar')
export class UikShellActivityBar extends LitElement {
  @property({attribute: false}) accessor items: UikShellActivityBarItem[] = [];
  @property({type: String}) accessor activeId = '';
  @state() private accessor focusedId = '';
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
      const hasFocused = this.items.some(item => item.id === this.focusedId);
      if (!hasFocused) {
        this.focusedId = this.resolveDefaultFocusId();
      }
    }

    if (changedProperties.has('activeId') && this.activeId && !this.contains(document.activeElement)) {
      this.focusedId = this.resolveDefaultFocusId();
    }
  }

  override createRenderRoot() {
    return ensureLightDomRoot(this);
  }

  private emitSelect(id: string) {
    this.dispatchEvent(new CustomEvent('activity-bar-select', {detail: {id}, bubbles: true, composed: true}));
  }

  private resolveDefaultFocusId() {
    if (this.activeId && this.items.some(item => item.id === this.activeId)) return this.activeId;
    return this.items[0]?.id ?? '';
  }

  private focusItemById(id: string) {
    const root = this.renderRoot as HTMLElement | undefined;
    const button = root?.querySelector<HTMLElement>(`uik-button[data-activity-id="${id}"]`);
    button?.focus();
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

    const {activityId} = currentTarget.dataset;
    if (!activityId) return;

    this.emitSelect(activityId);
  };

  private readonly onItemFocus = (event: FocusEvent) => {
    const currentTarget = event.currentTarget;
    if (!(currentTarget instanceof HTMLElement)) return;
    const {activityId} = currentTarget.dataset;
    if (!activityId) return;
    this.focusedId = activityId;
  };

  private readonly onItemKeydown = (event: KeyboardEvent) => {
    const currentTarget = event.currentTarget;
    if (!(currentTarget instanceof HTMLElement)) return;
    const {index} = currentTarget.dataset;
    if (!index) return;

    const currentIndex = Number(index);
    if (!Number.isFinite(currentIndex)) return;

    const lastIndex = this.items.length - 1;
    if (lastIndex < 0) return;

    let nextIndex = currentIndex;
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = Math.max(0, currentIndex - 1);
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = Math.min(lastIndex, currentIndex + 1);
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = lastIndex;
        break;
      default:
        return;
    }

    if (nextIndex === currentIndex) return;
    event.preventDefault();

    const nextItem = this.items[nextIndex];
    if (!nextItem) return;

    this.focusedId = nextItem.id;
    void this.updateComplete.then(() => {
      this.focusItemById(nextItem.id);
    });
  };

  private renderItem(item: UikShellActivityBarItem, index: number, focusId: string) {
    const isActive = this.activeId === item.id;
    const isFocused = focusId === item.id;
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
          data-activity-item="true"
          data-activity-id=${item.id}
          data-index=${String(index)}
          variant="ghost"
          size="icon"
          style=${styleMap({width: '100%', height: '100%'})}
          ?muted=${!isActive}
          ?active=${isActive}
          .tabIndexValue=${isFocused ? 0 : -1}
          aria-pressed=${isActive ? 'true' : 'false'}
          aria-label=${item.label}
          title=${item.tooltip ?? item.label}
          @click=${this.onItemClick}
          @focusin=${this.onItemFocus}
          @keydown=${this.onItemKeydown}>
          ${iconTemplate}
        </uik-button>
      </div>
    `;
  }

  override render() {
    const ariaLabelledby = this.getAttribute('aria-labelledby');
    const ariaLabel = this.getAttribute('aria-label');
    const hasLabelledby = Boolean(ariaLabelledby);
    const hasLabel = typeof ariaLabel === 'string' && ariaLabel.trim().length > 0;
    const resolvedLabel = hasLabel ? ariaLabel : hasLabelledby ? null : 'Activity bar';
    const focusId = this.focusedId || this.resolveDefaultFocusId();
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
    const items = this.items.map((item, index) => this.renderItem(item, index, focusId));
    return html`
      <aside
        part="activity-bar"
        data-region="activity-bar"
        role="toolbar"
        aria-orientation="vertical"
        aria-label=${resolvedLabel ?? nothing}
        aria-labelledby=${ariaLabelledby ?? nothing}
        style=${styleMap(containerStyles)}>
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
