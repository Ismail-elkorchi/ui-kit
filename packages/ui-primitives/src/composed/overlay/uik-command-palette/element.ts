import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";

import { styles } from "./styles";
import { buildDescribedBy, createId, hasSlotContent } from "../../../internal";

type SlotName =
  | "title"
  | "description"
  | "label"
  | "empty"
  | "loading"
  | "footer";

export type UikCommandPaletteCloseReason =
  | "escape"
  | "select"
  | "programmatic"
  | "toggle";

export interface UikCommandPaletteItem {
  id: string;
  label: string;
  value?: string;
  description?: string;
  keywords?: string | string[];
  shortcut?: string;
  group?: string;
  isDisabled?: boolean;
}

export interface UikCommandPaletteSelectDetail {
  item: UikCommandPaletteItem;
  query: string;
}

export interface UikCommandPaletteOpenChangeDetail {
  open: boolean;
  reason?: UikCommandPaletteCloseReason;
}

export interface UikCommandPaletteQueryChangeDetail {
  query: string;
}

export type UikCommandPaletteFilter = (
  item: UikCommandPaletteItem,
  query: string,
) => boolean;

const normalizeQuery = (value: string) => value.trim().toLowerCase();

const tokenizeQuery = (value: string) =>
  normalizeQuery(value)
    .split(/\s+/)
    .filter((token) => token.length > 0);

