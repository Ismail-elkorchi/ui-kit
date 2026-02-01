import type {
  UikButton,
  UikCommandPalette,
  UikNavItem,
  UikSelect,
  UikTreeView,
} from "@ismail-elkorchi/ui-primitives";
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

const buildRoutes = (
  docsPageList: DocPage[] = docsPages,
  labPageList: DocPage[] = labPages,
): UikShellRoute[] => {
  const docsSubviewIds = docsPageList.map((page) => page.id);
  const labSubviewIds = labPageList.map((page) => page.id);

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
  ["uik-badge", () => import("@ismail-elkorchi/ui-primitives/uik-badge")],
  ["uik-box", () => import("@ismail-elkorchi/ui-primitives/uik-box")],
  ["uik-button", () => import("@ismail-elkorchi/ui-primitives/uik-button")],
  ["uik-checkbox", () => import("@ismail-elkorchi/ui-primitives/uik-checkbox")],
  [
    "uik-code-block",
    () => import("@ismail-elkorchi/ui-primitives/uik-code-block"),
  ],
  ["uik-combobox", () => import("@ismail-elkorchi/ui-primitives/uik-combobox")],
  [
    "uik-description-list",
    () => import("@ismail-elkorchi/ui-primitives/uik-description-list"),
  ],
  ["uik-dialog", () => import("@ismail-elkorchi/ui-primitives/uik-dialog")],
  [
    "uik-empty-state",
    () => import("@ismail-elkorchi/ui-patterns/uik-empty-state"),
  ],
  ["uik-heading", () => import("@ismail-elkorchi/ui-primitives/uik-heading")],
  ["uik-page-hero", () => import("@ismail-elkorchi/ui-patterns/uik-page-hero")],
  [
    "uik-section-card",
    () => import("@ismail-elkorchi/ui-patterns/uik-section-card"),
  ],
  [
    "uik-shell-activity-bar",
    () => import("@ismail-elkorchi/ui-shell/activity-bar"),
  ],
  ["uik-shell-layout", () => import("@ismail-elkorchi/ui-shell/layout")],
  [
    "uik-shell-secondary-sidebar",
    () => import("@ismail-elkorchi/ui-shell/secondary-sidebar"),
  ],
  ["uik-shell-sidebar", () => import("@ismail-elkorchi/ui-shell/sidebar")],
  [
    "uik-shell-status-bar",
    () => import("@ismail-elkorchi/ui-shell/status-bar"),
  ],
  ["uik-icon", () => import("@ismail-elkorchi/ui-primitives/uik-icon")],
  ["uik-input", () => import("@ismail-elkorchi/ui-primitives/uik-input")],
  ["uik-link", () => import("@ismail-elkorchi/ui-primitives/uik-link")],
  ["uik-listbox", () => import("@ismail-elkorchi/ui-primitives/uik-listbox")],
  ["uik-menu", () => import("@ismail-elkorchi/ui-primitives/uik-menu")],
  [
    "uik-menu-item",
    () => import("@ismail-elkorchi/ui-primitives/uik-menu-item"),
  ],
  ["uik-menubar", () => import("@ismail-elkorchi/ui-primitives/uik-menubar")],
  ["uik-nav", () => import("@ismail-elkorchi/ui-primitives/uik-nav")],
  ["uik-option", () => import("@ismail-elkorchi/ui-primitives/uik-option")],
  [
    "uik-pagination",
    () => import("@ismail-elkorchi/ui-primitives/uik-pagination"),
  ],
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
  ["uik-select", () => import("@ismail-elkorchi/ui-primitives/uik-select")],
  ["uik-spinner", () => import("@ismail-elkorchi/ui-primitives/uik-spinner")],
  ["uik-stack", () => import("@ismail-elkorchi/ui-primitives/uik-stack")],
  ["uik-surface", () => import("@ismail-elkorchi/ui-primitives/uik-surface")],
  ["uik-switch", () => import("@ismail-elkorchi/ui-primitives/uik-switch")],
  ["uik-tab", () => import("@ismail-elkorchi/ui-primitives/uik-tab")],
  [
    "uik-tab-panel",
    () => import("@ismail-elkorchi/ui-primitives/uik-tab-panel"),
  ],
  ["uik-tabs", () => import("@ismail-elkorchi/ui-primitives/uik-tabs")],
  ["uik-text", () => import("@ismail-elkorchi/ui-primitives/uik-text")],
  ["uik-textarea", () => import("@ismail-elkorchi/ui-primitives/uik-textarea")],
  ["uik-tooltip", () => import("@ismail-elkorchi/ui-primitives/uik-tooltip")],
  [
    "uik-tree-view",
    () => import("@ismail-elkorchi/ui-primitives/uik-tree-view"),
  ],
]);
const preloadedComponents = new Set();
const prefetchedComponents = new Set([
  "uik-description-list",
  "uik-input",
  "uik-progress",
  "uik-radio",
  "uik-radio-group",
  "uik-stack",
  "uik-switch",
]);
const baseComponentTags = [
  "uik-shell-layout",
  "uik-shell-activity-bar",
  "uik-shell-sidebar",
  "uik-shell-secondary-sidebar",
  "uik-shell-status-bar",
  "uik-badge",
  "uik-box",
  "uik-button",
  "uik-heading",
  "uik-link",
  "uik-page-hero",
  "uik-section-card",
  "uik-select",
  "uik-surface",
  "uik-text",
  "uik-tree-view",
];
const loadedComponents = new Set(preloadedComponents);
const pendingComponents = new Map<string, Promise<unknown>>();

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

