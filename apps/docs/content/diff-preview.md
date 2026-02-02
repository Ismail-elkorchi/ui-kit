# Diff Preview

Use the diff preview when you need to review structured changes before applying them.

## Basic diff

```json-diff
{
  "status": "queued",
  "owner": "docs",
  "count": 2
}
---
{
  "status": "done",
  "owner": "docs",
  "count": 3,
  "approved": true
}
```

## Nested structures and arrays

```json-diff
{
  "pipeline": {
    "steps": ["validate", "preview"],
    "meta": {
      "attempt": 1,
      "flags": ["alpha"]
    }
  }
}
---
{
  "pipeline": {
    "steps": ["validate", "preview", "apply"],
    "meta": {
      "attempt": 2,
      "flags": ["alpha", "bravo"]
    }
  },
  "result": {
    "status": "ok"
  }
}
```

## How to interpret changes

- **Add** means a new key or array index appears in the after state.
- **Remove** means a key or array index disappears from the after state.
- **Replace** means the value at a path changed.

Arrays are compared by index for this first version.
