import type {
  UikButton,
  UikDialog,
  UikInput,
  UikNav,
  UikNavItem,
  UikProgress,
  UikRadioGroup,
  UikSelect,
  UikSwitch,
} from '@ismail-elkorchi/ui-primitives';
import '@ismail-elkorchi/ui-primitives/register';
import {
  createUikShellRouter,
  type UikShellActivityBar,
  type UikShellActivityBarItem,
  type UikShellLayout,
  type UikShellLocation,
  type UikShellSecondarySidebar,
  type UikShellStatusBar,
  type UikShellRoute,
} from '@ismail-elkorchi/ui-shell';
import '@ismail-elkorchi/ui-shell/register';

import {buildPageMap, docsPages, labPages, renderPageSections, renderToc} from './content';

const ensureDefaultAttribute = (target: HTMLElement, name: string, fallback: string) => {
  if (!target.getAttribute(name)) target.setAttribute(name, fallback);
};

const buildRoutes = (): UikShellRoute[] => {
  const docsSubviewIds = docsPages.map(page => page.id);
  const labSubviewIds = labPages.map(page => page.id);

  return [
    {
      id: 'docs',
      label: 'Docs',
      subviews: docsSubviewIds,
      defaultSubview: docsSubviewIds[0],
    },
    {
      id: 'lab',
      label: 'Lab',
      subviews: labSubviewIds,
      defaultSubview: labSubviewIds[0],
    },
  ];
};

const buildActivityItems = (routes: UikShellRoute[]): UikShellActivityBarItem[] => {
  const icons: Record<string, string> = {
    docs: 'M4 5a2 2 0 012-2h10a2 2 0 012 2v14a1 1 0 01-1 1h-2a2 2 0 00-2 2H6a2 2 0 01-2-2V5z',
    lab: 'M9 2h6l3 7-6 13-6-13 3-7z',
  };

  return routes.map(route => ({
    id: route.id,
    label: route.label ?? route.id,
    icon: icons[route.id] ?? icons.docs,
  }));
};

const buildNavItems = (): UikNavItem[] => [
  {
    id: 'docs',
    label: 'Docs',
    children: docsPages.map(page => ({
      id: `docs/${page.id}`,
      label: page.title,
      href: `#docs/${page.id}`,
    })),
  },
  {
    id: 'lab',
    label: 'Lab',
    children: labPages.map(page => ({
      id: `lab/${page.id}`,
      label: page.title,
      href: `#lab/${page.id}`,
    })),
  },
];

const buildMobileNavOptions = () => {
  const docsOptions = docsPages
    .map(page => `<option value="docs/${page.id}">${page.title}</option>`)
    .join('');
  const labOptions = labPages
    .map(page => `<option value="lab/${page.id}">${page.title}</option>`)
    .join('');

  return `
    <optgroup label="Docs">${docsOptions}</optgroup>
    <optgroup label="Lab">${labOptions}</optgroup>
  `;
};

const locationKey = (location: UikShellLocation) =>
  location.subview ? `${location.view}/${location.subview}` : location.view;

const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

const setOutlineOpen = (
  layout: UikShellLayout,
  secondary: UikShellSecondarySidebar,
  isOpen: boolean,
) => {
  secondary.isOpen = isOpen;
  layout.isSecondarySidebarVisible = isOpen;
};

const updateStatusMeta = (statusBar: UikShellStatusBar) => {
  const root = document.documentElement;
  const theme = root.getAttribute('data-uik-theme') ?? 'light';
  const density = root.getAttribute('data-uik-density') ?? 'comfortable';
  statusBar.meta = `Theme: ${theme} | Density: ${density}`;
};

