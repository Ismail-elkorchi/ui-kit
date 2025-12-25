import {LitElement, html, nothing, svg, type SVGTemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {styleMap} from 'lit/directives/style-map.js';

import '../../../atomic/control/uik-button';
import {styles} from './styles';

export type UikNavRailIcon = string | SVGTemplateResult;

export interface UikNavRailItem {
  id: string;
  label: string;
  icon?: UikNavRailIcon;
  tooltip?: string;
  isDisabled?: boolean;
}

export interface UikNavRailSelectDetail {
  id: string;
  item: UikNavRailItem;
}

@customElement('uik-nav-rail')
export class UikNavRail extends LitElement {
  @property({attribute: false}) accessor items: UikNavRailItem[] = [];
  @property({type: String}) accessor activeId = '';
  @property({type: String, reflect: true, useDefault: true}) accessor orientation:
    | 'vertical'
    | 'horizontal' = 'vertical';
  @property({attribute: 'aria-label'}) accessor ariaLabelValue = '';
  @property({attribute: 'aria-labelledby'}) accessor ariaLabelledbyValue = '';

  @state() private accessor focusedId = '';

  static override readonly styles = styles;

  override updated(changed: Map<string, unknown>) {
    if (changed.has('items')) {
      const hasFocused = this.items.some(item => item.id === this.focusedId && !item.isDisabled);
      if (!hasFocused) {
        this.focusedId = this.resolveDefaultFocusId();
      }
    }

    if (changed.has('activeId') && this.activeId && !this.contains(document.activeElement)) {
      this.focusedId = this.resolveDefaultFocusId();
    }
  }

  private emitSelect(item: UikNavRailItem) {
    const detail: UikNavRailSelectDetail = {id: item.id, item};
    this.dispatchEvent(new CustomEvent('nav-rail-select', {detail, bubbles: true, composed: true}));
  }

  private resolveDefaultFocusId() {
    const active = this.items.find(item => item.id === this.activeId && !item.isDisabled);
    if (active) return active.id;
    const firstEnabled = this.items.find(item => !item.isDisabled);
    return firstEnabled?.id ?? '';
  }

  private focusItemById(id: string) {
    const root = this.renderRoot as HTMLElement | undefined;
    const button = root?.querySelector<HTMLElement>(`uik-button[data-nav-rail-id="${id}"]`);
    button?.focus();
  }

  private renderIcon(item: UikNavRailItem) {
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

  private onItemClick = (item: UikNavRailItem) => {
    if (item.isDisabled) return;
    this.emitSelect(item);
  };

  private onItemFocus = (event: FocusEvent) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement)) return;
    const {navRailId} = target.dataset;
    if (!navRailId) return;
    this.focusedId = navRailId;
  };

  private onItemKeydown = (event: KeyboardEvent) => {
    const orientation = this.orientation;
    const nextKeys = orientation === 'horizontal' ? ['ArrowRight'] : ['ArrowDown'];
    const prevKeys = orientation === 'horizontal' ? ['ArrowLeft'] : ['ArrowUp'];
    if (![...nextKeys, ...prevKeys, 'Home', 'End'].includes(event.key)) return;

    const enabledItems = this.items.filter(item => !item.isDisabled);
    if (enabledItems.length === 0) return;

    const currentIndex = Math.max(
      0,
      enabledItems.findIndex(item => item.id === this.focusedId),
    );
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = enabledItems.length - 1;
        break;
      default: {
        const delta = nextKeys.includes(event.key) ? 1 : -1;
        nextIndex = (currentIndex + delta + enabledItems.length) % enabledItems.length;
        break;
      }
    }

    const nextItem = enabledItems[nextIndex];
    if (!nextItem) return;

    event.preventDefault();
    this.focusedId = nextItem.id;
    void this.updateComplete.then(() => {
      this.focusItemById(nextItem.id);
    });
  };

  private renderItem(item: UikNavRailItem, focusId: string) {
    const isActive = this.activeId === item.id;
    const isFocused = focusId === item.id && !item.isDisabled;
    const iconStyles = {
      width: 'var(--uik-component-nav-rail-icon-size)',
      height: 'var(--uik-component-nav-rail-icon-size)',
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
      <div part="item" class="item" data-item-id=${item.id}>
        ${isActive ? html`<div part="item-indicator" class="indicator"></div>` : nothing}
        <uik-button
          part="item-button"
          data-nav-rail-id=${item.id}
          variant="ghost"
          size="icon"
          style=${styleMap({width: '100%', height: '100%'})}
          ?muted=${!isActive}
          ?active=${isActive}
          ?disabled=${item.isDisabled ?? false}
          .tabIndexValue=${isFocused ? 0 : -1}
          aria-pressed=${isActive ? 'true' : 'false'}
          aria-label=${item.label}
          title=${item.tooltip ?? item.label}
          @click=${() => this.onItemClick(item)}
          @focusin=${this.onItemFocus}
          @keydown=${this.onItemKeydown}>
          ${iconTemplate}
        </uik-button>
      </div>
    `;
  }

  override render() {
    const ariaLabel = this.ariaLabelValue || undefined;
    const ariaLabelledby = this.ariaLabelledbyValue || undefined;
    const focusId = this.focusedId || this.resolveDefaultFocusId();

    return html`
      <div
        part="base"
        class="rail"
        role="toolbar"
        aria-orientation=${this.orientation}
        aria-label=${ifDefined(ariaLabel)}
        aria-labelledby=${ifDefined(ariaLabelledby)}>
        ${this.items.map(item => this.renderItem(item, focusId))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uik-nav-rail': UikNavRail;
  }
}
