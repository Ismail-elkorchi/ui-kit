import { LitElement, html, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { styles } from "./styles.js";
// eslint-disable-next-line import/no-internal-modules -- Keep explicit extension for dist import contract checks.
import "../uik-json-viewer/index.js";
// eslint-disable-next-line import/no-internal-modules -- Keep explicit extension for dist import contract checks.
import "../uik-visually-hidden/index.js";

export type JsonDiffCopyKind = "path" | "before" | "after";
export interface JsonDiffCopyDetail {
  kind: JsonDiffCopyKind;
  path: string;
  value: string;
}

export type JsonDiffKind = "add" | "remove" | "replace";

interface JsonDiffChange {
  id: string;
  kind: JsonDiffKind;
  path: string;
  before: unknown;
  after: unknown;
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

const isIdentifier = (value: string) => /^[$A-Z_][0-9A-Z_$]*$/i.test(value);

const escapePathKey = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

const buildPath = (parent: string, key: string, isIndex: boolean) => {
  if (parent === "$") {
    return isIndex
      ? `$[${key}]`
      : isIdentifier(key)
        ? `$.${key}`
        : `$['${escapePathKey(key)}']`;
  }
  if (isIndex) return `${parent}[${key}]`;
  return isIdentifier(key)
    ? `${parent}.${key}`
    : `${parent}['${escapePathKey(key)}']`;
};

const isPlainObject = (value: unknown) =>
  !!value &&
  typeof value === "object" &&
  Object.prototype.toString.call(value) === "[object Object]";

const resolveValueType = (value: unknown): JsonValueType => {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (isPlainObject(value)) return "object";
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
    case "bigint":
    case "symbol":
    case "function":
      return "unknown";
    default:
      return "unknown";
  }
};

const stringifyValue = (value: unknown): string => {
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "symbol") return value.toString();
  if (typeof value === "function") return "[Function]";
  try {
    const json = JSON.stringify(value, null, 2) as unknown;
    if (typeof json === "string") return json;
  } catch {
    // fall through to String
  }
  return String(value);
};

const diffValues = (
  before: unknown,
  after: unknown,
  path: string,
  changes: JsonDiffChange[],
) => {
  if (Object.is(before, after)) return;
  const beforeType = resolveValueType(before);
  const afterType = resolveValueType(after);

  if (beforeType === "array" && afterType === "array") {
    const beforeArray = before as unknown[];
    const afterArray = after as unknown[];
    const max = Math.max(beforeArray.length, afterArray.length);
    for (let index = 0; index < max; index += 1) {
      const nextPath = buildPath(path, String(index), true);
      if (index >= beforeArray.length) {
        const id = `${String(changes.length)}:${nextPath}`;
        changes.push({
          id,
          kind: "add",
          path: nextPath,
          before: undefined,
          after: afterArray[index],
        });
      } else if (index >= afterArray.length) {
        const id = `${String(changes.length)}:${nextPath}`;
        changes.push({
          id,
          kind: "remove",
          path: nextPath,
          before: beforeArray[index],
          after: undefined,
        });
      } else {
        diffValues(beforeArray[index], afterArray[index], nextPath, changes);
      }
    }
    return;
  }

  if (beforeType === "object" && afterType === "object") {
    const beforeObj = before as Record<string, unknown>;
    const afterObj = after as Record<string, unknown>;
    const keys = new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]);
    [...keys]
      .sort((a, b) => a.localeCompare(b))
      .forEach((key) => {
        const nextPath = buildPath(path, key, false);
        if (!(key in beforeObj)) {
          const id = `${String(changes.length)}:${nextPath}`;
          changes.push({
            id,
            kind: "add",
            path: nextPath,
            before: undefined,
            after: afterObj[key],
          });
          return;
        }
        if (!(key in afterObj)) {
          const id = `${String(changes.length)}:${nextPath}`;
          changes.push({
            id,
            kind: "remove",
            path: nextPath,
            before: beforeObj[key],
            after: undefined,
          });
          return;
        }
        diffValues(beforeObj[key], afterObj[key], nextPath, changes);
      });
    return;
  }

  const id = `${String(changes.length)}:${path}`;
  changes.push({
    id,
    kind: "replace",
    path,
    before,
    after,
  });
};

const buildDiff = (before: unknown, after: unknown) => {
  const changes: JsonDiffChange[] = [];
  if (before === undefined && after === undefined) return changes;
  if (before === undefined) {
    const id = `${String(changes.length)}:$`;
    changes.push({
      id,
      kind: "add",
      path: "$",
      before: undefined,
      after,
    });
    return changes;
  }
  if (after === undefined) {
    const id = `${String(changes.length)}:$`;
    changes.push({
      id,
      kind: "remove",
      path: "$",
      before,
      after: undefined,
    });
    return changes;
  }
  diffValues(before, after, "$", changes);
  return changes;
};

