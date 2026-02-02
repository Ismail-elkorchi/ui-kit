import { LitElement, html, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";

import { styles } from "./styles.js";
import { buildTreeItems, collectTreeIds } from "../../../internal/index.js";
import type { TreeItem, TreeItemBase } from "../../../internal/index.js";
import "../uik-visually-hidden/index.js";

export type JsonViewerCopyKind = "path" | "value";
export interface JsonViewerCopyDetail {
  kind: JsonViewerCopyKind;
  path: string;
  value: string;
}

type JsonValueType =
  | "array"
  | "boolean"
  | "null"
  | "number"
  | "object"
  | "string"
  | "undefined"
  | "unknown";

interface JsonViewerNode extends TreeItemBase {
  path: string;
  value: unknown;
  valueType: JsonValueType;
  size: number;
  children?: JsonViewerNode[];
}

const isIdentifier = (value: string) => /^[$A-Z_][0-9A-Z_$]*$/i.test(value);

const escapePathKey = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

const buildPath = (parent: string, key: string, isIndex: boolean) => {
  if (parent === "$") {
    return isIndex ? `$[${key}]` : isIdentifier(key) ? `$.${key}` : `$['${escapePathKey(key)}']`;
  }
  if (isIndex) return `${parent}[${key}]`;
  return isIdentifier(key)
    ? `${parent}.${key}`
    : `${parent}['${escapePathKey(key)}']`;
};

const resolveValueType = (value: unknown): JsonValueType => {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  switch (typeof value) {
    case "boolean":
      return "boolean";
    case "number":
      return "number";
    case "string":
      return "string";
    case "undefined":
      return "undefined";
    case "object":
      return "object";
    default:
      return "unknown";
  }
};

const stringifyValue = (value: unknown): string => {
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "symbol") return value.toString();
  if (typeof value === "function") return "[Function]";
  try {
    const json = JSON.stringify(value, null, 2);
    if (json !== undefined) return json;
  } catch {
    // fall through to String
  }
  return String(value);
};

const formatStringDisplay = (value: string) => {
  const normalized = value.replace(/\n/g, "\\n");
  const truncated =
    normalized.length > 120 ? `${normalized.slice(0, 120)}…` : normalized;
  return { display: `"${truncated}"`, full: `"${normalized}"` };
};

const formatValuePreview = (node: JsonViewerNode) => {
  const { value, valueType, size } = node;
  switch (valueType) {
    case "string":
      return formatStringDisplay(String(value ?? ""));
    case "number":
    case "boolean":
      return { display: String(value), full: String(value) };
    case "null":
      return { display: "null", full: "null" };
    case "undefined":
      return { display: "undefined", full: "undefined" };
    case "array":
      return { display: `Array(${size})`, full: `Array(${size})` };
    case "object":
      return { display: `Object(${size})`, full: `Object(${size})` };
    default:
      return { display: String(value), full: String(value) };
  }
};

/**
 * Token-driven JSON viewer for structured data.
 * @attr json (string)
 * @attr expanded-depth (number)
 * @attr aria-label
 * @attr aria-labelledby
 * @prop value (unknown)
 * @part base
 * @part item
 * @part toggle
 * @part key
 * @part value
 * @part type
 * @part actions
 * @part action-button
 * @part error
 * @part status
 * @event json-viewer-copy (detail: {kind, path, value})
 * @a11y Tree role with roving focus. Arrow keys move, Left/Right collapse/expand, Enter/Space toggles.
 * @note Copy shortcuts: Ctrl/Cmd+C copies value, Ctrl/Cmd+Shift+C copies path.
 * @cssprop --uik-component-json-viewer-*
 */
@customElement("uik-json-viewer")
export class UikJsonViewer extends LitElement {
  @property({ attribute: false }) accessor value: unknown = undefined;
  @property({ type: String }) accessor json = "";
  @property({ type: Number, attribute: "expanded-depth" })
  accessor expandedDepth = 2;
  @property({ attribute: "aria-label" }) accessor ariaLabelValue = "";
  @property({ attribute: "aria-labelledby" }) accessor ariaLabelledbyValue = "";

  @state() accessor parseError = "";
  @state() accessor statusMessage = "";
  @state() accessor openIds: string[] = [];
  @state() accessor tree: JsonViewerNode[] = [];

  private focusId = "";
  private visibleItems: TreeItem<JsonViewerNode>[] = [];
  private statusTimeout: number | undefined;

  static override readonly styles = styles;

  override willUpdate(changed: Map<string, unknown>) {
    if (changed.has("value") || changed.has("json") || changed.has("expandedDepth")) {
      const { nodes, error } = this.buildTree();
      this.parseError = error;
      this.tree = nodes;
      this.openIds = this.resolveInitialOpenIds(nodes);
    }

    if (changed.has("tree") || changed.has("openIds")) {
      this.visibleItems = buildTreeItems(this.tree, this.getOpenSet());
      if (!this.visibleItems.some((item) => item.id === this.focusId)) {
        this.focusId = this.visibleItems[0]?.id ?? "";
      }
    }
  }