const buildDocsGroupItems = (
  pages: DocPage[],
  baseUrl: string,
  activePageId?: string | null,
) => {
  const grouped = new Map<string, DocPage[]>();
  pages.forEach((page) => {
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
        const sectionChildren =
          activePageId && page.id === activePageId
            ? buildSectionNavItems(page, baseUrl)
            : [];
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

const buildNavItems = (
  baseUrl: string,
  docsPageList: DocPage[] = docsPages,
  labPageList: DocPage[] = labPages,
  activeDocPageId?: string | null,
): UikNavItem[] => {
  const base = normalizeBaseUrl(baseUrl);
  const toHref = (key: string) => `${base}${key}`;

  return [
    {
      id: "docs",
      label: "Docs",
      children: buildDocsGroupItems(docsPageList, baseUrl, activeDocPageId),
    },
    {
      id: "lab",
      label: "Lab",
      children: labPageList.map((page) => ({
        id: `lab/${page.id}`,
        label: getPageLabel(page),
        href: toHref(`lab/${page.id}`),
      })),
    },
  ];
};

const buildMobileNavOptions = (
  docsPageList: DocPage[] = docsPages,
  labPageList: DocPage[] = labPages,
) => {
  const grouped = new Map<string, DocPage[]>();
  docsPageList.forEach((page) => {
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
  const labOptions = labPageList
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

const buildCommandPaletteCommands = (
  docsPageList: DocPage[] = docsPages,
  labPageList: DocPage[] = labPages,
): CommandPaletteCommand[] => {
  const items: CommandPaletteCommand[] = [];
  const addItems = (view: string, pages: DocPage[], fallback: string) => {
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

  addItems("docs", docsPageList, "Docs");
  addItems("lab", labPageList, "Lab");
  return items;
};

const basePageTitle = "UI Kit";

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

const collectOpenIds = (items: UikNavItem[], currentId?: string) => {
  const openIds: string[] = [];
  const addOpenId = (item: UikNavItem) => {
    if (item.children?.length) {
      openIds.push(item.id);
    }
  };
  const findPath = (
    nodes: UikNavItem[],
    targetId: string,
    path: UikNavItem[] = [],
  ): UikNavItem[] | null => {
    for (const node of nodes) {
      const nextPath = [...path, node];
      if (node.id === targetId) return nextPath;
      if (node.children?.length) {
        const result = findPath(node.children, targetId, nextPath);
        if (result) return result;
      }
    }
    return null;
  };
  if (!currentId) return openIds;
  const path = findPath(items, currentId);
  if (!path) return openIds;
  path.forEach(addOpenId);
  return openIds;
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

const componentLoadBatchSize = 1;

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

const loadComponent = (tag: string, loader: () => Promise<unknown>) => {
  if (loadedComponents.has(tag)) return Promise.resolve();
  const pending = pendingComponents.get(tag);
  if (pending) return pending;
  const promise = loader()
    .then(() => {
      loadedComponents.add(tag);
    })
    .finally(() => {
      pendingComponents.delete(tag);
    });
  pendingComponents.set(tag, promise);
  return promise;
};

const loadComponents = async (tags: Iterable<string>) => {
  const queue: Array<[string, () => Promise<unknown>]> = [];
  for (const tag of tags) {
    if (loadedComponents.has(tag)) continue;
    const loader = componentLoaders.get(tag);
    if (!loader) continue;
    queue.push([tag, loader]);
  }
  for (let index = 0; index < queue.length; index += 1) {
    const [tag, loader] = queue[index] ?? [];
    if (!tag || !loader) continue;
    await loadComponent(tag, loader);
    const shouldYield =
      index < queue.length - 1 && (index + 1) % componentLoadBatchSize === 0;
    if (shouldYield) {
      await nextFrame();
    }
  }
};

const prefetchComponents = () => {
  prefetchedComponents.forEach((tag) => {
    const loader = componentLoaders.get(tag);
    if (!loader) return;
    void loadComponent(tag, loader);
  });
};

const loadPageComponents = async (page: DocPageContent) => {
  const tags = collectPageComponentTags(page);
  await loadComponents(tags);
};

const loadBaseComponents = () => {
  return loadComponents(baseComponentTags);
};

const schedulePageComponents = (
  page: DocPageContent,
  onComplete?: () => void,
) => {
  const run = () => {
    const promise = loadPageComponents(page);
    if (onComplete) {
      promise.finally(onComplete);
    }
  };
  if ("requestIdleCallback" in window) {
    (
      window as Window & {
        requestIdleCallback: (
          callback: IdleRequestCallback,
          options?: IdleRequestOptions,
        ) => number;
      }
    ).requestIdleCallback(run, { timeout: 250 });
  } else {
    globalThis.setTimeout(run, 0);
  }
};

const schedulePrefetchComponents = () => {
  const schedule = () => {
    const run = () => prefetchComponents();
    if ("requestIdleCallback" in window) {
      (
        window as Window & {
          requestIdleCallback: (
            callback: IdleRequestCallback,
            options?: IdleRequestOptions,
          ) => number;
        }
      ).requestIdleCallback(run);
    } else {
      globalThis.setTimeout(run, 0);
    }
  };
  const handleFirstInteraction = () => {
    window.removeEventListener("pointerdown", handleFirstInteraction);
    schedule();
  };
  window.addEventListener("pointerdown", handleFirstInteraction, {
    passive: true,
  });
};

const scheduleMobileNavOptions = (mobileNavSelect: UikSelect | null) => {
  if (!mobileNavSelect) return;
  const populate = () => {
    if (!mobileNavSelect.isConnected) return;
    if (mobileNavSelect.querySelector("option")) return;
    const currentValue = mobileNavSelect.value;
    mobileNavSelect.insertAdjacentHTML(
      "beforeend",
      buildMobileNavOptions(docsPages, labPages),
    );
    if (currentValue) {
      mobileNavSelect.value = currentValue;
    }
  };
  const handlePopulate = () => {
    populate();
    mobileNavSelect.removeEventListener("focus", handlePopulate);
    mobileNavSelect.removeEventListener("pointerdown", handlePopulate);
  };
  mobileNavSelect.addEventListener("focus", handlePopulate);
  mobileNavSelect.addEventListener("pointerdown", handlePopulate, {
    passive: true,
  });
};

const setOutlineOpen = (
  layout: UikShellLayout,
  secondary: UikShellSecondarySidebar,
  isOpen: boolean,
  options: { focus?: boolean } = {},
) => {
  const { focus = true } = options;
  secondary.isOpen = isOpen;
  layout.isSecondarySidebarVisible = isOpen;
  if (isOpen && focus) {
    void secondary.updateComplete.then(() => {
      const closeButton = secondary.querySelector<UikButton>(
        'uik-button[part="close-button"]',
      );
      closeButton?.focus();
    });
  }
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

const ensureMetaElement = (selector: string, create: () => HTMLElement) => {
  const existing = document.head.querySelector<HTMLElement>(selector);
  if (existing) return existing;
  const element = create();
  document.head.append(element);
  return element;
};

const setMetaName = (name: string, content: string) => {
  const selector = `meta[name="${name}"]`;
  const element = ensureMetaElement(selector, () => {
    const meta = document.createElement("meta");
    meta.name = name;
    return meta;
  });
  if (element instanceof HTMLMetaElement) {
    element.content = content;
  }
};

const setMetaProperty = (property: string, content: string) => {
  const selector = `meta[property="${property}"]`;
  const element = ensureMetaElement(selector, () => {
    const meta = document.createElement("meta");
    meta.setAttribute("property", property);
    return meta;
  });
  if (element instanceof HTMLMetaElement) {
    element.content = content;
  }
};

const setCanonicalLink = (href: string) => {
  const element = ensureMetaElement('link[rel="canonical"]', () => {
    const link = document.createElement("link");
    link.rel = "canonical";
    return link;
  });
  if (element instanceof HTMLLinkElement) {
    element.href = href;
  }
};

const buildCanonicalUrl = (baseUrl: string, key: string) =>
  `${window.location.origin}${baseUrl}${key}`;

const updateSeoMetadata = (page: DocPage, canonicalUrl: string) => {
  const pageTitle = getPageLabel(page);
  const description =
    page.summary.trim() || `UI Kit documentation — ${pageTitle}`;
  const title = `${basePageTitle} — ${pageTitle}`;

  document.title = title;
  setMetaName("description", description);
  setMetaProperty("og:title", title);
  setMetaProperty("og:description", description);
  setMetaProperty("og:type", "website");
  setMetaProperty("og:url", canonicalUrl);
  setMetaName("twitter:card", "summary");
  setMetaName("twitter:title", title);
  setMetaName("twitter:description", description);
  setCanonicalLink(canonicalUrl);
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

export const mountDocsApp = async (container: HTMLElement) => {
  const [{ createUikPreferencesController }, { createUikShellRouter }] =
    await Promise.all([
      import("@ismail-elkorchi/ui-tokens"),
      import("@ismail-elkorchi/ui-shell/router"),
    ]);
  const preferences = createUikPreferencesController({
    root: document.documentElement,
    storageKey: "uik-docs-preferences",
    defaults: {
      theme: "system",
      density: "comfortable",
    },
    persist: true,
  });
  const initialPreferences = preferences.apply();
  const baseUrl = normalizeBaseUrl(getBaseUrlFromVite());
  const initialRoute = getRouteFromLocation(baseUrl);
  const initialView = initialRoute.view === "lab" ? "lab" : "docs";
  const initialSubview = initialRoute.subview ?? docsPages[0]?.id;
  const initialPage =
    initialView === "lab"
      ? labPages.find((page) => page.id === initialSubview)
      : docsPages.find((page) => page.id === initialSubview);
  const initialTitle = initialPage?.title ?? "";
  const initialSummary = initialPage?.summary ?? "";
  const initialGroup = initialPage?.group ?? "";
  const initialKind = initialPage?.kind ?? "";
  const initialPackage = initialPage?.package
    ? `@ismail-elkorchi/${initialPage.package}`
    : "";
  const initialHeroLinks = initialPage ? renderHeroLinks(initialPage) : "";
  const initialOutline = initialPage ? renderToc(initialPage) : "";
  const initialTheme = initialPreferences.theme ?? resolveTheme();
  const initialDensity =
    initialPreferences.density ??
    document.documentElement.getAttribute("data-uik-density") ??
    "comfortable";
  const initialStatusMeta = `Theme: ${initialTheme} | Density: ${initialDensity}`;
  const groupBadgeAttr = initialGroup ? "" : " hidden";
  const kindBadgeAttr = initialKind ? "" : " hidden";
  const packageBadgeAttr = initialPackage ? "" : " hidden";
  const heroLinksAttr = initialHeroLinks ? "" : " hidden";
  const baseComponentsPromise = loadBaseComponents();
  const initialPageContent = initialPage
    ? await loadPageContent(initialView, initialPage.id)
    : null;
  await baseComponentsPromise;
  const initialPageSections = initialPageContent
    ? renderPageSections(initialPageContent)
    : "";
  const initialContentBusy = initialPageContent ? "true" : "false";

  container.innerHTML = `
    <nav aria-label="Skip links">
      <a class="docs-skip-link" href="#docs-main">Skip to content</a>
    </nav>
    <uik-shell-layout class="docs-shell" isSecondarySidebarVisible>
      <uik-shell-activity-bar
        slot="activity-bar"
        class="docs-activity-bar"
        data-shell-active-target="view"
        aria-label="Primary navigation"></uik-shell-activity-bar>
      <uik-shell-sidebar
        slot="primary-sidebar"
        id="docs-sidebar"
        class="docs-sidebar"
        heading="Navigation"
        subtitle="UIK"
        aria-label="Docs navigation">
        <uik-tree-view
          class="docs-tree-nav"
          data-docs-nav-tree
          data-shell-active-target="route"
          aria-label="Docs navigation"></uik-tree-view>
        <div slot="footer" class="docs-sidebar-footer">
          <uik-text as="p" size="sm" tone="muted">Tokens-first, standards-based UI.</uik-text>
        </div>
      </uik-shell-sidebar>
      <div slot="main-content" id="docs-main" class="docs-main">
          <div class="docs-page" data-docs-page>
          <uik-page-hero class="docs-hero">
            <div slot="eyebrow" class="docs-hero-top">
              <uik-badge variant="secondary">UIK Docs</uik-badge>
              <uik-badge variant="outline" data-docs-group${groupBadgeAttr}>${escapeHtml(initialGroup)}</uik-badge>
              <uik-badge variant="outline" data-docs-kind${kindBadgeAttr}>${escapeHtml(initialKind)}</uik-badge>
              <uik-badge variant="outline" data-docs-package${packageBadgeAttr}>${escapeHtml(initialPackage)}</uik-badge>
            </div>
            <uik-heading slot="title" level="1" data-docs-title>${escapeHtml(
              initialTitle,
            )}</uik-heading>
            <uik-text slot="summary" as="p" data-docs-summary class="docs-summary">${escapeHtml(
              initialSummary,
            )}</uik-text>
            <nav slot="links" class="docs-hero-links" data-docs-hero-links${heroLinksAttr} aria-label="Jump to sections">${initialHeroLinks}</nav>
          </uik-page-hero>
          <div class="docs-page-content" data-docs-content aria-busy="${initialContentBusy}">${initialPageSections}</div>
        </div>
      </div>
      <uik-shell-secondary-sidebar
        slot="secondary-sidebar"
        class="docs-outline"
        isOpen
        heading="On this page"
        aria-label="On this page">
        <div data-docs-outline>${initialOutline}</div>
      </uik-shell-secondary-sidebar>
      <uik-shell-status-bar
        slot="status-bar"
        class="docs-status"
        message="${escapeHtml(initialTitle)}"
        tone="info"
        meta="${escapeHtml(initialStatusMeta)}">
        <div slot="context-actions" class="docs-context-actions">
          <uik-button
            variant="ghost"
            size="sm"
            data-docs-action="nav-toggle"
            aria-controls="docs-sidebar"
            aria-expanded="false"
          >
            Menu
          </uik-button>
          <uik-button variant="ghost" size="sm" data-docs-action="outline-toggle">Outline</uik-button>
        </div>
        <div slot="global-controls" class="docs-global-controls">
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
          </uik-select>
        </div>
      </uik-shell-status-bar>
    </uik-shell-layout>
  `;
  await nextFrame();

  const pageMap = buildPageMap();
  const routes = buildRoutes(docsPages, labPages);
  const router = createUikShellRouter({
    routes,
    initialView,
    ...(initialSubview ? { initialSubview } : {}),
  });

  const layout = container.querySelector<UikShellLayout>("uik-shell-layout");
  const activityBar = container.querySelector<UikShellActivityBar>(
    "uik-shell-activity-bar",
  );
  const navTree = container.querySelector<UikTreeView>("[data-docs-nav-tree]");
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
  const navToggle = container.querySelector<UikButton>(
    '[data-docs-action="nav-toggle"]',
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
  let commandPalette = container.querySelector<UikCommandPalette>(
    "[data-docs-command-palette]",
  );
  let commandCenter: UikCommandCenterHandle | null = null;
  let contentRenderToken = 0;
  const initialLocationKey = initialPage
    ? locationKey({ view: initialView, subview: initialSubview })
    : "";
  let initialContentReady = Boolean(initialPageContent);
  let initialPageComponentsScheduled = false;
  let prefetchScheduled = false;
  let mobileNavScheduled = false;

  if (!layout || !activityBar || !navTree || !statusBar || !secondarySidebar) {
    throw new Error("Docs layout could not be initialized.");
  }

  if (outlineToggle) {
    secondarySidebar.focusReturnTarget = outlineToggle;
  }

  activityBar.items = buildActivityItems(routes);
  let activeDocPageId = initialView === "docs" ? initialSubview : null;
  let navItems = buildNavItems(baseUrl, docsPages, labPages, activeDocPageId);
  const initialNavId = resolveNavCurrentId(router.current);
  navTree.items = navItems;
  navTree.openIds = collectOpenIds(navItems, initialNavId);
  setOutlineOpen(layout, secondarySidebar, true, { focus: false });
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

  const updateActiveRoute = (
    location: UikShellLocation,
    overrideKey?: string,
  ) => {
    const nextKey = overrideKey?.trim() ?? "";
    layout.activeRouteKey =
      nextKey.length > 0 ? nextKey : resolveNavCurrentId(location);
  };

  const syncCommandCenterOpenButton = () => {
    if (!commandCenter) return;
    commandCenter.setOpenButton(commandPaletteOpenButton);
  };

  let commandCenterInit: Promise<void> | null = null;
  let commandCenterBootstrapActive = false;
  let commandPaletteOpenTarget: UikButton | null = null;
  let commandPaletteOpenHandler: ((event: Event) => void) | null = null;
  const isEditableElement = (element: Element | null) => {
    if (!element) return false;
    const tag = element.tagName;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return true;
    if (element instanceof HTMLElement && element.isContentEditable) {
      return true;
    }
    return ["UIK-INPUT", "UIK-TEXTAREA", "UIK-COMBOBOX"].includes(tag);
  };
  const ensureCommandPaletteElement = async () => {
    if (commandPalette?.isConnected) return commandPalette;
    const existing = container.querySelector<UikCommandPalette>(
      "[data-docs-command-palette]",
    );
    if (existing) {
      commandPalette = existing;
      return commandPalette;
    }
    await Promise.all([
      import("@ismail-elkorchi/ui-primitives/uik-command-palette"),
      import("@ismail-elkorchi/ui-primitives/uik-visually-hidden"),
    ]);
    const palette = document.createElement(
      "uik-command-palette",
    ) as UikCommandPalette;
    palette.className = "docs-command-palette";
    palette.setAttribute("data-docs-command-palette", "");
    palette.setAttribute("placeholder", "Search docs and lab pages");
    palette.innerHTML = `
      <span slot="title">Command palette</span>
      <span slot="description">Type to search docs and lab pages.</span>
      <uik-visually-hidden slot="label">Search commands</uik-visually-hidden>
      <uik-text slot="footer" as="p" size="sm" tone="muted">
        Use Up/Down to navigate, Enter to select, Esc to close.
      </uik-text>
    `;
    container.appendChild(palette);
    commandPalette = palette;
    return commandPalette;
  };
  const ensureCommandCenter = () => {
    if (commandCenterInit) return commandCenterInit;
    commandCenterInit = (async () => {
      const palette = await ensureCommandPaletteElement();
      if (!palette) return;
      const { createUikCommandCenter } =
        await import("@ismail-elkorchi/ui-shell/command-center");
      commandCenter = createUikCommandCenter({
        palette,
        commands: buildCommandPaletteCommands(),
        onSelect: (command) => {
          if (!command.value) return;
          const [view, subview] = command.value.split("/");
          router.navigate(view, subview);
          syncUrl(router.current);
          updateActiveRoute(router.current);
        },
      });
      syncCommandCenterOpenButton();
    })();
    return commandCenterInit;
  };

  const installCommandCenterBootstrap = () => {
    if (commandCenter) return;
    const triggerOpen = () => {
      void ensureCommandCenter().then(() => {
        if (commandPalette) {
          commandPalette.show();
        }
        commandCenter?.open();
      });
    };
    if (!commandCenterBootstrapActive) {
      window.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.defaultPrevented) return;
        if (!event.metaKey && !event.ctrlKey) return;
        if (event.key.toLowerCase() !== "k") return;
        if (isEditableElement(document.activeElement)) return;
        event.preventDefault();
        triggerOpen();
      });
      commandCenterBootstrapActive = true;
    }
    if (
      commandPaletteOpenButton &&
      commandPaletteOpenButton !== commandPaletteOpenTarget
    ) {
      if (commandPaletteOpenTarget && commandPaletteOpenHandler) {
        commandPaletteOpenTarget.removeEventListener(
          "click",
          commandPaletteOpenHandler,
        );
      }
      commandPaletteOpenHandler = (event: Event) => {
        event.preventDefault();
        triggerOpen();
      };
      commandPaletteOpenTarget = commandPaletteOpenButton;
      commandPaletteOpenButton.addEventListener(
        "click",
        commandPaletteOpenHandler,
      );
    }
  };

  const finalizeContentRender = (page: DocPage, token?: number) => {
    if (!contentElement) return;
    if (!prefetchScheduled) {
      prefetchScheduled = true;
      schedulePrefetchComponents();
    }
    if (!mobileNavScheduled) {
      mobileNavScheduled = true;
      scheduleMobileNavOptions(mobileNavSelect);
    }
    const shouldPrefetchCommandCenter =
      contentElement.querySelector(
        '[data-docs-action="command-palette-open"]',
      ) !== null;
    if (shouldPrefetchCommandCenter && !commandCenterInit) {
      void ensureCommandCenter();
    }
    commandPaletteOpenButton = null;
    const needsPortfolio =
      contentElement.querySelector("[data-docs-portfolio]") !== null;
    const needsLabControls =
      page.id === "shell-patterns" ||
      page.id === "overlays" ||
      page.id === "command-palette";
    if (needsPortfolio || needsLabControls) {
      installCommandCenterBootstrap();
      void import("./lab-previews").then((module) => {
        if (token !== undefined && token !== contentRenderToken) return;
        if (!contentElement) return;
        if (needsPortfolio) {
          module.wirePortfolioPreviews(contentElement);
        }
        if (page.id === "shell-patterns") {
          module.wireLabShellControls(
            contentElement,
            statusBar,
            layout,
            secondarySidebar,
            setOutlineOpen,
          );
        }
        if (page.id === "overlays") {
          module.wireLabOverlayControls(contentElement);
        }
        if (page.id === "command-palette") {
          commandPaletteOpenButton =
            module.wireLabCommandPaletteControls(contentElement);
        }
        syncCommandCenterOpenButton();
        installCommandCenterBootstrap();
      });
    } else {
      syncCommandCenterOpenButton();
      installCommandCenterBootstrap();
    }
  };

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
      finalizeContentRender(page, token);
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
    const isInitialContent = initialContentReady && key === initialLocationKey;

    updateActiveRoute(location);
    const nextDocPageId =
      location.view === "docs"
        ? (location.subview ?? docsPages[0]?.id ?? null)
        : null;
    if (nextDocPageId !== activeDocPageId) {
      activeDocPageId = nextDocPageId;
      navItems = buildNavItems(baseUrl, docsPages, labPages, activeDocPageId);
      navTree.items = navItems;
    }
    navTree.openIds = collectOpenIds(navItems, resolveNavCurrentId(location));

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
      if (!isInitialContent) {
        contentElement.innerHTML = "";
        contentElement.setAttribute("aria-busy", "true");
      }
    }
    if (outlineElement) outlineElement.innerHTML = renderToc(page);
    if (mobileNavSelect) {
      mobileNavSelect.value = key;
    }

    statusBar.message = page.title;
    if (page.id !== "shell-patterns") statusBar.tone = "info";
    updateStatusMeta(statusBar);
    const canonicalUrl = buildCanonicalUrl(baseUrl, key);
    updateSeoMetadata(page, canonicalUrl);
    if (isInitialContent) {
      initialContentReady = false;
      finalizeContentRender(page, contentRenderToken);
      if (initialPageContent && !initialPageComponentsScheduled) {
        initialPageComponentsScheduled = true;
        schedulePageComponents(initialPageContent, () => {
          if (contentElement) {
            contentElement.setAttribute("aria-busy", "false");
          }
        });
      }
      void scrollToHashTarget();
    } else {
      void renderPageContent(location.view as "docs" | "lab", page);
    }
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
    updateActiveRoute(router.current);
    void scrollToHashTarget();
  });

  activityBar.addEventListener("activity-bar-select", (event: Event) => {
    const detail = (event as CustomEvent<{ id: string }>).detail;
    router.navigate(detail.id);
    syncUrl(router.current);
    updateActiveRoute(router.current);
  });

  navTree.addEventListener("tree-view-activate", (event: Event) => {
    const detail = (event as CustomEvent<{ id: string }>).detail;
    const [view, subviewWithHash] = detail.id.split("/");
    if (!view || !subviewWithHash) return;
    const [subview, hash] = subviewWithHash.split("#");
    if (!subview) return;
    router.navigate(view, subview);
    const nextKey = `${view}/${subview}`;
    const nextPath = hash
      ? `${baseUrl}${nextKey}#${hash}`
      : `${baseUrl}${nextKey}`;
    window.history.pushState({}, "", nextPath);
    updateActiveRoute(router.current, detail.id);
    void scrollToHashTarget();
  });

  outlineToggle?.addEventListener("click", () => {
    setOutlineOpen(layout, secondarySidebar, !secondarySidebar.isOpen, {
      focus: true,
    });
  });

  navToggle?.addEventListener("click", () => {
    layout.isPrimarySidebarOpen = true;
  });

  layout.addEventListener("primary-sidebar-open", () => {
    navToggle?.setAttribute("aria-expanded", "true");
  });

  layout.addEventListener("primary-sidebar-close", () => {
    navToggle?.setAttribute("aria-expanded", "false");
  });

  secondarySidebar.addEventListener("secondary-sidebar-close", () => {
    setOutlineOpen(layout, secondarySidebar, false, { focus: true });
  });

  themeSelect?.addEventListener("change", () => {
    preferences.setTheme(themeSelect.value);
    updateStatusMeta(statusBar);
  });

  densitySelect?.addEventListener("change", () => {
    preferences.setDensity(densitySelect.value);
    updateStatusMeta(statusBar);
  });

  mobileNavSelect?.addEventListener("change", () => {
    const [view, subview] = mobileNavSelect.value.split("/");
    if (!view || !subview) return;
    router.navigate(view, subview);
    syncUrl(router.current);
    updateActiveRoute(router.current);
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
