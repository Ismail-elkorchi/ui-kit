# Markdown Rendering

Markdown content should render with tables, callouts, and token-first styling.

## Tables

| Surface     | Status                             |
| ----------- | ---------------------------------- |
| Tables      | Render with proper table semantics |
| Admonitions | Map to UIK alerts                  |

## Admonitions

> [!NOTE]
> Notes map to `uik-alert` with the info variant.

> [!WARNING]
> Warnings map to `uik-alert` with the warning variant.

## Lists and code

- Use `uik-alert` for callouts.
- Keep tables readable with token-first borders.

```bash
npm run format
```