  private buildTree(): { nodes: JsonViewerNode[]; error: string } {
    const raw = this.json;
    if (raw !== "") {
      const trimmed = raw.trim();
      if (!trimmed) {
        return { nodes: [], error: "Invalid JSON: input is empty." };
      }
      try {
        const parsed = JSON.parse(trimmed);
        return { nodes: [this.buildNode("$", parsed, "$")], error: "" };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { nodes: [], error: `Invalid JSON: ${message}` };
      }
    }

    if (this.value === undefined) return { nodes: [], error: "" };
    return { nodes: [this.buildNode("$", this.value, "$")], error: "" };
  }

  private buildNode(label: string, value: unknown, path: string): JsonViewerNode {
    const valueType = resolveValueType(value);
    let children: JsonViewerNode[] | undefined;
    let size = 0;

    if (valueType === "object" && value && typeof value === "object") {
      const entries = Object.entries(value as Record<string, unknown>);
      size = entries.length;
      if (size > 0) {
        children = entries.map(([key, childValue]) =>
          this.buildNode(key, childValue, buildPath(path, key, false)),
        );
      }
    }

    if (valueType === "array" && Array.isArray(value)) {
      size = value.length;
      if (size > 0) {
        children = value.map((childValue, index) =>
          this.buildNode(String(index), childValue, buildPath(path, String(index), true)),
        );
      }
    }

    return {
      id: path,
      label,
      path,
      value,
      valueType,
      size,
      children,
    };
  }

  private resolveInitialOpenIds(nodes: JsonViewerNode[]): string[] {
    const maxDepth = Math.max(0, Number(this.expandedDepth) || 0);
    if (maxDepth === 0) return [];
    const open = new Set<string>();
    const walk = (entries: JsonViewerNode[], depth: number) => {
      if (depth >= maxDepth) return;
      entries.forEach((entry) => {
        if (entry.children && entry.children.length > 0) {
          open.add(entry.id);
          walk(entry.children, depth + 1);
        }
      });
    };
    walk(nodes, 0);
    const ordered = collectTreeIds(nodes);
    return ordered.filter((id) => open.has(id));
  }

  private getOpenSet(): Set<string> {
    return new Set(this.openIds);
  }

  private resolveOpenIds(nextOpen: Set<string>) {
    const orderedIds = collectTreeIds(this.tree);
    return orderedIds.filter((id) => nextOpen.has(id));
  }

  private toggleOpen(entry: JsonViewerNode, isOpen?: boolean) {
    if (!entry.children || entry.children.length === 0) return;
    const openSet = this.getOpenSet();
    const next = isOpen ?? !openSet.has(entry.id);
    if (next) {
      openSet.add(entry.id);
    } else {
      openSet.delete(entry.id);
    }
    this.openIds = this.resolveOpenIds(openSet);
  }

  private focusItem(id: string) {
    this.focusId = id;
    this.requestUpdate();
    void this.updateComplete.then(() => {
      const element = this.renderRoot.querySelector<HTMLElement>(
        `[data-item-id="${id}"]`,
      );
      element?.focus();
    });
  }

  private onItemFocus = (event: FocusEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const id = target.getAttribute("data-item-id");
    if (!id) return;
    this.focusId = id;
    this.requestUpdate();
  };

  private setStatus(message: string) {
    this.statusMessage = message;
    if (this.statusTimeout) {
      window.clearTimeout(this.statusTimeout);
    }
    this.statusTimeout = window.setTimeout(() => {
      this.statusMessage = "";
    }, 1400);
  }

