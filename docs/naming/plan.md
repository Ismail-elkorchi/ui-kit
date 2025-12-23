# Naming Plan for UIK Monorepo

## Goal
Apply the repo-wide naming rules consistently across packages so public names read like contracts, shared layers stay vendor-neutral, and one concept maps to one term everywhere.

## Scope
- All packages in the monorepo (tokens, primitives, shell, and shared tooling).
- Public API surfaces: exports, types, functions, events, slots, parts, CSS vars, token names, filenames, and folder names.

## Steps (Execute in Step 2)
1) Read the repo and package AGENTS to confirm naming constraints and boundaries.
2) Inventory current vocabulary:
   - List public exports per package.
   - List token namespaces, CSS vars, and component hooks.
   - List key types/functions/classes and top-level folders.
3) Inventory unused items that pollute the space:
   - List unused exports, tokens, CSS vars, types, functions, files, and folders.
   - Record each unused item with its location; external consumer risk is accepted.
4) Build a vocabulary map:
   - Define each concept in one sentence.
   - Pick one canonical term per concept.
   - Record disallowed synonyms.
5) Identify violations:
   - Vendor names in shared layers.
   - Implementation-driven names that do not describe intent.
   - Synonym drift across packages.
6) Establish a naming glossary:
   - Capture canonical terms, definitions, and disallowed synonyms.
   - Note which layer owns each term (tokens, primitives, shell).
7) Plan renames with mechanical consistency:
   - Rename source identifiers, filenames, exports, and docs together.
   - Update references in stories/tests and package exports.
8) Apply changes in deterministic order:
   - Tokens first, then primitives, then shell.
   - Keep a running checklist of updated references.
9) Update documentation and contracts:
   - Storybook and README references.
   - Public API docs (props/attrs/events/slots/parts/custom properties).
10) Validate:
   - Run lint/typecheck/tests/build if available.
   - Scan for old terms to confirm no drift remains.

## Remarks
- Prefer domain terms over implementation terms (intent over mechanism).
- Avoid inventing new concepts; align to existing architecture and contracts.
- Keep names short but unambiguous; avoid clever abbreviations.
- If a rename changes public API, document it and keep stories/tests aligned.
- No backward-compatibility layer for naming changes; prioritize coherence and unambiguity across the monorepo even for external consumers.
- Unused items identified in the inventory are eligible for deletion to reduce naming noise and drift, even if public exports break.
- Add enforcement hooks if feasible (lint rules, review checklist, or scripts) to prevent drift.

## Dangers to Avoid
- Introducing vendor names in shared layers (tokens/primitives).
- Partial renames that leave conflicting terms in code or docs.
- Renaming in one layer without updating consumers.
- Leaving stale exports or deep import usage after renames.
- Renaming files/folders to match tools rather than domain concepts.

## Definition of Done
- Vocabulary is consistent across packages and documentation.
- Public names read like contracts and match the chosen terms.
- No vendor naming appears in shared layers.
- Public exports and filenames match the canonical terms, even when breaking changes.
