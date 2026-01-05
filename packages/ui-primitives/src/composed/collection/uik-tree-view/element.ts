import { LitElement, html, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";

import { styles } from "./styles";
import { buildTreeItems, collectTreeIds } from "../../../internal";
import type { TreeItem, TreeItemBase } from "../../../internal";

export type UikTreeViewItem = TreeItemBase;

export interface UikTreeViewActivateDetail {
  id: string;
  item: UikTreeViewItem;
}

export interface UikTreeViewToggleDetail {
  id: string;
  open: boolean;
  item: UikTreeViewItem;
}

/**
 * Tree view navigation list with expandable branches.
 * @attr items (array)
 * @attr openIds (string[])
 * @attr currentId
 * @part base
 * @part item
 * @part toggle
 * @part label
 * @event tree-view-activate
 * @event tree-view-toggle
 * @a11y Treeview role with roving focus; Arrow keys move, typeahead jumps, Enter/Space activates.
 * @note Typeahead: typing letters moves focus to the next matching label.
 * @note Multi-select patterns are app-owned; compose selection controls alongside items.
 * @note Async loading: listen to tree-view-toggle or tree-view-activate and update items/openIds when children load.
 * @cssprop --uik-component-tree-view-item-*
 * @cssprop --uik-component-tree-view-indent
 * @cssprop --uik-component-tree-view-text-*
 * @cssprop --uik-component-tree-view-toggle-fg
 */
@customElement("uik-tree-view")
export class UikTreeView extends LitElement {
  @property({ attribute: false }) accessor items: UikTreeViewItem[] = [];
  @property({ attribute: false }) accessor openIds: string[] = [];
  @property({ type: String }) accessor currentId = "";
  @property({ attribute: "aria-label" }) accessor ariaLabelValue = "";
  @property({ attribute: "aria-labelledby" }) accessor ariaLabelledbyValue = "";

  @state() private accessor focusId = "";
  private typeaheadQuery = "";
  private typeaheadTimestamp = 0;

  static override readonly styles = styles;

  override updated(changed: Map<string, unknown>) {
    if (changed.has("items") || changed.has("openIds")) {
      const items = this.getVisibleItems();
      if (!items.some((item) => item.id === this.focusId)) {
        this.focusId = items[0]?.id ?? "";
      }
    }
  }

  private getOpenSet(): Set<string> {
    return new Set(this.openIds);
  }

  private getVisibleItems(): TreeItem<UikTreeViewItem>[] {
    return buildTreeItems(this.items, this.getOpenSet());
  }

  private resolveOpenIds(nextOpen: Set<string>) {
    const orderedIds = collectTreeIds(this.items);
    return orderedIds.filter((id) => nextOpen.has(id));
  }

  private emitActivate(item: UikTreeViewItem) {
    const detail: UikTreeViewActivateDetail = { id: item.id, item };
    this.dispatchEvent(
      new CustomEvent("tree-view-activate", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private emitToggle(item: UikTreeViewItem, open: boolean) {
    const detail: UikTreeViewToggleDetail = { id: item.id, open, item };
    this.dispatchEvent(
      new CustomEvent("tree-view-toggle", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private toggleOpen(item: UikTreeViewItem, isOpen?: boolean) {
    if (!Array.isArray(item.children) || item.isDisabled) return;
    const openSet = this.getOpenSet();
    const nextOpen = isOpen ?? !openSet.has(item.id);
    if (nextOpen) {
      openSet.add(item.id);
    } else {
      openSet.delete(item.id);
    }
    this.openIds = this.resolveOpenIds(openSet);
    this.emitToggle(item, nextOpen);
  }

  private focusItem(id: string) {
    this.focusId = id;
    void this.updateComplete.then(() => {
      const element = this.renderRoot.querySelector<HTMLElement>(
        `[data-item-id="${id}"]`,
      );
      element?.focus();
    });
  }

  private activateItem(entry: TreeItem<UikTreeViewItem>) {
    if (entry.item.isDisabled) return;
    if (entry.isBranch) {
      this.toggleOpen(entry.item);
    } else {
      this.emitActivate(entry.item);
    }
  }

  private onItemFocus = (event: FocusEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const id = target.getAttribute("data-item-id");
    if (!id) return;
    this.focusId = id;
  };

  private onKeyDown = (event: KeyboardEvent) => {
    const items = this.getVisibleItems();
    if (items.length === 0) return;
    const currentIndex = items.findIndex((item) => item.id === this.focusId);
    if (currentIndex === -1) return;
    const current = items[currentIndex];
    if (!current) return;

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        const next = items[Math.min(items.length - 1, currentIndex + 1)];
        if (next) this.focusItem(next.id);
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        const prev = items[Math.max(0, currentIndex - 1)];
        if (prev) this.focusItem(prev.id);
        break;
      }
      case "ArrowRight": {
        if (current.isBranch) {
          event.preventDefault();
          if (!current.isExpanded) {
            this.toggleOpen(current.item, true);
          } else {
            const next = items[currentIndex + 1];
            if (next && next.parentId === current.id) {
              this.focusItem(next.id);
            }
          }
        }
        break;
      }
      case "ArrowLeft": {
        event.preventDefault();
        if (current.isBranch && current.isExpanded) {
          this.toggleOpen(current.item, false);
        } else if (current.parentId) {
          this.focusItem(current.parentId);
        }
        break;
      }
      case "Home": {
        event.preventDefault();
        const first = items[0];
        if (first) this.focusItem(first.id);
        break;
      }
      case "End": {
        event.preventDefault();
        const last = items[items.length - 1];
        if (last) this.focusItem(last.id);
        break;
      }
      case " ": {
        event.preventDefault();
        this.activateItem(current);
        break;
      }
      case "Enter": {
        event.preventDefault();
        this.activateItem(current);
        break;
      }
      default:
        if (
          event.key.length === 1 &&
          !event.altKey &&
          !event.ctrlKey &&
          !event.metaKey
        ) {
          event.preventDefault();
          this.applyTypeahead(event.key, items, currentIndex);
        }
        break;
    }
  };

  private applyTypeahead(
    key: string,
    items: TreeItem<UikTreeViewItem>[],
    currentIndex: number,
  ) {
    const now = Date.now();
    const withinWindow = now - this.typeaheadTimestamp < 750;
    this.typeaheadTimestamp = now;
    this.typeaheadQuery = withinWindow
      ? `${this.typeaheadQuery}${key}`
      : key;
    const query = this.typeaheadQuery.toLowerCase();
    const nextIndex = this.findTypeaheadMatch(items, query, currentIndex);
    if (nextIndex >= 0) {
      const match = items[nextIndex];
      if (match) {
        this.focusItem(match.id);
      }
      return;
    }
    if (query.length > 1) {
      this.typeaheadQuery = key;
      const fallbackIndex = this.findTypeaheadMatch(
        items,
        key.toLowerCase(),
        currentIndex,
      );
      if (fallbackIndex >= 0) {
        const match = items[fallbackIndex];
        if (match) {
          this.focusItem(match.id);
        }
      }
    }
  }

  private findTypeaheadMatch(
    items: TreeItem<UikTreeViewItem>[],
    query: string,
    startIndex: number,
  ) {
    const total = items.length;
    for (let offset = 1; offset <= total; offset += 1) {
      const index = (startIndex + offset) % total;
      const label = items[index]?.item.label ?? "";
      if (label.toLowerCase().startsWith(query)) return index;
    }
    return -1;
  }

  private renderToggleIcon(isOpen: boolean) {
    const path = isOpen ? "M5 9l7 7 7-7" : "M9 5l7 7-7 7";
    return svg`<svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      style=${styleMap({
        width: "var(--uik-size-icon-sm)",
        height: "var(--uik-size-icon-sm)",
      })}>
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="var(--uik-border-width-1)"
        d=${path}></path>
    </svg>`;
  }

  private renderItem(
    entry: TreeItem<UikTreeViewItem>,
  ) {
    const dataItem = entry.item;
    const isBranch = entry.isBranch;
    const isOpen = entry.isExpanded;
    const isCurrent = dataItem.id === this.currentId;
    const depthValue = String(entry.depth);
    const itemStyles = {
      paddingInlineStart: `calc(var(--uik-component-tree-view-item-padding-x) + (var(--uik-component-tree-view-indent) * ${depthValue}))`,
      paddingInlineEnd: "var(--uik-component-tree-view-item-padding-x)",
    };

    return html`
      <div
        part="item"
        class="item"
        role="treeitem"
        tabindex=${entry.id === this.focusId ? 0 : -1}
        aria-label=${dataItem.label}
        aria-level=${String(entry.depth + 1)}
        aria-posinset=${String(entry.index + 1)}
        aria-setsize=${String(entry.setSize)}
        aria-current=${ifDefined(isCurrent ? "page" : undefined)}
        aria-expanded=${ifDefined(
          isBranch ? (isOpen ? "true" : "false") : undefined,
        )}
        aria-disabled=${ifDefined(dataItem.isDisabled ? "true" : undefined)}
        data-kind=${isBranch ? "branch" : "leaf"}
        data-current=${isCurrent ? "true" : "false"}
        data-item-id=${dataItem.id}
        data-disabled=${dataItem.isDisabled ? "true" : "false"}
        style=${styleMap(itemStyles)}
        @click=${() => this.activateItem(entry)}
        @keydown=${this.onKeyDown}
        @focus=${this.onItemFocus}
      >
        ${isBranch
          ? html`
              <span
                part="toggle"
                class="toggle"
                data-open=${isOpen ? "true" : "false"}
                aria-hidden="true"
                @click=${(event: Event) => {
                  event.stopPropagation();
                  this.toggleOpen(dataItem);
                }}
              >
                ${this.renderToggleIcon(isOpen)}
              </span>
            `
          : html`<span part="toggle" class="toggle" aria-hidden="true"></span>`}
        <span part="label" class="label">${dataItem.label}</span>
      </div>
    `;
  }

  override render() {
    const items = this.getVisibleItems();

    return html`
      <div
        part="base"
        class="tree"
        role="tree"
        aria-label=${ifDefined(
          this.ariaLabelValue ||
            (this.ariaLabelledbyValue ? undefined : "Tree view"),
        )}
        aria-labelledby=${ifDefined(this.ariaLabelledbyValue || undefined)}
      >
        ${items.map((item) => this.renderItem(item))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-tree-view": UikTreeView;
  }
}
