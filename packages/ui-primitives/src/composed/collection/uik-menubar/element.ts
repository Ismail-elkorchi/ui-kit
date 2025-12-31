import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { styles } from "./styles";
import type { UikMenu } from "../uik-menu";
import "../uik-menu";

/**
 * Menubar wrapper for uik-menu triggers.
 * @attr aria-label
 * @attr aria-labelledby
 * @slot default (uik-menu children)
 * @part base
 * @a11y Roving focus across triggers with ArrowLeft/Right, Home/End; ArrowDown opens.
 * @cssprop --uik-component-menubar-* (bg, fg, border, radius, padding, gap)
 */
@customElement("uik-menubar")
export class UikMenubar extends LitElement {
  @property({ attribute: "aria-label" }) accessor ariaLabelValue = "";
  @property({ attribute: "aria-labelledby" }) accessor ariaLabelledbyValue = "";

  @state() private accessor focusedIndex = 0;
  @state() private accessor openIndex: number | null = null;

  static override readonly styles = styles;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("keydown", this.onKeyDown);
    this.addEventListener("focusin", this.onFocusIn);
    this.addEventListener("menu-open", this.onMenuOpen as EventListener);
    this.addEventListener("menu-close", this.onMenuClose as EventListener);
  }

  override disconnectedCallback() {
    this.removeEventListener("keydown", this.onKeyDown);
    this.removeEventListener("focusin", this.onFocusIn);
    this.removeEventListener("menu-open", this.onMenuOpen as EventListener);
    this.removeEventListener("menu-close", this.onMenuClose as EventListener);
    super.disconnectedCallback();
  }

  override firstUpdated() {
    this.syncTriggers();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has("focusedIndex")) {
      this.syncTriggers();
    }
  }

  private getMenus(): UikMenu[] {
    return Array.from(this.querySelectorAll<UikMenu>("uik-menu"));
  }

  private getMenuIndex(menu: UikMenu) {
    return this.getMenus().indexOf(menu);
  }

  private resolveMenuFromEvent(event: Event): UikMenu | null {
    const path = event.composedPath();
    for (const node of path) {
      if (node instanceof HTMLElement && node.tagName === "UIK-MENU") {
        return node as UikMenu;
      }
    }
    return null;
  }

  private resolveMenuItemEvent(event: Event) {
    return event
      .composedPath()
      .some(
        (node) =>
          node instanceof HTMLElement && node.tagName === "UIK-MENU-ITEM",
      );
  }

  private isTriggerDisabled(trigger: HTMLElement | null): boolean {
    if (!trigger) return true;
    const disabled = (trigger as HTMLButtonElement).disabled;
    if (disabled) return true;
    return trigger.getAttribute("aria-disabled") === "true";
  }

  private getEnabledIndices(menus: UikMenu[]) {
    const indices: number[] = [];
    menus.forEach((menu, index) => {
      if (!this.isTriggerDisabled(menu.getTriggerElement())) {
        indices.push(index);
      }
    });
    return indices;
  }

  private getNextEnabledIndex(
    indices: number[],
    startIndex: number,
    delta: number,
  ) {
    if (indices.length === 0) return -1;
    const currentPosition = Math.max(0, indices.indexOf(startIndex));
    const nextPosition =
      (currentPosition + delta + indices.length) % indices.length;
    const fallback = indices[0];
    if (fallback === undefined) return -1;
    return indices[nextPosition] ?? fallback;
  }

  private focusTriggerAtIndex(index: number) {
    const menus = this.getMenus();
    const menu = menus[index];
    if (!menu) return;
    this.focusedIndex = index;
    menu.focusTrigger();
  }

  private openMenuAtIndex(index: number, focus: "first" | "last" = "first") {
    const menus = this.getMenus();
    const menu = menus[index];
    if (!menu) return;
    if (this.isTriggerDisabled(menu.getTriggerElement())) return;

    const currentOpenIndex =
      this.openIndex ?? menus.findIndex((entry) => entry.open);
    if (currentOpenIndex !== -1 && currentOpenIndex !== index) {
      const openMenu = menus[currentOpenIndex];
      if (openMenu) {
        openMenu.suppressNextFocusReturn();
        openMenu.hide();
      }
    }

    this.openIndex = index;
    this.focusedIndex = index;
    menu.openWithFocus(focus);
  }

  private syncTriggers() {
    const menus = this.getMenus();
    const enabledIndices = this.getEnabledIndices(menus);
    if (enabledIndices.length === 0) return;

    let nextFocused = this.focusedIndex;
    if (!enabledIndices.includes(nextFocused)) {
      nextFocused = enabledIndices[0] ?? 0;
    }

    menus.forEach((menu, index) => {
      const trigger = menu.getTriggerElement();
      if (!trigger) return;
      const isFocused = index === nextFocused;
      menu.setTriggerTabIndex(isFocused ? 0 : -1);
      if (!trigger.hasAttribute("role")) {
        trigger.setAttribute("role", "menuitem");
      }
    });

    if (nextFocused !== this.focusedIndex) {
      this.focusedIndex = nextFocused;
    }
  }

  private onMenuOpen = (event: CustomEvent) => {
    const menu = this.resolveMenuFromEvent(event);
    if (!menu) return;
    const menus = this.getMenus();
    const index = menus.indexOf(menu);
    if (index === -1) return;

    this.openIndex = index;
    this.focusedIndex = index;

    menus.forEach((entry, entryIndex) => {
      if (entryIndex === index) return;
      if (!entry.open) return;
      entry.suppressNextFocusReturn();
      entry.hide();
    });
  };

  private onMenuClose = (event: CustomEvent) => {
    const menu = this.resolveMenuFromEvent(event);
    if (!menu) return;
    const index = this.getMenuIndex(menu);
    if (index === -1) return;
    if (this.openIndex === index) {
      this.openIndex = null;
    }
  };

  private onFocusIn = (event: FocusEvent) => {
    const menu = this.resolveMenuFromEvent(event);
    if (!menu) return;
    const index = this.getMenuIndex(menu);
    if (index !== -1 && index !== this.focusedIndex) {
      this.focusedIndex = index;
    }
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;

    const menus = this.getMenus();
    if (menus.length === 0) return;
    const enabledIndices = this.getEnabledIndices(menus);
    if (enabledIndices.length === 0) return;

    const isFromMenuItem = this.resolveMenuItemEvent(event);
    const resolvedOpenIndex =
      this.openIndex ?? menus.findIndex((entry) => entry.open);
    const hasOpenMenu = resolvedOpenIndex !== -1;

    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      if (isFromMenuItem && ["Home", "End"].includes(event.key)) {
        return;
      }
      event.preventDefault();
      const delta = event.key === "ArrowLeft" ? -1 : 1;
      let nextIndex = this.focusedIndex;
      if (event.key === "Home") {
        nextIndex = enabledIndices[0] ?? 0;
      } else if (event.key === "End") {
        nextIndex = enabledIndices[enabledIndices.length - 1] ?? 0;
      } else {
        nextIndex = this.getNextEnabledIndex(
          enabledIndices,
          this.focusedIndex,
          delta,
        );
      }

      if (hasOpenMenu) {
        this.openMenuAtIndex(nextIndex, "first");
      } else {
        this.focusTriggerAtIndex(nextIndex);
      }
      return;
    }

    if (isFromMenuItem) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.openMenuAtIndex(this.focusedIndex, "first");
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.openMenuAtIndex(this.focusedIndex, "last");
    }
  };

  private onSlotChange = () => {
    this.syncTriggers();
  };

  override render() {
    const ariaLabel = this.ariaLabelValue || undefined;
    const ariaLabelledby = this.ariaLabelledbyValue || undefined;

    return html`
      <div
        part="base"
        class="menubar"
        role="menubar"
        aria-label=${ifDefined(ariaLabel)}
        aria-labelledby=${ifDefined(ariaLabelledby)}
      >
        <slot @slotchange=${this.onSlotChange}></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-menubar": UikMenubar;
  }
}