  private fallbackCopy(value: string): boolean {
    if (!document.execCommand) return false;
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    textarea.style.insetInlineStart = "0";
    textarea.style.insetBlockStart = "0";
    document.body.append(textarea);
    textarea.select();

    const selection = document.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const success = document.execCommand("copy");
    textarea.remove();
    if (range && selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    return success;
  }

  private async copyText(value: string): Promise<boolean> {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return true;
      } catch {
        // fall back to execCommand
      }
    }
    return this.fallbackCopy(value);
  }

  private emitCopy(kind: JsonViewerCopyKind, entry: JsonViewerNode, value: string) {
    const detail: JsonViewerCopyDetail = {
      kind,
      path: entry.path,
      value,
    };
    this.dispatchEvent(
      new CustomEvent("json-viewer-copy", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onCopy = async (kind: JsonViewerCopyKind, entry: JsonViewerNode) => {
    const value = kind === "path" ? entry.path : stringifyValue(entry.value);
    const success = await this.copyText(value);
    this.setStatus(success ? `Copied ${kind}` : "Copy failed");
    this.emitCopy(kind, entry, value);
  };

  private onKeyDown = (event: KeyboardEvent) => {
    const items = this.visibleItems;
    if (items.length === 0) return;
    const currentIndex = items.findIndex((item) => item.id === this.focusId);
    if (currentIndex === -1) return;
    const current = items[currentIndex];
    if (!current) return;

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
      event.preventDefault();
      if (event.shiftKey) {
        this.onCopy("path", current.item);
      } else {
        this.onCopy("value", current.item);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        const next = items[Math.min(items.length - 1, currentIndex + 1)];
        if (next) this.focusItem(next.id);
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        const prev = items[Math.max(0, currentIndex - 1)];
        if (prev) this.focusItem(prev.id);
        break;
      }
      case "ArrowRight": {
        if (current.isBranch) {
          event.preventDefault();
          if (!current.isExpanded) {
            this.toggleOpen(current.item, true);
          } else {
            const next = items[currentIndex + 1];
            if (next && next.parentId === current.id) {
              this.focusItem(next.id);
            }
          }
        }
        break;
      }
      case "ArrowLeft": {
        event.preventDefault();
        if (current.isBranch && current.isExpanded) {
          this.toggleOpen(current.item, false);
        } else if (current.parentId) {
          this.focusItem(current.parentId);
        }
        break;
      }
      case "Enter":
      case " ": {
        if (current.isBranch) {
          event.preventDefault();
          this.toggleOpen(current.item);
        }
        break;
      }
      default:
        break;
    }
  };

  private renderToggleIcon(isOpen: boolean) {
    const path = isOpen ? "M5 9l7 7 7-7" : "M9 5l7 7-7 7";
    return svg`<svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      style=${styleMap({
        width: "var(--uik-component-json-viewer-toggle-size)",
        height: "var(--uik-component-json-viewer-toggle-size)",
      })}>
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="var(--uik-border-width-1)"
        d=${path}></path>
    </svg>`;
  }

  private renderItem(entry: TreeItem<JsonViewerNode>) {
    const { item } = entry;
    const isBranch = entry.isBranch;
    const isOpen = entry.isExpanded;
    const { display, full } = formatValuePreview(item);
    const itemStyles = {
      paddingInlineStart: `calc(var(--uik-component-json-viewer-item-padding-x) + (var(--uik-component-json-viewer-indent) * ${entry.depth}))`,
      paddingInlineEnd: "var(--uik-component-json-viewer-item-padding-x)",
    };

    return html`
      <div
        part="item"
        class="item"
        role="treeitem"
        tabindex=${entry.id === this.focusId ? 0 : -1}
        aria-label=${item.label}
        aria-level=${String(entry.depth + 1)}
        aria-posinset=${String(entry.index + 1)}
        aria-setsize=${String(entry.setSize)}
        aria-expanded=${ifDefined(
          isBranch ? (isOpen ? "true" : "false") : undefined,
        )}
        data-item-id=${item.id}
        data-path=${item.path}
        data-type=${item.valueType}
        style=${styleMap(itemStyles)}
        @click=${() => this.toggleOpen(item)}
        @keydown=${this.onKeyDown}
        @focus=${this.onItemFocus}
      >
        <span part="toggle" class="toggle" aria-hidden="true">
          ${isBranch ? this.renderToggleIcon(isOpen) : null}
        </span>
        <span class="content">
          <span part="key" class="key">${item.label}</span>
          <span class="separator">:</span>
          <span
            part="value"
            class="value"
            data-type=${item.valueType}
            title=${full}
            aria-label=${full}
          >
            ${display}
          </span>
          <span part="type" class="type">${item.valueType}</span>
        </span>
        <span part="actions" class="actions">
          <button
            part="action-button"
            class="action-button"
            type="button"
            tabindex="-1"
            data-action="copy-path"
            aria-label=${`Copy path ${item.path}`}
            @click=${(event: Event) => {
              event.stopPropagation();
              this.onCopy("path", item);
            }}
          >
            Path
          </button>
          <button
            part="action-button"
            class="action-button"
            type="button"
            tabindex="-1"
            data-action="copy-value"
            aria-label=${`Copy value at ${item.path}`}
            @click=${(event: Event) => {
              event.stopPropagation();
              this.onCopy("value", item);
            }}
          >
            Value
          </button>
        </span>
      </div>
    `;
  }

  override render() {
    const ariaLabel = this.ariaLabelValue || undefined;
    const ariaLabelledby = this.ariaLabelledbyValue || undefined;

    if (this.parseError) {
      return html`
        <div part="base" class="wrapper">
          <div part="error" class="error" role="alert">
            ${this.parseError}
          </div>
        </div>
      `;
    }

    if (this.tree.length === 0) {
      return html`
        <div part="base" class="wrapper">
          <div part="error" class="error" role="status">No JSON data.</div>
        </div>
      `;
    }

    return html`
      <div part="base" class="wrapper">
        <uik-visually-hidden part="status" aria-live="polite" role="status">
          ${this.statusMessage}
        </uik-visually-hidden>
        <div
          class="tree"
          role="tree"
          aria-label=${ifDefined(
            ariaLabel || (ariaLabelledby ? undefined : "JSON viewer"),
          )}
          aria-labelledby=${ifDefined(ariaLabelledby)}
        >
          ${this.visibleItems.map((entry) => this.renderItem(entry))}
        </div>
      </div>
    `;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.statusTimeout) {
      window.clearTimeout(this.statusTimeout);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-json-viewer": UikJsonViewer;
  }
}
