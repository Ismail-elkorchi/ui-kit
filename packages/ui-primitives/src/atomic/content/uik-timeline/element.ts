import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { styles } from "./styles.js";

export interface UikTimelineItem {
  id?: string;
  title: string;
  description?: string;
  meta?: string;
  status?: string;
}

const readString = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const normalizeItem = (value: unknown, index: number): UikTimelineItem => {
  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    const title = readString(record["title"], `Item ${index + 1}`);
    const item: UikTimelineItem = {
      id: readString(record["id"], `item-${index + 1}`),
      title,
    };
    const description = readString(record["description"]).trim();
    if (description) item.description = description;
    const meta = readString(record["meta"]).trim();
    if (meta) item.meta = meta;
    const status = readString(record["status"]).trim();
    if (status) item.status = status;
    return item;
  }

  return {
    id: `item-${index + 1}`,
    title: readString(value, `Item ${index + 1}`),
  };
};

const normalizeItems = (values: unknown[]): UikTimelineItem[] =>
  values.map((value, index) => normalizeItem(value, index));

/**
 * Token-driven timeline/log list for run history and activity feeds.
 * @attr json-items (string)
 * @attr density (comfortable | compact)
 * @attr aria-label
 * @attr aria-labelledby
 * @attr aria-describedby
 * @prop items (UikTimelineItem[])
 * @part base
 * @part item
 * @part marker
 * @part content
 * @part title
 * @part meta
 * @part description
 * @part status
 * @part error
 * @a11y Static ordered list semantics. Place interactive controls inside items.
 * @note json-items expects a JSON array of {title, description?, meta?, status?}.
 * @cssprop --uik-component-separator-color
 * @cssprop --uik-component-separator-thickness
 */
@customElement("uik-timeline")
export class UikTimeline extends LitElement {
  @property({ attribute: false }) accessor items: UikTimelineItem[] = [];
  @property({ type: String, attribute: "json-items" }) accessor jsonItems = "";
  @property({ type: String, reflect: true, useDefault: true })
  accessor density: "comfortable" | "compact" = "comfortable";
  @property({ attribute: "aria-label" }) accessor ariaLabelValue = "";
  @property({ attribute: "aria-labelledby" }) accessor ariaLabelledbyValue = "";
  @property({ attribute: "aria-describedby" }) accessor ariaDescribedbyValue =
    "";

  @state() accessor parseError = "";
  @state() accessor resolvedItems: UikTimelineItem[] = [];

  static override readonly styles = styles;

  override willUpdate(changed: Map<string, unknown>) {
    if (changed.has("items") || changed.has("jsonItems")) {
      const { items, error } = this.resolveItems();
      this.resolvedItems = items;
      this.parseError = error;
    }
  }

  override render() {
    if (this.parseError) {
      return html`
        <div part="error" class="error" role="alert">${this.parseError}</div>
      `;
    }

    return html`
      <ol
        part="base"
        class="timeline"
        aria-label=${ifDefined(this.ariaLabelValue || undefined)}
        aria-labelledby=${ifDefined(this.ariaLabelledbyValue || undefined)}
        aria-describedby=${ifDefined(this.ariaDescribedbyValue || undefined)}
      >
        ${this.resolvedItems.map(
          (item) => html`
            <li part="item" class="item">
              <span part="marker" class="marker" aria-hidden="true"></span>
              <div part="content" class="content">
                <div class="header">
                  <span part="title" class="title">${item.title}</span>
                  ${item.meta
                    ? html`<span part="meta" class="meta">${item.meta}</span>`
                    : null}
                </div>
                ${item.description
                  ? html`
                      <span part="description" class="description">
                        ${item.description}
                      </span>
                    `
                  : null}
                ${item.status
                  ? html`
                      <span part="status" class="status">${item.status}</span>
                    `
                  : null}
              </div>
            </li>
          `,
        )}
      </ol>
    `;
  }

  private resolveItems(): { items: UikTimelineItem[]; error: string } {
    const rawJson = this.jsonItems.trim();
    if (rawJson) {
      try {
        const parsed = JSON.parse(rawJson);
        if (!Array.isArray(parsed)) {
          return {
            items: [],
            error: "Invalid timeline items: json-items must be an array.",
          };
        }
        return { items: normalizeItems(parsed), error: "" };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          items: [],
          error: `Invalid timeline items: ${message}`,
        };
      }
    }

    if (!Array.isArray(this.items)) {
      return { items: [], error: "" };
    }

    return { items: normalizeItems(this.items), error: "" };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-timeline": UikTimeline;
  }
}
