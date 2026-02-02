# JSON Viewer

Use the JSON viewer when you need to present structured data with keyboard navigation and copy actions.

## Basic usage

```json-viewer
{
  "id": "BL-0018",
  "status": "queued",
  "owner": "docs"
}
```

## Nested structures

```json-viewer
{
  "queue": {
    "id": "BL-0018",
    "deps": ["BL-0017", "BL-0015"],
    "steps": [
      { "id": "verify", "done": false },
      { "id": "ship", "done": false }
    ]
  },
  "metrics": {
    "latencyMs": 120,
    "retries": 2
  }
}
```

## Tokens-style payloads

```json-viewer
{
  "component": {
    "jsonViewer": {
      "bg": "{surface.bg}",
      "border": "{border.muted}",
      "value": {
        "string": "{text.success}",
        "number": "{text.info}"
      }
    }
  }
}
```

## When to use / limitations

- Use it for read-only payloads such as configuration snapshots, contracts, or telemetry.
- Keep payloads reasonably sized and adjust `expandedDepth` when you need more context.
- This is a viewer, not an editor or diff tool.
