import { LitElement, html, nothing } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

import "@ismail-elkorchi/ui-primitives/uik-button";
import "@ismail-elkorchi/ui-primitives/uik-separator";

import {
  ensureLightDomRoot,
  LightDomSlotController,
} from "../internal/light-dom-slot-controller.js";

type OverlayCloseReason = "escape" | "outside" | "programmatic" | "toggle";

/**
 * Secondary sidebar panel with header and optional footer.
 * @attr isOpen (boolean)
 * @attr heading
 * @attr focusReturnTarget (selector | element)
 * @slot default
 * @slot footer
 * @part secondary-sidebar
 * @part header
 * @part heading
 * @part close-button
 * @part body
 * @part footer
 * @event secondary-sidebar-close (detail: {reason})
 * @a11y Escape closes and returns focus (configured target or last active); close button is labeled; provide meaningful heading.
 * @cssprop --uik-component-shell-secondary-sidebar-bg
 * @cssprop --uik-component-shell-secondary-sidebar-width
 */
@customElement("uik-shell-secondary-sidebar")
export class UikShellSecondarySidebar extends LitElement {
  @property({ type: Boolean }) accessor isOpen = false;
  @property({ type: String }) accessor heading = "";
  @property({ attribute: "focus-return-target" }) accessor focusReturnTarget:
    | string
    | HTMLElement
    | null = null;
  @state() private accessor hasFooter = false;
  private pendingFooterState: boolean | null = null;
  private footerUpdateTask: Promise<void> | null = null;
  private slotController?: LightDomSlotController;
  private previousActiveElement: HTMLElement | null = null;
  private shouldRestoreFocus = false;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("keydown", this.onKeydown);
    if (!this.style.display) this.style.display = "block";
    if (!this.style.boxSizing) this.style.boxSizing = "border-box";
    if (!this.style.height) this.style.height = "100%";
    this.slotController ??= new LightDomSlotController(
      this,
      "[data-shell-root]",
      [
        { name: null, containerSelector: '[data-shell-slot="default"]' },
        { name: "footer", containerSelector: '[data-shell-slot="footer"]' },
      ],
      (root) => {
        const footerContainer = root.querySelector(
          '[data-shell-slot="footer"]',
        );
        const nextHasFooter =
          !!footerContainer?.querySelector('[slot="footer"]');
        this.updateFooterState(nextHasFooter);
      },
    );
    this.slotController.connect();
  }

  override disconnectedCallback() {
    this.removeEventListener("keydown", this.onKeydown);
    this.slotController?.disconnect();
    super.disconnectedCallback();
  }

  override firstUpdated() {
    this.slotController?.sync();
  }

  override willUpdate(changedProps: PropertyValues<this>) {
    const wasOpen = changedProps.get("isOpen");
    if (
      changedProps.has("isOpen") &&
      this.isOpen &&
      (wasOpen === false || wasOpen === undefined)
    ) {
      const active = document.activeElement;
      this.previousActiveElement =
        active instanceof HTMLElement ? active : null;
    }
  }

  override createRenderRoot() {
    return ensureLightDomRoot(this);
  }

  private close = (reason: OverlayCloseReason = "programmatic") => {
    if (!this.isOpen) return;
    this.shouldRestoreFocus = true;
    this.isOpen = false;
    this.dispatchEvent(
      new CustomEvent("secondary-sidebar-close", {
        detail: { reason },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private onKeydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    if (event.key !== "Escape") return;
    event.stopPropagation();
    event.preventDefault();
    this.close("escape");
  };

  private restoreFocus() {
    const target = this.resolveFocusReturnTarget();
    if (target) target.focus();
    this.previousActiveElement = null;
  }

  private resolveFocusReturnTarget(): HTMLElement | null {
    if (
      this.focusReturnTarget instanceof HTMLElement &&
      this.focusReturnTarget.isConnected
    ) {
      return this.focusReturnTarget;
    }
    if (
      typeof this.focusReturnTarget === "string" &&
      this.focusReturnTarget.trim()
    ) {
      const resolved = document.querySelector<HTMLElement>(
        this.focusReturnTarget,
      );
      if (resolved) return resolved;
    }
    if (this.previousActiveElement?.isConnected) {
      return this.previousActiveElement;
    }
    return null;
  }

  override updated(changedProps: PropertyValues<this>) {
    const wasOpen = changedProps.get("isOpen");
    if (
      (changedProps.has("isOpen") && wasOpen === true && !this.isOpen) ||
      this.shouldRestoreFocus
    ) {
      this.restoreFocus();
      this.shouldRestoreFocus = false;
    }
  }

  private updateFooterState(nextHasFooter: boolean) {
    if (nextHasFooter === this.hasFooter) return;
    if (!this.hasUpdated || !this.isUpdatePending) {
      this.hasFooter = nextHasFooter;
      return;
    }
    this.pendingFooterState = nextHasFooter;
    if (this.footerUpdateTask) return;
    this.footerUpdateTask = this.updateComplete.then(() => {
      this.footerUpdateTask = null;
      if (this.pendingFooterState === null) return;
      const pending = this.pendingFooterState;
      this.pendingFooterState = null;
      if (pending !== this.hasFooter) this.hasFooter = pending;
    });
  }

  override render() {
    if (!this.isOpen) return nothing;

    const forcedColors = window.matchMedia("(forced-colors: active)").matches;
    const dividerColor = forcedColors
      ? "CanvasText"
      : "var(--uik-component-shell-divider-color)";
    const sidebarStyles = {
      width: "var(--uik-component-shell-secondary-sidebar-width)",
      backgroundColor: forcedColors
        ? "Canvas"
        : "oklch(var(--uik-component-shell-secondary-sidebar-bg))",
      color: forcedColors ? "CanvasText" : "oklch(var(--uik-text-default))",
      borderLeft: `var(--uik-border-width-1) solid ${dividerColor}`,
      display: "flex",
      flexDirection: "column",
      flexShrink: "0",
      height: "100%",
      boxSizing: "border-box",
    };
    const headerStyles = {
      height: "var(--uik-size-control-md)",
      paddingInline: "var(--uik-space-4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: "0",
      userSelect: "none",
    };
    const headingStyles = {
      fontSize: "var(--uik-typography-font-size-1)",
      fontWeight: "var(--uik-typography-font-weight-bold)",
      letterSpacing: "var(--uik-typography-letter-spacing-wide)",
      lineHeight: "var(--uik-typography-line-height-2)",
      color: forcedColors ? "CanvasText" : "oklch(var(--uik-text-muted))",
      textTransform: "uppercase",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    };
    const bodyContainerStyles = {
      display: "flex",
      flexDirection: "column",
      flex: "1 1 auto",
      minHeight: "var(--uik-space-0)",
    };
    const bodyStyles = {
      padding: "var(--uik-space-4)",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      flex: "1 1 auto",
      minHeight: "var(--uik-space-0)",
      boxSizing: "border-box",
      scrollbarColor: forcedColors
        ? ""
        : "oklch(var(--uik-component-shell-scrollbar-thumb)) oklch(var(--uik-component-shell-scrollbar-track))",
      scrollbarWidth: "thin",
    };
    const footerStyles = {
      padding: "var(--uik-space-3)",
      backgroundColor: forcedColors
        ? "Canvas"
        : "oklch(var(--uik-surface-card))",
    };

    const ariaLabelledby = this.getAttribute("aria-labelledby");
    const ariaLabel = this.getAttribute("aria-label");
    const hasLabelledby = Boolean(ariaLabelledby);
    const hasLabel =
      typeof ariaLabel === "string" && ariaLabel.trim().length > 0;
    const resolvedLabel = hasLabel
      ? ariaLabel
      : hasLabelledby
        ? null
        : this.heading || "Secondary sidebar";

    return html`
      <aside
        part="secondary-sidebar"
        data-region="secondary-sidebar"
        aria-label=${resolvedLabel ?? nothing}
        aria-labelledby=${ariaLabelledby ?? nothing}
        style=${styleMap(sidebarStyles)}
      >
        <div part="header" style=${styleMap(headerStyles)}>
          <span part="heading" style=${styleMap(headingStyles)}
            >${this.heading}</span
          >
          <uik-button
            part="close-button"
            variant="ghost"
            size="icon"
            muted
            aria-label="Close secondary sidebar"
            title="Close secondary sidebar"
            @click=${() => this.close("toggle")}
          >
            <svg
              part="close-icon"
              aria-hidden="true"
              style=${styleMap({
                width: "var(--uik-size-icon-sm)",
                height: "var(--uik-size-icon-sm)",
              })}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="var(--uik-border-width-2)"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </uik-button>
        </div>
        <uik-separator
          orientation="horizontal"
          style=${`--uik-component-separator-color: ${dividerColor};`}
        ></uik-separator>
        <div part="body-container" style=${styleMap(bodyContainerStyles)}>
          <div
            part="body"
            style=${styleMap(bodyStyles)}
            data-shell-slot="default"
          ></div>
        </div>
        <div ?hidden=${!this.hasFooter}>
          <uik-separator
            orientation="horizontal"
            style=${`--uik-component-separator-color: ${dividerColor};`}
          ></uik-separator>
          <div
            part="footer"
            style=${styleMap(footerStyles)}
            data-shell-slot="footer"
          ></div>
        </div>
      </aside>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-shell-secondary-sidebar": UikShellSecondarySidebar;
  }
}
