import { customElement, property, state } from "lit/decorators.js";

import { styles } from "./styles.js";
import type { UikMenuItem } from "./uik-menu-item.js";
import "./uik-menu-item.js";
import { UikPopover } from "../../../atomic/overlay/uik-popover/element.js";
import { styles as popoverStyles } from "../../../atomic/overlay/uik-popover/styles.js";
import { createId } from "../../../internal/index.js";

export interface UikMenuActiveDetail {
  id: string;
  value: string;
  item: UikMenuItem;
}

export interface UikMenuSelectDetail {
  id: string;
  value: string;
  item: UikMenuItem;
}

/**
 * Menu panel with trigger slot and roving focus items.
 * @attr open
 * @attr placement
 * @attr popover (auto | manual | hint)
 * @attr value
 * @attr activeId
 * @slot trigger
 * @slot default (uik-menu-item children)
 * @part control
 * @part base
 * @event menu-active (detail: {id, value, item})
 * @event menu-select (detail: {id, value, item})
 * @event menu-open
 * @event menu-close
 * @event overlay-close (detail: {reason})
 * @a11y Roving focus with Arrow/Home/End; Enter/Space selects; Escape closes and returns focus.
 * @cssprop --uik-component-menu-* (bg, fg, border, radius, padding, shadow, offset, gap)
 * @cssprop --uik-component-menu-item-* (bg, fg, padding, radius, height, state colors)
 */
@customElement("uik-menu")
export class UikMenu extends UikPopover {
  @property({ type: String }) accessor value = "";
  @property({ type: String }) accessor activeId = "";

  @state() private accessor isEmpty = true;

  protected override readonly panelRole = "menu";
  protected override readonly panelId = createId("uik-menu");
  protected override get shouldManageFocusReturn(): boolean {
    return false;
  }
  static override readonly styles = [popoverStyles, styles];

