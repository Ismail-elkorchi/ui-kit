import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { styles } from "./styles.js";

/**
 * Definition list wrapper for label/value metadata.
 * @attr density (comfortable | compact)
 * @attr layout (auto | columns | stacked)
 * @slot default (dt + dd pairs)
 * @part base
 * @a11y Use dt/dd pairs for correct definition list semantics.
 * @cssprop --uik-component-description-list-term-width
 * @cssprop --uik-component-description-list-row-gap
 * @cssprop --uik-component-description-list-column-gap
 * @cssprop --uik-component-description-list-row-gap-compact
 * @cssprop --uik-component-description-list-column-gap-compact
 * @cssprop --uik-component-description-list-term-font-family
 * @cssprop --uik-component-description-list-term-font-size
 * @cssprop --uik-component-description-list-term-line-height
 * @cssprop --uik-component-description-list-term-font-weight
 * @cssprop --uik-component-description-list-term-color
 * @cssprop --uik-component-description-list-value-font-family
 * @cssprop --uik-component-description-list-value-font-size
 * @cssprop --uik-component-description-list-value-line-height
 * @cssprop --uik-component-description-list-value-font-weight
 * @cssprop --uik-component-description-list-value-color
 */
@customElement("uik-description-list")
export class UikDescriptionList extends LitElement {
  @property({ type: String, reflect: true, useDefault: true })
  accessor density: "comfortable" | "compact" = "comfortable";

  @property({ type: String, reflect: true, useDefault: true })
  accessor layout: "auto" | "columns" | "stacked" = "auto";

  private resizeObserver: ResizeObserver | null = null;

  static override readonly styles = styles;

  override connectedCallback() {
    super.connectedCallback();
    this.resizeObserver ??= new ResizeObserver(() => {
      this.updateAutoLayout();
    });
    this.resizeObserver.observe(this);
  }

  override disconnectedCallback() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    super.disconnectedCallback();
  }

  override firstUpdated() {
    this.updateAutoLayout();
  }

  override updated(changed: Map<PropertyKey, unknown>) {
    if (changed.has("layout") || changed.has("density")) {
      this.updateAutoLayout();
    }
  }

  override render() {
    return html`
      <dl part="base" class="list">
        <div class="group">
          <slot></slot>
        </div>
      </dl>
    `;
  }

  private updateAutoLayout() {
    if (this.layout !== "auto") {
      this.toggleAttribute("data-uik-layout-stacked", false);
      return;
    }

    const width = this.getBoundingClientRect().width;
    if (width === 0) {
      return;
    }

    const styles = getComputedStyle(this);
    const termWidth = this.readPx(
      styles.getPropertyValue("--uik-component-description-list-term-width"),
    );
    const columnGap = this.readPx(
      styles.getPropertyValue(
        this.density === "compact"
          ? "--uik-component-description-list-column-gap-compact"
          : "--uik-component-description-list-column-gap",
      ),
    );
    const threshold = termWidth + columnGap;
    if (threshold <= 0) {
      this.toggleAttribute("data-uik-layout-stacked", false);
      return;
    }

    this.toggleAttribute("data-uik-layout-stacked", width <= threshold);
  }

  private readPx(value: string) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-description-list": UikDescriptionList;
  }
}
