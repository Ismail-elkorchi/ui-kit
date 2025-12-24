export const UIK_SHELL_NAVIGATION_EVENT = 'uik-shell:navigation';

export interface UikShellRoute {
  id: string;
  label?: string;
  subviews?: string[];
  defaultSubview?: string;
}

export interface UikShellLocation {
  view: string;
  subview?: string | undefined;
}

export interface UikShellNavigationDetail {
  from: UikShellLocation;
  to: UikShellLocation;
  route: UikShellRoute;
}

export interface UikShellRouterConfig {
  routes: UikShellRoute[];
  initialView?: string;
  initialSubview?: string;
}

export type UikShellNavigationListener = (location: UikShellLocation) => void;

export class UikShellRouter extends EventTarget {
  private readonly routeRegistry = new Map<string, UikShellRoute>();
  private readonly lastSubviews = new Map<string, string | undefined>();
  private location: UikShellLocation;

  constructor(config: UikShellRouterConfig) {
    super();
    if (config.routes.length === 0) throw new Error('UikShellRouter requires at least one route.');

    for (const route of config.routes) {
      this.routeRegistry.set(route.id, route);
    }

    const view = this.resolveInitialView(config.initialView);
    const subview = this.resolveSubview(view, config.initialSubview);
    this.location = {view, subview};
  }

  get current(): UikShellLocation {
    return {...this.location};
  }

  get routes(): UikShellRoute[] {
    return [...this.routeRegistry.values()];
  }

  subscribe(listener: UikShellNavigationListener): () => void {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<UikShellNavigationDetail>).detail;
      listener(detail.to);
    };

    this.addEventListener(UIK_SHELL_NAVIGATION_EVENT, handler as EventListener);
    listener(this.current);

    return () => {
      this.removeEventListener(UIK_SHELL_NAVIGATION_EVENT, handler as EventListener);
    };
  }

  navigate(view: string, subview?: string) {
    const route = this.routeRegistry.get(view);
    if (!route) throw new Error(`Unknown route "${view}".`);

    const resolvedSubview = this.resolveSubview(view, subview);
    const next: UikShellLocation = {view, subview: resolvedSubview};

    if (next.view === this.location.view && next.subview === this.location.subview) return;

    const previous = this.location;
    this.location = next;

    this.dispatchEvent(
      new CustomEvent<UikShellNavigationDetail>(UIK_SHELL_NAVIGATION_EVENT, {
        detail: {from: previous, to: next, route},
      }),
    );

    const globalWindow = (globalThis as unknown as {window?: Window}).window;
    if (globalWindow) {
      globalWindow.dispatchEvent(
        new CustomEvent<UikShellNavigationDetail>(UIK_SHELL_NAVIGATION_EVENT, {
          detail: {from: previous, to: next, route},
        }),
      );
    }
  }

  private resolveInitialView(initialView?: string): string {
    if (initialView && this.routeRegistry.has(initialView)) return initialView;
    const first = this.routeRegistry.values().next().value;
    if (!first) throw new Error('UikShellRouter requires at least one route.');
    return first.id;
  }

  private resolveSubview(view: string, requested?: string): string | undefined {
    const route = this.routeRegistry.get(view);
    if (!route?.subviews?.length) return undefined;

    if (requested && route.subviews.includes(requested)) {
      this.lastSubviews.set(view, requested);
      return requested;
    }

    const remembered = this.lastSubviews.get(view);
    if (remembered && route.subviews.includes(remembered)) return remembered;

    const fallback = route.defaultSubview ?? route.subviews[0];
    this.lastSubviews.set(view, fallback);
    return fallback;
  }
}

export const createUikShellRouter = (config: UikShellRouterConfig) => new UikShellRouter(config);
