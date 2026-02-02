## Install with a package manager

UIK ships as standards-first ESM. Install the packages you need in your app or workspace.

```bash
npm install @ismail-elkorchi/ui-tokens @ismail-elkorchi/ui-primitives @ismail-elkorchi/ui-patterns @ismail-elkorchi/ui-shell
```

## No-bundler / import-map setup

If you are not using a bundler, copy the published `dist/` folders into a public asset directory and map UIK entrypoints.

```html
<link rel="stylesheet" href="/vendor/ui-tokens/base.css" />

<script type="importmap">
  {
    "imports": {
      "@ismail-elkorchi/ui-primitives/register": "/vendor/ui-primitives/register.js",
      "@ismail-elkorchi/ui-patterns/register": "/vendor/ui-patterns/register.js",
      "@ismail-elkorchi/ui-shell/register": "/vendor/ui-shell/register.js"
    }
  }
</script>

<script type="module">
  import "@ismail-elkorchi/ui-primitives/register";
  import "@ismail-elkorchi/ui-patterns/register";
  import "@ismail-elkorchi/ui-shell/register";
</script>
```

Keep the import map explicit so it is clear which entrypoints are in use.
