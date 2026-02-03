# Apply preview

Preview JSON changes before applying updates in a critical workflow.

## Proposed changes

```json-diff
{
  "workspace": "Atlas",
  "plan": "starter",
  "members": 12,
  "alerts": {
    "status": "daily",
    "slack": false
  }
}
---
{
  "workspace": "Atlas",
  "plan": "pro",
  "members": 18,
  "alerts": {
    "status": "hourly",
    "slack": true
  },
  "billing": {
    "cycle": "annual",
    "renewal": "2026-03-01"
  }
}
```

## Final shape review

```json-viewer
{
  "workspace": "Atlas",
  "plan": "pro",
  "members": 18,
  "alerts": {
    "status": "hourly",
    "slack": true
  },
  "billing": {
    "cycle": "annual",
    "renewal": "2026-03-01"
  }
}
```

## How to interpret changes

Focus on the summary count first, then review each changed path. Confirm that
added keys align with user intent and that replacements have the expected
before/after values.