/**
 * Token-driven JSON diff preview for apply flows.
 * @attr json-before (string)
 * @attr json-after (string)
 * @attr aria-label
 * @attr aria-labelledby
 * @prop before (unknown)
 * @prop after (unknown)
 * @part base
 * @part header
 * @part summary
 * @part list
 * @part item
 * @part toggle
 * @part kind
 * @part path
 * @part actions
 * @part action-button
 * @part detail
 * @part detail-block
 * @part detail-label
 * @part error
 * @part status
 * @event json-diff-copy (detail: {kind, path, value})
 * @a11y Roving focus list. Arrow keys move, Left/Right collapse/expand, Enter/Space toggles.
 * @cssprop --uik-component-json-diff-*
 */
@customElement("uik-json-diff")
export class UikJsonDiff extends LitElement {
  @property({ attribute: false }) accessor beforeValue: unknown = undefined;
  @property({ attribute: false }) accessor afterValue: unknown = undefined;
  @property({ type: String, attribute: "json-before" }) accessor jsonBefore =
    "";
  @property({ type: String, attribute: "json-after" }) accessor jsonAfter = "";
  @property({ attribute: "aria-label" }) accessor ariaLabelValue = "";
  @property({ attribute: "aria-labelledby" }) accessor ariaLabelledbyValue = "";

  @state() accessor parseError = "";
  @state() accessor statusMessage = "";
  @state() accessor changes: JsonDiffChange[] = [];
  @state() accessor openIds: string[] = [];
  @state() accessor focusIndex = 0;

  private statusTimeout: number | undefined;

  static override readonly styles = styles;

  constructor() {
    super();
    Object.defineProperty(this, "before", {
      configurable: true,
      get: () => this.beforeValue,
      set: (value) => {
        this.beforeValue = value;
      },
    });
    Object.defineProperty(this, "after", {
      configurable: true,
      get: () => this.afterValue,
      set: (value) => {
        this.afterValue = value;
      },
    });
  }

  override willUpdate(changed: Map<string, unknown>) {
    if (
      changed.has("beforeValue") ||
      changed.has("afterValue") ||
      changed.has("jsonBefore") ||
      changed.has("jsonAfter")
    ) {
      const { changes, error } = this.buildChanges();
      this.parseError = error;
      this.changes = changes;
      this.openIds = [];
      this.focusIndex = 0;
    }

    if (changed.has("changes") && this.focusIndex >= this.changes.length) {
      this.focusIndex = this.changes.length > 0 ? 0 : -1;
    }
  }

  private buildChanges(): { changes: JsonDiffChange[]; error: string } {
    const rawBefore = this.jsonBefore.trim();
    const rawAfter = this.jsonAfter.trim();

    if (rawBefore || rawAfter) {
      if (!rawBefore || !rawAfter) {
        return {
          changes: [],
          error:
            "Invalid JSON diff: both json-before and json-after are required.",
        };
      }
      try {
        const parsedBefore: unknown = JSON.parse(rawBefore);
        const parsedAfter: unknown = JSON.parse(rawAfter);
        return { changes: buildDiff(parsedBefore, parsedAfter), error: "" };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          changes: [],
          error: `Invalid JSON diff: ${message}`,
        };
      }
    }

    if (this.beforeValue === undefined && this.afterValue === undefined) {
      return { changes: [], error: "" };
    }

