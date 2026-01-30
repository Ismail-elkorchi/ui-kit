import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

import "@ismail-elkorchi/ui-primitives/uik-badge";

import {
  ensureLightDomRoot,
  LightDomSlotController,
} from "../internal/light-dom-slot-controller.js";

type StatusBarTone = "info" | "success" | "danger" | "muted";

/**
 * Status bar for global status and actions.
 * @attr message
 * @attr tone (info | success | danger | muted)
 * @attr meta
 * @slot context-actions
 * @slot global-controls
 * @slot meta
 * @part status-bar
 * @part status-main
 * @part status-controls
 * @part message
 * @part context-actions
 * @part global-controls
 * @part meta
 * @a11y Use short status text; provide accessible names for actions.
 * @cssprop --uik-component-shell-status-bar-bg
 * @cssprop --uik-component-shell-status-bar-fg
 * @cssprop --uik-component-shell-status-bar-height
 */
@customElement("uik-shell-status-bar")
export class UikShellStatusBar extends LitElement {
  @property({ type: String }) accessor message = "Ready";
  @property({ type: String }) accessor tone: StatusBarTone = "info";
  @property({ type: String }) accessor meta = "";
  @state() private accessor hasMetaSlot = false;
  private pendingMetaSlotState: boolean | null = null;
  private metaSlotUpdateTask: Promise<void> | null = null;
  private slotController?: LightDomSlotController;

  override connectedCallback() {
    super.connectedCallback();
    if (!this.style.display) this.style.display = "block";
    if (!this.style.boxSizing) this.style.boxSizing = "border-box";
    if (!this.style.width) this.style.width = "100%";
    this.slotController ??= new LightDomSlotController(
      this,
      "[data-shell-root]",
      [
        {
          name: "context-actions",
          containerSelector: '[data-shell-slot="context-actions"]',
        },
        {
          name: "global-controls",
          containerSelector: '[data-shell-slot="global-controls"]',
        },
        { name: "meta", containerSelector: '[data-shell-slot="meta"]' },
      ],
      (root) => {
        const metaContainer = root.querySelector('[data-shell-slot="meta"]');
        const hasMeta = !!metaContainer?.querySelector('[slot="meta"]');
        this.updateMetaSlotState(hasMeta);
        if (hasMeta) {
          const fallback = root.querySelector('[data-shell-fallback="meta"]');
          fallback?.remove();
        }
      },
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

  private updateMetaSlotState(nextHasMeta: boolean) {
    if (nextHasMeta === this.hasMetaSlot) return;
    if (!this.hasUpdated || !this.isUpdatePending) {
      this.hasMetaSlot = nextHasMeta;
      return;
    }
    this.pendingMetaSlotState = nextHasMeta;
    if (this.metaSlotUpdateTask) return;
    this.metaSlotUpdateTask = this.updateComplete.then(() => {
      this.metaSlotUpdateTask = null;
      if (this.pendingMetaSlotState === null) return;
      const pending = this.pendingMetaSlotState;
      this.pendingMetaSlotState = null;
      if (pending !== this.hasMetaSlot) this.hasMetaSlot = pending;
    });
  }

  private getToneColor() {
    switch (this.tone) {
      case "info": {
        return "oklch(var(--uik-text-info))";
      }
      case "success": {
        return "oklch(var(--uik-text-success))";
      }
      case "danger": {
        return "oklch(var(--uik-text-danger))";
      }
      case "muted": {
        return "oklch(var(--uik-text-muted))";
      }
      default: {
        const _exhaustive: never = this.tone;
        return _exhaustive;
      }
    }
  }

  override render() {
    const showMetaFallback = !this.hasMetaSlot && this.meta !== "";
    const metaContent = showMetaFallback
      ? html`<uik-badge variant="outline">${this.meta}</uik-badge>`
      : nothing;
    const forcedColors = window.matchMedia("(forced-colors: active)").matches;
    const statusBarFg = forcedColors
      ? "CanvasText"
      : "oklch(var(--uik-component-shell-status-bar-fg))";
    const statusBarBg = forcedColors
      ? "Canvas"
      : "oklch(var(--uik-component-shell-status-bar-bg))";
    const statusBarDivider = forcedColors
      ? "CanvasText"
      : "oklch(var(--uik-component-shell-divider-color))";
    const statusBarStyles = {
      height: "var(--uik-component-shell-status-bar-height)",
      backgroundColor: statusBarBg,
      color: statusBarFg,
      paddingInline: "var(--uik-space-3)",
      borderTop: `var(--uik-border-width-1) solid ${statusBarDivider}`,
      fontSize: "var(--uik-typography-font-size-1)",
      lineHeight: "var(--uik-typography-line-height-2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: "0",
      userSelect: "none",
      boxSizing: "border-box",
    };
    const groupStyles = {
      display: "flex",
      alignItems: "center",
      gap: "var(--uik-space-3)",
    };
    const actionsStyles = {
      display: "flex",
      alignItems: "center",
      gap: "var(--uik-space-2)",
      flexWrap: "wrap",
    };
    const controlsStyles = {
      display: "flex",
      alignItems: "center",
      gap: "var(--uik-space-3)",
      flexWrap: "wrap",
      justifyContent: "flex-end",
    };
    const messageStyles = {
      color: forcedColors ? "CanvasText" : this.getToneColor(),
      fontWeight: "var(--uik-typography-font-weight-medium)",
      display: "flex",
      alignItems: "center",
      gap: "var(--uik-space-2)",
    };
    const metaStyles = {
      display: "flex",
      alignItems: "center",
      gap: "var(--uik-space-2)",
      color: forcedColors ? "CanvasText" : "oklch(var(--uik-text-muted))",
    };

    return html`
      <div
        part="status-bar"
        data-region="status-bar"
        role="status"
        aria-live="polite"
        style=${styleMap(statusBarStyles)}
      >
        <div part="status-main" style=${styleMap(groupStyles)}>
          <span part="message" style=${styleMap(messageStyles)}
            >${this.message}</span
          >
          <span
            part="context-actions"
            style=${styleMap(actionsStyles)}
            data-shell-slot="context-actions"
          ></span>
        </div>
        <div part="status-controls" style=${styleMap(controlsStyles)}>
          <span
            part="global-controls"
            style=${styleMap(actionsStyles)}
            data-shell-slot="global-controls"
          ></span>
          <span
            part="meta"
            style=${styleMap(metaStyles)}
            data-shell-slot="meta"
          >
            ${showMetaFallback
              ? html`<span data-shell-fallback="meta">${metaContent}</span>`
              : nothing}
          </span>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-shell-status-bar": UikShellStatusBar;
  }
}