const normalizeKeywords = (value?: string | string[]) => {
  if (!value) return "";
  return Array.isArray(value) ? value.join(" ") : value;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Command palette overlay with filtering, keyboard navigation, and selection.
 * @attr open (boolean)
 * @attr query
 * @attr placeholder
 * @attr loading (boolean)
 * @attr disabled (boolean)
 * @attr disable-filter (boolean)
 * @attr disable-auto-close (boolean)
 * @attr highlight-matches (boolean)
 * @attr input-label
 * @attr virtualize (boolean)
 * @attr item-height (number)
 * @attr viewport-height (number)
 * @attr overscan (number)
 * @slot title
 * @slot description
 * @slot label
 * @slot empty
 * @slot loading
 * @slot footer
 * @part dialog
 * @part panel
 * @part header
 * @part title
 * @part description
 * @part label
 * @part input
 * @part list
 * @part group
 * @part group-label
 * @part item
 * @part item-label
 * @part item-description
 * @part item-shortcut
 * @part highlight
 * @part empty
 * @part loading
 * @part footer
 * @event command-palette-open-change (detail: {open, reason})
 * @event command-palette-query-change (detail: {query})
 * @event command-palette-select (detail: {item, query})
 * @a11y Uses combobox + listbox with aria-activedescendant for keyboard navigation.
 * @cssprop --uik-component-command-palette-* (panel, input, list, item, highlight)
 */
@customElement("uik-command-palette")
export class UikCommandPalette extends LitElement {
  @property({ type: Boolean, reflect: true, useDefault: true }) accessor open =
    false;
  @property({ type: String }) accessor query = "";
  @property({ type: String }) accessor placeholder = "Search commands";
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor loading = false;
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor disabled = false;
  @property({ type: Boolean, reflect: true, attribute: "disable-filter" })
  accessor disableFilter = false;
  @property({ type: Boolean, reflect: true, attribute: "disable-auto-close" })
  accessor disableAutoClose = false;
  @property({ type: Boolean, reflect: true })
  accessor virtualize = false;
  @property({ type: Boolean, reflect: true, attribute: "highlight-matches" })
  accessor highlightMatches = true;
  @property({ type: String, attribute: "input-label" })
  accessor inputLabel = "Search commands";
  @property({ type: Number, attribute: "item-height" })
  accessor itemHeight: number | null = null;
  @property({ type: Number, attribute: "viewport-height" })
  accessor viewportHeight: number | null = null;
  @property({ type: Number }) accessor overscan = 4;
  @property({ attribute: false }) accessor items: UikCommandPaletteItem[] = [];
  @property({ attribute: false })
  accessor filter: UikCommandPaletteFilter | null = null;
  @property({ attribute: "aria-label" }) accessor ariaLabelValue = "";
  @property({ attribute: "aria-labelledby" }) accessor ariaLabelledbyValue = "";
  @property({ attribute: "aria-describedby" }) accessor ariaDescribedbyValue =
    "";

  @state() private accessor activeIndex = -1;
  @state() private accessor listScrollTop = 0;

  private readonly paletteId = createId("uik-command-palette");
  private readonly inputId = `${this.paletteId}-input`;
  private readonly labelId = `${this.paletteId}-label`;
  private readonly titleId = `${this.paletteId}-title`;
  private readonly descriptionId = `${this.paletteId}-description`;
  private readonly listboxId = `${this.paletteId}-listbox`;
  private focusReturnElement: HTMLElement | null = null;
  private pendingCloseReason: UikCommandPaletteCloseReason | null = null;

  static override readonly styles = styles;

  private get dialogElement(): HTMLDialogElement | null {
    return this.renderRoot.querySelector("dialog");
  }

  private get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector("input");
  }

  private get listElement(): HTMLElement | null {
    return this.renderRoot.querySelector("[data-command-list]");
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has("open")) {
      if (this.open) {
        this.captureFocusOrigin();
      }
      this.syncOpenState();
      this.dispatchOpenChange();
    }

    if (
      changed.has("items") ||
      changed.has("query") ||
      changed.has("disableFilter") ||
      changed.has("loading")
    ) {
      this.syncActiveIndex();
      this.resetScroll();
    }
  }

  show() {
    this.open = true;
  }

  close() {
    this.pendingCloseReason ??= "programmatic";
    this.open = false;
  }

  private syncOpenState() {
    const dialog = this.dialogElement;
    if (!dialog) return;
    if (this.open) {
      dialog.hidden = false;
      if (!dialog.open) dialog.showModal();
      void this.focusInput();
    } else {
      if (dialog.open) {
        dialog.close();
      }
      dialog.hidden = true;
      this.restoreFocus();
    }
  }

  private dispatchOpenChange() {
    const reason = this.pendingCloseReason ?? "programmatic";
    this.pendingCloseReason = null;
    this.dispatchEvent(
      new CustomEvent<UikCommandPaletteOpenChangeDetail>(
        "command-palette-open-change",
        {
          detail: { open: this.open, reason },
          bubbles: true,
          composed: true,
        },
      ),
    );
  }

  private captureFocusOrigin() {
    const active = document.activeElement;
    if (active instanceof HTMLElement && !this.contains(active)) {
      this.focusReturnElement = active;
    }
  }

  private restoreFocus() {
    const target = this.focusReturnElement;
    this.focusReturnElement = null;
    if (target?.isConnected) {
      target.focus();
    }
  }

  private async focusInput() {
    await this.updateComplete;
    const input = this.inputElement;
    input?.focus();
  }

  private resetScroll() {
    this.listScrollTop = 0;
    const list = this.listElement;
    if (list) list.scrollTop = 0;
  }

  private syncActiveIndex() {
    if (this.loading) {
      this.activeIndex = -1;
      return;
    }
    const items = this.getFilteredItems();
    const nextIndex = this.findNextEnabledIndex(items, 0);
    this.activeIndex = nextIndex ?? -1;
  }

  private getFilteredItems() {
    if (this.disableFilter) return this.items;
    const rawQuery = this.query;
    const normalized = normalizeQuery(rawQuery);
    if (!normalized) return this.items;
    if (this.filter) {
      return this.items.filter((item) => this.filter?.(item, rawQuery));
    }
    const tokens = tokenizeQuery(normalized);
    return this.items.filter((item) => {
      const haystack = [
        item.label,
        item.description,
        normalizeKeywords(item.keywords),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  }

  private findNextEnabledIndex(
    items: UikCommandPaletteItem[],
    startIndex: number,
  ) {
    for (let index = startIndex; index < items.length; index += 1) {
      if (!items[index]?.isDisabled) return index;
    }
    return null;
  }

  private findPrevEnabledIndex(
    items: UikCommandPaletteItem[],
    startIndex: number,
  ) {
    for (let index = startIndex; index >= 0; index -= 1) {
      if (!items[index]?.isDisabled) return index;
    }
    return null;
  }

  private moveActiveByOffset(offset: number) {
    const items = this.getFilteredItems();
    if (items.length === 0) return;

    let nextIndex = this.activeIndex;
    if (nextIndex === -1) {
      nextIndex = offset > 0 ? 0 : items.length - 1;
    } else {
      nextIndex = Math.min(Math.max(nextIndex + offset, 0), items.length - 1);
    }

    const resolved =
      offset >= 0
        ? this.findNextEnabledIndex(items, nextIndex)
        : this.findPrevEnabledIndex(items, nextIndex);

    if (resolved === null) return;
    this.activeIndex = resolved;
    this.scrollToIndex(resolved);
  }

  private scrollToIndex(index: number) {
    const list = this.listElement;
    if (!list) return;
    if (this.virtualize && this.itemHeight && this.viewportHeight) {
      list.scrollTop = index * this.itemHeight;
      this.listScrollTop = list.scrollTop;
      return;
    }
    const item = list.querySelector<HTMLElement>(
      `[data-command-index="${String(index)}"]`,
    );
    item?.scrollIntoView({ block: "nearest" });
  }

  private selectIndex(index: number) {
    const items = this.getFilteredItems();
    const item = items[index];
    if (!item || item.isDisabled) return;
    this.dispatchEvent(
      new CustomEvent<UikCommandPaletteSelectDetail>("command-palette-select", {
        detail: { item, query: this.query },
        bubbles: true,
        composed: true,
      }),
    );
    if (!this.disableAutoClose) {
      this.pendingCloseReason = "select";
      this.open = false;
    }
  }

  private getOptionId(index: number) {
    return `${this.listboxId}-option-${String(index)}`;
  }

  private hasSlot(name: SlotName) {
    return hasSlotContent(this, name);
  }

  private onInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.query = target.value;
    this.dispatchEvent(
      new CustomEvent<UikCommandPaletteQueryChangeDetail>(
        "command-palette-query-change",
        {
          detail: { query: this.query },
          bubbles: true,
          composed: true,
        },
      ),
    );
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (!this.open || this.disabled) return;
    if (event.defaultPrevented) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        this.moveActiveByOffset(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        this.moveActiveByOffset(-1);
        break;
      case "Home":
        event.preventDefault();
        this.activeIndex =
          this.findNextEnabledIndex(this.getFilteredItems(), 0) ?? -1;
        if (this.activeIndex >= 0) {
          this.scrollToIndex(this.activeIndex);
        }
        break;
      case "End": {
        event.preventDefault();
        const items = this.getFilteredItems();
        const nextIndex =
          this.findPrevEnabledIndex(items, items.length - 1) ?? -1;
        this.activeIndex = nextIndex;
        if (nextIndex >= 0) {
          this.scrollToIndex(nextIndex);
        }
        break;
      }
      case "Enter":
        event.preventDefault();
        if (this.activeIndex >= 0) {
          this.selectIndex(this.activeIndex);
        }
        break;
      case "Escape":
        event.preventDefault();
        this.pendingCloseReason = "escape";
        this.open = false;
        break;
      default:
        break;
    }
  };

  private onListClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const item = target.closest<HTMLElement>("[data-command-index]");
    if (!item) return;
    const index = Number(item.dataset["commandIndex"]);
    if (Number.isNaN(index)) return;
    this.activeIndex = index;
    this.selectIndex(index);
  };

  private onListMouseDown = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest("[data-command-index]")) {
      event.preventDefault();
    }
  };

  private onListScroll = (event: Event) => {
    if (!this.virtualize) return;
    const target = event.target as HTMLElement;
    this.listScrollTop = target.scrollTop;
  };

  private renderHighlightedText(text: string, tokens: string[]) {
    if (!this.highlightMatches || tokens.length === 0) return text;
    const lowerTokens = tokens.map((token) => token.toLowerCase());
    const pattern = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "gi");
    return text.split(pattern).map((part) => {
      if (part === "") return "";
      if (lowerTokens.includes(part.toLowerCase())) {
        return html`<mark part="highlight" class="highlight">${part}</mark>`;
      }
      return part;
    });
  }

  override render() {
    const hasTitle = this.hasSlot("title");
    const hasDescription = this.hasSlot("description");
    const hasLabel = this.hasSlot("label");
    const hasFooter = this.hasSlot("footer");
    const dialogDescribedBy = buildDescribedBy(
      this.ariaDescribedbyValue,
      hasDescription ? this.descriptionId : null,
    );
    const dialogLabel = hasTitle ? undefined : this.ariaLabelValue || undefined;
    const dialogLabelledby = hasTitle
      ? this.titleId
      : this.ariaLabelledbyValue || undefined;

    const listLabelledBy = hasLabel ? this.labelId : undefined;
    const listLabel = hasLabel ? undefined : this.inputLabel || undefined;
    const filteredItems = this.getFilteredItems();
    const hasGroups = filteredItems.some((item) => Boolean(item.group));
    const canVirtualize =
      this.virtualize &&
      Boolean(this.itemHeight && this.viewportHeight) &&
      !hasGroups;
    const totalCount = filteredItems.length;
    const startIndex = canVirtualize
      ? Math.max(
          Math.floor(this.listScrollTop / (this.itemHeight ?? 1)) -
            this.overscan,
          0,
        )
      : 0;
    const visibleCount = canVirtualize
      ? Math.ceil((this.viewportHeight ?? 0) / (this.itemHeight ?? 1)) +
        this.overscan * 2
      : totalCount;
    const endIndex = canVirtualize
      ? Math.min(startIndex + visibleCount, totalCount)
      : totalCount;
    const visibleItems = filteredItems.slice(startIndex, endIndex);
    const emptyVisible = !this.loading && visibleItems.length === 0;
    const queryTokens = tokenizeQuery(this.query);
    const listStyle = canVirtualize
      ? {
          maxHeight: `${String(this.viewportHeight)}px`,
          paddingTop: `${String(startIndex * (this.itemHeight ?? 0))}px`,
          paddingBottom: `${String(
            (totalCount - endIndex) * (this.itemHeight ?? 0),
          )}px`,
        }
      : undefined;

    const renderItem = (item: UikCommandPaletteItem, absoluteIndex: number) => {
      const isActive = absoluteIndex === this.activeIndex;
      const labelContent = this.renderHighlightedText(item.label, queryTokens);
      const descriptionContent = item.description
        ? this.renderHighlightedText(item.description, queryTokens)
        : null;

      return html`
        <div
          part="item"
          class="item"
          role="option"
          id=${this.getOptionId(absoluteIndex)}
          data-command-index=${String(absoluteIndex)}
          data-testid="command-palette-item"
          data-active=${String(isActive)}
          data-disabled=${String(Boolean(item.isDisabled))}
          aria-selected=${ifDefined(isActive ? "true" : "false")}
          aria-disabled=${ifDefined(item.isDisabled ? "true" : undefined)}
          aria-setsize=${ifDefined(
            canVirtualize ? String(totalCount) : undefined,
          )}
          aria-posinset=${ifDefined(
            canVirtualize ? String(absoluteIndex + 1) : undefined,
          )}
        >
          <div part="item-label" class="item-content">
            <span>${labelContent}</span>
            ${item.description
              ? html`<span part="item-description" class="item-description">
                  ${descriptionContent}
                </span>`
              : nothing}
          </div>
          ${item.shortcut
            ? html`<span part="item-shortcut" class="item-shortcut"
                >${item.shortcut}</span
              >`
            : nothing}
        </div>
      `;
    };

    const renderGroups = () => {
      const grouped = new Map<
        string,
        { item: UikCommandPaletteItem; index: number }[]
      >();
      const order: string[] = [];
      filteredItems.forEach((item, index) => {
        const group = item.group ?? "";
        if (!grouped.has(group)) {
          grouped.set(group, []);
          order.push(group);
        }
        grouped.get(group)?.push({ item, index });
      });

      return order.map((group) => {
        const items = grouped.get(group) ?? [];
        if (!group) {
          return items.map(({ item, index }) => renderItem(item, index));
        }
        return html`
          <div part="group" class="group" role="group" aria-label=${group}>
            <div part="group-label" class="group-label">${group}</div>
            ${items.map(({ item, index }) => {
              return renderItem(item, index);
            })}
          </div>
        `;
      });
    };

    const listBody = this.loading
      ? html`<div
          part="loading"
          class="loading"
          role="option"
          aria-selected="false"
          aria-disabled="true"
          data-testid="command-palette-loading"
        >
          <slot name="loading">Loading results...</slot>
        </div>`
      : emptyVisible
        ? html`<div
            part="empty"
            class="empty"
            role="option"
            aria-selected="false"
            aria-disabled="true"
            data-testid="command-palette-empty"
          >
            <slot name="empty">No results.</slot>
          </div>`
        : hasGroups
          ? renderGroups()
          : visibleItems.map((item, index) =>
              renderItem(item, startIndex + index),
            );

    return html`
      <dialog
        part="dialog"
        aria-label=${ifDefined(dialogLabel)}
        aria-labelledby=${ifDefined(dialogLabelledby)}
        aria-describedby=${ifDefined(dialogDescribedBy)}
        aria-modal=${ifDefined(this.open ? "true" : undefined)}
        data-testid="command-palette-dialog"
        @close=${() => {
          if (this.open) {
            this.pendingCloseReason ??= "programmatic";
            this.open = false;
          }
        }}
        @cancel=${() => {
          this.pendingCloseReason ??= "escape";
        }}
      >
        <div part="panel" class="panel" data-testid="command-palette-panel">
          <div
            part="header"
            class="header"
            ?hidden=${!hasTitle && !hasDescription}
          >
            <div
              part="title"
              class="title"
              id=${this.titleId}
              ?hidden=${!hasTitle}
            >
              <slot name="title"></slot>
            </div>
            <div
              part="description"
              class="description"
              id=${this.descriptionId}
              ?hidden=${!hasDescription}
            >
              <slot name="description"></slot>
            </div>
          </div>
          <label
            part="label"
            class="label"
            id=${this.labelId}
            for=${this.inputId}
            ?hidden=${!hasLabel}
          >
            <slot name="label"></slot>
          </label>
          <input
            part="input"
            class="input"
            id=${this.inputId}
            type="text"
            role="combobox"
            placeholder=${this.placeholder}
            .value=${this.query}
            ?disabled=${this.disabled}
            data-testid="command-palette-input"
            aria-label=${ifDefined(
              !hasLabel ? this.inputLabel || undefined : undefined,
            )}
            aria-labelledby=${ifDefined(hasLabel ? this.labelId : undefined)}
            aria-controls=${this.listboxId}
            aria-expanded=${this.open ? "true" : "false"}
            aria-activedescendant=${ifDefined(
              this.activeIndex >= 0
                ? this.getOptionId(this.activeIndex)
                : undefined,
            )}
            aria-autocomplete="list"
            aria-haspopup="listbox"
            @input=${this.onInput}
            @keydown=${this.onKeyDown}
          />
          <div
            part="list"
            class="list"
            id=${this.listboxId}
            role="listbox"
            aria-label=${ifDefined(listLabel)}
            aria-labelledby=${ifDefined(listLabelledBy)}
            aria-busy=${ifDefined(this.loading ? "true" : undefined)}
            data-command-list
            data-testid="command-palette-list"
            style=${listStyle ? styleMap(listStyle) : nothing}
            @click=${this.onListClick}
            @mousedown=${this.onListMouseDown}
            @keydown=${this.onKeyDown}
            @scroll=${this.onListScroll}
          >
            ${listBody}
          </div>
          <div part="footer" class="footer" ?hidden=${!hasFooter}>
            <slot name="footer"></slot>
          </div>
        </div>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-command-palette": UikCommandPalette;
  }
}
