import type {
  UikButton,
  UikCommandPalette,
  UikDialog,
  UikInput,
  UikNav,
  UikNavItem,
  UikNavRail,
  UikNavRailItem,
  UikProgress,
  UikRadioGroup,
  UikSelect,
  UikSwitch,
  UikTreeView,
  UikTreeViewItem,
} from "@ismail-elkorchi/ui-primitives";
import "@ismail-elkorchi/ui-primitives/uik-badge";
import "@ismail-elkorchi/ui-primitives/uik-box";
import "@ismail-elkorchi/ui-primitives/uik-button";
import "@ismail-elkorchi/ui-primitives/uik-command-palette";
import "@ismail-elkorchi/ui-primitives/uik-heading";
import "@ismail-elkorchi/ui-primitives/uik-link";
import "@ismail-elkorchi/ui-primitives/uik-nav";
import "@ismail-elkorchi/ui-primitives/uik-select";
import "@ismail-elkorchi/ui-primitives/uik-surface";
import "@ismail-elkorchi/ui-primitives/uik-text";
import "@ismail-elkorchi/ui-primitives/uik-visually-hidden";
import type {
  UikCommandCenterCommand,
  UikCommandCenterHandle,
  UikShellActivityBar,
  UikShellActivityBarItem,
  UikShellLayout,
  UikShellLocation,
  UikShellSecondarySidebar,
  UikShellStatusBar,
  UikShellRoute,
} from "@ismail-elkorchi/ui-shell";
import { createUikShellRouter } from "@ismail-elkorchi/ui-shell/router";
import "@ismail-elkorchi/ui-shell/activity-bar";
import "@ismail-elkorchi/ui-shell/layout";
import "@ismail-elkorchi/ui-shell/secondary-sidebar";
import "@ismail-elkorchi/ui-shell/sidebar";
import "@ismail-elkorchi/ui-shell/status-bar";

import {
  buildPageMap,
  docsPages,
  labPages,
  loadPageContent,
  renderPageSections,
  renderToc,
  type DocPageContent,
  type DocPage,
} from "./content";

const ensureDefaultAttribute = (
  target: HTMLElement,
  name: string,
  fallback: string,
) => {
  if (!target.getAttribute(name)) target.setAttribute(name, fallback);
};

