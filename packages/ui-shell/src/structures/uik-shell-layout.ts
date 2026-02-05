import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

import {
  ensureLightDomRoot,
  LightDomSlotController,
} from "../internal/light-dom-slot-controller.js";
import { getForcedColors, getReducedMotion } from "../internal/media.js";

/**
 * Shell region layout container with named slots.
 * @attr isSecondarySidebarVisible (boolean)
 * @attr isPrimarySidebarOpen (boolean)
 * @attr activeRouteKey (string)
 * @slot activity-bar
 * @slot primary-sidebar
 * @slot main-content
 * @slot secondary-sidebar
 * @slot status-bar
 * @part layout
 * @part row
 * @part drawer
 * @part scrim
 * @part activity-bar
 * @part primary-sidebar
 * @part main-content
 * @part secondary-sidebar
 * @part status-bar
 * @event primary-sidebar-open
 * @event primary-sidebar-close (detail: {reason})
 * @a11y Provides top-level landmarks (main/complementary/contentinfo); label slotted regions via aria-label/aria-labelledby or heading on the slotted elements.
 * @cssprop --uik-component-shell-divider-color
 * @cssprop --uik-component-shell-scrollbar-*
 * @cssprop --uik-component-shell-collapse-breakpoint
 * @cssprop --uik-component-shell-drawer-scrim-color
 * @cssprop --uik-component-shell-drawer-scrim-opacity
 * @cssprop --uik-component-shell-drawer-scrim-z
 * @cssprop --uik-component-shell-drawer-z
 */
@customElement("uik-shell-layout")
export class UikShellLayout extends LitElement {
  static override styles = css`
    uik-shell-layout > :not([data-shell-root]) {
      display: none;
    }
  `;
  @property({ type: Boolean }) accessor isSecondarySidebarVisible = false;
  @property({ type: Boolean }) accessor isPrimarySidebarOpen = false;
  @property({ type: String, attribute: "active-route-key" })
  accessor activeRouteKey = "";
  @state() private accessor isNarrow = false;
  private slotController?: LightDomSlotController;
  private resizeObserver: ResizeObserver | null = null;
  private resizeFrame: number | null = null;
  private pendingWidth = 0;
  private previousPrimaryFocus: HTMLElement | null = null;
  private pendingCloseReason: OverlayCloseReason | null = null;
  private scrollLockActive = false;
  private previousDocumentOverflow: string | null = null;
  private previousBodyOverflow: string | null = null;
  private scrimElement: HTMLDivElement | null = null;
  private restoreVisibility = false;

  private readonly closeReasons: OverlayCloseReason[] = [
    "escape",
    "outside",
    "programmatic",
    "toggle",
  ];

  override connectedCallback() {
    super.connectedCallback();
    if (!this.style.display) this.style.display = "block";
    if (!this.style.boxSizing) this.style.boxSizing = "border-box";
    if (!this.style.height) this.style.height = "100%";
    if (!this.style.width) this.style.width = "100%";
    if (!this.style.visibility) {
      this.style.visibility = "hidden";
      this.restoreVisibility = true;
    }
    this.slotController ??= new LightDomSlotController(
      this,
      "[data-shell-root]",
      [
        {
          name: "activity-bar",
          containerSelector: '[data-shell-slot="activity-bar"]',
        },
        {
          name: "primary-sidebar",
          containerSelector: '[data-shell-slot="primary-sidebar"]',
        },
        {
          name: "main-content",
          containerSelector: '[data-shell-slot="main-content"]',
        },
        {
          name: "secondary-sidebar",
          containerSelector: '[data-shell-slot="secondary-sidebar"]',
        },
        {
          name: "status-bar",
          containerSelector: '[data-shell-slot="status-bar"]',
        },
      ],
      () => {
        this.syncActiveTargets();
      },
    );
    if (!this.hasUpdated) {
      this.requestUpdate();
      this.performUpdate();
    }
    this.slotController.connect();
    this.resizeObserver ??= new ResizeObserver((entries) => {
      const entry = entries[0];
      const width = entry
        ? entry.contentRect.width
        : this.getBoundingClientRect().width;
      this.queueResizeUpdate(width);
    });
    this.resizeObserver.observe(this);
    this.addEventListener("keydown", this.onKeydown);
  }

