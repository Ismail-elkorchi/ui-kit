import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

import {
  ensureLightDomRoot,
  LightDomSlotController,
} from "../internal/light-dom-slot-controller.js";

/**
 * Shell region layout container with named slots.
 * @attr isSecondarySidebarVisible (boolean)
 * @slot activity-bar
 * @slot primary-sidebar
 * @slot main-content
 * @slot secondary-sidebar
 * @slot status-bar
 * @part layout
 * @part row
 * @part activity-bar
 * @part primary-sidebar
 * @part main-content
 * @part secondary-sidebar
 * @part status-bar
 * @a11y Use semantic elements inside slots for landmarks.
 * @cssprop --uik-component-shell-divider-color
 * @cssprop --uik-component-shell-scrollbar-*
 */
@customElement("uik-shell-layout")
export class UikShellLayout extends LitElement {
  @property({ type: Boolean }) accessor isSecondarySidebarVisible = false;
  private slotController?: LightDomSlotController;

  override connectedCallback() {
    super.connectedCallback();
    if (!this.style.display) this.style.display = "block";
    if (!this.style.boxSizing) this.style.boxSizing = "border-box";
    if (!this.style.height) this.style.height = "100%";
    if (!this.style.width) this.style.width = "100%";
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
    );
    this.slotController.connect();
  }

  override disconnectedCallback() {
    this.slotController?.disconnect();
    super.disconnectedCallback();
  }

  override firstUpdated() {
    this.slotController?.sync();
  }

  override createRenderRoot() {
    return ensureLightDomRoot(this);
  }

  override render() {
    const ariaLabelledby = this.getAttribute("aria-labelledby");
    const ariaLabel = this.getAttribute("aria-label");
    const hasLabelledby = Boolean(ariaLabelledby);
    const hasLabel =
      typeof ariaLabel === "string" && ariaLabel.trim().length > 0;
    const resolvedLabel = hasLabel
      ? ariaLabel
      : hasLabelledby
        ? null
        : "Shell layout";

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
    const fixedRegionStyles = {
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
    const secondaryStyles = {
      ...fixedRegionStyles,
      display: this.isSecondarySidebarVisible ? "block" : "none",
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
        role="region"
        aria-label=${resolvedLabel ?? nothing}
        aria-labelledby=${ariaLabelledby ?? nothing}
      >
        <div part="row" style=${styleMap(rowStyles)}>
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
          <div
            part="main-content"
            style=${styleMap(mainStyles)}
            data-region="main-content"
            role="presentation"
          >
            <div
              data-shell-slot="main-content"
              style=${styleMap(mainSlotStyles)}
            ></div>
          </div>
          <div
            part="secondary-sidebar"
            style=${styleMap(secondaryStyles)}
            data-region="secondary-sidebar"
            role="presentation"
          >
            <div
              data-shell-slot="secondary-sidebar"
              style=${styleMap(slotColumnStyles)}
            ></div>
          </div>
        </div>
        <div
          part="status-bar"
          style=${styleMap(statusBarStyles)}
          data-region="status-bar"
          role="presentation"
        >
          <div
            data-shell-slot="status-bar"
            style=${styleMap(statusSlotStyles)}
          ></div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-shell-layout": UikShellLayout;
  }
}