const normalizeBaseUrl = (value: string) => {
  if (!value) return "/";
  const withLeading = value.startsWith("/") ? value : `/${value}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
};

const getRouteFromLocation = (baseUrl: string) => {
  const pathname = window.location.pathname;
  const base = normalizeBaseUrl(baseUrl);
  const relative = pathname.startsWith(base)
    ? pathname.slice(base.length)
    : pathname.replace(/^\/+/, "");
  const segments = relative.split("/").filter(Boolean);
  const view = segments[0];
  const subview = segments[1];
  return { view, subview };
};

const buildRoutes = (): UikShellRoute[] => {
  const docsSubviewIds = docsPages.map((page) => page.id);
  const labSubviewIds = labPages.map((page) => page.id);

  const createRoute = (
    id: string,
    label: string,
    subviews: string[],
  ): UikShellRoute => {
    if (subviews.length === 0) return { id, label };
    return { id, label, subviews, defaultSubview: subviews[0] };
  };

  return [
    createRoute("docs", "Docs", docsSubviewIds),
    createRoute("lab", "Lab", labSubviewIds),
  ];
};

const buildActivityItems = (
  routes: UikShellRoute[],
): UikShellActivityBarItem[] => {
  const icons = {
    docs: "M4 5a2 2 0 012-2h10a2 2 0 012 2v14a1 1 0 01-1 1h-2a2 2 0 00-2 2H6a2 2 0 01-2-2V5z",
    lab: "M9 2h6l3 7-6 13-6-13 3-7z",
  } as const;

  return routes.map((route) => {
    const icon = route.id === "lab" ? icons.lab : icons.docs;
    return {
      id: route.id,
      label: route.label ?? route.id,
      icon,
    };
  });
};

const docsGroupOrder = ["Guides", "Foundations", "Components"];
const componentSectionShortcuts: Record<string, string[]> = {
  primitives: ["Portfolio", "Usage", "Contracts"],
  shell: ["Portfolio", "Layout layer", "Contracts"],
};

const componentTagPattern = /<\s*(uik-[a-z0-9-]+)/g;
const componentLoaders = new Map<string, () => Promise<unknown>>([
  ["uik-alert", () => import("@ismail-elkorchi/ui-primitives/uik-alert")],
  ["uik-checkbox", () => import("@ismail-elkorchi/ui-primitives/uik-checkbox")],
  [
    "uik-description-list",
    () => import("@ismail-elkorchi/ui-primitives/uik-description-list"),
  ],
  ["uik-dialog", () => import("@ismail-elkorchi/ui-primitives/uik-dialog")],
  ["uik-icon", () => import("@ismail-elkorchi/ui-primitives/uik-icon")],
  ["uik-input", () => import("@ismail-elkorchi/ui-primitives/uik-input")],
  ["uik-menu", () => import("@ismail-elkorchi/ui-primitives/uik-menu")],
  [
    "uik-menu-item",
    () => import("@ismail-elkorchi/ui-primitives/uik-menu-item"),
  ],
  ["uik-menubar", () => import("@ismail-elkorchi/ui-primitives/uik-menubar")],
  ["uik-popover", () => import("@ismail-elkorchi/ui-primitives/uik-popover")],
  ["uik-progress", () => import("@ismail-elkorchi/ui-primitives/uik-progress")],
  ["uik-radio", () => import("@ismail-elkorchi/ui-primitives/uik-radio")],
  [
    "uik-radio-group",
    () => import("@ismail-elkorchi/ui-primitives/uik-radio-group"),
  ],
  [
    "uik-resizable-panels",
    () => import("@ismail-elkorchi/ui-primitives/uik-resizable-panels"),
  ],
  ["uik-spinner", () => import("@ismail-elkorchi/ui-primitives/uik-spinner")],
  ["uik-stack", () => import("@ismail-elkorchi/ui-primitives/uik-stack")],
  ["uik-switch", () => import("@ismail-elkorchi/ui-primitives/uik-switch")],
  ["uik-textarea", () => import("@ismail-elkorchi/ui-primitives/uik-textarea")],
  ["uik-tooltip", () => import("@ismail-elkorchi/ui-primitives/uik-tooltip")],
  [
    "uik-tree-view",
    () => import("@ismail-elkorchi/ui-primitives/uik-tree-view"),
  ],
]);
const preloadedComponents = new Set([
  "uik-badge",
  "uik-box",
  "uik-button",
  "uik-command-palette",
  "uik-heading",
  "uik-link",
  "uik-nav",
  "uik-select",
  "uik-surface",
  "uik-text",
  "uik-visually-hidden",
  "uik-shell-activity-bar",
  "uik-shell-layout",
  "uik-shell-secondary-sidebar",
  "uik-shell-sidebar",
  "uik-shell-status-bar",
]);
const loadedComponents = new Set(preloadedComponents);

const normalizeNavId = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getPageLabel = (page: DocPage) => page.navLabel ?? page.title;
const getPageGroup = (page: DocPage) => {
  const group = page.group?.trim();
  return group && group.length > 0 ? group : "Docs";
};

const buildSectionNavItems = (page: DocPage, baseUrl: string): UikNavItem[] => {
  const sectionTitles = componentSectionShortcuts[page.id];
  if (!sectionTitles?.length) return [];
  const base = normalizeBaseUrl(baseUrl);
  const toHref = (key: string) => `${base}${key}`;
  const pageKey = `docs/${page.id}`;
  return sectionTitles
    .map((title) => {
      const tocItem = page.toc.find(
        (item) =>
          item.level === 2 && item.title.toLowerCase() === title.toLowerCase(),
      );
      if (!tocItem) return null;
      return {
        id: `${pageKey}#${tocItem.id}`,
        label: title,
        href: toHref(`${pageKey}#${tocItem.id}`),
      } satisfies UikNavItem;
    })
    .filter(Boolean) as UikNavItem[];
};

const buildDocsGroupItems = (baseUrl: string) => {
  const grouped = new Map<string, DocPage[]>();
  docsPages.forEach((page) => {
    const group = getPageGroup(page);
    if (!grouped.has(group)) grouped.set(group, []);
    grouped.get(group)?.push(page);
  });

  const base = normalizeBaseUrl(baseUrl);
  const toHref = (key: string) => `${base}${key}`;
  const groups: UikNavItem[] = [];
  const remaining = new Set(grouped.keys());

  const addGroup = (group: string) => {
    const pages = grouped.get(group);
    if (!pages?.length) return;
    remaining.delete(group);
    groups.push({
      id: `docs-group-${normalizeNavId(group)}`,
      label: group,
      children: pages.map((page) => {
        const pageId = `docs/${page.id}`;
        const sectionChildren = buildSectionNavItems(page, baseUrl);
        const item: UikNavItem = {
          id: pageId,
          label: getPageLabel(page),
          href: toHref(pageId),
        };
        if (sectionChildren.length) item.children = sectionChildren;
        return item;
      }),
    });
  };

  docsGroupOrder.forEach(addGroup);
  [...remaining].sort().forEach(addGroup);
  return groups;
};

