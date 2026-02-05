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
  componentPageIds,
  docsPages,
  ensureComponentPages,
  getAllDocsPages,
  getPublicDocsPages,
  isPublicPage,
  labPages,
  publicDocsNavPages,
  publicLabPages,
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
  const subview = segments.length > 1 ? segments.slice(1).join("/") : undefined;
  return { view, subview };
};

const buildRoutes = (
  docsPageList: DocPage[] = docsPages,
  labPageList: DocPage[] = labPages,
  publicDocsList: DocPage[] = publicDocsNavPages,
  publicLabList: DocPage[] = publicLabPages,
  componentSubviewIds: string[] = componentPageIds,
): UikShellRoute[] => {
  const docsSubviewIds = [
    ...docsPageList.map((page) => page.id),
    ...componentSubviewIds,
  ];
  const uniqueDocsSubviewIds = Array.from(new Set(docsSubviewIds));
  const labSubviewIds = labPageList.map((page) => page.id);
  const docsDefault = publicDocsList[0]?.id ?? uniqueDocsSubviewIds[0];
  const labDefault = publicLabList[0]?.id ?? labSubviewIds[0];

  const createRoute = (
    id: string,
    label: string,
    subviews: string[],
    defaultSubview?: string,
  ): UikShellRoute => {
    if (subviews.length === 0) return { id, label };
    return {
      id,
      label,
      subviews,
      defaultSubview: defaultSubview ?? subviews[0],
    };
  };

  return [
    createRoute("docs", "Docs", uniqueDocsSubviewIds, docsDefault),
    createRoute("lab", "Examples", labSubviewIds, labDefault),
  ];
};

