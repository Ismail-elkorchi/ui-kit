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
