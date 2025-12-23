# @ismail-elkorchi/ui-shell

Tailwind-friendly shell components (activity bar, sidebars, status bar, and an optional frame layout) for Light DOM layouts. They render Tailwind utility classes, depend on `@ismail-elkorchi/ui-primitives` for controls, and stay framework-agnostic.

## Build & distribution

- `npm run build` emits ESM + `.d.ts` modules into `dist/` for `index/register/router`, layout, activity bar, sidebar, secondary sidebar, and status bar.
- Tailwind scanning helper ships as `dist/tailwind-source.css`.
- Published output contains only `dist/` plus this README; TypeScript sources stay in the workspace.

## Layout layer

- Regions: left rail (`activity-bar`), primary sidebar, main content, optional secondary sidebar, and status bar.
- `uik-shell-layout` stitches the regions together and tags them with `data-region` attributes to keep the layout contract visible in the DOM.
- Shell components expose only UI surface/state; business logic should live in the host app.
- **Contract**: Shell components use `ui-primitives` strictly via their public API (attributes/props). They do not rely on Tailwind utility injection to style the internals of primitives (no `class="text-red-500"` on a `uik-button`).

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
  <uik-shell-layout
    .activityBar=${html`
      <uik-shell-activity-bar
        .items=${activityItems}
        .activeId=${'explorer'}
        @activity-bar-select=${(e: CustomEvent<{id: string}>) => console.log(e.detail.id)}>
      </uik-shell-activity-bar>
    `}
    .primarySidebar=${html`
      <uik-shell-sidebar
        heading="Explorer"
        .actions=${html`<uik-button variant="ghost" size="icon">…</uik-button>`}
        .body=${html`<!-- put your file tree or filters here -->`}>
      </uik-shell-sidebar>
    `}
    .mainContent=${html`<main class="flex-1">Your editor or subviews</main>`}
    .secondarySidebar=${html`
      <uik-shell-secondary-sidebar
        .isOpen=${true}
        heading="AI Assistant"
        .body=${html`<p class="text-sm text-muted-foreground">Auxiliary tools live here.</p>`}
        @secondary-sidebar-close=${() => console.log('close secondary')}></uik-shell-secondary-sidebar>
    `}
    .statusBar=${html`
      <uik-shell-status-bar message="Ready" tone="info" .meta=${'3 files selected'}></uik-shell-status-bar>
    `}
    ?isSecondarySidebarVisible=${true}>
  </uik-shell-layout>
`;
```

### Component notes

- `uik-shell-activity-bar`: accepts `.items` (id/label/icon/path) and emits `activity-bar-select`.
- `uik-shell-sidebar`: header/heading with `.actions`, `.body`, and optional `.footer`; `isBodyPadded`/`isBodyScrollable` toggle spacing and scroll.
- `uik-shell-secondary-sidebar`: controlled via `.isOpen`; emits `secondary-sidebar-close` when the close button is clicked.
- `uik-shell-status-bar`: `.message` + `.tone` colorizes the left side; `.meta` renders on the right (string becomes an outline badge).

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

## Tailwind v4 scanning

The package ships Tailwind class strings in TypeScript. Add the source hint before importing Tailwind:

```css
@import '@ismail-elkorchi/ui-tokens/index.css';
@import '@ismail-elkorchi/ui-shell/tailwind-source.css'; /* pulls in @source "./**/*.{ts,js}" */
@source "./**/*.{ts,js,html}";
@import 'tailwindcss';
```

Adjust the `@source` path to match the location of your entry CSS. Alternatively, add the line yourself:

```css
@source "../../node_modules/@ismail-elkorchi/ui-shell/**/*.{ts,js}";
```

Make sure these appear in the renderer entry CSS so Tailwind keeps the shell utilities during tree-shaking.
