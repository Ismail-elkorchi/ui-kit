## Register everything at once

Use the register entrypoints when you want all components available globally.

```ts
import "@ismail-elkorchi/ui-primitives/register";
import "@ismail-elkorchi/ui-patterns/register";
import "@ismail-elkorchi/ui-shell/register";
```

## Register only what you render

Import individual modules when you prefer explicit dependencies or tighter bundles.

```ts
import "@ismail-elkorchi/ui-primitives/uik-button";
import "@ismail-elkorchi/ui-primitives/uik-input";
import "@ismail-elkorchi/ui-patterns/uik-section-card";
import "@ismail-elkorchi/ui-shell/layout";
import "@ismail-elkorchi/ui-shell/status-bar";
```

## Events + value patterns

UIK controls expose a `value` property and forward native `input`/`change` events from their internal form elements.

```ts
const input = document.querySelector("uik-input");
input?.addEventListener("input", (event) => {
  const element = event.currentTarget as HTMLElement & { value?: string };
  console.log("value", element.value ?? "");
});
```

## Form-associated controls

Form controls participate in `FormData` when named.

```html
<form id="profile-form">
  <uik-input name="displayName">
    <span slot="label">Display name</span>
  </uik-input>
</form>
```

## Custom Elements Manifest (CEM)

The CEM file ships alongside each package and is exported for tooling consumption.

```ts
import manifest from "@ismail-elkorchi/ui-primitives/custom-elements.json" assert { type: "json" };
```

The same path is available for shell and patterns packages:

- `@ismail-elkorchi/ui-shell/custom-elements.json`
- `@ismail-elkorchi/ui-patterns/custom-elements.json`

## SSR-safe loading

Only register custom elements in the browser.

```ts
if (typeof window !== "undefined") {
  await import("@ismail-elkorchi/ui-primitives/register");
}
```
