import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { styles } from "./styles.js";
import type { UikTabPanel } from "./uik-tab-panel.js";
import type { UikTab } from "./uik-tab.js";
import { createId } from "../../../internal/index.js";
import "./uik-tab.js";
import "./uik-tab-panel.js";

export interface UikTabsSelectDetail {
  id: string;
}

/**
 * Tabs container with roving focus and panels.
 * @attr activeId
 * @attr orientation (horizontal | vertical)
 * @attr activation (auto | manual)
 * @slot tab (uik-tab children)
 * @slot panel (uik-tab-panel children)
 * @part tablist
 * @part panels
 * @event tabs-select (detail: {id})
 * @a11y Arrow keys move focus; Enter/Space activate when activation=manual.
 * @cssprop --uik-component-tabs-* (border, gap, tab, panel)
 */
@customElement("uik-tabs")
export class UikTabs extends LitElement {
  @property({ type: String }) accessor activeId = "";
  @property({ type: String, reflect: true, useDefault: true })
  accessor orientation: "horizontal" | "vertical" = "horizontal";
  @property({ type: String, reflect: true, useDefault: true })
  accessor activation: "auto" | "manual" = "auto";
  @property({ attribute: "aria-label" }) accessor ariaLabelValue = "";
  @property({ attribute: "aria-labelledby" }) accessor ariaLabelledbyValue = "";

