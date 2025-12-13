export const APP_SHELL_NAV_EVENT = 'app-shell:navigate';

export interface AppShellRoute {
  id: string;
  label?: string;
  subviews?: string[];
  defaultSubview?: string;
}

export interface AppShellLocation {
  view: string;
  subview?: string | undefined;
}

export interface AppShellNavigationDetail {
  from: AppShellLocation;
  to: AppShellLocation;
  route: AppShellRoute;
}

export interface AppShellRouterConfig {
  routes: AppShellRoute[];
  initialView?: string;
  initialSubview?: string;
}

export type AppShellNavigationListener = (location: AppShellLocation) => void;

export class AppShellRouter extends EventTarget {
  private readonly routes = new Map<string, AppShellRoute>();
  private readonly lastSubviews = new Map<string, string | undefined>();
  private location: AppShellLocation;

  constructor(config: AppShellRouterConfig) {
    super();
    if (!config.routes.length) throw new Error('AppShellRouter requires at least one route.');

    config.routes.forEach(route => this.routes.set(route.id, route));

    const view = this.resolveInitialView(config.initialView);
    const subview = this.resolveSubview(view, config.initialSubview);
    this.location = {view, subview};
  }

  get current(): AppShellLocation {
    return {...this.location};
  }

  get routeList(): AppShellRoute[] {
    return Array.from(this.routes.values());
  }

  subscribe(listener: AppShellNavigationListener): () => void {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<AppShellNavigationDetail>).detail;
      listener(detail.to);
    };

    this.addEventListener(APP_SHELL_NAV_EVENT, handler as EventListener);
    listener(this.current);

    return () => {
      this.removeEventListener(APP_SHELL_NAV_EVENT, handler as EventListener);
    };
  }

  navigate(view: string, subview?: string) {
    const route = this.routes.get(view);
    if (!route) throw new Error(`Unknown route "${view}".`);

    const resolvedSubview = this.resolveSubview(view, subview);
    const next: AppShellLocation = {view, subview: resolvedSubview};

    if (next.view === this.location.view && next.subview === this.location.subview) return;

    const previous = this.location;
    this.location = next;

    this.dispatchEvent(
      new CustomEvent<AppShellNavigationDetail>(APP_SHELL_NAV_EVENT, {detail: {from: previous, to: next, route}})
    );

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent<AppShellNavigationDetail>(APP_SHELL_NAV_EVENT, {detail: {from: previous, to: next, route}})
      );
    }
  }

  private resolveInitialView(initialView?: string): string {
    if (initialView && this.routes.has(initialView)) return initialView;
    const first = this.routes.values().next().value;
    if (!first) throw new Error('AppShellRouter requires at least one route.');
    return first.id;
  }

  private resolveSubview(view: string, requested?: string): string | undefined {
    const route = this.routes.get(view);
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

export const createAppShellRouter = (config: AppShellRouterConfig) => new AppShellRouter(config);
