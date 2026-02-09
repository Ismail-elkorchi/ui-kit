interface SlotTarget {
  name: string | null;
  containerSelector: string;
}

interface SyncResult {
  moved: Record<string, number>;
}

const ROOT_ATTRIBUTE = "data-shell-root";

export function ensureLightDomRoot(
  host: HTMLElement,
  attr: string = ROOT_ATTRIBUTE,
) {
  const existing = Array.from(host.children).find((child) =>
    child.hasAttribute(attr),
  );
  if (existing instanceof HTMLElement) return existing;
  const root = document.createElement("div");
  root.setAttribute(attr, "");
  if (!root.style.display) root.style.display = "block";
  if (!root.style.boxSizing) root.style.boxSizing = "border-box";
  if (!root.style.width) root.style.width = "100%";
  if (!root.style.height) root.style.height = "100%";
  host.append(root);
  return root;
}

export class LightDomSlotController {
  private observer: MutationObserver | null = null;
  private syncQueued = false;

  constructor(
    private readonly host: HTMLElement,
    private readonly rootSelector: string,
    private readonly targets: SlotTarget[],
    private readonly onAfterSync?: (
      root: HTMLElement,
      result: SyncResult,
    ) => void,
  ) {}

  connect() {
    if (this.observer) return;
    this.sync();
    this.observer = new MutationObserver((records) => {
      if (!this.shouldSync(records)) return;
      this.queueSync();
    });
    this.observer.observe(this.host, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["slot"],
    });
  }

  disconnect() {
    this.observer?.disconnect();
    this.observer = null;
    this.syncQueued = false;
  }

  private queueSync() {
    if (this.syncQueued) return;
    this.syncQueued = true;
    queueMicrotask(() => {
      this.syncQueued = false;
      this.sync();
    });
  }

  private resolveRoot() {
    const scopedSelector = this.rootSelector.includes(":scope")
      ? this.rootSelector
      : `:scope > ${this.rootSelector}`;
    return (
      this.host.querySelector<HTMLElement>(scopedSelector) ??
      this.host.querySelector<HTMLElement>(this.rootSelector)
    );
  }

  private shouldSync(records: MutationRecord[]) {
    const root = this.resolveRoot();
    for (const record of records) {
      if (record.type === "childList") {
        // React only when direct host children are added/removed.
        if (record.target === this.host) return true;
        if (
          root &&
          record.target instanceof Node &&
          !root.contains(record.target) &&
          record.target !== root
        ) {
          return true;
        }
        continue;
      }
      if (record.type === "attributes" && record.attributeName === "slot") {
        const target = record.target;
        if (!(target instanceof HTMLElement)) continue;
        // Slot assignment changes matter only for shell-level projected nodes.
        if (target.parentElement === this.host) return true;
      }
    }
    return false;
  }

  sync() {
    const root = this.resolveRoot();
    if (!root) return;

    const containers = new Map<string | null, HTMLElement>();
    const moved: SyncResult["moved"] = {};

    for (const target of this.targets) {
      const container = root.querySelector<HTMLElement>(
        target.containerSelector,
      );
      if (!container) continue;
      containers.set(target.name, container);
      moved[target.name ?? "default"] = 0;
    }

    if (containers.size === 0) return;

    for (const node of Array.from(this.host.childNodes)) {
      if (node === root) continue;
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const slotName = element.getAttribute("slot") || null;
        const container = containers.get(slotName);
        if (!container) continue;
        container.append(element);
        const key = slotName ?? "default";
        moved[key] = (moved[key] ?? 0) + 1;
        continue;
      }
      if (node.nodeType === Node.TEXT_NODE) {
        const container = containers.get(null);
        if (!container) continue;
        const text = node as Text;
        if (!text.textContent || text.textContent.trim() === "") continue;
        container.append(text);
        moved["default"] = (moved["default"] ?? 0) + 1;
      }
    }

    const hasMoves = Object.values(moved).some((count) => count > 0);
    if (hasMoves) {
      this.onAfterSync?.(root, { moved });
    }
  }
}
