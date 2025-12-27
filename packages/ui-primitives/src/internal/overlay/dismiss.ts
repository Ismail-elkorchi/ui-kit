export interface OutsideDismissController {
  connect: () => void;
  disconnect: () => void;
}

export function createOutsideDismissController(
  host: HTMLElement,
  onOutsideDismiss: () => void,
): OutsideDismissController {
  let controller: AbortController | null = null;

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    const path = event.composedPath();
    if (path.includes(host)) return;
    onOutsideDismiss();
  };

  return {
    connect() {
      if (controller) return;
      controller = new AbortController();
      const signal = controller.signal;
      document.addEventListener("pointerdown", onPointerDown, {
        capture: true,
        signal,
      });
    },
    disconnect() {
      controller?.abort();
      controller = null;
    },
  };
}

export function createEscapeKeyHandler(onEscape: () => void) {
  return (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    onEscape();
  };
}