const buildNavItems = (baseUrl: string): UikNavItem[] => {
  const base = normalizeBaseUrl(baseUrl);
  const toHref = (key: string) => `${base}${key}`;

  return [
    {
      id: "docs",
      label: "Docs",
      children: buildDocsGroupItems(baseUrl),
    },
    {
      id: "lab",
      label: "Lab",
      children: labPages.map((page) => ({
        id: `lab/${page.id}`,
        label: getPageLabel(page),
        href: toHref(`lab/${page.id}`),
      })),
    },
  ];
};

const buildMobileNavOptions = () => {
  const grouped = new Map<string, DocPage[]>();
  docsPages.forEach((page) => {
    const group = getPageGroup(page);
    if (!grouped.has(group)) grouped.set(group, []);
    grouped.get(group)?.push(page);
  });
  const remaining = new Set(grouped.keys());
  const renderGroup = (group: string) => {
    const pages = grouped.get(group) ?? [];
    if (!pages.length) return "";
    remaining.delete(group);
    const options = pages
      .map(
        (page) =>
          `<option value="docs/${page.id}">${getPageLabel(page)}</option>`,
      )
      .join("");
    return `<optgroup label="${group}">${options}</optgroup>`;
  };
  const docsOptions = [
    ...docsGroupOrder.map(renderGroup),
    ...[...remaining].sort().map(renderGroup),
  ]
    .filter(Boolean)
    .join("");
  const labOptions = labPages
    .map(
      (page) => `<option value="lab/${page.id}">${getPageLabel(page)}</option>`,
    )
    .join("");

  return `
    ${docsOptions}
    <optgroup label="Lab">${labOptions}</optgroup>
  `;
};

type CommandPaletteCommand = UikCommandCenterCommand & { value: string };