const buildActivityItems = (
  routes: UikShellRoute[],
): UikShellActivityBarItem[] => {
  const icons = {
    docs: "M4 5a2 2 0 012-2h10a2 2 0 012 2v14a1 1 0 01-1 1h-2a2 2 0 00-2 2H6a2 2 0 01-2-2V5z",
    lab: "M3 3h6v6H3V3zm0 8h6v6H3v-6zm8-8h6v6h-6V3zm0 8h6v6h-6v-6z",
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

const docsGroupOrder = [
  "Guides",
  "Foundations",
  "Components",
  "Patterns",
  "Examples",
];
const componentSectionShortcuts: Record<string, string[]> = {
  primitives: ["Portfolio", "Usage", "Contracts"],
  shell: ["Portfolio", "Layout layer", "Contracts"],
};

const componentTagPattern = /<\s*(uik-[a-z0-9-]+)/g;
const coreComponentLoaders = new Map<string, () => Promise<unknown>>([
  ["uik-badge", () => import("@ismail-elkorchi/ui-primitives/uik-badge")],
  ["uik-button", () => import("@ismail-elkorchi/ui-primitives/uik-button")],
  [
    "uik-code-block",
    () => import("@ismail-elkorchi/ui-primitives/uik-code-block"),
  ],
  ["uik-heading", () => import("@ismail-elkorchi/ui-primitives/uik-heading")],
  ["uik-link", () => import("@ismail-elkorchi/ui-primitives/uik-link")],
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
  ["uik-select", () => import("@ismail-elkorchi/ui-primitives/uik-select")],
  ["uik-text", () => import("@ismail-elkorchi/ui-primitives/uik-text")],
  [
    "uik-tree-view",
    () => import("@ismail-elkorchi/ui-primitives/uik-tree-view"),
  ],
]);
let extendedComponentLoaders: Map<string, () => Promise<unknown>> | null = null;
let extendedComponentLoadersPromise: Promise<
  Map<string, () => Promise<unknown>>
> | null = null;
const loadExtendedComponentLoaders = async () => {
  if (extendedComponentLoaders) return extendedComponentLoaders;
  if (!extendedComponentLoadersPromise) {
    extendedComponentLoadersPromise = import("./component-loaders").then(
      (module) => {
        extendedComponentLoaders = module.extendedComponentLoaders;
        return extendedComponentLoaders;
      },
    );
  }
  return extendedComponentLoadersPromise;
};
let labPreviewsModule: typeof import("./lab-previews") | null = null;
let labPreviewsPromise: Promise<typeof import("./lab-previews")> | null = null;
const loadLabPreviews = async () => {
  if (labPreviewsModule) return labPreviewsModule;
  if (!labPreviewsPromise) {
    labPreviewsPromise = import("./lab-previews").then((module) => {
      labPreviewsModule = module;
      return module;
    });
  }
  return labPreviewsPromise;
};
const prefetchedComponents = new Set([
  "uik-description-list",
  "uik-input",
  "uik-progress",
  "uik-radio",
  "uik-radio-group",
  "uik-stack",
  "uik-switch",
]);
const publicBaseComponentTags = [
  "uik-shell-layout",
  "uik-shell-activity-bar",
  "uik-shell-sidebar",
  "uik-shell-secondary-sidebar",
  "uik-shell-status-bar",
  "uik-badge",
  "uik-button",
  "uik-code-block",
  "uik-heading",
  "uik-link",
  "uik-page-hero",
  "uik-section-card",
  "uik-select",
  "uik-text",
  "uik-tree-view",
];
const internalBaseComponentTags = [
  "uik-shell-layout",
  "uik-shell-activity-bar",
  "uik-shell-sidebar",
  "uik-shell-secondary-sidebar",
  "uik-shell-status-bar",
  "uik-button",
  "uik-code-block",
  "uik-heading",
  "uik-link",
  "uik-section-card",
  "uik-select",
  "uik-text",
  "uik-tree-view",
];
const baseComponentBundleTags = new Set([
  ...publicBaseComponentTags,
  ...internalBaseComponentTags,
]);
const preloadedComponents = new Set();
const loadedComponents = new Set(preloadedComponents);
const pendingComponents = new Map<string, Promise<unknown>>();
let baseComponentBundlePromise: Promise<void> | null = null;

const loadBaseComponentBundle = () => {
  if (!baseComponentBundlePromise) {
    baseComponentBundlePromise = import("./base-components").then(() => {
      baseComponentBundleTags.forEach((tag) => {
        loadedComponents.add(tag);
      });
    });
  }
  return baseComponentBundlePromise;
};


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
  docsPageList: DocPage[] = publicDocsNavPages,
  labPageList: DocPage[] = publicLabPages,
  activeDocPageId?: string | null,
): UikNavItem[] => {
  const base = normalizeBaseUrl(baseUrl);
  const toHref = (key: string) => `${base}${key}`;

  const items: UikNavItem[] = [
    {
      id: "docs",
      label: "Docs",
      children: buildDocsGroupItems(docsPageList, baseUrl, activeDocPageId),
    },
  ];
  if (labPageList.length > 0) {
    items.push({
      id: "lab",
      label: "Examples",
      children: labPageList.map((page) => ({
        id: `lab/${page.id}`,
        label: getPageLabel(page),
        href: toHref(`lab/${page.id}`),
      })),
    });
  }
  return items;
};

const buildMobileNavOptions = (
  docsPageList: DocPage[] = publicDocsNavPages,
  labPageList: DocPage[] = publicLabPages,
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

  const labGroup = labOptions
    ? `<optgroup label="Examples">${labOptions}</optgroup>`
    : "";

  return `
    ${docsOptions}
    ${labGroup}
  `;
};

type CommandPaletteCommand = UikCommandCenterCommand & { value: string };

const buildCommandPaletteCommands = (
  docsPageList: DocPage[] = getPublicDocsPages(),
  labPageList: DocPage[] = publicLabPages,
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
  addItems("lab", labPageList, "Examples");
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

const splitViewAndSubview = (value: string) => {
  const [view, ...rest] = value.split("/");
  const subview = rest.join("/");
  return { view, subview };
};

const normalizeNavSubview = (view: string, subview?: string) => {
  if (view === "docs" && subview?.startsWith("components/")) {
    return "components";
  }
  return subview;
};

const resolveNavCurrentId = (location: UikShellLocation) => {
  const subview = normalizeNavSubview(location.view, location.subview);
  const key = subview ? `${location.view}/${subview}` : location.view;
  const hash = window.location.hash;
  return hash ? `${key}${hash}` : key;
};

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const scheduleIdleTask = (task: () => Promise<void>) =>
  new Promise<void>((resolve) => {
    const run = () => {
      task().finally(resolve);
    };
    if ("requestIdleCallback" in window) {
      (
        window as Window & {
          requestIdleCallback: (
            callback: IdleRequestCallback,
            options?: IdleRequestOptions,
          ) => number;
        }
      ).requestIdleCallback(
        () => {
          run();
        },
        { timeout: 1500 },
      );
    } else {
      globalThis.setTimeout(() => {
        run();
      }, 0);
    }
  });

const collectPageComponentTags = (page: DocPageContent) => {
  const tags = new Set<string>();
  for (const section of page.sections) {
    const scrubbed = section.body
      .replace(/<uik-code-block[\s\S]*?<\/uik-code-block>/gi, "")
      .replace(/<pre[\s\S]*?<\/pre>/gi, "");
    componentTagPattern.lastIndex = 0;
    let match = componentTagPattern.exec(scrubbed);
    while (match) {
      tags.add(match[1]);
      match = componentTagPattern.exec(scrubbed);
    }
  }
  return tags;
};

const pageHasPortfolio = (page: DocPageContent | null) =>
  Boolean(
    page?.sections.some((section) =>
      section.body.includes("data-docs-portfolio"),
    ),
  );

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

const resolveComponentLoaders = async (tags: Iterable<string>) => {
  const queue: Array<[string, () => Promise<unknown>]> = [];
  let extended: Map<string, () => Promise<unknown>> | null = null;
  for (const tag of tags) {
    if (loadedComponents.has(tag)) continue;
    let loader = coreComponentLoaders.get(tag);
    if (!loader) {
      if (!extended) {
        extended = await loadExtendedComponentLoaders();
      }
      loader = extended.get(tag);
    }
    if (loader) {
      queue.push([tag, loader]);
    }
  }
  return queue;
};

const loadComponents = async (tags: Iterable<string>) => {
  const queue = await resolveComponentLoaders(tags);
  await Promise.all(
    queue.map(([tag, loader]) => {
      if (!tag || !loader) return Promise.resolve();
      return loadComponent(tag, loader);
    }),
  );
};

const prefetchComponents = async () => {
  const queue = await resolveComponentLoaders(prefetchedComponents);
  queue.forEach(([tag, loader]) => {
    void loadComponent(tag, loader);
  });
};

const loadPageComponents = async (page: DocPageContent) => {
  const tags = collectPageComponentTags(page);
  await loadComponents(tags);
};

const loadBaseComponents = (tags: string[]) => {
  if (!tags.length) return Promise.resolve();
  return loadBaseComponentBundle();
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
      buildMobileNavOptions(publicDocsNavPages, publicLabPages),
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

const updateSeoMetadata = (
  page: DocPage,
  canonicalUrl: string,
  isInternal: boolean,
) => {
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
  setMetaName("robots", isInternal ? "noindex,nofollow" : "index,follow");
  setCanonicalLink(canonicalUrl);
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
  const tokensPromise = import("@ismail-elkorchi/ui-tokens");
  const routerPromise = import("@ismail-elkorchi/ui-shell/router");
  const baseUrl = normalizeBaseUrl(getBaseUrlFromVite());
  const initialRoute = getRouteFromLocation(baseUrl);
  const initialView = initialRoute.view === "lab" ? "lab" : "docs";
  const defaultDocsSubview = publicDocsNavPages[0]?.id ?? docsPages[0]?.id;
  const defaultLabSubview = publicLabPages[0]?.id ?? labPages[0]?.id;
  const initialSubview =
    initialRoute.subview ??
    (initialView === "lab" ? defaultLabSubview : defaultDocsSubview);
  const needsComponentPages =
    initialView === "docs" &&
    Boolean(initialSubview) &&
    componentPageIds.includes(initialSubview);
  if (needsComponentPages) {
    await ensureComponentPages();
  }
  const docsPageList = getAllDocsPages();
  const initialPage =
    initialView === "lab"
      ? labPages.find((page) => page.id === initialSubview)
      : docsPageList.find((page) => page.id === initialSubview);
  const initialTitle = initialPage?.title ?? "";
  const initialSummary = initialPage?.summary ?? "";
  const initialGroup = initialPage?.group ?? "";
  const initialKind = initialPage?.kind ?? "";
  const initialPackage = initialPage?.package
    ? `@ismail-elkorchi/${initialPage.package}`
    : "";
  const initialHeroLinks = initialPage ? renderHeroLinks(initialPage) : "";
  const initialOutline = initialPage ? renderToc(initialPage) : "";
  const initialIsInternal = initialPage ? !isPublicPage(initialPage) : false;
  const initialTheme = resolveTheme();
  const initialDensity =
    document.documentElement.getAttribute("data-uik-density") ?? "comfortable";
  const initialStatusMeta = `Theme: ${initialTheme} | Density: ${initialDensity}`;
  const groupBadgeAttr = initialGroup ? "" : " hidden";
  const kindBadgeAttr = initialKind ? "" : " hidden";
  const packageBadgeAttr = initialPackage ? "" : " hidden";
  const heroLinksAttr = initialHeroLinks ? "" : " hidden";
  const fixtureHiddenAttr = initialIsInternal ? "" : " hidden";
  const outlineHiddenAttr = initialIsInternal ? " hidden" : "";
  const outlineOpenAttr = initialIsInternal ? "" : " isOpen";
  const secondaryVisibleAttr = initialIsInternal
    ? ""
    : " isSecondarySidebarVisible";
  const initialPageContentPromise = initialPage
    ? loadPageContent(initialView as "docs" | "lab", initialPage.id)
    : null;
  const initialPageContent = initialPageContentPromise
    ? await initialPageContentPromise
    : null;
  const baseComponentsPromise = loadBaseComponents(
    initialIsInternal ? internalBaseComponentTags : publicBaseComponentTags,
  );
  let initialPageComponentsPromise: Promise<void> | null = null;
  const ensureInitialPageComponents = () => {
    if (initialPageComponentsPromise) return initialPageComponentsPromise;
    if (!initialPageContent) return null;
    initialPageComponentsPromise = loadPageComponents(initialPageContent);
    return initialPageComponentsPromise;
  };
  const initialPageSections = initialPageContent
    ? renderPageSections(initialPageContent)
    : "";
  const initialNeedsPortfolio = pageHasPortfolio(initialPageContent);
  const initialNeedsLabControls =
    initialPage?.id === "shell-patterns" ||
    initialPage?.id === "overlays" ||
    initialPage?.id === "command-palette";
  if (initialNeedsPortfolio || initialNeedsLabControls) {
    await loadLabPreviews();
  }
  const initialContentBusy =
    initialPageContent || initialPage ? "true" : "false";
  const heroMarkup = initialIsInternal
    ? ""
    : `
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
          `;
  const globalControlsMarkup = initialIsInternal
    ? ""
    : `
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
        `;

  container.innerHTML = `
    <nav aria-label="Skip links">
      <a class="docs-skip-link" href="#docs-main">Skip to content</a>
    </nav>
    <uik-shell-layout class="docs-shell"${secondaryVisibleAttr}>
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
          <header class="docs-fixture-header" data-docs-fixture${fixtureHiddenAttr}>
            <h1 class="docs-fixture-title" data-docs-fixture-title>${escapeHtml(
              initialTitle,
            )}</h1>
            <p class="docs-summary docs-fixture-summary" data-docs-fixture-summary>${escapeHtml(
              initialSummary,
            )}</p>
          </header>
          ${heroMarkup}
          <div class="docs-page-content" data-docs-content aria-busy="${initialContentBusy}">${initialPageSections}</div>
        </div>
      </div>
      <uik-shell-secondary-sidebar${outlineOpenAttr}${outlineHiddenAttr}
        slot="secondary-sidebar"
        class="docs-outline"
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
        ${globalControlsMarkup}
      </uik-shell-status-bar>
    </uik-shell-layout>
  `;
  if (initialNeedsPortfolio && labPreviewsModule) {
    labPreviewsModule.wirePortfolioPreviews(container);
  }
  if (initialPageContent) {
    const schedule = () => {
      void ensureInitialPageComponents();
    };
    if ("requestIdleCallback" in window) {
      (
        window as Window & {
          requestIdleCallback: (
            callback: IdleRequestCallback,
            options?: IdleRequestOptions,
          ) => number;
        }
      ).requestIdleCallback(schedule);
    } else {
      globalThis.setTimeout(schedule, 0);
    }
  }
  await baseComponentsPromise;
  await nextFrame();

  const [{ createUikPreferencesController }, { createUikShellRouter }] =
    await Promise.all([tokensPromise, routerPromise]);
  const preferences = createUikPreferencesController({
    root: document.documentElement,
    storageKey: "uik-docs-preferences",
    defaults: {
      theme: "system",
      density: "comfortable",
    },
    persist: true,
  });
  preferences.apply();

  let pageMap = buildPageMap();
  const routes = buildRoutes(
    docsPages,
    labPages,
    publicDocsNavPages,
    publicLabPages,
    componentPageIds,
  );
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
  const heroElement = container.querySelector<HTMLElement>(".docs-hero");
  const fixtureHeader = container.querySelector<HTMLElement>(
    "[data-docs-fixture]",
  );
  const fixtureTitle = container.querySelector<HTMLElement>(
    "[data-docs-fixture-title]",
  );
  const fixtureSummary = container.querySelector<HTMLElement>(
    "[data-docs-fixture-summary]",
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

  let outlineRestoreState = secondarySidebar.isOpen;
  let hadInternalOverride = false;

  if (outlineToggle) {
    secondarySidebar.focusReturnTarget = outlineToggle;
  }

  activityBar.items = buildActivityItems(routes);
  let activeDocPageId = initialView === "docs" ? initialSubview : null;
  let navItems = buildNavItems(
    baseUrl,
    publicDocsNavPages,
    publicLabPages,
    activeDocPageId,
  );
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

  const setFixtureContent = (page: DocPage) => {
    if (fixtureTitle) fixtureTitle.textContent = page.title;
    if (fixtureSummary) {
      const nextSummary = page.summary?.trim() ?? "";
      fixtureSummary.textContent = nextSummary;
      fixtureSummary.toggleAttribute("hidden", nextSummary.length === 0);
    }
  };

  const updateFixtureLayout = (page: DocPage) => {
    const isInternal = !isPublicPage(page);
    heroElement?.toggleAttribute("hidden", isInternal);
    fixtureHeader?.toggleAttribute("hidden", !isInternal);
    secondarySidebar.toggleAttribute("hidden", isInternal);
    if (outlineToggle) outlineToggle.toggleAttribute("hidden", isInternal);

    if (isInternal) {
      if (!hadInternalOverride) {
        outlineRestoreState = secondarySidebar.isOpen;
        hadInternalOverride = true;
      }
      setOutlineOpen(layout, secondarySidebar, false, { focus: false });
    } else if (hadInternalOverride) {
      setOutlineOpen(layout, secondarySidebar, outlineRestoreState, {
        focus: false,
      });
      hadInternalOverride = false;
    }
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
    palette.setAttribute("placeholder", "Search docs and examples");
    palette.innerHTML = `
      <span slot="title">Command palette</span>
      <span slot="description">Type to search docs and examples.</span>
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
      await ensureComponentPages();
      const { createUikCommandCenter } =
        await import("@ismail-elkorchi/ui-shell/command-center");
      commandCenter = createUikCommandCenter({
        palette,
        commands: buildCommandPaletteCommands(),
        onSelect: (command) => {
          if (!command.value) return;
          const { view, subview } = splitViewAndSubview(command.value);
          if (!view || !subview) return;
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
    if (token !== undefined && token !== contentRenderToken) return;
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
      const applyLabPreviews = (module: typeof import("./lab-previews")) => {
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
      };
      if (labPreviewsModule) {
        applyLabPreviews(labPreviewsModule);
      } else {
        void loadLabPreviews().then((module) => {
          if (token !== undefined && token !== contentRenderToken) return;
          applyLabPreviews(module);
        });
      }
    } else {
      syncCommandCenterOpenButton();
      installCommandCenterBootstrap();
    }
  };

  const renderPageContent = async (view: "docs" | "lab", page: DocPage) => {
    const token = (contentRenderToken += 1);
    const isInitialPage = Boolean(
      initialPage &&
      view === initialView &&
      page.id === initialPage.id &&
      initialPageContentPromise,
    );
    const shouldReuseInitialContent = Boolean(
      isInitialPage && initialPageContent,
    );
    if (contentElement) {
      contentElement.setAttribute("aria-busy", "true");
      if (!shouldReuseInitialContent) {
        contentElement.innerHTML = "";
      }
    }
    const pageContent = isInitialPage
      ? await initialPageContentPromise
      : await loadPageContent(view, page.id);
    if (token !== contentRenderToken) return;

    const shouldAwaitComponents = page.id !== "command-palette";
    const needsLabPreviews =
      pageHasPortfolio(pageContent) ||
      page.id === "shell-patterns" ||
      page.id === "overlays" ||
      page.id === "command-palette";
    if (needsLabPreviews) {
      await loadLabPreviews();
    }
    const loadPromise = isInitialPage
      ? (ensureInitialPageComponents() ?? loadPageComponents(pageContent))
      : loadPageComponents(pageContent);
    if (shouldAwaitComponents) {
      await loadPromise;
    }
    if (token !== contentRenderToken) return;

    if (contentElement) {
      if (!shouldReuseInitialContent) {
        contentElement.innerHTML = renderPageSections(pageContent);
      }
      contentElement.setAttribute("aria-busy", "false");
      finalizeContentRender(page, token);
    }

    if (!shouldAwaitComponents) {
      void loadPromise;
    }
    if (token !== contentRenderToken) return;

    void scrollToHashTarget();
  };

  const applyLocation = async (location: UikShellLocation) => {
    const key = locationKey(location);
    let page = pageMap.get(key);
    if (
      !page &&
      location.view === "docs" &&
      location.subview &&
      componentPageIds.includes(location.subview)
    ) {
      await ensureComponentPages();
      pageMap = buildPageMap();
      page = pageMap.get(key);
    }
    if (!page) return;
    const isInternal = !isPublicPage(page);
    const isInitialContent = initialContentReady && key === initialLocationKey;

    updateActiveRoute(location);
    const nextDocPageId =
      location.view === "docs"
        ? (normalizeNavSubview(location.view, location.subview) ??
          docsPages[0]?.id ??
          null)
        : null;
    if (nextDocPageId !== activeDocPageId) {
      activeDocPageId = nextDocPageId;
      navItems = buildNavItems(
        baseUrl,
        publicDocsNavPages,
        publicLabPages,
        activeDocPageId,
      );
      navTree.items = navItems;
    }
    navTree.openIds = collectOpenIds(navItems, resolveNavCurrentId(location));

    if (titleElement) titleElement.textContent = page.title;
    if (summaryElement) summaryElement.textContent = page.summary;
    setFixtureContent(page);
    updateFixtureLayout(page);
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
    updateSeoMetadata(page, canonicalUrl, isInternal);
    if (isInitialContent) {
      initialContentReady = false;
      finalizeContentRender(page, contentRenderToken);
      if (initialPageContent && !initialPageComponentsScheduled) {
        initialPageComponentsScheduled = true;
        const loadPromise =
          ensureInitialPageComponents() ??
          loadPageComponents(initialPageContent);
        loadPromise.finally(() => {
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

  router.subscribe((location) => {
    void applyLocation(location);
  });
  syncUrl(router.current, "replace");

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
    const [path, hash] = detail.id.split("#");
    const { view, subview } = splitViewAndSubview(path);
    if (!view || !subview) return;
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
    const { view, subview } = splitViewAndSubview(mobileNavSelect.value);
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
