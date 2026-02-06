## Load base tokens

Base tokens define global CSS custom properties consumed by every component.

```css
@import "@ismail-elkorchi/ui-tokens/base.css";
```

## Add theme layers

UIK ships theme and density layers as separate CSS files so you can opt in explicitly.

```css
@import "@ismail-elkorchi/ui-tokens/themes/uik-theme-base.css";
@import "@ismail-elkorchi/ui-tokens/themes/uik-light.css";
@import "@ismail-elkorchi/ui-tokens/themes/uik-dark.css";
@import "@ismail-elkorchi/ui-tokens/themes/uik-density-comfortable.css";
@import "@ismail-elkorchi/ui-tokens/themes/uik-density-compact.css";
```

## Override tokens in the host

Override any `--uik-*` token in your app scope to customize the system.

```css
:root {
  --uik-border-radius-4: var(--uik-border-radius-6);
}
```

## Semantic app naming

UIK does not ship a second "app semantic alias" layer. Use the built-in semantic tokens directly (`--uik-surface-*`, `--uik-text-*`, `--uik-border-*`, `--uik-focus-ring-*`) so host styles stay aligned with source tokens.

If your app requires local aliases like `--background` or `--foreground`, define them in your app stylesheet as thin references:

```css
:root {
  --background: oklch(var(--uik-surface-bg));
  --foreground: oklch(var(--uik-text-default));
  --border: oklch(var(--uik-border-default));
  --ring: oklch(var(--uik-focus-ring-default));
}
```
