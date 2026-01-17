import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { styles } from "./styles.js";

export interface UikPaginationChangeDetail {
  page: number;
}

type PageItem = number | "ellipsis-start" | "ellipsis-end";

/**
 * Pagination control with previous/next and page buttons.
 * @attr page
 * @attr page-count
 * @attr total
 * @attr max-buttons
 * @slot summary
 * @part base
 * @part list
 * @part item
 * @part button
 * @part summary
 * @part ellipsis
 * @event pagination-change (detail: {page})
 * @a11y Buttons are native and expose aria-current on the active page.
 * @cssprop --uik-component-pagination-gap
 * @cssprop --uik-component-pagination-font-family
 * @cssprop --uik-component-pagination-summary-font-size
 * @cssprop --uik-component-pagination-summary-font-weight
 * @cssprop --uik-component-pagination-summary-color
 * @cssprop --uik-component-pagination-ellipsis-color
 * @cssprop --uik-component-pagination-button-bg
 * @cssprop --uik-component-pagination-button-bg-hover
 * @cssprop --uik-component-pagination-button-bg-active
 * @cssprop --uik-component-pagination-button-fg
 * @cssprop --uik-component-pagination-button-border
 * @cssprop --uik-component-pagination-button-border-width
 * @cssprop --uik-component-pagination-button-radius
 * @cssprop --uik-component-pagination-button-padding-x
 * @cssprop --uik-component-pagination-button-padding-y
 * @cssprop --uik-component-pagination-button-font-size
 * @cssprop --uik-component-pagination-button-font-weight
 * @cssprop --uik-component-pagination-button-line-height
 * @cssprop --uik-component-pagination-button-min-width
 * @cssprop --uik-component-pagination-button-height
 * @cssprop --uik-component-pagination-button-current-bg
 * @cssprop --uik-component-pagination-button-current-fg
 * @cssprop --uik-component-pagination-button-current-border
 * @cssprop --uik-component-pagination-button-disabled-opacity
 * @cssprop --uik-component-pagination-button-focus-offset
 * @cssprop --uik-component-pagination-button-focus-width
 */
@customElement("uik-pagination")
export class UikPagination extends LitElement {
  @property({ type: Number }) accessor page = 1;
  @property({ type: Number, attribute: "page-count" })
  accessor pageCount = 1;
  @property({ type: Number }) accessor total = 0;
  @property({ type: Number, attribute: "max-buttons" })
  accessor maxButtons = 7;
  @property({ attribute: "aria-label" }) accessor ariaLabelValue = "";
  @property({ attribute: "aria-labelledby" }) accessor ariaLabelledbyValue = "";

  static override readonly styles = styles;

  override updated(changed: Map<string, unknown>) {
    if (changed.has("page") || changed.has("pageCount")) {
      const clamped = this.clampPage(this.page);
      if (clamped !== this.page) {
        this.page = clamped;
      }
    }
  }

  private clampPage(value: number): number {
    const count = this.safePageCount();
    if (Number.isNaN(value) || value < 1) return 1;
    return Math.min(value, count);
  }

  private safePageCount(): number {
    if (!Number.isFinite(this.pageCount) || this.pageCount < 1) return 1;
    return Math.floor(this.pageCount);
  }

  private buildItems(): PageItem[] {
    const count = this.safePageCount();
    const current = this.clampPage(this.page);
    const maxButtons = Math.max(5, Math.floor(this.maxButtons));

    if (count <= maxButtons) {
      return Array.from({ length: count }, (_, i) => i + 1);
    }

    const windowSize = maxButtons - 2;
    let start = Math.max(2, current - Math.floor(windowSize / 2));
    let end = start + windowSize - 1;

    if (end >= count) {
      end = count - 1;
      start = end - windowSize + 1;
    }

    const items: PageItem[] = [1];
    if (start > 2) items.push("ellipsis-start");
    for (let page = start; page <= end; page += 1) {
      items.push(page);
    }
    if (end < count - 1) items.push("ellipsis-end");
    items.push(count);
    return items;
  }

  private emitChange(nextPage: number) {
    const clamped = this.clampPage(nextPage);
    if (clamped === this.page) return;
    this.page = clamped;
    const detail: UikPaginationChangeDetail = { page: clamped };
    this.dispatchEvent(
      new CustomEvent("pagination-change", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private renderPageButton(page: number, current: number) {
    const isCurrent = page === current;
    const pageLabel = String(page);
    return html`
      <li part="item" class="item">
        <button
          part="button"
          class="button"
          type="button"
          aria-current=${ifDefined(isCurrent ? "page" : undefined)}
          aria-label=${`Page ${pageLabel}`}
          @click=${() => this.emitChange(page)}
        >
          ${page}
        </button>
      </li>
    `;
  }

  override render() {
    const current = this.clampPage(this.page);
    const count = this.safePageCount();
    const currentLabel = String(current);
    const countLabel = String(count);
    const totalLabel = String(this.total);
    const summary =
      this.total > 0
        ? `Page ${currentLabel} of ${countLabel} (${totalLabel} total)`
        : `Page ${currentLabel} of ${countLabel}`;

    return html`
      <nav
        part="base"
        class="pagination"
        aria-label=${ifDefined(
          this.ariaLabelValue ||
            (this.ariaLabelledbyValue ? undefined : "Pagination"),
        )}
        aria-labelledby=${ifDefined(this.ariaLabelledbyValue || undefined)}
      >
        <button
          part="button"
          class="button previous"
          type="button"
          ?disabled=${current <= 1}
          aria-label="Previous page"
          @click=${() => this.emitChange(current - 1)}
        >
          Prev
        </button>
        <ol part="list" class="list">
          ${this.buildItems().map((item) =>
            typeof item === "number"
              ? this.renderPageButton(item, current)
              : html`
                  <li part="ellipsis" class="ellipsis" aria-hidden="true">
                    ...
                  </li>
                `,
          )}
        </ol>
        <button
          part="button"
          class="button next"
          type="button"
          ?disabled=${current >= count}
          aria-label="Next page"
          @click=${() => this.emitChange(current + 1)}
        >
          Next
        </button>
        <span part="summary" class="summary">
          <slot name="summary">${summary}</slot>
        </span>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-pagination": UikPagination;
  }
}
