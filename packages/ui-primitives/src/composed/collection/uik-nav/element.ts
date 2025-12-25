import {LitElement, html, nothing, svg} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {styleMap} from 'lit/directives/style-map.js';

import {styles} from './styles';
import {buildTreeItems, collectTreeIds} from '../../../internal';
import type {TreeItem, TreeItemBase} from '../../../internal';

export interface UikNavItem extends TreeItemBase {
  href?: string;
  target?: string;
  rel?: string;
}

export interface UikNavSelectDetail {
  id: string;
  href?: string;
  item: UikNavItem;
}

export interface UikNavToggleDetail {
  id: string;
  open: boolean;
  item: UikNavItem;
}

/**
 * Navigation list with grouped links and current state.
 * @attr items (array)
 * @attr openIds (string[])
 * @attr currentId
 * @part base
 * @part item
 * @part toggle
 * @part link
 * @part label
 * @event nav-select
 * @event nav-toggle
 * @a11y Renders anchors inside a nav landmark; active links expose aria-current.
 * @cssprop --uik-component-nav-item-*
 * @cssprop --uik-component-nav-indent
 * @cssprop --uik-component-nav-text-*
 * @cssprop --uik-component-nav-toggle-fg
 */
@customElement('uik-nav')
export class UikNav extends LitElement {
  @property({attribute: false}) accessor items: UikNavItem[] = [];
  @property({attribute: false}) accessor openIds: string[] = [];
  @property({type: String}) accessor currentId = '';
  @property({attribute: 'aria-label'}) accessor ariaLabelValue = '';
  @property({attribute: 'aria-labelledby'}) accessor ariaLabelledbyValue = '';

  static override readonly styles = styles;

  private emitSelect(item: UikNavItem) {
    const detail: UikNavSelectDetail = {id: item.id, item};
    if (item.href) detail.href = item.href;
    const navEvent = new CustomEvent<UikNavSelectDetail>('nav-select', {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(navEvent);
    return navEvent;
  }

  private emitToggle(item: UikNavItem, open: boolean) {
    const detail: UikNavToggleDetail = {id: item.id, open, item};
    this.dispatchEvent(new CustomEvent('nav-toggle', {detail, bubbles: true, composed: true}));
  }

  private getOpenSet(): Set<string> {
    return new Set(this.openIds);
  }

  private resolveOpenIds(nextOpen: Set<string>) {
    const orderedIds = collectTreeIds(this.items);
    return orderedIds.filter(id => nextOpen.has(id));
  }

  private toggleItem(item: UikNavItem) {
    if (item.isDisabled) return;
    const openSet = this.getOpenSet();
    const isOpen = openSet.has(item.id);
    if (isOpen) {
      openSet.delete(item.id);
    } else {
      openSet.add(item.id);
    }
    this.openIds = this.resolveOpenIds(openSet);
    this.emitToggle(item, !isOpen);
  }

  private onLinkClick = (item: UikNavItem, event: MouseEvent) => {
    if (item.isDisabled) {
      event.preventDefault();
      return;
    }
    const navEvent = this.emitSelect(item);
    if (navEvent.defaultPrevented) event.preventDefault();
  };

  private onLabelClick = (item: UikNavItem) => {
    if (item.isDisabled) return;
    if (Array.isArray(item.children)) {
      this.toggleItem(item);
    }
  };

  private renderToggleIcon(isOpen: boolean) {
    const path = isOpen ? 'M5 9l7 7 7-7' : 'M9 5l7 7-7 7';
    return svg`<svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      style=${styleMap({
        width: 'var(--uik-size-icon-sm)',
        height: 'var(--uik-size-icon-sm)',
      })}>
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="var(--uik-border-width-1)"
        d=${path}></path>
    </svg>`;
  }

  private renderItem(entry: TreeItem<UikNavItem>) {
    const dataItem = entry.item;
    const isOpen = entry.isBranch && entry.isExpanded;
    const isCurrent = dataItem.id === this.currentId;
    const depthValue = String(entry.depth);
    const itemStyles = {
      paddingInlineStart: `calc(var(--uik-component-nav-item-padding-x) + (var(--uik-component-nav-indent) * ${depthValue}))`,
      paddingInlineEnd: 'var(--uik-component-nav-item-padding-x)',
    };
    const label = dataItem.href
      ? html`
          <a
            part="link"
            class="link"
            data-current=${isCurrent ? 'true' : 'false'}
            data-disabled=${dataItem.isDisabled ? 'true' : 'false'}
            href=${ifDefined(dataItem.href ?? undefined)}
            target=${ifDefined(dataItem.target ?? undefined)}
            rel=${ifDefined(dataItem.rel ?? undefined)}
            aria-current=${ifDefined(isCurrent ? 'page' : undefined)}
            aria-disabled=${ifDefined(dataItem.isDisabled ? 'true' : undefined)}
            tabindex=${ifDefined(dataItem.isDisabled ? '-1' : undefined)}
            @click=${(event: MouseEvent) => this.onLinkClick(dataItem, event)}>
            ${dataItem.label}
          </a>
        `
      : html`
          <button
            part="label"
            class="label"
            type="button"
            data-disabled=${dataItem.isDisabled ? 'true' : 'false'}
            aria-disabled=${ifDefined(dataItem.isDisabled ? 'true' : undefined)}
            ?disabled=${dataItem.isDisabled ?? false}
            @click=${() => this.onLabelClick(dataItem)}>
            ${dataItem.label}
          </button>
        `;

    return html`
      <div part="item" class="item" style=${styleMap(itemStyles)} data-item-id=${dataItem.id}>
        ${entry.isBranch
          ? html`
              <button
                part="toggle"
                class="toggle"
                type="button"
                ?disabled=${dataItem.isDisabled ?? false}
                aria-label=${isOpen ? `Collapse ${dataItem.label}` : `Expand ${dataItem.label}`}
                aria-expanded=${isOpen ? 'true' : 'false'}
                @click=${() => this.toggleItem(dataItem)}>
                ${this.renderToggleIcon(isOpen)}
              </button>
            `
          : nothing}
        ${label}
      </div>
    `;
  }

  override render() {
    const items = buildTreeItems(this.items, this.getOpenSet());
    return html`
      <nav
        part="base"
        class="nav"
        aria-label=${ifDefined(this.ariaLabelValue || undefined)}
        aria-labelledby=${ifDefined(this.ariaLabelledbyValue || undefined)}>
        ${items.map(item => this.renderItem(item))}
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uik-nav': UikNav;
  }
}
