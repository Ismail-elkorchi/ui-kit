# UIK Docs

The UIK documentation site and dogfooding lab. It is built with UIK tokens, primitives, and shell components.

## Markdown rendering

Markdown content is rendered at build time using `marked`. Raw HTML is allowed because the sources are repo-controlled; do not feed untrusted user input into the docs generator.

## Development

```bash
npm install
npm run --workspace apps/docs dev
```

## Build

```bash
npm run --workspace apps/docs build
```

## Preview

```bash
npm run --workspace apps/docs preview
```
