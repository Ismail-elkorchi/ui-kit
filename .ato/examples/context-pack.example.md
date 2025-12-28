# Context Pack Example

Command:

```sh
ato pack --task "add motion tokens" --budget 1200 --format md --focus ui-tokens
```

Example output (truncated):

```md
# Context Pack

- task: add motion tokens
- focus: ui-tokens
- budget: 1200 chars

## Bootstrap Summary

- Release: 0.1.1 → 0.1.2 (line: 0.1.x)
- In Progress: BL-0065
- Next Safe: BL-0007
- Blockers: none

## Pointers

- Contract: .ato/contracts/PLATFORM_CONTRACT.md
- Router (root): AGENTS.md
- Router (focus): packages/ui-tokens/AGENTS.md
- Gates: .ato/config.json (gates.\*)
- Queue schema: `@ismail-elkorchi/ato` (schemas/queue.v1.json)

## Next Commands (by focus)

- Workspace: packages/ui-tokens
- build: npm -w packages/ui-tokens run build
- verify: npm -w packages/ui-tokens run verify
- test: npm -w packages/ui-tokens run test

## Queue Items

- BL-0007 (queued) — Add motion tokens | target: exact:0.1.2
```

Notes:

- Essentials are always included; queue items drop first if budget is tight.
