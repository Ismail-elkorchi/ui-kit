# Release workflow

## Version policy

- UIK publishable packages (`@ismail-elkorchi/ui-*`) share a single version.
- Internal dependency constraints are **exact** (no carets) to keep workspaces aligned.
- Docs (`apps/docs`) stays `private: true`, but its internal dependency versions stay aligned with the release version.

## Commands

- `npm run release:check` – run the full gate chain.
- `npm run release:bump -- --type patch` – bump versions and sync internal deps.
- `npm run release:tag -- --version 0.x.y` – generate notes + tag.
- `npm run release -- --type patch` – full release workflow.

Release notes are written to `tools/release/notes/vX.Y.Z.md`.