  override disconnectedCallback() {
    this.slotController?.disconnect();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (this.resizeFrame !== null) {
      cancelAnimationFrame(this.resizeFrame);
      this.resizeFrame = null;
    }
    this.removeEventListener("keydown", this.onKeydown);
    this.unlockScroll();
    this.removeScrim();
    super.disconnectedCallback();
  }

  override firstUpdated() {
    this.queueResizeUpdate(this.getBoundingClientRect().width);
    if (this.restoreVisibility) {
      this.slotController?.sync();
      requestAnimationFrame(() => {
        this.style.visibility = "";
        this.restoreVisibility = false;
      });
    }
  }

  override createRenderRoot() {
    return ensureLightDomRoot(this);
  }

  private get drawerOpen() {
    return this.isNarrow && this.isPrimarySidebarOpen;
  }

  private updateNarrowState(width: number) {
    if (!Number.isFinite(width) || width <= 0) return;
    const breakpoint = this.resolveCollapseBreakpoint();
    if (!Number.isFinite(breakpoint) || breakpoint <= 0) return;
    const next = width <= breakpoint;
    if (next === this.isNarrow) return;
    if (!next && this.isPrimarySidebarOpen) {
      this.pendingCloseReason ??= "programmatic";
      this.isPrimarySidebarOpen = false;
    }
    if (next) {
      this.closeSecondarySidebar();
    }
    this.isNarrow = next;
  }

  private queueResizeUpdate(width: number) {
    this.pendingWidth = width;
    if (this.resizeFrame !== null) return;
    this.resizeFrame = requestAnimationFrame(() => {
      this.resizeFrame = null;
      this.updateNarrowState(this.pendingWidth);
    });
  }

  private syncActiveTargets() {
    const normalized = this.activeRouteKey.trim();
    const view = normalized
      ? (normalized.split("/")[0]?.split("#")[0] ?? "")
      : "";
    this.querySelectorAll<HTMLElement>(
      '[data-shell-active-target="view"]',
    ).forEach((target) => {
      if ("activeId" in target) {
        (target as { activeId?: string }).activeId = view;
      }
    });
    this.querySelectorAll<HTMLElement>(
      '[data-shell-active-target="route"]',
    ).forEach((target) => {
      if ("currentId" in target) {
        (target as { currentId?: string }).currentId = normalized;
      }
    });
  }

  private resolveCollapseBreakpoint(): number {
    const raw = getComputedStyle(this)
      .getPropertyValue("--uik-component-shell-collapse-breakpoint")
      .trim();
    if (!raw) return 0;
    const rootFont = Number.parseFloat(
      getComputedStyle(document.documentElement).fontSize || "16",
    );
    const numeric = Number.parseFloat(raw);
    if (!Number.isFinite(numeric)) return 0;
    if (raw.endsWith("rem")) return numeric * rootFont;
    if (raw.endsWith("em")) return numeric * rootFont;
    return numeric;
  }

  private captureFocusOrigin() {
    const active = document.activeElement;
    if (active instanceof HTMLElement && !this.contains(active)) {
      this.previousPrimaryFocus = active;
    } else if (active instanceof HTMLElement) {
      this.previousPrimaryFocus = active;
    }
  }

  private restoreFocus() {
    const target = this.previousPrimaryFocus;
    this.previousPrimaryFocus = null;
    if (target?.isConnected) {
      target.focus();
    }
  }

  private lockScroll() {
    if (this.scrollLockActive) return;
    this.scrollLockActive = true;
    const doc = document.documentElement;
    const body = document.body;
    this.previousDocumentOverflow = doc.style.overflow;
    this.previousBodyOverflow = body.style.overflow;
    doc.style.overflow = "hidden";
    body.style.overflow = "hidden";
  }