const buildCommandPaletteCommands = (): CommandPaletteCommand[] => {
  const items: CommandPaletteCommand[] = [];
  const addItems = (
    view: string,
    pages: typeof docsPages,
    fallback: string,
  ) => {
    pages.forEach((page) => {
      const group = page.group ?? fallback;
      const keywords = `${group} ${page.title} ${page.summary}`.trim();
      items.push({
        id: `${view}-${page.id}`,
        label: getPageLabel(page),
        description: page.summary,
        value: `${view}/${page.id}`,
        group,
        keywords,
      });
    });
  };

  addItems("docs", docsPages, "Docs");
  addItems("lab", labPages, "Lab");
  return items;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderHeroLinks = (page: DocPage) => {
  const links = page.toc.filter((item) => item.level === 2).slice(0, 6);
  if (!links.length) return "";
  return links
    .map(
      (item) =>
        `<a class="docs-hero-link" href="#${item.id}">${escapeHtml(
          item.title,
        )}</a>`,
    )
    .join("");
};

const collectOpenIds = (items: UikNavItem[]) => {
  const ids: string[] = [];
  const walk = (item: UikNavItem) => {
    if (item.children?.length) {
      ids.push(item.id);
      item.children.forEach(walk);
    }
  };
  items.forEach(walk);
  return ids;
};

const locationKey = (location: UikShellLocation) =>
  location.subview ? `${location.view}/${location.subview}` : location.view;

const resolveNavCurrentId = (location: UikShellLocation) => {
  const key = locationKey(location);
  const hash = window.location.hash;
  return hash ? `${key}${hash}` : key;
};

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const collectPageComponentTags = (page: DocPageContent) => {
  const tags = new Set<string>();
  for (const section of page.sections) {
    componentTagPattern.lastIndex = 0;
    let match = componentTagPattern.exec(section.body);
    while (match) {
      tags.add(match[1]);
      match = componentTagPattern.exec(section.body);
    }
  }
  return tags;
};

const loadPageComponents = async (page: DocPageContent) => {
  const tags = collectPageComponentTags(page);
  const imports: Promise<unknown>[] = [];
  tags.forEach((tag) => {
    if (loadedComponents.has(tag)) return;
    const loader = componentLoaders.get(tag);
    if (!loader) return;
    loadedComponents.add(tag);
    imports.push(loader());
  });
  await Promise.all(imports);
};

const setOutlineOpen = (
  layout: UikShellLayout,
  secondary: UikShellSecondarySidebar,
  isOpen: boolean,
) => {
  secondary.isOpen = isOpen;
  layout.isSecondarySidebarVisible = isOpen;
};

const getSystemTheme = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function")
    return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const resolveTheme = () => {
  const theme = document.documentElement.getAttribute("data-uik-theme");
  return theme && theme.length > 0 ? theme : getSystemTheme();
};

const updateStatusMeta = (statusBar: UikShellStatusBar) => {
  const root = document.documentElement;
  const theme = resolveTheme();
  const density = root.getAttribute("data-uik-density") ?? "comfortable";
  statusBar.meta = `Theme: ${theme} | Density: ${density}`;
};

const getBaseUrlFromVite = () => {
  const meta = import.meta as unknown as { env?: { BASE_URL?: unknown } };
  const baseUrl = meta.env?.BASE_URL;
  return typeof baseUrl === "string" ? baseUrl : "/";
};

const copyToClipboard = async (value: string) => {
  await navigator.clipboard.writeText(value);
};

const scrollToHashTarget = async () => {
  const raw = window.location.hash;
  if (!raw || raw === "#") return;
  const id = decodeURIComponent(raw.slice(1));
  if (!id) return;
  await nextFrame();
  document.getElementById(id)?.scrollIntoView({ block: "start" });
};

const wireLabShellControls = (
  container: HTMLElement,
  statusBar: UikShellStatusBar,
  layout: UikShellLayout,
  secondary: UikShellSecondarySidebar,
) => {
  const messageInput = container.querySelector<UikInput>(
    '[data-docs-control="status-message"]',
  );
  if (messageInput) {
    messageInput.value = statusBar.message;
    messageInput.addEventListener("input", () => {
      statusBar.message = messageInput.value;
    });
  }

  const toneGroup = container.querySelector<UikRadioGroup>(
    '[data-docs-control="status-tone"]',
  );
  if (toneGroup) {
    toneGroup.value = statusBar.tone;
    toneGroup.addEventListener("change", () => {
      statusBar.tone = toneGroup.value as UikShellStatusBar["tone"];
    });
  }

  const secondaryToggle = container.querySelector<UikSwitch>(
    '[data-docs-control="secondary-toggle"]',
  );
  if (secondaryToggle) {
    secondary.focusReturnTarget = secondaryToggle;
    secondaryToggle.checked = secondary.isOpen;
    secondaryToggle.addEventListener("change", () => {
      setOutlineOpen(layout, secondary, secondaryToggle.checked);
    });
  }
};

const wireLabOverlayControls = (container: HTMLElement) => {
  const dialog = container.querySelector<UikDialog>("[data-docs-dialog]");
  const dialogOpen = container.querySelector<UikButton>(
    '[data-docs-action="dialog-open"]',
  );
  const dialogClose = container.querySelector<UikButton>(
    '[data-docs-action="dialog-close"]',
  );

  if (dialog && dialogOpen) {
    dialogOpen.addEventListener("click", () => dialog.showModal());
  }

  if (dialog && dialogClose) {
    dialogClose.addEventListener("click", () => dialog.close());
  }

  const progress = container.querySelector<UikProgress>("[data-docs-progress]");
  const progressToggle = container.querySelector<UikButton>(
    '[data-docs-action="progress-toggle"]',
  );

  if (progress && progressToggle) {
    progressToggle.addEventListener("click", () => {
      const next = !progress.indeterminate;
      progress.indeterminate = next;
      if (next) {
        progress.value = 0;
      } else {
        progress.value = 42;
      }
    });
  }
};

const wireLabCommandPaletteControls = (container: HTMLElement) => {
  return (
    container.querySelector<UikButton>(
      '[data-docs-action="command-palette-open"]',
    ) ?? null
  );
};

const wirePortfolioPreviews = (container: HTMLElement) => {
  const navItems: UikNavItem[] = [
    { id: "overview", label: "Overview", href: "#" },
    {
      id: "foundations",
      label: "Foundations",
      children: [
        { id: "tokens", label: "Tokens", href: "#" },
        { id: "components", label: "Components", href: "#" },
      ],
    },
    { id: "release", label: "Release notes", href: "#" },
  ];
  const navRailItems: UikNavRailItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: "M5 6h14M5 12h10M5 18h14",
    },
    {
      id: "tokens",
      label: "Tokens",
      icon: "M6 5h12v6H6zM6 13h12v6H6z",
    },
    {
      id: "components",
      label: "Components",
      icon: "M6 6h5v5H6zM13 6h5v5h-5zM6 13h5v5H6zM13 13h5v5h-5z",
    },
  ];
  const treeItems: UikTreeViewItem[] = [
    {
      id: "design",
      label: "Design",
      children: [
        { id: "tokens", label: "Tokens" },
        { id: "themes", label: "Themes" },
      ],
    },
    {
      id: "components",
      label: "Components",
      children: [
        { id: "inputs", label: "Inputs" },
        { id: "overlays", label: "Overlays" },
      ],
    },
  ];
  const activityItems: UikShellActivityBarItem[] = [
    {
      id: "workspace",
      label: "Workspace",
      icon: "M4 5h16v14H4z",
    },
    {
      id: "tokens",
      label: "Tokens",
      icon: "M12 4l8 4-8 4-8-4 8-4z",
    },
    {
      id: "console",
      label: "Console",
      icon: "M5 7h14M7 12h10M9 17h6",
    },
  ];

  container
    .querySelectorAll<UikNav>('[data-docs-portfolio="nav"]')
    .forEach((nav) => {
      nav.items = navItems;
      nav.openIds = ["foundations"];
      nav.currentId = "tokens";
    });

  container
    .querySelectorAll<UikNavRail>('[data-docs-portfolio="nav-rail"]')
    .forEach((navRail) => {
      navRail.items = navRailItems;
      navRail.activeId = "tokens";
    });

  container
    .querySelectorAll<UikTreeView>('[data-docs-portfolio="tree-view"]')
    .forEach((treeView) => {
      treeView.items = treeItems;
      treeView.openIds = ["design", "components"];
      treeView.selectedIds = ["tokens"];
    });

  container
    .querySelectorAll<UikShellActivityBar>(
      '[data-docs-portfolio="shell-activity-bar"]',
    )
    .forEach((activityBar) => {
      activityBar.items = activityItems;
      activityBar.activeId = "workspace";
    });

  container
    .querySelectorAll<HTMLElement>("[data-docs-dialog-trigger]")
    .forEach((trigger) => {
      const dialogId = trigger.getAttribute("data-docs-dialog-trigger");
      if (!dialogId) return;
      const dialog = container.querySelector<UikDialog>(`#${dialogId}`);
      if (!dialog) return;
      trigger.addEventListener("click", () => {
        if (!dialog.open) dialog.showModal();
      });
    });

  container
    .querySelectorAll<HTMLElement>("[data-docs-dialog-close]")
    .forEach((trigger) => {
      const dialogId = trigger.getAttribute("data-docs-dialog-close");
      if (!dialogId) return;
      const dialog = container.querySelector<UikDialog>(`#${dialogId}`);
      if (!dialog) return;
      trigger.addEventListener("click", () => {
        dialog.close();
      });
    });
};