const wireLabShellControls = (
  container: HTMLElement,
  statusBar: UikShellStatusBar,
  layout: UikShellLayout,
  secondary: UikShellSecondarySidebar,
) => {
  const messageInput = container.querySelector<UikInput>('[data-docs-control="status-message"]');
  if (messageInput) {
    messageInput.value = statusBar.message;
    messageInput.addEventListener('input', () => {
      statusBar.message = messageInput.value;
    });
  }

  const toneGroup = container.querySelector<UikRadioGroup>('[data-docs-control="status-tone"]');
  if (toneGroup) {
    toneGroup.value = statusBar.tone;
    toneGroup.addEventListener('change', () => {
      statusBar.tone = toneGroup.value as UikShellStatusBar['tone'];
    });
  }

  const secondaryToggle = container.querySelector<UikSwitch>('[data-docs-control="secondary-toggle"]');
  if (secondaryToggle) {
    secondary.focusReturnTarget = secondaryToggle;
    secondaryToggle.checked = secondary.isOpen;
    secondaryToggle.addEventListener('change', () => {
      setOutlineOpen(layout, secondary, secondaryToggle.checked);
    });
  }
};

const wireLabOverlayControls = (container: HTMLElement) => {
  const dialog = container.querySelector<UikDialog>('[data-docs-dialog]');
  const dialogOpen = container.querySelector<UikButton>('[data-docs-action="dialog-open"]');
  const dialogClose = container.querySelector<UikButton>('[data-docs-action="dialog-close"]');

  if (dialog && dialogOpen) {
    dialogOpen.addEventListener('click', () => dialog.showModal());
  }

  if (dialog && dialogClose) {
    dialogClose.addEventListener('click', () => dialog.close());
  }

  const progress = container.querySelector<UikProgress>('[data-docs-progress]');
  const progressToggle = container.querySelector<UikButton>('[data-docs-action="progress-toggle"]');

  if (progress && progressToggle) {
    progressToggle.addEventListener('click', () => {
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

export const mountDocsApp = (container: HTMLElement) => {
  ensureDefaultAttribute(document.documentElement, 'data-uik-theme', 'light');
  ensureDefaultAttribute(document.documentElement, 'data-uik-density', 'comfortable');

  container.innerHTML = `
    <a class="docs-skip-link" href="#docs-main">Skip to content</a>
    <uik-shell-layout class="docs-shell">
      <uik-shell-activity-bar
        slot="activity-bar"
        class="docs-activity-bar"
        aria-label="Primary navigation"></uik-shell-activity-bar>
      <uik-shell-sidebar slot="primary-sidebar" class="docs-sidebar" heading="Navigation" subtitle="UIK">
        <uik-nav class="docs-nav" aria-label="Docs navigation"></uik-nav>
        <div slot="footer" class="docs-sidebar-footer">
          <uik-text as="p" size="sm" tone="muted">Tokens-first, standards-based UI.</uik-text>
        </div>
      </uik-shell-sidebar>
      <main slot="main-content" id="docs-main" class="docs-main">
        <div class="docs-page" data-docs-page>
          <uik-surface variant="card" bordered class="docs-hero">
            <uik-box padding="5">
              <div class="docs-hero-inner">
                <div class="docs-hero-top">
                  <uik-badge variant="secondary">UIK Docs</uik-badge>
                  <uik-badge variant="outline">Tokens + Primitives + Shell</uik-badge>
                </div>
                <uik-heading level="1" data-docs-title></uik-heading>
                <uik-text as="p" data-docs-summary class="docs-summary"></uik-text>
                <div class="docs-hero-actions">
                  <div class="docs-hero-controls">
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
                  <uik-button variant="ghost" size="sm" data-docs-action="outline-toggle">Outline</uik-button>
                </div>
              </div>
            </uik-box>
          </uik-surface>
          <div class="docs-page-content" data-docs-content></div>
        </div>
      </main>
      <uik-shell-secondary-sidebar slot="secondary-sidebar" class="docs-outline" heading="On this page">
        <div data-docs-outline></div>
      </uik-shell-secondary-sidebar>
      <uik-shell-status-bar slot="status-bar" class="docs-status"></uik-shell-status-bar>
    </uik-shell-layout>
  `;

  const pageMap = buildPageMap();
  const routes = buildRoutes();
  const router = createUikShellRouter({
    routes,
    initialView: 'docs',
    initialSubview: docsPages[0]?.id,
  });

  const layout = container.querySelector<UikShellLayout>('uik-shell-layout');
  const activityBar = container.querySelector<UikShellActivityBar>('uik-shell-activity-bar');
  const nav = container.querySelector<UikNav>('uik-nav');
  const statusBar = container.querySelector<UikShellStatusBar>('uik-shell-status-bar');
  const secondarySidebar = container.querySelector<UikShellSecondarySidebar>('uik-shell-secondary-sidebar');
  const titleElement = container.querySelector<HTMLElement>('[data-docs-title]');
  const summaryElement = container.querySelector<HTMLElement>('[data-docs-summary]');
  const contentElement = container.querySelector<HTMLElement>('[data-docs-content]');
  const outlineElement = container.querySelector<HTMLElement>('[data-docs-outline]');
  const outlineToggle = container.querySelector<UikButton>('[data-docs-action="outline-toggle"]');
  const themeSelect = container.querySelector<UikSelect>('uik-select[data-docs-control="theme"]');
  const densitySelect = container.querySelector<UikSelect>('uik-select[data-docs-control="density"]');
  const mobileNavSelect = container.querySelector<UikSelect>('uik-select[data-docs-control="mobile-nav"]');

  if (!layout || !activityBar || !nav || !statusBar || !secondarySidebar) {
    throw new Error('Docs layout could not be initialized.');
  }

  activityBar.items = buildActivityItems(routes);
  nav.items = buildNavItems();
  nav.openIds = ['docs', 'lab'];
  setOutlineOpen(layout, secondarySidebar, true);

  const applyLocation = (location: UikShellLocation) => {
    const key = locationKey(location);
    const page = pageMap.get(key);
    if (!page) return;

    activityBar.activeId = location.view;

    const nextOpen = new Set(nav.openIds);
    nextOpen.add(location.view);
    nav.openIds = [...nextOpen];
    nav.currentId = key;

    if (titleElement) titleElement.textContent = page.title;
    if (summaryElement) summaryElement.textContent = page.summary;
    if (contentElement) {
      contentElement.innerHTML = renderPageSections(page);
    }
    if (outlineElement) {
      outlineElement.innerHTML = renderToc(page);
    }
    if (mobileNavSelect) {
      mobileNavSelect.value = key;
    }

    statusBar.message = page.title;
    if (page.id !== 'shell-patterns') statusBar.tone = 'info';
    updateStatusMeta(statusBar);
    document.title = `UIK Docs - ${page.title}`;

    if (contentElement) {
      if (page.id === 'shell-patterns') {
        wireLabShellControls(contentElement, statusBar, layout, secondarySidebar);
      }
      if (page.id === 'overlays') {
        wireLabOverlayControls(contentElement);
      }
    }
  };

  router.subscribe(applyLocation);

  activityBar.addEventListener('activity-bar-select', event => {
    const detail = (event as CustomEvent<{id: string}>).detail;
    router.navigate(detail.id);
  });

  nav.addEventListener('nav-select', event => {
    const detail = (event as CustomEvent<{id: string}>).detail;
    const [view, subview] = detail.id.split('/');
    if (!view || !subview) return;
    event.preventDefault();
    router.navigate(view, subview);
  });

  outlineToggle?.addEventListener('click', () => {
    setOutlineOpen(layout, secondarySidebar, !secondarySidebar.isOpen);
  });

  secondarySidebar.addEventListener('secondary-sidebar-close', () => {
    setOutlineOpen(layout, secondarySidebar, false);
  });

  themeSelect?.addEventListener('change', () => {
    document.documentElement.setAttribute('data-uik-theme', themeSelect.value);
    updateStatusMeta(statusBar);
  });

  densitySelect?.addEventListener('change', () => {
    document.documentElement.setAttribute('data-uik-density', densitySelect.value);
    updateStatusMeta(statusBar);
  });

  mobileNavSelect?.addEventListener('change', () => {
    const [view, subview] = mobileNavSelect.value.split('/');
    if (!view || !subview) return;
    router.navigate(view, subview);
  });

  const syncSelects = async () => {
    await nextFrame();
    if (themeSelect) themeSelect.value = document.documentElement.getAttribute('data-uik-theme') ?? 'light';
    if (densitySelect) densitySelect.value = document.documentElement.getAttribute('data-uik-density') ?? 'comfortable';
    if (mobileNavSelect) mobileNavSelect.value = locationKey(router.current);
  };

  void syncSelects();
};
