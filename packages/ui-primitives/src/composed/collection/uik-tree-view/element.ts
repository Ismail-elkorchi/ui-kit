import { LitElement, html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";

import { styles } from "./styles";
import {
  buildTreeIndex,
  buildTreeItems,
  collectLeafIds,
  collectTreeIds,
} from "../../../internal";
import type { TreeIndex, TreeItem, TreeItemBase } from "../../../internal";

export type UikTreeViewItem = TreeItemBase;

export interface UikTreeViewSelectDetail {
  id: string;
  checked: boolean;
  selectionState: "checked" | "mixed" | "unchecked";
  selectedIds: string[];
  item: UikTreeViewItem;
}

export interface UikTreeViewOpenDetail {
  id: string;
  item: UikTreeViewItem;
}

export interface UikTreeViewToggleDetail {
  id: string;
  open: boolean;
  item: UikTreeViewItem;
}

type SelectionState = "checked" | "mixed" | "unchecked";

/**
 * Tree view list with tri-state selection and open state.
 * @attr items (array)
 * @attr selectedIds (string[])
 * @attr openIds (string[])
 * @part base
 * @part item
 * @part toggle
 * @part selection
 * @part label
 * @event tree-view-select
 * @event tree-view-open
 * @event tree-view-toggle
 * @a11y Treeview role with roving focus; Space toggles selection and Enter opens items.
 * @cssprop --uik-component-tree-view-item-*
 * @cssprop --uik-component-tree-view-indent
 * @cssprop --uik-component-tree-view-text-*
 * @cssprop --uik-component-tree-view-toggle-fg
 */
@customElement("uik-tree-view")
export class UikTreeView extends LitElement {
  @property({ attribute: false }) accessor items: UikTreeViewItem[] = [];
  @property({ attribute: false }) accessor selectedIds: string[] = [];
  @property({ attribute: false }) accessor openIds: string[] = [];
  @property({ attribute: "aria-label" }) accessor ariaLabelValue = "";
  @property({ attribute: "aria-labelledby" }) accessor ariaLabelledbyValue = "";

  @state() private accessor focusId = "";

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

  private getTreeIndex(): TreeIndex<UikTreeViewItem> {
    return buildTreeIndex(this.items);
  }

  private resolveOpenIds(nextOpen: Set<string>) {
    const orderedIds = collectTreeIds(this.items);
    return orderedIds.filter((id) => nextOpen.has(id));
  }

  private resolveSelectionState(
    treeIndex: TreeIndex<UikTreeViewItem>,
    selectedSet: Set<string>,
    id: string,
  ): SelectionState {
    const leafIds = collectLeafIds(treeIndex, id);
    if (leafIds.length === 0)
      return selectedSet.has(id) ? "checked" : "unchecked";
    const selectedCount = leafIds.filter((leafId) =>
      selectedSet.has(leafId),
    ).length;
    if (selectedCount === 0) return "unchecked";
    if (selectedCount === leafIds.length) return "checked";
    return "mixed";
  }

  private resolveSelectedIds(selectedSet: Set<string>) {
    const orderedIds = collectTreeIds(this.items);
    return orderedIds.filter((id) => selectedSet.has(id));
  }

  private emitSelect(
    item: UikTreeViewItem,
    checked: boolean,
    selectionState: SelectionState,
  ) {
    const detail: UikTreeViewSelectDetail = {
      id: item.id,
      checked,
      selectionState,
      selectedIds: this.selectedIds,
      item,
    };
    this.dispatchEvent(
      new CustomEvent("tree-view-select", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private emitOpen(item: UikTreeViewItem) {
    const detail: UikTreeViewOpenDetail = { id: item.id, item };
    this.dispatchEvent(
      new CustomEvent("tree-view-open", {
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

  private toggleSelection(item: UikTreeViewItem) {
    if (item.isDisabled) return;
    const treeIndex = this.getTreeIndex();
    const selectedSet = new Set(this.selectedIds);
    const state = this.resolveSelectionState(treeIndex, selectedSet, item.id);
    const leafIds = collectLeafIds(treeIndex, item.id);
    const targets = leafIds.length > 0 ? leafIds : [item.id];
    const shouldSelect = state !== "checked";
    targets.forEach((id) => {
      if (shouldSelect) {
        selectedSet.add(id);
      } else {
        selectedSet.delete(id);
      }
    });
    this.selectedIds = this.resolveSelectedIds(selectedSet);
    const nextState = this.resolveSelectionState(
      treeIndex,
      selectedSet,
      item.id,
    );
    this.emitSelect(item, shouldSelect, nextState);
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

  private onItemClick(item: UikTreeViewItem) {
    if (item.isDisabled) return;
    if (Array.isArray(item.children)) {
      this.toggleOpen(item);
      return;
    }
    this.emitOpen(item);
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
        this.toggleSelection(current.item);
        break;
      }
      case "Enter": {
        event.preventDefault();
        this.onItemClick(current.item);
        break;
      }
      default:
        break;
    }
  };

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

  private renderCheckIcon(state: SelectionState) {
    if (state === "unchecked") return nothing;
    const path = state === "mixed" ? "M7 12h10" : "M5 13l4 4L19 7";
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
    treeIndex: TreeIndex<UikTreeViewItem>,
    selectedSet: Set<string>,
  ) {
    const dataItem = entry.item;
    const state = this.resolveSelectionState(
      treeIndex,
      selectedSet,
      dataItem.id,
    );
    const isBranch = entry.isBranch;
    const isOpen = entry.isExpanded;
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
        aria-expanded=${ifDefined(
          isBranch ? (isOpen ? "true" : "false") : undefined,
        )}
        aria-checked=${state === "mixed"
          ? "mixed"
          : state === "checked"
            ? "true"
            : "false"}
        aria-selected=${state === "checked" ? "true" : "false"}
        aria-disabled=${ifDefined(dataItem.isDisabled ? "true" : undefined)}
        data-kind=${isBranch ? "branch" : "leaf"}
        data-item-id=${dataItem.id}
        data-disabled=${dataItem.isDisabled ? "true" : "false"}
        style=${styleMap(itemStyles)}
        @click=${() => this.onItemClick(dataItem)}
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
        <span
          part="selection"
          class="selection"
          data-state=${state}
          aria-hidden="true"
          @click=${(event: Event) => {
            event.stopPropagation();
            this.toggleSelection(dataItem);
          }}
        >
          ${this.renderCheckIcon(state)}
        </span>
        <span part="label" class="label">${dataItem.label}</span>
      </div>
    `;
  }

  override render() {
    const treeIndex = this.getTreeIndex();
    const items = this.getVisibleItems();
    const selectedSet = new Set(this.selectedIds);

    return html`
      <div
        part="base"
        class="tree"
        role="tree"
        aria-multiselectable="true"
        aria-label=${ifDefined(
          this.ariaLabelValue ||
            (this.ariaLabelledbyValue ? undefined : "Tree view"),
        )}
        aria-labelledby=${ifDefined(this.ariaLabelledbyValue || undefined)}
      >
        ${items.map((item) => this.renderItem(item, treeIndex, selectedSet))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-tree-view": UikTreeView;
  }
}