export const mountDocsApp = (container: HTMLElement) => {
  ensureDefaultAttribute(
    document.documentElement,
    "data-uik-density",
    "comfortable",
  );
  const baseUrl = normalizeBaseUrl(getBaseUrlFromVite());

  container.innerHTML = `
    <nav aria-label="Skip links">
      <a class="docs-skip-link" href="#docs-main">Skip to content</a>
    </nav>
    <uik-shell-layout class="docs-shell">
      <uik-shell-activity-bar
        slot="activity-bar"
        class="docs-activity-bar"
        aria-label="Primary navigation"></uik-shell-activity-bar>
      <uik-shell-sidebar
        slot="primary-sidebar"
        class="docs-sidebar"
        heading="Navigation"
        subtitle="UIK"
        aria-label="Docs navigation">
        <uik-nav class="docs-nav" aria-label="Docs navigation"></uik-nav>
        <div slot="footer" class="docs-sidebar-footer">
          <uik-text as="p" size="sm" tone="muted">Tokens-first, standards-based UI.</uik-text>
        </div>
      </uik-shell-sidebar>
      <main slot="main-content" id="docs-main" class="docs-main">
        <div class="docs-page" data-docs-page>
          <uik-surface variant="card" bordered class="docs-hero">
            <uik-box padding="5">
              <div class="docs-hero-grid">
                <div class="docs-hero-content">
                  <div class="docs-hero-top">
                    <uik-badge variant="secondary">UIK Docs</uik-badge>
                    <uik-badge variant="outline" data-docs-group></uik-badge>
                    <uik-badge variant="outline" data-docs-kind></uik-badge>
                    <uik-badge variant="outline" data-docs-package></uik-badge>
                  </div>
                  <uik-heading level="1" data-docs-title></uik-heading>
                  <uik-text as="p" data-docs-summary class="docs-summary"></uik-text>
                  <nav class="docs-hero-links" data-docs-hero-links aria-label="Jump to sections"></nav>
                </div>
                <div class="docs-hero-panel">
                  <uik-surface variant="elevated" bordered class="docs-hero-panel-surface">
                    <uik-box padding="4">
                      <div class="docs-hero-control-grid">
                        <uik-select data-docs-control="theme">
                          <span slot="label">Theme</span>
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </uik-select>
                        <uik-select data-docs-control="density">
                          <span slot="label">Density</span>
                          <option value="comfortable">Comfortable</option>
                          <option value="compact">Compact</option>
                        </uik-select>
                        <uik-select data-docs-control="mobile-nav" class="docs-mobile-nav">
                          <span slot="label">Page</span>
                          ${buildMobileNavOptions()}
                        </uik-select>
                      </div>
                      <div class="docs-hero-panel-actions">
                        <uik-button variant="ghost" size="sm" data-docs-action="outline-toggle">Outline</uik-button>
                      </div>
                    </uik-box>
                  </uik-surface>
                </div>
              </div>
            </uik-box>
          </uik-surface>
          <div class="docs-page-content" data-docs-content></div>
        </div>
      </main>
      <uik-shell-secondary-sidebar
        slot="secondary-sidebar"
        class="docs-outline"
        heading="On this page"
        aria-label="On this page">
        <div data-docs-outline></div>
      </uik-shell-secondary-sidebar>
      <uik-shell-status-bar slot="status-bar" class="docs-status"></uik-shell-status-bar>
    </uik-shell-layout>
    <uik-command-palette
      class="docs-command-palette"
      data-docs-command-palette
      placeholder="Search docs and lab pages"
    >
      <span slot="title">Command palette</span>
      <span slot="description">Type to search docs and lab pages.</span>
      <uik-visually-hidden slot="label">Search commands</uik-visually-hidden>
      <uik-text slot="footer" as="p" size="sm" tone="muted">
        Use Up/Down to navigate, Enter to select, Esc to close.
      </uik-text>
    </uik-command-palette>
  `;

  const pageMap = buildPageMap();
  const routes = buildRoutes();
  const initialRoute = getRouteFromLocation(baseUrl);
  const initialView = initialRoute.view ?? "docs";
  const initialSubview = initialRoute.subview ?? docsPages[0]?.id;
  const router = createUikShellRouter({
    routes,
    initialView,
    ...(initialSubview ? { initialSubview } : {}),
  });

  const layout = container.querySelector<UikShellLayout>("uik-shell-layout");
  const activityBar = container.querySelector<UikShellActivityBar>(
    "uik-shell-activity-bar",
  );
  const nav = container.querySelector<UikNav>("uik-nav");
  const statusBar = container.querySelector<UikShellStatusBar>(
    "uik-shell-status-bar",
  );
  const secondarySidebar = container.querySelector<UikShellSecondarySidebar>(
    "uik-shell-secondary-sidebar",
  );
  const titleElement =
    container.querySelector<HTMLElement>("[data-docs-title]");
  const summaryElement = container.querySelector<HTMLElement>(
    "[data-docs-summary]",
  );
  const groupBadge = container.querySelector<HTMLElement>("[data-docs-group]");
  const kindBadge = container.querySelector<HTMLElement>("[data-docs-kind]");
  const packageBadge = container.querySelector<HTMLElement>(
    "[data-docs-package]",
  );
  const heroLinksElement = container.querySelector<HTMLElement>(
    "[data-docs-hero-links]",
  );
  const contentElement = container.querySelector<HTMLElement>(
    "[data-docs-content]",
  );
  const outlineElement = container.querySelector<HTMLElement>(
    "[data-docs-outline]",
  );
  const outlineToggle = container.querySelector<UikButton>(
    '[data-docs-action="outline-toggle"]',
  );
  const themeSelect = container.querySelector<UikSelect>(
    'uik-select[data-docs-control="theme"]',
  );
  const densitySelect = container.querySelector<UikSelect>(
    'uik-select[data-docs-control="density"]',
  );
  const mobileNavSelect = container.querySelector<UikSelect>(
    'uik-select[data-docs-control="mobile-nav"]',
  );
  const syncUrl = (
    location: UikShellLocation,
    mode: "push" | "replace" = "push",
  ) => {
    const key = locationKey(location);
    const nextPath = `${baseUrl}${key}`;
    if (window.location.pathname === nextPath) return;
    if (mode === "replace") {
      window.history.replaceState({}, "", nextPath);
    } else {
      window.history.pushState({}, "", nextPath);
    }
  };
  const commandPalette = container.querySelector<UikCommandPalette>(
    "[data-docs-command-palette]",
  );
  let commandCenter: UikCommandCenterHandle | null = null;
  let contentRenderToken = 0;

  if (!layout || !activityBar || !nav || !statusBar || !secondarySidebar) {
    throw new Error("Docs layout could not be initialized.");
  }

  activityBar.items = buildActivityItems(routes);
  nav.items = buildNavItems(baseUrl);
  nav.openIds = collectOpenIds(nav.items);
  setOutlineOpen(layout, secondarySidebar, true);
  let commandPaletteOpenButton: UikButton | null = null;

  const setBadgeContent = (element: HTMLElement | null, value?: string) => {
    if (!element) return;
    const nextValue = value?.trim() ?? "";
    element.textContent = nextValue;
    element.toggleAttribute("hidden", nextValue.length === 0);
  };

  const updateHeroLinks = (page: DocPage) => {
    if (!heroLinksElement) return;
    const links = renderHeroLinks(page);
    heroLinksElement.innerHTML = links;
    heroLinksElement.toggleAttribute("hidden", links.length === 0);
  };

  const updateNavCurrent = (location: UikShellLocation) => {
    nav.currentId = resolveNavCurrentId(location);
  };

  const syncCommandCenterOpenButton = () => {
    if (!commandCenter) return;
    commandCenter.setOpenButton(commandPaletteOpenButton);
  };

  if (commandPalette) {
    void import("@ismail-elkorchi/ui-shell/command-center").then(
      ({ createUikCommandCenter }) => {
        commandCenter = createUikCommandCenter({
          palette: commandPalette,
          commands: buildCommandPaletteCommands(),
          onSelect: (command) => {
            if (!command.value) return;
            const [view, subview] = command.value.split("/");
            router.navigate(view, subview);
            syncUrl(router.current);
            updateNavCurrent(router.current);
          },
        });
        syncCommandCenterOpenButton();
      },
    );
  }

  const renderPageContent = async (view: "docs" | "lab", page: DocPage) => {
    const token = (contentRenderToken += 1);
    if (contentElement) {
      contentElement.setAttribute("aria-busy", "true");
      contentElement.innerHTML = "";
    }
    const pageContent = await loadPageContent(view, page.id);
    if (token !== contentRenderToken) return;

    const shouldAwaitComponents = page.id !== "command-palette";
    const loadPromise = loadPageComponents(pageContent);
    if (shouldAwaitComponents) {
      await loadPromise;
    }
    if (token !== contentRenderToken) return;

    if (contentElement) {
      contentElement.innerHTML = renderPageSections(pageContent);
      contentElement.setAttribute("aria-busy", "false");
      wirePortfolioPreviews(contentElement);
    }

    if (contentElement) {
      if (page.id === "shell-patterns") {
        wireLabShellControls(
          contentElement,
          statusBar,
          layout,
          secondarySidebar,
        );
      }
      if (page.id === "overlays") {
        wireLabOverlayControls(contentElement);
      }
      commandPaletteOpenButton = null;
      if (page.id === "command-palette") {
        commandPaletteOpenButton =
          wireLabCommandPaletteControls(contentElement);
      }
      syncCommandCenterOpenButton();
    }

    if (!shouldAwaitComponents) {
      await loadPromise;
    }
    if (token !== contentRenderToken) return;

    void scrollToHashTarget();
  };

  const applyLocation = (location: UikShellLocation) => {
    const key = locationKey(location);
    const page = pageMap.get(key);
    if (!page) return;

    activityBar.activeId = location.view;
    updateNavCurrent(location);

    if (titleElement) titleElement.textContent = page.title;
    if (summaryElement) summaryElement.textContent = page.summary;
    setBadgeContent(groupBadge, page.group);
    setBadgeContent(kindBadge, page.kind);
    setBadgeContent(
      packageBadge,
      page.package ? `@ismail-elkorchi/${page.package}` : "",
    );
    updateHeroLinks(page);
    if (contentElement) {
      contentElement.innerHTML = "";
      contentElement.setAttribute("aria-busy", "true");
    }
    if (outlineElement) outlineElement.innerHTML = renderToc(page);
    if (mobileNavSelect) {
      mobileNavSelect.value = key;
    }

    statusBar.message = page.title;
    if (page.id !== "shell-patterns") statusBar.tone = "info";
    updateStatusMeta(statusBar);
    document.title = `UIK Docs - ${page.title}`;
    void renderPageContent(location.view as "docs" | "lab", page);
  };

  router.subscribe(applyLocation);
  syncUrl(router.current, "replace");

  const onCodeCopyClick = async (event: Event) => {
    const target = event.target as HTMLElement | null;
    const copyButton = target?.closest<HTMLElement>(
      '[data-docs-action="copy-code"]',
    );
    if (!copyButton) return;

    const code = copyButton
      .closest(".docs-code-block")
      ?.querySelector("pre code");
    const text = code?.textContent ?? "";
    if (!text) return;

    const previous = copyButton.textContent || "Copy";
    try {
      await copyToClipboard(text);
      copyButton.textContent = "Copied";
    } catch {
      copyButton.textContent = "Failed";
    } finally {
      window.setTimeout(() => {
        copyButton.textContent = previous;
      }, 1200);
    }
  };

  contentElement?.addEventListener("click", (event) => {
    void onCodeCopyClick(event);
  });

  window.addEventListener("hashchange", () => {
    updateNavCurrent(router.current);
    void scrollToHashTarget();
  });

  activityBar.addEventListener("activity-bar-select", (event: Event) => {
    const detail = (event as CustomEvent<{ id: string }>).detail;
    router.navigate(detail.id);
    syncUrl(router.current);
    updateNavCurrent(router.current);
  });

  nav.addEventListener("nav-select", (event: Event) => {
    const detail = (event as CustomEvent<{ id: string }>).detail;
    const [view, subviewWithHash] = detail.id.split("/");
    if (!view || !subviewWithHash) return;
    const [subview, hash] = subviewWithHash.split("#");
    if (!subview) return;
    event.preventDefault();
    router.navigate(view, subview);
    const nextKey = `${view}/${subview}`;
    const nextPath = hash
      ? `${baseUrl}${nextKey}#${hash}`
      : `${baseUrl}${nextKey}`;
    window.history.pushState({}, "", nextPath);
    updateNavCurrent(router.current);
    void scrollToHashTarget();
  });

  outlineToggle?.addEventListener("click", () => {
    setOutlineOpen(layout, secondarySidebar, !secondarySidebar.isOpen);
  });

  secondarySidebar.addEventListener("secondary-sidebar-close", () => {
    setOutlineOpen(layout, secondarySidebar, false);
  });

  themeSelect?.addEventListener("change", () => {
    document.documentElement.setAttribute("data-uik-theme", themeSelect.value);
    updateStatusMeta(statusBar);
  });

  densitySelect?.addEventListener("change", () => {
    document.documentElement.setAttribute(
      "data-uik-density",
      densitySelect.value,
    );
    updateStatusMeta(statusBar);
  });

  mobileNavSelect?.addEventListener("change", () => {
    const [view, subview] = mobileNavSelect.value.split("/");
    if (!view || !subview) return;
    router.navigate(view, subview);
    syncUrl(router.current);
    updateNavCurrent(router.current);
  });

  window.addEventListener("popstate", () => {
    const next = getRouteFromLocation(baseUrl);
    if (!next.view) return;
    try {
      router.navigate(next.view, next.subview);
    } catch {
      router.navigate("docs", docsPages[0]?.id);
      syncUrl(router.current, "replace");
    }
  });

  const syncSelects = async () => {
    await nextFrame();
    if (themeSelect) themeSelect.value = resolveTheme();
    if (densitySelect)
      densitySelect.value =
        document.documentElement.getAttribute("data-uik-density") ??
        "comfortable";
    if (mobileNavSelect) mobileNavSelect.value = locationKey(router.current);
  };

  void syncSelects();
};
