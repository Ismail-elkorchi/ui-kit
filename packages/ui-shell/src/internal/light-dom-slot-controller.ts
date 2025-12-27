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

    const result: SyncResult = { moved: {} };

    for (const target of this.targets) {
      const container = root.querySelector<HTMLElement>(
        target.containerSelector,
      );
      if (!container) continue;

      const movedCount = this.moveToContainer(root, container, target.name);
      result.moved[target.name ?? "default"] = movedCount;
    }

    this.onAfterSync?.(root, result);
  }

  private moveToContainer(
    root: HTMLElement,
    container: HTMLElement,
    slotName: string | null,
  ) {
    let moved = 0;
    for (const node of Array.from(this.host.childNodes)) {
      if (node === root) continue;
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const childSlot = element.getAttribute("slot");
        if (slotName === null) {
          if (childSlot) continue;
          container.append(element);
          moved += 1;
          continue;
        }
        if (childSlot === slotName) {
          container.append(element);
          moved += 1;
        }
        continue;
      }
      if (slotName === null && node.nodeType === Node.TEXT_NODE) {
        const text = node as Text;
        if (!text.textContent || text.textContent.trim() === "") continue;
        container.append(text);
        moved += 1;
      }
    }
    return moved;
  }
}
