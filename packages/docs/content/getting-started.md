## Install

Install tokens, primitives, and shell in the same app or workspace.

```bash
npm install @ismail-elkorchi/ui-tokens @ismail-elkorchi/ui-primitives @ismail-elkorchi/ui-shell
```

## Load tokens

Import token CSS once so every primitive reads the same CSS custom properties.

```css
@import '@ismail-elkorchi/ui-tokens/base.css';
```

<uik-alert variant="info">
  <span slot="title">Tokens first</span>
  <uik-text as="p" class="docs-paragraph">Primitives and shell components only consume --uik-* variables.</uik-text>
</uik-alert>

Switch theme or density by setting data attributes on the root element.

```html
<html data-uik-theme="dark" data-uik-density="compact">
```

## Register custom elements

Register primitives and shell components before rendering any markup.

```ts
import '@ismail-elkorchi/ui-primitives/register';
import '@ismail-elkorchi/ui-shell/register';
```

## Compose the shell

Use `<uik-shell-layout>` to wire regions with named slots.

```html
<uik-shell-layout>
  <uik-shell-activity-bar slot="activity-bar"></uik-shell-activity-bar>
  <uik-shell-sidebar slot="primary-sidebar" heading="Navigation"></uik-shell-sidebar>
  <main slot="main-content">Main content</main>
  <uik-shell-status-bar slot="status-bar" message="Ready"></uik-shell-status-bar>
</uik-shell-layout>
```

## Accessibility and forms

Primitives are built on native semantics. Provide labels, hints, and errors via slots, and prefer native form behavior whenever possible.

Controls are form-associated and participate in FormData when named. Keep focus visible and use keyboard-first testing as part of your workflow.

## Next steps

Continue with the Tokens, Primitives, and Shell reference pages for full contracts and usage patterns.
