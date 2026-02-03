# Apply preview

Use diff previews to help teams review changes before applying updates.

## Status change

```json-diff
{
  "status": "queued",
  "items": 3
}
---
{
  "status": "running",
  "items": 4,
  "owner": "design-ops"
}
```

## Nested updates

```json-diff
{
  "project": {
    "id": "alpha",
    "roles": ["owner", "reviewer"],
    "flags": {
      "beta": false,
      "export": false
    }
  }
}
---
{
  "project": {
    "id": "alpha",
    "roles": ["owner", "reviewer", "approver"],
    "flags": {
      "beta": true,
      "export": false
    }
  }
}
```

## Inspect the final payload

```json-viewer
{
  "status": "running",
  "items": 4,
  "owner": "design-ops",
  "project": {
    "id": "alpha",
    "roles": ["owner", "reviewer", "approver"],
    "flags": {
      "beta": true,
      "export": false
    }
  }
}
```

## How to interpret changes

Additions show new fields or list entries, removals show deleted paths, and
replacements show updates to existing values. Use the copy actions to capture a
path or value for review notes.
