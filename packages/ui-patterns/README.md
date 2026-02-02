# @ismail-elkorchi/ui-patterns

Composed UI patterns built from UIK primitives. Patterns are Custom Elements that assemble primitives into higher-level flows while exposing clear slots, parts, and token-backed theming hooks.

## Dependency rules

- Depends on `@ismail-elkorchi/ui-primitives` and `@ismail-elkorchi/ui-tokens`.
- Must not depend on `@ismail-elkorchi/ui-shell`.
- Patterns consume primitives via public attributes/props only.

## Using the patterns

```ts
import "@ismail-elkorchi/ui-tokens/index.css";
import "@ismail-elkorchi/ui-primitives/register";
import "@ismail-elkorchi/ui-patterns/register";
```

```html
<uik-empty-state>
  <span slot="title">No data yet</span>
  <span slot="description">Create your first record to get started.</span>
  <div slot="actions">
    <uik-button variant="solid">Create record</uik-button>
  </div>
</uik-empty-state>
```

```html
<uik-example title="Preview + Code">
  <div slot="preview">
    <uik-button variant="secondary">Preview</uik-button>
  </div>
  <uik-code-block slot="code" copyable>
    &lt;uik-button variant="secondary"&gt;Preview&lt;/uik-button&gt;
  </uik-code-block>
</uik-example>
```
