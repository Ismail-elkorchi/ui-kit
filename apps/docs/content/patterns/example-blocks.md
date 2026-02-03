# Example blocks

Example blocks pair previews with copyable code so teams can adopt the same
implementation quickly.

## Preview + code

```example-html
<uik-stack direction="horizontal" gap="2" align="center">
  <uik-button variant="solid">Create</uik-button>
  <uik-input placeholder="Workspace name" aria-label="Workspace name"></uik-input>
</uik-stack>
```

## Anatomy

```html
<uik-example>
  <div slot="preview">
    <!-- Rendered preview markup -->
  </div>
  <uik-code-block slot="code" copyable>
    <!-- Copyable snippet -->
  </uik-code-block>
</uik-example>
```
