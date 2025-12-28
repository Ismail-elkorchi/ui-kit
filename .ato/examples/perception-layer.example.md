# Perception Layer Example

Limitation (named): Context packs truncated sections, masking important details under tight budgets.

Minimal improvement:

- Remove truncation; enforce budget by omitting whole units only.
- Fail with a clear error if the budget cannot be met after dropping all optional units.

Regression check:

- Run `ato lint protocol` (router protocol metadata present + correct).
- Run `ato lint terms` (terminology consistency across routers).
- Run `ato pack --task "..." --budget 1 --format md` and verify it fails fast with a clear error when the budget cannot be met.