  private unlockScroll() {
    if (!this.scrollLockActive) return;
    const doc = document.documentElement;
    const body = document.body;
    doc.style.overflow = this.previousDocumentOverflow ?? "";
    body.style.overflow = this.previousBodyOverflow ?? "";
    this.previousDocumentOverflow = null;
    this.previousBodyOverflow = null;
    this.scrollLockActive = false;
  }

  private focusDrawerContent() {
    const drawer = this.querySelector<HTMLElement>("[data-shell-drawer]");
    this.findFirstFocusable(drawer)?.focus();
  }

  private getFocusableSelector() {
    return [
      "button",
      "[href]",
      "input",
      "select",
      "textarea",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",");
  }

  private findFirstFocusable(container: Element | null): HTMLElement | null {
    if (!container) return null;
    return (
      container.querySelector<HTMLElement>(this.getFocusableSelector()) ?? null
    );
  }

  private focusFallback() {
    const mainRegion = this.querySelector<HTMLElement>(
      '[data-region="main-content"]',
    );
    const focusable = this.findFirstFocusable(mainRegion);
    if (focusable) {
      focusable.focus();
      return;
    }
    if (!this.hasAttribute("tabindex")) {
      this.tabIndex = -1;
    }
    this.focus();
  }

  private isActiveWithin(region: string) {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement)) return false;
    const container = this.querySelector<HTMLElement>(
      `[data-region="${region}"]`,
    );
    return !!container?.contains(active);
  }

  private moveFocusFromCollapsedRegions() {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement)) return;
    const inPrimary = this.isActiveWithin("primary-sidebar");
    const inActivity = this.isActiveWithin("activity-bar");
    const inSecondary = this.isActiveWithin("secondary-sidebar");
    const primaryCollapsed =
      this.isNarrow && !this.isPrimarySidebarOpen && (inPrimary || inActivity);
    const secondaryCollapsed = !this.isSecondarySidebarVisible && inSecondary;
    if (primaryCollapsed || secondaryCollapsed) {
      this.focusFallback();
    }
  }

  private closeSecondarySidebar() {
    if (!this.isSecondarySidebarVisible) return;
    this.isSecondarySidebarVisible = false;
    const secondary = this.querySelector<HTMLElement>(
      'uik-shell-secondary-sidebar[slot="secondary-sidebar"]',
    );
    if (!secondary || !("isOpen" in secondary)) return;
    const typedSecondary = secondary as {
      isOpen?: boolean;
      focusReturnTarget?: string | HTMLElement | null;
    };
    const wasOpen = Boolean(typedSecondary.isOpen);
    typedSecondary.isOpen = false;
    if (!wasOpen) return;
    const target = this.resolveSecondaryReturnTarget(typedSecondary);
    if (target) {
      target.focus();
    } else {
      this.focusFallback();
    }
  }

  private resolveSecondaryReturnTarget(secondary: {
    focusReturnTarget?: string | HTMLElement | null;
  }): HTMLElement | null {
    const target = secondary.focusReturnTarget;
    if (target instanceof HTMLElement && target.isConnected) return target;
    if (typeof target === "string" && target.trim()) {
      return document.querySelector<HTMLElement>(target) ?? null;
    }
    return null;
  }

  private closePrimarySidebar(reason: OverlayCloseReason) {
    if (!this.isPrimarySidebarOpen) return;
    if (!this.closeReasons.includes(reason)) {
      this.pendingCloseReason = "programmatic";
    } else {
      this.pendingCloseReason = reason;
    }
    this.isPrimarySidebarOpen = false;
  }

  private onKeydown = (event: KeyboardEvent) => {
    if (!this.drawerOpen) return;
    if (event.defaultPrevented) return;
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    this.closePrimarySidebar("escape");
  };

  private onScrimClick = () => {
    this.closePrimarySidebar("outside");
  };

  private applyScrimStyles(target: HTMLElement) {
    const forcedColors = getForcedColors();
    target.style.position = "fixed";
    target.style.inset = "0";
    target.style.backgroundColor = forcedColors
      ? "CanvasText"
      : "oklch(var(--uik-component-shell-drawer-scrim-color))";
    target.style.opacity = forcedColors
      ? "0.25"
      : "var(--uik-component-shell-drawer-scrim-opacity)";
    target.style.zIndex = "var(--uik-component-shell-drawer-scrim-z)";
    target.style.pointerEvents = "auto";
  }

  private ensureScrim() {
    if (this.scrimElement?.isConnected) return;
    const scrim = document.createElement("div");
    scrim.setAttribute("data-shell-scrim", "");
    scrim.setAttribute("part", "scrim");
    this.applyScrimStyles(scrim);
    scrim.addEventListener("click", this.onScrimClick);
    document.body.append(scrim);
    this.scrimElement = scrim;
  }

  private removeScrim() {
    if (!this.scrimElement) return;
    this.scrimElement.removeEventListener("click", this.onScrimClick);
    this.scrimElement.remove();
    this.scrimElement = null;
  }

  override updated(changedProps: Map<string, unknown>) {
    const wasNarrow =
      (changedProps.get("isNarrow") as boolean | undefined) ?? this.isNarrow;
    const wasPrimaryOpen =
      (changedProps.get("isPrimarySidebarOpen") as boolean | undefined) ??
      this.isPrimarySidebarOpen;
    const wasDrawerOpen = wasNarrow && wasPrimaryOpen;
    const nowDrawerOpen = this.drawerOpen;

    if (changedProps.has("activeRouteKey")) {
      this.syncActiveTargets();
    }

    if (changedProps.has("isNarrow")) {
      this.toggleAttribute("data-shell-narrow", this.isNarrow);
      if (this.isNarrow) {
        this.moveFocusFromCollapsedRegions();
      }
    }

    if (wasDrawerOpen !== nowDrawerOpen) {
      if (nowDrawerOpen) {
        this.captureFocusOrigin();
        this.lockScroll();
        this.ensureScrim();
        requestAnimationFrame(() => this.focusDrawerContent());
        this.dispatchEvent(
          new CustomEvent("primary-sidebar-open", {
            bubbles: true,
            composed: true,
          }),
        );
      } else {
        this.unlockScroll();
        this.removeScrim();
        this.restoreFocus();
        const reason = this.pendingCloseReason ?? "toggle";
        this.pendingCloseReason = null;
        this.dispatchEvent(
          new CustomEvent("primary-sidebar-close", {
            detail: { reason },
            bubbles: true,
            composed: true,
          }),
        );
      }
    }
  }

  override render() {
    const resolveSlotLabel = (
      slotName: string,
      fallback: string,
    ): { label: string | null; labelledby: string | null } => {
      const element = this.querySelector<HTMLElement>(`[slot="${slotName}"]`);
      if (element) {
        const ariaLabel = element.getAttribute("aria-label");
        if (ariaLabel && ariaLabel.trim()) {
          return { label: ariaLabel, labelledby: null };
        }
        const ariaLabelledby = element.getAttribute("aria-labelledby");
        if (ariaLabelledby && ariaLabelledby.trim()) {
          return { label: null, labelledby: ariaLabelledby };
        }
        const heading = element.getAttribute("heading");
        if (heading && heading.trim()) {
          return { label: heading, labelledby: null };
        }
      }
      return { label: fallback, labelledby: null };
    };
    const primaryLabel = resolveSlotLabel("primary-sidebar", "Sidebar");
    const activityLabel = resolveSlotLabel("activity-bar", "Activity bar");
    const drawerLabel =
      primaryLabel.label || primaryLabel.labelledby
        ? primaryLabel
        : activityLabel;
    const secondaryLabel = resolveSlotLabel(
      "secondary-sidebar",
      "Secondary sidebar",
    );

    const layoutStyles = {
      backgroundColor: "oklch(var(--uik-surface-bg))",
      color: "oklch(var(--uik-text-default))",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
      boxSizing: "border-box",
    };
    const rowStyles = {
      display: "flex",
      flex: "1 1 auto",
      minHeight: "var(--uik-space-0)",
      overflow: "hidden",
    };
    const fixedRegionStyles = { flexShrink: "0" };
    const drawerWidth =
      "min(100vw, calc(var(--uik-component-shell-activity-bar-width) + var(--uik-component-shell-sidebar-width)))";
    const isReducedMotion =
      document.documentElement.getAttribute("data-uik-motion") === "reduced" ||
      getReducedMotion();
    const drawerStyles = this.isNarrow
      ? {
          position: "fixed",
          insetBlock: "0",
          insetInlineStart: "0",
          width: drawerWidth,
          maxWidth: "100vw",
          display: "flex",
          flexDirection: "row",
          height: "100%",
          transform: this.drawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: isReducedMotion
            ? "none"
            : "transform var(--uik-motion-transition-transform)",
          zIndex: "var(--uik-component-shell-drawer-z)",
          pointerEvents: this.drawerOpen ? "auto" : "none",
        }
      : {
          display: "flex",
          flexDirection: "row",
          height: "100%",
          flexShrink: "0",
        };
    const mainStyles = {
      display: "flex",
      flex: "1 1 auto",
      flexDirection: "column",
      minWidth: "var(--uik-space-0)",
      minHeight: "var(--uik-space-0)",
    };
    const statusBarStyles = {
      flexShrink: "0",
    };
    const secondaryHidden = !this.isSecondarySidebarVisible;
    const secondaryStyles = {
      ...fixedRegionStyles,
      display: secondaryHidden ? "none" : "block",
    };
    const slotColumnStyles = {
      height: "100%",
      minHeight: "var(--uik-space-0)",
    };
    const mainSlotStyles = {
      display: "flex",
      flex: "1 1 auto",
      flexDirection: "column",
      minWidth: "var(--uik-space-0)",
      minHeight: "var(--uik-space-0)",
      height: "100%",
    };
    const statusSlotStyles = {
      width: "100%",
    };
    return html`
      <div
        part="layout"
        style=${styleMap(layoutStyles)}
        data-layout-layer="shell"
      >
        <div part="row" style=${styleMap(rowStyles)}>
          <aside
            part="drawer"
            style=${styleMap(drawerStyles)}
            data-shell-drawer
            aria-label=${drawerLabel.label ?? nothing}
            aria-labelledby=${drawerLabel.labelledby ?? nothing}
            aria-hidden=${this.isNarrow && !this.drawerOpen ? "true" : nothing}
            ?inert=${this.isNarrow && !this.drawerOpen}
          >
            <div
              part="activity-bar"
              style=${styleMap(fixedRegionStyles)}
              data-region="activity-bar"
              role="presentation"
            >
              <div
                data-shell-slot="activity-bar"
                style=${styleMap(slotColumnStyles)}
              ></div>
            </div>
            <div
              part="primary-sidebar"
              style=${styleMap(fixedRegionStyles)}
              data-region="primary-sidebar"
              role="presentation"
            >
              <div
                data-shell-slot="primary-sidebar"
                style=${styleMap(slotColumnStyles)}
              ></div>
            </div>
          </aside>
          <main
            part="main-content"
            style=${styleMap(mainStyles)}
            data-region="main-content"
          >
            <div
              data-shell-slot="main-content"
              style=${styleMap(mainSlotStyles)}
            ></div>
          </main>
          <aside
            part="secondary-sidebar"
            style=${styleMap(secondaryStyles)}
            data-region="secondary-sidebar"
            aria-label=${secondaryLabel.label ?? nothing}
            aria-labelledby=${secondaryLabel.labelledby ?? nothing}
            aria-hidden=${secondaryHidden ? "true" : nothing}
            ?inert=${secondaryHidden}
          >
            <div
              data-shell-slot="secondary-sidebar"
              style=${styleMap(slotColumnStyles)}
            ></div>
          </aside>
        </div>
        <footer
          part="status-bar"
          style=${styleMap(statusBarStyles)}
          data-region="status-bar"
        >
          <div
            data-shell-slot="status-bar"
            style=${styleMap(statusSlotStyles)}
          ></div>
        </footer>
      </div>
    `;
  }
}

type OverlayCloseReason = "escape" | "outside" | "programmatic" | "toggle";

declare global {
  interface HTMLElementTagNameMap {
    "uik-shell-layout": UikShellLayout;
  }
}
