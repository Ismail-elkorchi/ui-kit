export interface DocSection {
  id: string;
  title: string;
  body: string;
}

export interface DocPage {
  id: string;
  title: string;
  summary: string;
  sections: DocSection[];
}

export interface ComponentDoc {
  id: string;
  name: string;
  summary: string;
  attributes: string[];
  slots: string[];
  parts: string[];
  events: string[];
  a11y: string[];
  cssVars: string[];
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const p = (html: string) => `<uik-text as="p" class="docs-paragraph">${html}</uik-text>`;
const codeInline = (value: string) => `<code>${escapeHtml(value)}</code>`;
const codeBlock = (value: string) =>
  `<pre class="docs-code"><code>${escapeHtml(value)}</code></pre>`;
const list = (items: string[]) =>
  `<ul class="docs-list">${items.map(item => `<li>${p(item)}</li>`).join('')}</ul>`;
const section = (id: string, title: string, body: string): DocSection => ({id, title, body});

export const primitiveDocs: ComponentDoc[] = [
  {
    id: 'alert',
    name: '<uik-alert>',
    summary: 'Inline status messaging for neutral and semantic feedback.',
    attributes: ['variant (neutral | info | success | warning | danger)'],
    slots: ['title', 'default (message body)'],
    parts: ['base', 'title', 'body'],
    events: ['None.'],
    a11y: ['role="status" by default; warning/danger switches to role="alert".'],
    cssVars: ['--uik-component-alert-{neutral|info|success|warning|danger}-{bg|border|fg}'],
  },
  {
    id: 'badge',
    name: '<uik-badge>',
    summary: 'Compact label for status or counts.',
    attributes: ['variant (default | secondary | danger | outline)'],
    slots: ['default (label)'],
    parts: ['base'],
    events: ['None.'],
    a11y: ['Inline element; provide meaningful text content.'],
    cssVars: [
      '--uik-component-badge-base-* (padding, radius, font, border)',
      '--uik-component-badge-{default|secondary|danger|outline}-{bg|border|fg|shadow}',
    ],
  },
  {
    id: 'box',
    name: '<uik-box>',
    summary: 'Simple padded container with background and border hooks.',
    attributes: ['padding (0-6)', 'inline (boolean)'],
    slots: ['default'],
    parts: ['base'],
    events: ['None.'],
    a11y: ['Presentational wrapper; use semantic HTML inside.'],
    cssVars: [
      '--uik-component-box-padding-{0..6}',
      '--uik-component-box-bg',
      '--uik-component-box-bg-opacity',
      '--uik-component-box-border-color',
      '--uik-component-box-border-opacity',
      '--uik-component-box-border-width',
      '--uik-component-box-radius',
    ],
  },
  {
    id: 'button',
    name: '<uik-button>',
    summary: 'Primary action control with variants and sizes.',
    attributes: [
      'variant (solid | danger | outline | secondary | ghost | link)',
      'size (default | sm | lg | icon)',
      'type (button | submit | reset)',
      'tabIndexValue (number)',
      'active (boolean)',
      'muted (boolean)',
      'disabled (boolean)',
    ],
    slots: ['default (label or icon)'],
    parts: ['base'],
    events: ['Native button events bubble from the internal <button>.'],
    a11y: [
      'Forward aria-label, aria-labelledby, and aria-pressed to the internal button.',
      'Icon-only buttons should provide an accessible name.',
    ],
    cssVars: [
      '--uik-component-button-base-* (gap, font, focus ring, border)',
      '--uik-component-button-{solid|ghost|outline|secondary|danger|link}-*',
      '--uik-component-button-{sm|md|lg}-*',
    ],
  },
  {
    id: 'checkbox',
    name: '<uik-checkbox>',
    summary: 'Form-associated checkbox control with label, hint, and error slots.',
    attributes: ['name', 'value', 'checked', 'indeterminate (boolean)', 'disabled', 'required', 'invalid', 'tabIndexValue (number)'],
    slots: ['label', 'hint', 'error'],
    parts: ['base', 'control', 'label', 'hint', 'error'],
    events: ['Native change bubbles from the internal <input>.'],
    a11y: ['Provide a label slot or aria-label; hint/error are wired via aria-describedby.'],
    cssVars: ['--uik-component-checkbox-accent', '--uik-component-checkbox-size'],
  },
  {
    id: 'dialog',
    name: '<uik-dialog>',
    summary: 'Native dialog wrapper with slots for title, description, and actions.',
    attributes: ['open', 'modal (boolean)'],
    slots: ['title', 'description', 'default (body)', 'actions'],
    parts: ['base', 'panel', 'title', 'description', 'body', 'actions'],
    events: ['Native close and cancel bubble from <dialog>.'],
    a11y: ['Uses native dialog semantics; forwards aria-* attributes to <dialog>.'],
    cssVars: [
      '--uik-layout-panel-width-md',
      '--uik-elevation-modal-shadow',
      '--uik-scrim-color',
      '--uik-scrim-opacity',
    ],
  },
  {
    id: 'heading',
    name: '<uik-heading>',
    summary: 'Tokenized heading typography with semantic levels.',
    attributes: ['level (1-6)', 'tone (default | strong | muted | danger | success | warning | info)'],
    slots: ['default'],
    parts: ['base'],
    events: ['None.'],
    a11y: ['Renders the matching native heading element.'],
    cssVars: [
      '--uik-component-heading-size-{1..6}',
      '--uik-component-heading-line-height-{1..6}',
      '--uik-component-heading-weight',
      '--uik-component-heading-color-{default|strong|muted|danger|success|warning|info}',
    ],
  },
  {
    id: 'icon',
    name: '<uik-icon>',
    summary: 'Sized icon wrapper for inline SVG content.',
    attributes: ['size (xs | sm | md | lg)', 'tone (default | muted | danger | success | warning | info | inverse)'],
    slots: ['default (svg)'],
    parts: ['base'],
    events: ['None.'],
    a11y: ['Use aria-label for meaningful icons or aria-hidden for decorative icons.'],
    cssVars: [
      '--uik-component-icon-size-{xs|sm|md|lg}',
      '--uik-component-icon-color-{default|muted|danger|success|warning|info|inverse}',
    ],
  },
  {
    id: 'input',
    name: '<uik-input>',
    summary: 'Form-associated text input with labels, hints, and errors.',
    attributes: [
      'type',
      'name',
      'value',
      'placeholder',
      'disabled',
      'required',
      'readonly',
      'invalid',
      'autocomplete',
      'inputmode',
      'enterkeyhint',
    ],
    slots: ['label', 'hint', 'error'],
    parts: ['base', 'control', 'label', 'hint', 'error'],
    events: ['Native input and change bubble from the internal <input>.'],
    a11y: [
      'Label slot associates via for; hint and error are wired to aria-describedby.',
      'aria-invalid is set when invalid or error content is present.',
    ],
    cssVars: ['--uik-component-input-base-* (bg, border, fg, padding, radius, shadow, selection)'],
  },
  {
    id: 'link',
    name: '<uik-link>',
    summary: 'Anchor wrapper with tokenized colors and underline styling.',
    attributes: ['href', 'target', 'rel', 'download'],
    slots: ['default (link text)'],
    parts: ['base'],
    events: ['Native anchor events bubble from the internal <a>.'],
    a11y: ['Forward aria-* attributes to <a>.'],
    cssVars: ['--uik-component-link-fg-default', '--uik-component-link-fg-hover', '--uik-component-link-underline-offset'],
  },
  {
    id: 'tree-view',
    name: '<uik-tree-view>',
    summary: 'Tree view list with tri-state selection and open state.',
    attributes: ['items (array)', 'selectedIds (string[])', 'openIds (string[])'],
    slots: ['None.'],
    parts: ['base', 'item', 'toggle', 'selection', 'label'],
    events: ['tree-view-select', 'tree-view-open', 'tree-view-toggle'],
    a11y: ['Treeview role with roving focus; Space toggles selection and Enter opens items.'],
    cssVars: [
      '--uik-component-tree-view-item-*',
      '--uik-component-tree-view-indent',
      '--uik-component-tree-view-text-*',
      '--uik-component-tree-view-toggle-fg',
    ],
  },
  {
    id: 'nav',
    name: '<uik-nav>',
    summary: 'Navigation list with grouped links and current state.',
    attributes: ['items (array)', 'openIds (string[])', 'currentId'],
    slots: ['None.'],
    parts: ['base', 'item', 'toggle', 'link', 'label'],
    events: ['nav-select', 'nav-toggle'],
    a11y: ['Renders anchors inside a nav landmark; active links expose aria-current.'],
    cssVars: [
      '--uik-component-nav-item-*',
      '--uik-component-nav-indent',
      '--uik-component-nav-text-*',
      '--uik-component-nav-toggle-fg',
    ],
  },
  {
    id: 'popover',
    name: '<uik-popover>',
    summary: 'Popover panel with trigger slot and optional native popover support.',
    attributes: ['open', 'placement', 'popover (auto | manual | hint)'],
    slots: ['trigger', 'default (panel content)'],
    parts: ['control', 'base'],
    events: ['Trigger events bubble; panel listens to native popover toggle when supported.'],
    a11y: ['Forward aria-* attributes to the panel.'],
    cssVars: [
      '--uik-elevation-popover-shadow',
      '--uik-surface-popover',
      '--uik-z-local-overlay',
      '--uik-radius-3',
    ],
  },
  {
    id: 'progress',
    name: '<uik-progress>',
    summary: 'Progress indicator with determinate and indeterminate modes.',
    attributes: ['value', 'max', 'indeterminate (boolean)'],
    slots: ['None.'],
    parts: ['base'],
    events: ['None.'],
    a11y: ['Forward aria-label and aria-labelledby to the internal <progress>.'],
    cssVars: [
      '--uik-component-progress-track-bg',
      '--uik-component-progress-bar-bg',
      '--uik-component-progress-height',
      '--uik-component-progress-min-width',
      '--uik-component-progress-radius',
    ],
  },
  {
    id: 'radio',
    name: '<uik-radio>',
    summary: 'Form-associated radio control with label, hint, and error slots.',
    attributes: ['name', 'value', 'checked', 'disabled', 'required', 'invalid'],
    slots: ['label', 'hint', 'error'],
    parts: ['base', 'control', 'label', 'hint', 'error'],
    events: ['Native change bubbles from the internal <input>.'],
    a11y: ['Provide a label slot or aria-label; hint/error are wired via aria-describedby.'],
    cssVars: ['--uik-component-radio-accent', '--uik-component-radio-size'],
  },
  {
    id: 'radio-group',
    name: '<uik-radio-group>',
    summary: 'Radio group wrapper with keyboard arrow navigation.',
    attributes: ['name', 'value', 'orientation (vertical | horizontal)', 'disabled', 'required', 'invalid'],
    slots: ['label', 'hint', 'error', 'default (<uik-radio> children)'],
    parts: ['base', 'control', 'label', 'hint', 'error'],
    events: ['Native change bubbles from child radios.'],
    a11y: ['Label slot wires aria-labelledby; hint/error are announced via aria-describedby.'],
    cssVars: ['--uik-component-radio-group-gap'],
  },
  {
    id: 'separator',
    name: '<uik-separator>',
    summary: 'Horizontal or vertical separator line.',
    attributes: ['orientation (horizontal | vertical)'],
    slots: ['None.'],
    parts: ['base'],
    events: ['None.'],
    a11y: ['Horizontal renders <hr>; vertical uses role="separator".'],
    cssVars: ['--uik-separator-color', '--uik-separator-thickness', '--uik-separator-radius'],
  },
  {
    id: 'select',
    name: '<uik-select>',
    summary: 'Form-associated select with label, hint, and error slots.',
    attributes: ['name', 'value', 'disabled', 'required', 'invalid'],
    slots: ['label', 'hint', 'error', 'default (<option> elements)'],
    parts: ['base', 'control', 'label', 'hint', 'error'],
    events: ['Native change bubbles from the internal <select>.'],
    a11y: ['Provide a label slot or aria-label; hint/error are wired via aria-describedby.'],
    cssVars: ['--uik-component-select-base-* (bg, border, fg, padding, radius, shadow, font)'],
  },
  {
    id: 'spinner',
    name: '<uik-spinner>',
    summary: 'Loading spinner with tone and size variations.',
    attributes: ['size (sm | md | lg)', 'tone (default | muted | primary | danger | success | warning | info)'],
    slots: ['None.'],
    parts: ['base'],
    events: ['None.'],
    a11y: ['Add aria-label if the spinner is meaningful.'],
    cssVars: [
      '--uik-component-spinner-size-{sm|md|lg}',
      '--uik-component-spinner-track',
      '--uik-component-spinner-indicator-{default|muted|primary|danger|success|warning|info}',
    ],
  },
  {
    id: 'stack',
    name: '<uik-stack>',
    summary: 'Flex stack for layout spacing and alignment.',
    attributes: ['direction (vertical | horizontal)', 'gap (1-6)', 'align', 'justify'],
    slots: ['default'],
    parts: ['base'],
    events: ['None.'],
    a11y: ['Use semantic wrappers for landmark content.'],
    cssVars: ['--uik-component-stack-gap-{1..6}'],
  },
  {
    id: 'surface',
    name: '<uik-surface>',
    summary: 'Surface wrapper for background, border, and elevation tokens.',
    attributes: ['variant (base | muted | card | elevated | popover)', 'bordered (boolean)'],
    slots: ['default'],
    parts: ['base'],
    events: ['None.'],
    a11y: ['Use semantic HTML inside; does not add roles.'],
    cssVars: [
      '--uik-component-surface-bg-{default|muted|card|elevated|popover}',
      '--uik-component-surface-shadow-{default|card|elevated|popover}',
      '--uik-component-surface-border-color-{default|bordered}',
      '--uik-component-surface-border-width-{default|bordered}',
      '--uik-component-surface-radius',
    ],
  },
  {
    id: 'switch',
    name: '<uik-switch>',
    summary: 'Form-associated switch control with label, hint, and error slots.',
    attributes: ['name', 'value', 'checked', 'disabled', 'required', 'invalid'],
    slots: ['label', 'hint', 'error'],
    parts: ['base', 'control', 'track', 'thumb', 'label', 'hint', 'error'],
    events: ['Native change bubbles from the internal <input>.'],
    a11y: ['Uses role="switch" and supports label slot or aria-label.'],
    cssVars: [
      '--uik-component-switch-height',
      '--uik-component-switch-width',
      '--uik-component-switch-padding',
      '--uik-component-switch-thumb-size',
      '--uik-component-switch-thumb-bg',
      '--uik-component-switch-thumb-shadow',
      '--uik-component-switch-track-bg-default',
      '--uik-component-switch-track-bg-checked',
      '--uik-component-switch-track-border-default',
      '--uik-component-switch-track-border-checked',
    ],
  },
  {
    id: 'text',
    name: '<uik-text>',
    summary: 'Tokenized text wrapper for size, weight, tone, and truncation.',
    attributes: ['as (span | p | div | label)', 'size (sm | md | lg | xl)', 'weight', 'tone', 'truncate (boolean)'],
    slots: ['default'],
    parts: ['base'],
    events: ['None.'],
    a11y: ['Use as=label for form labels when needed.'],
    cssVars: [
      '--uik-component-text-size-{sm|md|lg|xl}',
      '--uik-component-text-line-height-{sm|md|lg|xl}',
      '--uik-component-text-weight-{regular|medium|semibold|bold}',
      '--uik-component-text-color-{default|muted|strong|danger|success|warning|info}',
    ],
  },
  {
    id: 'textarea',
    name: '<uik-textarea>',
    summary: 'Form-associated textarea with label, hint, and error slots.',
    attributes: ['name', 'value', 'placeholder', 'rows', 'disabled', 'required', 'readonly', 'invalid'],
    slots: ['label', 'hint', 'error'],
    parts: ['base', 'control', 'label', 'hint', 'error'],
    events: ['Native input and change bubble from the internal <textarea>.'],
    a11y: ['Provide a label slot or aria-label; hint/error are wired via aria-describedby.'],
    cssVars: ['--uik-component-textarea-base-* (bg, border, fg, padding, radius, shadow, min-height)'],
  },
  {
    id: 'tooltip',
    name: '<uik-tooltip>',
    summary: 'Tooltip panel with trigger slot.',
    attributes: ['open', 'placement', 'popover (defaults to hint)'],
    slots: ['trigger', 'default (tooltip content)'],
    parts: ['control', 'base'],
    events: ['Trigger events bubble from slotted trigger.'],
    a11y: ['Panel uses role="tooltip" and wires aria-describedby to trigger.'],
    cssVars: ['--uik-z-local-tooltip', '--uik-text-inverse', '--uik-text-strong', '--uik-shadow-2'],
  },
  {
    id: 'visually-hidden',
    name: '<uik-visually-hidden>',
    summary: 'Utility to hide content visually while keeping it accessible.',
    attributes: ['None.'],
    slots: ['default'],
    parts: ['base'],
    events: ['None.'],
    a11y: ['Use for screen-reader-only labels or descriptions.'],
    cssVars: ['None.'],
  },
];

export const shellDocs: ComponentDoc[] = [
  {
    id: 'shell-layout',
    name: '<uik-shell-layout>',
    summary: 'Shell region layout container with named slots.',
    attributes: ['isSecondarySidebarVisible (boolean)'],
    slots: ['activity-bar', 'primary-sidebar', 'main-content', 'secondary-sidebar', 'status-bar'],
    parts: ['layout', 'row', 'activity-bar', 'primary-sidebar', 'main-content', 'secondary-sidebar', 'status-bar'],
    events: ['None.'],
    a11y: ['Use semantic elements inside slots for landmarks.'],
    cssVars: ['--uik-component-shell-divider-color', '--uik-component-shell-scrollbar-*'],
  },
  {
    id: 'shell-activity-bar',
    name: '<uik-shell-activity-bar>',
    summary: 'Vertical activity bar with roving focus and icon buttons.',
    attributes: ['items (array)', 'activeId (string)'],
    slots: ['footer'],
    parts: ['activity-bar', 'item', 'item-indicator', 'item-button', 'item-icon', 'spacer', 'footer'],
    events: ['activity-bar-select (detail: {id})'],
    a11y: ['Arrow keys, Home/End, Enter/Space activation; set aria-label if needed.'],
    cssVars: ['--uik-component-shell-activity-bar-bg', '--uik-component-shell-activity-bar-fg', '--uik-component-shell-activity-bar-width'],
  },
  {
    id: 'shell-sidebar',
    name: '<uik-shell-sidebar>',
    summary: 'Primary sidebar with heading, actions, body, and footer slots.',
    attributes: ['heading', 'subtitle', 'isBodyPadded', 'isBodyScrollable'],
    slots: ['actions', 'default', 'footer'],
    parts: ['sidebar', 'header', 'heading', 'subtitle', 'actions', 'body', 'footer'],
    events: ['None.'],
    a11y: ['Sidebar is an <aside>; ensure internal landmarks and labels.'],
    cssVars: ['--uik-component-shell-sidebar-bg', '--uik-component-shell-sidebar-fg', '--uik-component-shell-sidebar-width'],
  },
  {
    id: 'shell-secondary-sidebar',
    name: '<uik-shell-secondary-sidebar>',
    summary: 'Secondary sidebar panel with header and optional footer.',
    attributes: ['isOpen (boolean)', 'heading', 'focusReturnTarget (selector | element)'],
    slots: ['default', 'footer'],
    parts: ['secondary-sidebar', 'header', 'heading', 'close-button', 'body', 'footer'],
    events: ['secondary-sidebar-close'],
    a11y: ['Escape closes and returns focus (configured target or last active); close button is labeled; provide meaningful heading.'],
    cssVars: ['--uik-component-shell-secondary-sidebar-bg', '--uik-component-shell-secondary-sidebar-width'],
  },
  {
    id: 'shell-status-bar',
    name: '<uik-shell-status-bar>',
    summary: 'Status bar for global status and actions.',
    attributes: ['message', 'tone (info | success | danger | muted)', 'meta'],
    slots: ['actions', 'meta'],
    parts: ['status-bar', 'message', 'actions', 'meta'],
    events: ['None.'],
    a11y: ['Use short status text; provide accessible names for actions.'],
    cssVars: ['--uik-component-shell-status-bar-bg', '--uik-component-shell-status-bar-fg', '--uik-component-shell-status-bar-height'],
  },
  {
    id: 'shell-router',
    name: 'createUikShellRouter()',
    summary: 'Tiny EventTarget-based router for view + subview state.',
    attributes: ['routes (array)', 'initialView', 'initialSubview'],
    slots: ['None.'],
    parts: ['None.'],
    events: ['uik-shell:navigation (CustomEvent<UikShellNavigationDetail>)'],
    a11y: ['Keep focus management in the host app when views change.'],
    cssVars: ['None.'],
  },
];

const renderComponentCards = (components: ComponentDoc[]) => {
  return components
    .map(component => {
      const buildList = (items: string[]) => (items.length ? list(items) : p('None.'));
      return `
        <article class="docs-card docs-component" id="component-${component.id}">
          <header class="docs-card-header">
            <uik-heading level="3"><code>${escapeHtml(component.name)}</code></uik-heading>
            ${p(component.summary)}
          </header>
          <div class="docs-component-grid">
            <div class="docs-component-row">
              <uik-text as="p" class="docs-component-label">API</uik-text>
              ${buildList(component.attributes)}
            </div>
            <div class="docs-component-row">
              <uik-text as="p" class="docs-component-label">Slots</uik-text>
              ${buildList(component.slots)}
            </div>
            <div class="docs-component-row">
              <uik-text as="p" class="docs-component-label">Parts</uik-text>
              ${buildList(component.parts)}
            </div>
            <div class="docs-component-row">
              <uik-text as="p" class="docs-component-label">Events</uik-text>
              ${buildList(component.events)}
            </div>
            <div class="docs-component-row">
              <uik-text as="p" class="docs-component-label">A11y</uik-text>
              ${buildList(component.a11y)}
            </div>
            <div class="docs-component-row">
              <uik-text as="p" class="docs-component-label">CSS Vars</uik-text>
              ${buildList(component.cssVars)}
            </div>
          </div>
        </article>
      `;
    })
    .join('');
};

export const docsPages: DocPage[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    summary: 'Install UIK packages, load tokens, and compose primitives and shell components.',
    sections: [
      section(
        'install',
        'Install',
        `${p('Install tokens, primitives, and shell in the same app or workspace.')}
        ${codeBlock('npm install @ismail-elkorchi/ui-tokens @ismail-elkorchi/ui-primitives @ismail-elkorchi/ui-shell')}`,
      ),
      section(
        'load-tokens',
        'Load tokens',
        `${p('Import token CSS once so every primitive reads the same CSS custom properties.')}
        ${codeBlock("@import '@ismail-elkorchi/ui-tokens/base.css';")}
        <uik-alert variant="info">
          <span slot="title">Tokens first</span>
          ${p('Primitives and shell components only consume --uik-* variables.')}
        </uik-alert>
        ${p('Switch theme or density by setting data attributes on the root element.')}
        ${codeBlock('<html data-uik-theme="dark" data-uik-density="compact">')}`,
      ),
      section(
        'register-elements',
        'Register custom elements',
        `${p('Register primitives and shell components before rendering any markup.')}
        ${codeBlock("import '@ismail-elkorchi/ui-primitives/register';\nimport '@ismail-elkorchi/ui-shell/register';")}`,
      ),
      section(
        'compose-shell',
        'Compose the shell',
        `${p(`Use ${codeInline('<uik-shell-layout>')} to wire regions with named slots.`)}
        ${codeBlock(
          `<uik-shell-layout>
  <uik-shell-activity-bar slot="activity-bar"></uik-shell-activity-bar>
  <uik-shell-sidebar slot="primary-sidebar" heading="Navigation"></uik-shell-sidebar>
  <main slot="main-content">Main content</main>
  <uik-shell-status-bar slot="status-bar" message="Ready"></uik-shell-status-bar>
</uik-shell-layout>`,
        )}`,
      ),
      section(
        'a11y',
        'Accessibility and forms',
        `${p('Primitives are built on native semantics. Provide labels, hints, and errors via slots, and prefer native form behavior whenever possible.')}
        ${p('Controls are form-associated and participate in FormData when named. Keep focus visible and use keyboard-first testing as part of your workflow.')}`,
      ),
      section(
        'next',
        'Next steps',
        p('Continue with the Tokens, Primitives, and Shell reference pages for full contracts and usage patterns.'),
      ),
    ],
  },
  {
    id: 'tokens',
    title: 'Tokens Reference',
    summary: 'UIK tokens are the single source of truth for all visual values and component hooks.',
    sections: [
      section(
        'outputs',
        'Outputs and entrypoints',
        `${p(`Import CSS outputs directly from ${codeInline('@ismail-elkorchi/ui-tokens')}.`)}
        ${list([
          `${codeInline('@ismail-elkorchi/ui-tokens/index.css')} (base + theme wiring)`,
          `${codeInline('@ismail-elkorchi/ui-tokens/base.css')} (variables + theme layers)`,
          codeInline('@ismail-elkorchi/ui-tokens/themes/uik-light.css'),
          codeInline('@ismail-elkorchi/ui-tokens/themes/uik-dark.css'),
          codeInline('@ismail-elkorchi/ui-tokens/themes/uik-density-comfortable.css'),
          codeInline('@ismail-elkorchi/ui-tokens/themes/uik-density-compact.css'),
        ])}`,
      ),
      section(
        'theme-density',
        'Theme and density',
        `${p(`Theme and density are CSS-first. Toggle them via ${codeInline('data-uik-theme')} and ${codeInline('data-uik-density')} attributes.`)}
        ${codeBlock('<html data-uik-theme="light" data-uik-density="comfortable">')}`,
      ),
      section(
        'consume-css',
        'Consume tokens in CSS',
        `${p(`Use ${codeInline('--uik-*')} custom properties directly. Avoid hard-coded values.`)}
        ${codeBlock(
          `.card {
  background: oklch(var(--uik-surface-card));
  color: oklch(var(--uik-text-default));
  padding: var(--uik-space-5);
  border-radius: var(--uik-radius-4);
  box-shadow: var(--uik-shadow-2);
}`,
        )}`,
      ),
      section(
        'component-hooks',
        'Component hooks',
        `${p(`Component-specific hooks live under ${codeInline('tokens/components')} and emit ${codeInline('--uik-component-*')} variables.`)}
        ${p('If you need a new hook, add it to ui-tokens first and consume it in the primitive or shell component.')}`,
      ),
      section(
        'js-api',
        'Programmatic API',
        `${p('Use the JS helpers when you need to switch theme or density from code.')}
        ${codeBlock(
          `import {setTheme, setDensity} from '@ismail-elkorchi/ui-tokens';

setTheme(document.documentElement, 'dark');
setDensity(document.documentElement, 'compact');`,
        )}`,
      ),
    ],
  },
  {
    id: 'primitives',
    title: 'Primitives Reference',
    summary: 'Shadow DOM building blocks that read tokens and expose explicit contracts.',
    sections: [
      section(
        'overview',
        'Overview',
        `${p('Primitives are token-driven Custom Elements built with Lit. They expose slots, parts, and attributes so you can compose them without reaching into Shadow DOM.')}
        ${list([
          'Load tokens before primitives so CSS variables resolve correctly.',
          'Use explicit slots for labels, hints, and errors on form controls.',
          'Prefer native semantics first and add aria only when needed.',
        ])}`,
      ),
      section(
        'components',
        'Components and contracts',
        `<div class="docs-components">${renderComponentCards(primitiveDocs)}</div>`,
      ),
    ],
  },
  {
    id: 'shell',
    title: 'Shell Patterns',
    summary: 'Light DOM layout primitives that compose the UI into a consistent application shell.',
    sections: [
      section(
        'layout-recipe',
        'Layout recipe',
        `${p(`Use ${codeInline('<uik-shell-layout>')} to wire regions and keep layout explicit.`)}
        ${codeBlock(
          `<uik-shell-layout>
  <uik-shell-activity-bar slot="activity-bar"></uik-shell-activity-bar>
  <uik-shell-sidebar slot="primary-sidebar" heading="Explorer"></uik-shell-sidebar>
  <main slot="main-content">Workspace</main>
  <uik-shell-secondary-sidebar slot="secondary-sidebar" heading="Details"></uik-shell-secondary-sidebar>
  <uik-shell-status-bar slot="status-bar" message="Ready"></uik-shell-status-bar>
</uik-shell-layout>`,
        )}`,
      ),
      section(
        'router',
        'Router and navigation',
        `${p('The shell router keeps a view + subview location in memory and emits a navigation event.')}
        ${codeBlock(
          `import {createUikShellRouter} from '@ismail-elkorchi/ui-shell';

const router = createUikShellRouter({
  routes: [
    {id: 'docs', label: 'Docs', subviews: ['getting-started', 'tokens']},
    {id: 'lab', label: 'Lab', subviews: ['shell-patterns', 'overlays']}
  ],
  initialView: 'docs',
  initialSubview: 'getting-started'
});`,
        )}`,
      ),
      section(
        'components',
        'Shell component contracts',
        `<div class="docs-components">${renderComponentCards(shellDocs)}</div>`,
      ),
    ],
  },
];

