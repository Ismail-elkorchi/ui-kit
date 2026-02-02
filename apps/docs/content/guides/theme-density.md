## Set theme and density attributes

UIK reads `data-uik-theme` and `data-uik-density` from the root element.

```html
<html data-uik-theme="light" data-uik-density="comfortable"></html>
```

## Switch at runtime

Update attributes to toggle theme or density without reloading the page.

```ts
document.documentElement.setAttribute("data-uik-theme", "dark");
document.documentElement.setAttribute("data-uik-density", "compact");
```

## Ship both modes

Include both light and dark theme layers in CSS so the attribute switch is instant.
