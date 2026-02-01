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
    this.observer = new MutationObserver(() => this.sync());
    this.observer.observe(this.host, { childList: true, subtree: true });
  }

  disconnect() {
    this.observer?.disconnect();
    this.observer = null;
  }

  sync() {
    const scopedSelector = this.rootSelector.includes(":scope")
      ? this.rootSelector
      : `:scope > ${this.rootSelector}`;
    const root =
      this.host.querySelector<HTMLElement>(scopedSelector) ??
      this.host.querySelector<HTMLElement>(this.rootSelector);
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

    this.onAfterSync?.(root, { moved });
  }
}