export const labPages: DocPage[] = [
  {
    id: 'shell-patterns',
    title: 'Lab: Shell Patterns',
    summary: 'Dogfood shell patterns with live controls that update the layout and status bar.',
    sections: [
      section(
        'status-controls',
        'Status bar controls',
        `${p('Update the status bar message and tone using form-associated primitives.')}
        <div class="docs-lab-panel">
          <uik-input data-docs-control="status-message" value="Ready">
            <span slot="label">Status message</span>
          </uik-input>
          <uik-radio-group data-docs-control="status-tone" value="info">
            <span slot="label">Status tone</span>
            <uik-radio value="info"><span slot="label">Info</span></uik-radio>
            <uik-radio value="success"><span slot="label">Success</span></uik-radio>
            <uik-radio value="danger"><span slot="label">Danger</span></uik-radio>
            <uik-radio value="muted"><span slot="label">Muted</span></uik-radio>
          </uik-radio-group>
        </div>`,
      ),
      section(
        'secondary-sidebar',
        'Secondary sidebar toggle',
        `${p('Toggle the secondary sidebar to test layout changes and focus behavior.')}
        <div class="docs-lab-panel">
          <uik-switch data-docs-control="secondary-toggle">
            <span slot="label">Secondary sidebar</span>
          </uik-switch>
        </div>`,
      ),
    ],
  },
  {
    id: 'overlays',
    title: 'Lab: Overlays and Feedback',
    summary: 'Exercise dialogs, popovers, tooltips, and progress indicators.',
    sections: [
      section(
        'dialog',
        'Dialog',
        `${p('Open a modal dialog and validate keyboard dismissal and focus handling.')}
        <div class="docs-lab-panel">
          <uik-button variant="solid" data-docs-action="dialog-open">Open dialog</uik-button>
          <uik-dialog data-docs-dialog>
            <span slot="title">Docs dialog</span>
            <span slot="description">A modal dialog using native semantics.</span>
            ${p('Use this space for confirmation or structured content.')}
            <uik-button slot="actions" variant="outline" data-docs-action="dialog-close">Close</uik-button>
          </uik-dialog>
        </div>`,
      ),
      section(
        'popover',
        'Popover and tooltip',
        `${p('Popover uses the native Popover API when available. Tooltip provides a hint affordance.')}
        <div class="docs-lab-panel">
          <uik-popover placement="bottom-start" popover="auto">
            <uik-button slot="trigger" variant="secondary">Toggle popover</uik-button>
            <div class="docs-popover-panel">
              <uik-text as="p">Popover content with a short explanation.</uik-text>
            </div>
          </uik-popover>
          <uik-tooltip placement="top">
            <uik-button slot="trigger" variant="ghost">Hover for tooltip</uik-button>
            <uik-text as="p">Tooltip content.</uik-text>
          </uik-tooltip>
        </div>`,
      ),
      section(
        'progress',
        'Progress',
        `${p('Track background work with determinate or indeterminate progress.')}
        <div class="docs-lab-panel">
          <uik-progress data-docs-progress value="42" max="100"></uik-progress>
          <uik-button variant="ghost" data-docs-action="progress-toggle">Toggle indeterminate</uik-button>
        </div>`,
      ),
    ],
  },
];

export const buildPageMap = () => {
  const map = new Map<string, DocPage>();
  for (const page of docsPages) {
    map.set(`docs/${page.id}`, page);
  }
  for (const page of labPages) {
    map.set(`lab/${page.id}`, page);
  }
  return map;
};

export const renderToc = (page: DocPage) => {
  if (!page.sections.length) return '';
  return `<nav aria-label="On this page" class="docs-toc">${list(
    page.sections.map(
      sectionItem => `<uik-link href="#${sectionItem.id}">${sectionItem.title}</uik-link>`,
    ),
  )}</nav>`;
};

export const renderPageSections = (page: DocPage) => {
  return page.sections
    .map(sectionItem => {
      return `
        <section class="docs-section" id="${sectionItem.id}">
          <uik-heading level="2">${sectionItem.title}</uik-heading>
          <div class="docs-section-body">${sectionItem.body}</div>
        </section>
      `;
    })
    .join('');
};
