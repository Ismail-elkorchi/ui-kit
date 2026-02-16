export interface UikScrollSpyController {
  connect(): void;
  disconnect(): void;
  refresh(): void;
  getActiveId(): string | null;
}

export interface UikScrollSpyControllerOptions {
  targets: string | Iterable<HTMLElement>;
  scope?: ParentNode | null;
  root?: HTMLElement | Document | null;
  activationOffset?: number;
  rootMargin?: string;
  threshold?: number | number[];
  onActiveIdChange?: (activeId: string | null) => void;
}

const defaultThreshold = [0, 0.25, 0.5, 0.75, 1];

const resolveObserverRoot = (root?: HTMLElement | Document | null) => {
  if (!root || root instanceof Document) return null;
  return root;
};

const resolveScrollContainer = (
  root?: HTMLElement | Document | null,
): HTMLElement | null => {
  if (!root) return null;
  if (root instanceof Document) {
    return root.scrollingElement instanceof HTMLElement
      ? root.scrollingElement
      : null;
  }
  return root;
};

const collectTargets = (
  targets: string | Iterable<HTMLElement>,
  scope?: ParentNode | null,
) => {
  if (typeof targets === "string") {
    const queryRoot = scope ?? document;
    return Array.from(queryRoot.querySelectorAll<HTMLElement>(targets)).filter(
      (element) => element.id.length > 0,
    );
  }
  return Array.from(targets).filter((element) => element.id.length > 0);
};

const sameNodeList = (left: HTMLElement[], right: HTMLElement[]) => {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
};

const getViewportRange = (scrollContainer: HTMLElement | null) => {
  if (!scrollContainer) {
    return {
      top: 0,
      bottom: window.innerHeight,
    };
  }
  const rect = scrollContainer.getBoundingClientRect();
  return {
    top: rect.top,
    bottom: rect.bottom,
  };
};

const computeActiveId = (
  targets: HTMLElement[],
  activationOffset: number,
  scrollContainer: HTMLElement | null,
) => {
  if (targets.length === 0) return null;
  const viewport = getViewportRange(scrollContainer);
  const activationLine = viewport.top + activationOffset;
  let lastBeforeLine: HTMLElement | null = null;
  let firstVisible: HTMLElement | null = null;

  for (const target of targets) {
    const rect = target.getBoundingClientRect();
    const intersectsViewport =
      rect.bottom > viewport.top && rect.top < viewport.bottom;
    if (rect.top <= activationLine) {
      lastBeforeLine = target;
    }
    if (!firstVisible && intersectsViewport) {
      firstVisible = target;
    }
  }

  return (lastBeforeLine ?? firstVisible ?? targets[0])?.id ?? null;
};

/**
 * Observes section headings and reports which section is active while scrolling.
 * The API is deliberately framework-agnostic so docs, apps, and marketing pages
 * can reuse the same behavior.
 */
export const createUikScrollSpyController = (
  options: UikScrollSpyControllerOptions,
): UikScrollSpyController => {
  const {
    targets,
    scope = document,
    root = null,
    activationOffset = 96,
    rootMargin = "0px 0px -55% 0px",
    threshold = defaultThreshold,
    onActiveIdChange,
  } = options;

  const observerRoot = resolveObserverRoot(root);
  const scrollContainer = resolveScrollContainer(root);
  const eventScrollTarget: EventTarget =
    scrollContainer ?? document.scrollingElement ?? window;
  const eventResizeTarget =
    root instanceof Document ? (root.defaultView ?? window) : window;
  const observer =
    typeof IntersectionObserver === "function"
      ? new IntersectionObserver(
          () => {
            scheduleUpdate();
          },
          {
            root: observerRoot,
            rootMargin,
            threshold,
          },
        )
      : null;

  let rafId: number | null = null;
  let connected = false;
  let currentTargets: HTMLElement[] = [];
  let activeId: string | null = null;

  const setActiveId = (nextActiveId: string | null) => {
    if (nextActiveId === activeId) return;
    activeId = nextActiveId;
    onActiveIdChange?.(activeId);
  };

  const updateActive = () => {
    rafId = null;
    setActiveId(
      computeActiveId(currentTargets, activationOffset, scrollContainer),
    );
  };

  const scheduleUpdate = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(updateActive);
  };

  const observeTargets = (nextTargets: HTMLElement[]) => {
    if (!observer) {
      currentTargets = nextTargets;
      scheduleUpdate();
      return;
    }
    currentTargets.forEach((target) => observer.unobserve(target));
    currentTargets = nextTargets;
    currentTargets.forEach((target) => observer.observe(target));
    scheduleUpdate();
  };

  const refresh = () => {
    const nextTargets = collectTargets(targets, scope);
    if (sameNodeList(nextTargets, currentTargets)) {
      scheduleUpdate();
      return;
    }
    observeTargets(nextTargets);
  };

  return {
    connect() {
      if (connected) return;
      connected = true;
      eventScrollTarget.addEventListener("scroll", scheduleUpdate, {
        passive: true,
      });
      eventResizeTarget.addEventListener("resize", scheduleUpdate);
      refresh();
    },
    disconnect() {
      if (!connected) return;
      connected = false;
      eventScrollTarget.removeEventListener("scroll", scheduleUpdate);
      eventResizeTarget.removeEventListener("resize", scheduleUpdate);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (observer) {
        currentTargets.forEach((target) => observer.unobserve(target));
      }
      currentTargets = [];
      setActiveId(null);
    },
    refresh,
    getActiveId() {
      return activeId;
    },
  };
};