  @state() private accessor focusedId = "";
  static override readonly styles = styles;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("click", this.onTabClick);
    this.addEventListener("focusin", this.onTabFocus);
    this.addEventListener("keydown", this.onTabKeydown);
  }

  override disconnectedCallback() {
    this.removeEventListener("click", this.onTabClick);
    this.removeEventListener("focusin", this.onTabFocus);
    this.removeEventListener("keydown", this.onTabKeydown);
    super.disconnectedCallback();
  }

  override firstUpdated() {
    this.syncTabs();
  }

  override updated(changed: Map<string, unknown>) {
    if (
      changed.has("activeId") ||
      changed.has("focusedId") ||
      changed.has("orientation") ||
      changed.has("activation")
    ) {
      this.syncTabs();
    }
  }

  private getTabs(): UikTab[] {
    return Array.from(this.querySelectorAll<UikTab>("uik-tab"));
  }

  private getPanels(): UikTabPanel[] {
    return Array.from(this.querySelectorAll<UikTabPanel>("uik-tab-panel"));
  }

  private resolveTabKey(tab: UikTab): string {
    return tab.value || tab.id;
  }

  private ensureTabId(tab: UikTab) {
    if (!tab.id) tab.id = createId("uik-tab");
  }

  private ensurePanelId(panel: UikTabPanel) {
    if (!panel.id) panel.id = createId("uik-tab-panel");
  }

  private syncTabs() {
    const tabs = this.getTabs();
    const panels = this.getPanels();
    if (tabs.length === 0) return;

    const enabledTabs = tabs.filter((tab) => !tab.disabled);
    const firstEnabled = enabledTabs[0];
    if (!firstEnabled) return;

    let nextActiveId = this.activeId;
    if (!enabledTabs.some((tab) => this.resolveTabKey(tab) === nextActiveId)) {
      nextActiveId = this.resolveTabKey(firstEnabled);
    }

    if (!nextActiveId) {
      nextActiveId = this.resolveTabKey(firstEnabled);
    }

    if (nextActiveId !== this.activeId) {
      this.activeId = nextActiveId;
    }

    if (
      this.activation === "auto" ||
      !this.focusedId ||
      !enabledTabs.some((tab) => this.resolveTabKey(tab) === this.focusedId)
    ) {
      this.focusedId = nextActiveId;
    }

    panels.forEach((panel) => this.ensurePanelId(panel));
    const panelMap = new Map(
      panels.map((panel) => [panel.value || panel.id, panel]),
    );

    tabs.forEach((tab) => {
      this.ensureTabId(tab);
      tab.setAttribute("data-orientation", this.orientation);
      const tabKey = this.resolveTabKey(tab);
      const isActive = tabKey === nextActiveId;
      const isFocused = tabKey === this.focusedId;
      tab.selected = isActive;
      tab.tabIndexValue = isFocused ? 0 : -1;
      const panel = panelMap.get(tabKey) ?? null;
      if (panel) {
        tab.setAttribute("aria-controls", panel.id);
        panel.setAttribute("aria-labelledby", tab.id);
        panel.toggleAttribute("hidden", !isActive);
      }
    });
  }

  private activateTab(tab: UikTab) {
    if (tab.disabled) return;
    const tabKey = this.resolveTabKey(tab);
    if (!tabKey || tabKey === this.activeId) return;
    this.activeId = tabKey;
    const detail: UikTabsSelectDetail = { id: tabKey };
    this.dispatchEvent(
      new CustomEvent("tabs-select", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private focusTab(tab: UikTab) {
    if (tab.disabled) return;
    const tabKey = this.resolveTabKey(tab);
    if (!tabKey) return;
    this.focusedId = tabKey;
    void this.updateComplete.then(() => tab.focus());
  }

  private resolveTabFromEvent(event: Event): UikTab | null {
    const path = event.composedPath();
    for (const node of path) {
      if (node instanceof HTMLElement && node.tagName === "UIK-TAB") {
        return node as UikTab;
      }
    }
    return null;
  }

  private onTabClick = (event: Event) => {
    const tab = this.resolveTabFromEvent(event);
    if (!tab) return;
    this.activateTab(tab);
  };

  private onTabFocus = (event: FocusEvent) => {
    const tab = this.resolveTabFromEvent(event);
    if (!tab || tab.disabled) return;
    this.focusedId = this.resolveTabKey(tab);
    if (this.activation === "auto") {
      this.activateTab(tab);
    }
  };

  private onTabKeydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    const tab = this.resolveTabFromEvent(event);
    if (!tab) return;

    const enabledTabs = this.getTabs().filter((entry) => !entry.disabled);
    if (enabledTabs.length === 0) return;

    const currentIndex = Math.max(
      0,
      enabledTabs.findIndex(
        (entry) => this.resolveTabKey(entry) === this.focusedId,
      ),
    );
    let nextIndex = currentIndex;

    const nextKeys =
      this.orientation === "horizontal" ? ["ArrowRight"] : ["ArrowDown"];
    const prevKeys =
      this.orientation === "horizontal" ? ["ArrowLeft"] : ["ArrowUp"];

    if ([...nextKeys, ...prevKeys, "Home", "End"].includes(event.key)) {
      switch (event.key) {
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = enabledTabs.length - 1;
          break;
        default: {
          const delta = nextKeys.includes(event.key) ? 1 : -1;
          nextIndex =
            (currentIndex + delta + enabledTabs.length) % enabledTabs.length;
          break;
        }
      }

      event.preventDefault();
      const nextTab = enabledTabs[nextIndex];
      if (!nextTab) return;
      this.focusTab(nextTab);
      if (this.activation === "auto") {
        this.activateTab(nextTab);
      }
      return;
    }

    if (
      this.activation === "manual" &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      this.activateTab(tab);
    }
  };

  private onTabsSlotChange = () => {
    this.syncTabs();
  };

  override render() {
    const ariaLabel = this.ariaLabelValue || undefined;
    const ariaLabelledby = this.ariaLabelledbyValue || undefined;

    return html`
      <div
        part="tablist"
        class="tablist"
        role="tablist"
        aria-label=${ifDefined(ariaLabel)}
        aria-labelledby=${ifDefined(ariaLabelledby)}
        aria-orientation=${this.orientation}
      >
        <slot name="tab" @slotchange=${this.onTabsSlotChange}></slot>
      </div>
      <div part="panels" class="panels">
        <slot name="panel" @slotchange=${this.onTabsSlotChange}></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-tabs": UikTabs;
  }
}
