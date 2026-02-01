# Markdown Rendering

Markdown content should render with tables, callouts, and token-first styling.

## Tables

| Surface     | Status                             |
| ----------- | ---------------------------------- |
| Tables      | Render with proper table semantics |
| Admonitions | Map to UIK alerts                  |

## Admonitions

> [!NOTE]
> Notes map to `uik-alert` with the info variant and can include `inline code`.
>
> Use multiple paragraphs to describe the context and follow-up guidance.
>
> - This list stays inside the callout.
> - Each item uses token-first list styling.

> [!WARNING]
> Warnings map to `uik-alert` with the warning variant.

> A regular blockquote should stay as a blockquote, not an alert.

## Lists and code

- Use `uik-alert` for callouts.
- Keep tables readable with token-first borders.
- Inline `const inlined = true` should stay inline.

```bash
npm run format
```

```ts
export const formats = ["md", "json"] as const;
export type Format = (typeof formats)[number];
```

```js
const queue = new Map();
queue.set("docs", { ready: true });
```

```css
:root {
  color: oklch(var(--uik-text-default));
  border-radius: var(--uik-radius-3);
}
```

```html
<button class="docs-button" aria-label="Run checks">Run checks</button>
```