  private focusReturnElement: HTMLElement | null = null;
  private suppressFocusReturn = false;
  private pendingInitialFocus: "first" | "last" | null = null;
  private menuSlot: HTMLSlotElement | null = null;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("click", this.onItemClick);
    this.addEventListener("focusin", this.onItemFocus);
    this.addEventListener("keydown", this.onKeyDown);
  }

  override disconnectedCallback() {
    this.menuSlot?.removeEventListener("slotchange", this.onItemsSlotChange);
    this.menuSlot = null;
    this.removeEventListener("click", this.onItemClick);
    this.removeEventListener("focusin", this.onItemFocus);
    this.removeEventListener("keydown", this.onKeyDown);
    super.disconnectedCallback();
  }

  override firstUpdated() {
    super.firstUpdated();
    this.menuSlot =
      this.renderRoot.querySelector<HTMLSlotElement>("slot:not([name])");
    this.menuSlot?.addEventListener("slotchange", this.onItemsSlotChange);
    this.syncMenuItems();
    this.syncTriggerAria();
    this.syncPanelAria();
  }

  override updated(changed: Map<string, unknown>) {
    super.updated(changed);

    if (changed.has("activeId") || changed.has("open")) {
      this.syncMenuItems();
    }

    if (
      changed.has("open") ||
      changed.has("ariaLabelValue") ||
      changed.has("ariaLabelledbyValue")
    ) {
      this.syncTriggerAria();
      this.syncPanelAria();
    }

    if (changed.has("open")) {
      const wasOpen = changed.get("open") as boolean | undefined;
      if (!wasOpen && this.open) {
        this.captureMenuFocusOrigin();
        this.pendingInitialFocus ??= "first";
        void this.updateComplete.then(() => this.applyInitialFocus());
        this.dispatchEvent(
          new CustomEvent("menu-open", { bubbles: true, composed: true }),
        );
      }

      if (wasOpen && !this.open) {
        this.dispatchEvent(
          new CustomEvent("menu-close", { bubbles: true, composed: true }),
        );
        this.restoreMenuFocus();
      }
    }
  }

  openWithFocus(target: "first" | "last" = "first") {
    if (this.open) {
      this.pendingInitialFocus = target;
      void this.updateComplete.then(() => this.applyInitialFocus());
      return;
    }
    this.pendingInitialFocus = target;
    this.open = true;
    void this.updateComplete.then(() => this.applyInitialFocus());
  }

  suppressNextFocusReturn() {
    this.suppressFocusReturn = true;
  }

  override getTriggerElement(): HTMLElement | null {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>(
      'slot[name="trigger"]',
    );
    const assigned = slot?.assignedElements({ flatten: true }) ?? [];
    const trigger = assigned.find(
      (element): element is HTMLElement => element instanceof HTMLElement,
    );
    return trigger ?? null;
  }

  setTriggerTabIndex(value: number) {
    const trigger = this.getTriggerElement();
    if (!trigger) return;
    if ("tabIndexValue" in trigger) {
      (trigger as HTMLElement & { tabIndexValue: number }).tabIndexValue =
        value;
    } else {
      trigger.tabIndex = value;
    }
  }

  focusTrigger() {
    this.getTriggerElement()?.focus();
  }

  private getPanelElement(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(".panel");
  }

  private getItems(): UikMenuItem[] {
    return Array.from(this.querySelectorAll<UikMenuItem>("uik-menu-item"));
  }

  private getEnabledItems(): UikMenuItem[] {
    return this.getItems().filter((item) => !item.disabled);
  }

  private syncMenuItems() {
    const items = this.getItems();
    this.isEmpty = items.length === 0;
    this.toggleAttribute("data-empty", this.isEmpty);

    const enabledItems = items.filter((item) => !item.disabled);
    const firstEnabled = enabledItems[0];
    if (!firstEnabled) {
      this.activeId = "";
      items.forEach((item) => {
        item.active = false;
        item.tabIndexValue = -1;
      });
      return;
    }

    let nextActiveId = this.activeId;
    if (!enabledItems.some((item) => item.id === nextActiveId)) {
      nextActiveId = firstEnabled.id;
    }

    const activeChanged = nextActiveId !== this.activeId;
    if (activeChanged) {
      this.activeId = nextActiveId;
    }

    items.forEach((item) => {
      const isActive = item.id === nextActiveId;
      item.active = isActive;
      item.tabIndexValue = this.open && isActive && !item.disabled ? 0 : -1;
    });

    if (activeChanged) {
      const activeItem = items.find((item) => item.id === nextActiveId);
      if (activeItem) this.emitActive(activeItem);
    }
  }

  private applyInitialFocus() {
    if (!this.open) return;
    if (!this.pendingInitialFocus) return;
    const items = this.getEnabledItems();
    const firstItem = items[0];
    if (!firstItem) return;

    let target = firstItem;
    if (this.pendingInitialFocus === "last") {
      const lastItem = items[items.length - 1];
      if (lastItem) target = lastItem;
    }
    this.pendingInitialFocus = null;
    this.setActiveItem(target, false);
    this.focusItem(target);
  }

  private setActiveItem(item: UikMenuItem, shouldFocus: boolean) {
    if (item.disabled) return;
    if (item.id === this.activeId && shouldFocus) {
      void item.updateComplete.then(() => item.focus());
      return;
    }
    if (item.id !== this.activeId) {
      this.activeId = item.id;
      this.emitActive(item);
    }
    if (shouldFocus) {
      void item.updateComplete.then(() => item.focus());
    }
  }

  private focusItem(item: UikMenuItem) {
    void item.updateComplete.then(() => item.focus());
  }

  private emitActive(item: UikMenuItem) {
    const detail: UikMenuActiveDetail = {
      id: item.id,
      value: item.value || item.id,
      item,
    };
    this.dispatchEvent(
      new CustomEvent("menu-active", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private selectItem(item: UikMenuItem) {
    if (item.disabled) return;
    const nextValue = item.value || item.id;
    this.value = nextValue;
    const detail: UikMenuSelectDetail = {
      id: item.id,
      value: nextValue,
      item,
    };
    this.dispatchEvent(
      new CustomEvent("menu-select", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
    this.hide();
  }

  private selectActive() {
    const activeItem = this.getItems().find(
      (item) => item.id === this.activeId,
    );
    if (!activeItem) return;
    this.selectItem(activeItem);
  }

  private moveActiveByKey(key: string) {
    const items = this.getEnabledItems();
    if (items.length === 0) return false;

    const currentIndex = items.findIndex((item) => item.id === this.activeId);
    let nextIndex = currentIndex === -1 ? 0 : currentIndex;

    switch (key) {
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = items.length - 1;
        break;
      case "ArrowDown":
        nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % items.length;
        break;
      case "ArrowUp":
        nextIndex =
          currentIndex === -1
            ? items.length - 1
            : (currentIndex - 1 + items.length) % items.length;
        break;
      default:
        return false;
    }

    const nextItem = items[nextIndex];
    if (!nextItem) return false;
    this.setActiveItem(nextItem, true);
    return true;
  }

  private resolveItemFromEvent(event: Event): UikMenuItem | null {
    const path = event.composedPath();
    for (const node of path) {
      if (node instanceof HTMLElement && node.tagName === "UIK-MENU-ITEM") {
        return node as UikMenuItem;
      }
    }
    return null;
  }

  private onItemClick = (event: Event) => {
    const item = this.resolveItemFromEvent(event);
    if (!item) return;
    this.setActiveItem(item, false);
    this.selectItem(item);
  };

  private onItemFocus = (event: FocusEvent) => {
    if (!this.open) return;
    const item = this.resolveItemFromEvent(event);
    if (!item || item.disabled) return;
    this.activeId = item.id;
    this.emitActive(item);
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (!this.open || event.defaultPrevented) return;

    const handled = this.moveActiveByKey(event.key);
    if (handled) {
      event.preventDefault();
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.selectActive();
    }
  };

  private syncTriggerAria() {
    const trigger = this.getTriggerElement();
    if (!trigger) return;
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", this.open ? "true" : "false");
    trigger.setAttribute("aria-controls", this.panelId);
  }

  private syncPanelAria() {
    const panel = this.getPanelElement();
    panel?.setAttribute("aria-orientation", "vertical");
  }

  private captureMenuFocusOrigin() {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement)) return;
    const panel = this.getPanelElement();
    if (panel?.contains(active)) return;
    this.focusReturnElement = active;
  }

  private restoreMenuFocus() {
    if (this.suppressFocusReturn) {
      this.suppressFocusReturn = false;
      this.focusReturnElement = null;
      return;
    }
    const target = this.focusReturnElement;
    this.focusReturnElement = null;
    if (target?.isConnected) {
      target.focus();
    }
  }

  protected override onTriggerSlotChange() {
    this.syncTriggerAria();
  }

  private onItemsSlotChange = () => {
    this.syncMenuItems();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-menu": UikMenu;
  }
}