    return {
      changes: buildDiff(this.beforeValue, this.afterValue),
      error: "",
    };
  }

  private getOpenSet(): Set<string> {
    return new Set(this.openIds);
  }

  private toggleOpen(change: JsonDiffChange, isOpen?: boolean) {
    const openSet = this.getOpenSet();
    const next = isOpen ?? !openSet.has(change.id);
    if (next) {
      openSet.add(change.id);
    } else {
      openSet.delete(change.id);
    }
    this.openIds = [...openSet];
  }

  private focusItem(index: number) {
    if (index < 0 || index >= this.changes.length) return;
    this.focusIndex = index;
    this.requestUpdate();
    void this.updateComplete.then(() => {
      const element = this.renderRoot.querySelector<HTMLElement>(
        `[data-index="${String(index)}"]`,
      );
      element?.focus();
    });
  }

  private onItemFocus = (event: FocusEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const indexValue = target.getAttribute("data-index");
    const index = indexValue ? Number(indexValue) : NaN;
    if (Number.isNaN(index)) return;
    this.focusIndex = index;
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
    const execCommand = (document as unknown as { execCommand?: unknown })
      .execCommand;
    if (typeof execCommand !== "function") return false;
    const runCopy = execCommand as (
      this: Document,
      commandId: string,
    ) => boolean;
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
    const success = runCopy.call(document, "copy");
    textarea.remove();
    if (range && selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    return success;
  }

  private async copyText(value: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // fall back to execCommand
    }
    return this.fallbackCopy(value);
  }

  private emitCopy(
    kind: JsonDiffCopyKind,
    change: JsonDiffChange,
    value: string,
  ) {
    const detail: JsonDiffCopyDetail = { kind, path: change.path, value };
    this.dispatchEvent(
      new CustomEvent("json-diff-copy", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onCopy = async (
    kind: JsonDiffCopyKind,
    change: JsonDiffChange,
    value: string,
  ) => {
    const success = await this.copyText(value);
    this.setStatus(success ? `Copied ${kind}` : "Copy failed");
    this.emitCopy(kind, change, value);
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (this.changes.length === 0) return;
    const currentIndex = this.focusIndex;
    const current = this.changes[currentIndex];
    if (!current) return;

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        this.focusItem(Math.min(this.changes.length - 1, currentIndex + 1));
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        this.focusItem(Math.max(0, currentIndex - 1));
        break;
      }
      case "ArrowRight": {
        event.preventDefault();
        this.toggleOpen(current, true);
        break;
      }
      case "ArrowLeft": {
        event.preventDefault();
        this.toggleOpen(current, false);
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        this.toggleOpen(current);
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
      stroke="currentColor">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="var(--uik-border-width-1)"
        d=${path}></path>
    </svg>`;
  }

  private renderValueBlock(label: string, value: unknown, part: string) {
    return html`
      <div part="${part}" class="detail-block" data-side=${part}>
        <span part="detail-label" class="detail-label">${label}</span>
        <uik-json-viewer
          aria-label="${label} JSON"
          .value=${value}
          .expandedDepth=${1}
        ></uik-json-viewer>
      </div>
    `;
  }

  private renderItem(change: JsonDiffChange, index: number) {
    const isOpen = this.openIds.includes(change.id);
    const detailId = `json-diff-detail-${String(index)}`;
    const beforeValue = change.before;
    const afterValue = change.after;
    const hasBefore = typeof beforeValue !== "undefined";
    const hasAfter = typeof afterValue !== "undefined";

    return html`
      <div
        part="item"
        class="item"
        role="listitem"
        tabindex=${index === this.focusIndex ? 0 : -1}
        aria-label=${`${change.kind} ${change.path}`}
        data-index=${index}
        data-kind=${change.kind}
        data-path=${change.path}
        @keydown=${this.onKeyDown}
        @focus=${this.onItemFocus}
      >
        <button
          part="toggle"
          class="toggle"
          type="button"
          aria-expanded=${isOpen ? "true" : "false"}
          aria-controls=${detailId}
          aria-label=${isOpen ? "Collapse change" : "Expand change"}
          @click=${(event: Event) => {
            event.stopPropagation();
            this.toggleOpen(change);
          }}
        >
          ${this.renderToggleIcon(isOpen)}
        </button>
        <span part="kind" class="kind" data-kind=${change.kind}>
          ${change.kind}
        </span>
        <span part="path" class="path">${change.path}</span>
        <span part="actions" class="actions">
          <button
            part="action-button"
            class="action-button"
            type="button"
            data-action="copy-path"
            aria-label=${`Copy path ${change.path}`}
            @click=${() => this.onCopy("path", change, change.path)}
          >
            Path
          </button>
          ${hasBefore
            ? html`
                <button
                  part="action-button"
                  class="action-button"
                  type="button"
                  data-action="copy-before"
                  aria-label=${`Copy before value at ${change.path}`}
                  @click=${() =>
                    this.onCopy("before", change, stringifyValue(beforeValue))}
                >
                  Before
                </button>
              `
            : null}
          ${hasAfter
            ? html`
                <button
                  part="action-button"
                  class="action-button"
                  type="button"
                  data-action="copy-after"
                  aria-label=${`Copy after value at ${change.path}`}
                  @click=${() =>
                    this.onCopy("after", change, stringifyValue(afterValue))}
                >
                  After
                </button>
              `
            : null}
        </span>
        <div
          part="detail"
          class="detail"
          id=${detailId}
          role="group"
          ?hidden=${!isOpen}
        >
          ${hasBefore
            ? this.renderValueBlock(
                "Before",
                beforeValue,
                "detail-block-before",
              )
            : null}
          ${hasAfter
            ? this.renderValueBlock("After", afterValue, "detail-block-after")
            : null}
        </div>
      </div>
    `;
  }

  override render() {
    const ariaLabel =
      this.ariaLabelValue.trim() === "" ? undefined : this.ariaLabelValue;
    const ariaLabelledby =
      this.ariaLabelledbyValue.trim() === ""
        ? undefined
        : this.ariaLabelledbyValue;

    if (this.parseError) {
      return html`
        <div part="base" class="wrapper">
          <div part="error" class="error" role="alert">${this.parseError}</div>
        </div>
      `;
    }

    if (this.changes.length === 0) {
      return html`
        <div part="base" class="wrapper">
          <div part="error" class="error" role="status">No diff data.</div>
        </div>
      `;
    }

    const count = this.changes.length;
    const summary = count === 1 ? "1 change" : `${String(count)} changes`;

    return html`
      <div part="base" class="wrapper">
        <uik-visually-hidden part="status" aria-live="polite" role="status">
          ${this.statusMessage}
        </uik-visually-hidden>
        <div part="header" class="header">
          <span part="summary" class="summary">${summary}</span>
        </div>
        <div
          part="list"
          class="list"
          role="list"
          aria-label=${ifDefined(
            ariaLabel ?? (ariaLabelledby ? undefined : "JSON diff"),
          )}
          aria-labelledby=${ifDefined(ariaLabelledby)}
        >
          ${this.changes.map((change, index) => this.renderItem(change, index))}
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
    "uik-json-diff": UikJsonDiff;
  }
}
