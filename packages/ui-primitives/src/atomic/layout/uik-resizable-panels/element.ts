import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";

import { styles } from "./styles";
import { createId } from "../../../internal";

export type UikResizablePanelsResizePhase = "start" | "move" | "end";
export type UikResizablePanelsResizeSource = "pointer" | "keyboard";

export interface UikResizablePanelsResizeDetail {
  startSize: number;
  endSize: number;
  ratio: number;
  source: UikResizablePanelsResizeSource;
  phase: UikResizablePanelsResizePhase;
}

interface LayoutMetrics {
  availableSize: number;
  handleSize: number;
  minStart: number;
  minEnd: number;
  maxStart: number;
  start: number;
  end: number;
  ratio: number;
}

interface DragState {
  pointerId: number;
  startPointer: number;
  startSize: number;
  minStart: number;
  maxStart: number;
  availableSize: number;
  handleSize: number;
  handle: HTMLElement;
}

/**
 * Resizable two-panel layout with a keyboard-accessible separator.
 * @attr orientation (horizontal | vertical)
 * @attr startSize (number, px)
 * @attr minStartSize (number, px)
 * @attr minEndSize (number, px)
 * @attr step (number, px)
 * @attr stepLarge (number, px)
 * @slot start
 * @slot end
 * @part base
 * @part panel-start
 * @part panel-end
 * @part handle
 * @part handle-grip
 * @event resizable-panels-resize (detail: {startSize, endSize, ratio, source, phase})
 * @a11y Handle uses role="separator" with keyboard resizing; defaults aria-label to "Resize panels" unless aria-label/aria-labelledby is set.
 * @cssprop --uik-component-resizable-panels-panel-min-size
 * @cssprop --uik-component-resizable-panels-panel-start-size
 * @cssprop --uik-component-resizable-panels-handle-hit
 * @cssprop --uik-component-resizable-panels-handle-size
 * @cssprop --uik-component-resizable-panels-handle-bg
 * @cssprop --uik-component-resizable-panels-handle-hover-bg
 * @cssprop --uik-component-resizable-panels-handle-active-bg
 * @cssprop --uik-component-resizable-panels-handle-radius
 * @cssprop --uik-component-resizable-panels-step
 * @cssprop --uik-component-resizable-panels-step-lg
 */
@customElement("uik-resizable-panels")
export class UikResizablePanels extends LitElement {
  @property({ type: String, reflect: true }) accessor orientation:
    | "horizontal"
    | "vertical" = "horizontal";
  @property({ type: Number, attribute: "start-size" }) accessor startSize:
    | number
    | null = null;
  @property({ type: Number, attribute: "min-start-size" })
  accessor minStartSize: number | null = null;
  @property({ type: Number, attribute: "min-end-size" }) accessor minEndSize:
    | number
    | null = null;
  @property({ type: Number }) accessor step: number | null = null;
  @property({ type: Number, attribute: "step-large" }) accessor stepLarge:
    | number
    | null = null;
  @property({ attribute: "aria-label" }) accessor ariaLabelValue = "";
  @property({ attribute: "aria-labelledby" }) accessor ariaLabelledbyValue = "";
  @state() private accessor isDragging = false;

  static override readonly styles = styles;

  private readonly startId = createId("uik-resizable-panels-start");
  private readonly endId = createId("uik-resizable-panels-end");
  private dragState: DragState | null = null;
  private dragController: AbortController | null = null;

  private resolveAxisValue(event: PointerEvent) {
    return this.orientation === "vertical" ? event.clientY : event.clientX;
  }

