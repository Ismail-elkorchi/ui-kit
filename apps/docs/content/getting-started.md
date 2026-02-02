## Install the core packages

UIK is split into tokens, primitives, patterns, and shell so you can adopt only what you need.

```bash
npm install @ismail-elkorchi/ui-tokens @ismail-elkorchi/ui-primitives @ismail-elkorchi/ui-patterns @ismail-elkorchi/ui-shell
```

## Load tokens

Import token CSS once so every primitive reads the same CSS custom properties.

```css
@import "@ismail-elkorchi/ui-tokens/base.css";
```

## Register components

Register custom elements before rendering any UIK markup.

```ts
import "@ismail-elkorchi/ui-primitives/register";
import "@ismail-elkorchi/ui-patterns/register";
import "@ismail-elkorchi/ui-shell/register";
```

## Theme + density

Switch theme or density by setting data attributes on the root element.

```html
<html data-uik-theme="dark" data-uik-density="compact"></html>
```

## Next steps

- Installation
- Usage
- Tokens
- Theme + Density
