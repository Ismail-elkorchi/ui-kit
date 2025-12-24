# @ismail-elkorchi/ui-shell

Token-driven shell components (activity bar, sidebars, status bar, and an optional frame layout) for Light DOM composition. They depend on `@ismail-elkorchi/ui-primitives` for controls, expose slots + parts, and read all visual values from `@ismail-elkorchi/ui-tokens` CSS variables.

## Layout layer

- Regions: left rail (`activity-bar`), primary sidebar, main content, optional secondary sidebar, and status bar.
- `uik-shell-layout` stitches the regions together and tags them with `data-region` attributes to keep the layout contract visible in the DOM.
- Shell components expose only UI surface/state; business logic should live in the host app.
- **Contract**: Shell components use `ui-primitives` strictly via their public API (attributes/props). Visual styling comes from `--uik-*` custom properties (no framework utility classes).

## Using the components

```ts
import {html} from 'lit';
import '@ismail-elkorchi/ui-primitives/register';
import '@ismail-elkorchi/ui-shell/register';
import type {UikShellActivityBarItem} from '@ismail-elkorchi/ui-shell/activity-bar';

const activityItems: UikShellActivityBarItem[] = [
  {
    id: 'explorer',
    label: 'Explorer',
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'
  },
  {id: 'search', label: 'Search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'}
];

html`
  <uik-shell-layout ?isSecondarySidebarVisible=${true}>
    <uik-shell-activity-bar
      slot="activity-bar"
      .items=${activityItems}
      .activeId=${'explorer'}
      @activity-bar-select=${(e: CustomEvent<{id: string}>) => console.log(e.detail.id)}>
    </uik-shell-activity-bar>
    <uik-shell-sidebar slot="primary-sidebar" heading="Explorer">
      <uik-button slot="actions" variant="ghost" size="icon">…</uik-button>
      <div style="font-size: var(--uik-typography-font-size-2);">
        <!-- put your file tree or filters here -->
      </div>
    </uik-shell-sidebar>
    <main slot="main-content" style="flex: 1 1 auto; min-height: var(--uik-space-0);">
      Your editor or subviews
    </main>
    <uik-shell-secondary-sidebar
      slot="secondary-sidebar"
      .isOpen=${true}
      heading="AI Assistant"
      @secondary-sidebar-close=${() => console.log('close secondary')}>
      <p
        style="
          font-size: var(--uik-typography-font-size-2);
          color: oklch(var(--uik-text-muted));
        ">
        Auxiliary tools live here.
      </p>
    </uik-shell-secondary-sidebar>
    <uik-shell-status-bar slot="status-bar" message="Ready" tone="info" meta="3 files selected"></uik-shell-status-bar>
  </uik-shell-layout>
`;
```

### Component notes

- `uik-shell-layout`: named slots `activity-bar`, `primary-sidebar`, `main-content`, `secondary-sidebar`, `status-bar`.
- `uik-shell-activity-bar`: accepts `.items` (id/label/icon/path) and emits `activity-bar-select`; optional `footer` slot; roving focus with Arrow keys/Home/End and Enter/Space activation (set `aria-label` if you need a custom name).
- `uik-shell-sidebar`: `slot="actions"` for header actions, default slot for body, optional `slot="footer"`; `isBodyPadded`/`isBodyScrollable` toggle spacing + scroll.
- `uik-shell-secondary-sidebar`: controlled via `.isOpen`; default slot for body, optional `slot="footer"`; emits `secondary-sidebar-close` on close.
- `uik-shell-status-bar`: `.message` + `.tone` colorize the left side; `meta` string (outline badge) or `slot="meta"` for custom content; optional `slot="actions"`.

### Custom properties

- Activity bar: `--uik-component-shell-activity-bar-bg`, `--uik-component-shell-activity-bar-fg`, `--uik-component-shell-activity-bar-width`.
- Sidebar: `--uik-component-shell-sidebar-bg`, `--uik-component-shell-sidebar-fg`, `--uik-component-shell-sidebar-width`.
- Secondary sidebar: `--uik-component-shell-secondary-sidebar-bg`, `--uik-component-shell-secondary-sidebar-width`.
- Status bar: `--uik-component-shell-status-bar-bg`, `--uik-component-shell-status-bar-fg`, `--uik-component-shell-status-bar-height`.
- Shared: `--uik-component-shell-divider-color`, `--uik-component-shell-scrollbar-track`, `--uik-component-shell-scrollbar-thumb`.

## Tokens & theming

Load tokens once and set theme/density attributes on a shared container (often `:root`):

```css
@import '@ismail-elkorchi/ui-tokens/index.css';
```

```html
<html data-uik-theme="light" data-uik-density="comfortable">
  ...
</html>
```

## Routing store

A tiny EventTarget-based router lives in `@ismail-elkorchi/ui-shell/router`. It is framework-light, keeps state in memory (no history), and is meant for desktop flows that only need named views and optional subviews.

```ts
import {createUikShellRouter, UIK_SHELL_NAVIGATION_EVENT, type UikShellNavigationDetail} from '@ismail-elkorchi/ui-shell/router';

const routes = [
  {id: 'explorer', label: 'Explorer', subviews: ['code', 'prompt', 'apply'], defaultSubview: 'code'},
  {id: 'search', label: 'Search'},
  {id: 'settings', label: 'Settings'}
] as const;

export const shellRouter = createUikShellRouter({routes, initialView: 'explorer', initialSubview: 'code'});

// React to navigation anywhere in the app
const unsubscribe = shellRouter.subscribe(({view, subview}) => {
  console.log('Current location', view, subview);
});

// Wire Lit components through events
html`
  <uik-shell-activity-bar
    .items=${routes.map(r => ({id: r.id, label: r.label ?? r.id}))}
    .activeId=${shellRouter.current.view}
    @activity-bar-select=${(e: CustomEvent<{id: string}>) => shellRouter.navigate(e.detail.id)}>
  </uik-shell-activity-bar>

  <editor-area
    .activeSubview=${shellRouter.current.subview ?? 'code'}
    @subview-change=${(e: CustomEvent<{subview: string}>) =>
      shellRouter.navigate(shellRouter.current.view, e.detail.subview)}>
  </editor-area>
`;

// Listen to the low-level navigation event if you prefer EventTarget
window.addEventListener(UIK_SHELL_NAVIGATION_EVENT, (event: Event) => {
  const detail = (event as CustomEvent<UikShellNavigationDetail>).detail;
  console.log(detail.from, detail.to, detail.route);
});
```

- Routes are simple `{id, label?, subviews?, defaultSubview?}` objects.
- `navigate(view, subview?)` resolves subviews per route (keeping the last used subview for that route).
- `subscribe` immediately fires with the current location and returns an unsubscribe function.