  private parseDimensionValue(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (trimmed === "0") return 0;
    const pxMatch = /^(-?\d+(?:\.\d+)?)px$/i.exec(trimmed);
    const pxValue = pxMatch?.[1];
    if (pxValue !== undefined) return Number.parseFloat(pxValue);
    const remMatch = /^(-?\d+(?:\.\d+)?)rem$/i.exec(trimmed);
    const remValue = remMatch?.[1];
    if (remValue !== undefined) {
      const rootSize = Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize || "16",
      );
      return Number.parseFloat(remValue) * rootSize;
    }
    const numberValue = Number.parseFloat(trimmed);
    if (!Number.isNaN(numberValue) && Number.isFinite(numberValue))
      return numberValue;
    return undefined;
  }

  private resolveVarValue(
    value: string,
    style: CSSStyleDeclaration,
    depth = 0,
  ): string | undefined {
    if (depth > 4) return undefined;
    const match = /^var\(\s*(--[a-z0-9-]+)(?:,[^)]+)?\s*\)$/i.exec(
      value.trim(),
    );
    const tokenName = match?.[1];
    if (!tokenName) return value.trim();
    const next = style.getPropertyValue(tokenName).trim();
    if (!next) return undefined;
    return this.resolveVarValue(next, style, depth + 1);
  }

  private readTokenDimension(name: string) {
    const style = getComputedStyle(this);
    const raw = style.getPropertyValue(name);
    if (!raw) return undefined;
    const resolved = this.resolveVarValue(raw, style);
    if (!resolved) return undefined;
    return this.parseDimensionValue(resolved);
  }

  private resolveMinStartPx() {
    if (
      typeof this.minStartSize === "number" &&
      Number.isFinite(this.minStartSize)
    ) {
      return Math.max(this.minStartSize, 0);
    }
    return (
      this.readTokenDimension(
        "--uik-component-resizable-panels-panel-min-size",
      ) ?? 0
    );
  }

  private resolveMinEndPx() {
    if (
      typeof this.minEndSize === "number" &&
      Number.isFinite(this.minEndSize)
    ) {
      return Math.max(this.minEndSize, 0);
    }
    return (
      this.readTokenDimension(
        "--uik-component-resizable-panels-panel-min-size",
      ) ?? 0
    );
  }

  private resolveStepPx(isLarge: boolean) {
    const value = isLarge ? this.stepLarge : this.step;
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.max(value, 0);
    }
    const tokenName = isLarge
      ? "--uik-component-resizable-panels-step-lg"
      : "--uik-component-resizable-panels-step";
    return this.readTokenDimension(tokenName) ?? 1;
  }

  private resolveStartPx() {
    if (typeof this.startSize === "number" && Number.isFinite(this.startSize)) {
      return Math.max(this.startSize, 0);
    }
    return (
      this.readTokenDimension(
        "--uik-component-resizable-panels-panel-start-size",
      ) ??
      this.readTokenDimension(
        "--uik-component-resizable-panels-panel-min-size",
      ) ??
      0
    );
  }

  private resolveBaseSize() {
    const hostRect = this.getBoundingClientRect();
    const hostSize =
      this.orientation === "vertical" ? hostRect.height : hostRect.width;
    if (hostSize > 0) return hostSize;
    const base = this.shadowRoot?.querySelector<HTMLElement>('[part="base"]');
    if (!base) return undefined;
    const rect = base.getBoundingClientRect();
    const baseSize = this.orientation === "vertical" ? rect.height : rect.width;
    return baseSize > 0 ? baseSize : undefined;
  }

  private resolveHandleSize() {
    const handle =
      this.shadowRoot?.querySelector<HTMLElement>('[part="handle"]');
    const rect = handle?.getBoundingClientRect();
    const size = rect
      ? this.orientation === "vertical"
        ? rect.height
        : rect.width
      : 0;
    if (size > 0) return size;
    return (
      this.readTokenDimension("--uik-component-resizable-panels-handle-hit") ??
      0
    );
  }

  private resolveLayout(startOverride?: number): LayoutMetrics {
    let minStart = this.resolveMinStartPx();
    let minEnd = this.resolveMinEndPx();
    const handleSize = this.resolveHandleSize();
    const baseSize = this.resolveBaseSize();
    const startValue =
      typeof startOverride === "number" ? startOverride : this.resolveStartPx();

    const availableFromBase =
      typeof baseSize === "number" && baseSize > 0
        ? Math.max(baseSize - handleSize, 0)
        : undefined;
    const availableSize =
      availableFromBase ?? Math.max(startValue + minEnd, minStart + minEnd);
    const minTotal = minStart + minEnd;
    if (
      availableFromBase !== undefined &&
      availableSize > 0 &&
      minTotal > availableSize
    ) {
      const scale = availableSize / minTotal;
      minStart *= scale;
      minEnd *= scale;
    }

    const maxStart = Math.max(minStart, availableSize - minEnd);
    const start = Math.min(Math.max(startValue, minStart), maxStart);
    const end = Math.max(availableSize - start, 0);
    const ratio = availableSize > 0 ? start / availableSize : 0;

    return {
      availableSize,
      handleSize,
      minStart,
      minEnd,
      maxStart,
      start,
      end,
      ratio,
    };
  }

  private emitResize(
    phase: UikResizablePanelsResizePhase,
    source: UikResizablePanelsResizeSource,
    startValue?: number,
  ) {
    const layout = this.resolveLayout(startValue);
    const detail: UikResizablePanelsResizeDetail = {
      startSize: layout.start,
      endSize: layout.end,
      ratio: layout.ratio,
      source,
      phase,
    };
    this.dispatchEvent(
      new CustomEvent("resizable-panels-resize", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onHandleKeyDown = (event: KeyboardEvent) => {
    const isHorizontal = this.orientation === "horizontal";
    const step = this.resolveStepPx(event.shiftKey);
    const layout = this.resolveLayout();
    let nextSize: number | null = null;

    switch (event.key) {
      case "ArrowLeft":
        if (isHorizontal) nextSize = layout.start - step;
        break;
      case "ArrowRight":
        if (isHorizontal) nextSize = layout.start + step;
        break;
      case "ArrowUp":
        if (!isHorizontal) nextSize = layout.start - step;
        break;
      case "ArrowDown":
        if (!isHorizontal) nextSize = layout.start + step;
        break;
      case "Home":
        nextSize = layout.minStart;
        break;
      case "End":
        nextSize = layout.maxStart;
        break;
      default:
        return;
    }

    event.preventDefault();
    const clamped = Math.min(
      Math.max(nextSize ?? layout.start, layout.minStart),
      layout.maxStart,
    );
    if (clamped === layout.start) return;
    this.startSize = clamped;
    this.emitResize("move", "keyboard", clamped);
  };

  private onHandlePointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    const handle = event.currentTarget as HTMLElement;
    const layout = this.resolveLayout();
    const pointerValue = this.resolveAxisValue(event);

    this.dragState = {
      pointerId: event.pointerId,
      startPointer: pointerValue,
      startSize: layout.start,
      minStart: layout.minStart,
      maxStart: layout.maxStart,
      availableSize: layout.availableSize,
      handleSize: layout.handleSize,
      handle,
    };

    this.isDragging = true;
    this.emitResize("start", "pointer", layout.start);
    this.startPointerTracking();

    if ("setPointerCapture" in handle) {
      handle.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
  };

  private onHandlePointerMove = (event: PointerEvent) => {
    const state = this.dragState;
    if (!state || event.pointerId !== state.pointerId) return;
    const delta = this.resolveAxisValue(event) - state.startPointer;
    const next = Math.min(
      Math.max(state.startSize + delta, state.minStart),
      state.maxStart,
    );
    if (next !== this.startSize) {
      this.startSize = next;
      this.emitResize("move", "pointer", next);
    }
    event.preventDefault();
  };

  private onHandlePointerUp = (event: PointerEvent) => {
    const state = this.dragState;
    if (!state || event.pointerId !== state.pointerId) return;
    state.handle.releasePointerCapture(event.pointerId);
    this.stopPointerTracking();
    this.dragState = null;
    this.isDragging = false;
    this.emitResize("end", "pointer");
  };

  private onWindowPointerMove = (event: PointerEvent) => {
    if (!this.dragState) return;
    if (event.target === this.dragState.handle) return;
    this.onHandlePointerMove(event);
  };

  private onWindowPointerUp = (event: PointerEvent) => {
    if (!this.dragState) return;
    if (event.target === this.dragState.handle) return;
    this.onHandlePointerUp(event);
  };

  private startPointerTracking() {
    this.dragController?.abort();
    const controller = new AbortController();
    this.dragController = controller;
    const options = { signal: controller.signal };
    window.addEventListener("pointermove", this.onWindowPointerMove, options);
    window.addEventListener("pointerup", this.onWindowPointerUp, options);
    window.addEventListener("pointercancel", this.onWindowPointerUp, options);
  }

  private stopPointerTracking() {
    this.dragController?.abort();
    this.dragController = null;
  }

  override disconnectedCallback() {
    this.stopPointerTracking();
    super.disconnectedCallback();
  }

  override render() {
    const layout = this.resolveLayout();
    const ariaLabel = this.ariaLabelValue.trim() || undefined;
    const ariaLabelledby = this.ariaLabelledbyValue.trim() || undefined;
    const resolvedLabel =
      ariaLabel ?? (ariaLabelledby ? undefined : "Resize panels");
    const clampPercent = (value: number) =>
      Math.min(Math.max(Math.round(value), 0), 100);
    const ariaNow =
      layout.availableSize > 0 ? clampPercent(layout.ratio * 100) : 0;
    const minPercent =
      layout.availableSize > 0
        ? clampPercent((layout.minStart / layout.availableSize) * 100)
        : 0;
    const maxPercent =
      layout.availableSize > 0
        ? clampPercent((layout.maxStart / layout.availableSize) * 100)
        : 100;

    const baseClasses = this.isDragging ? "base dragging" : "base";

    const baseStyles = {
      "--uik-resizable-panels-min-start": `${String(layout.minStart)}px`,
      "--uik-resizable-panels-min-end": `${String(layout.minEnd)}px`,
      "--uik-resizable-panels-start-size": `${String(layout.start)}px`,
    };

    return html`
      <div part="base" class=${baseClasses} style=${styleMap(baseStyles)}>
        <div part="panel-start" class="panel panel-start" id=${this.startId}>
          <slot name="start"></slot>
        </div>
        <div
          part="handle"
          class="handle"
          role="separator"
          tabindex="0"
          aria-orientation=${this.orientation}
          aria-controls="${this.startId} ${this.endId}"
          aria-valuemin=${String(minPercent)}
          aria-valuemax=${String(maxPercent)}
          aria-valuenow=${String(ariaNow)}
          aria-label=${ifDefined(resolvedLabel)}
          aria-labelledby=${ifDefined(ariaLabelledby)}
          @keydown=${this.onHandleKeyDown}
          @pointerdown=${this.onHandlePointerDown}
          @pointermove=${this.onHandlePointerMove}
          @pointerup=${this.onHandlePointerUp}
          @pointercancel=${this.onHandlePointerUp}
        >
          <div part="handle-grip" class="handle-grip"></div>
        </div>
        <div part="panel-end" class="panel panel-end" id=${this.endId}>
          <slot name="end"></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-resizable-panels": UikResizablePanels;
  }
}
