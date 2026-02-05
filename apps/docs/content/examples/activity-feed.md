# Activity feed

Give teams a clear run history with a structured timeline that is easy to scan
and copy into incident reports.

## Run history timeline

```example-html
<uik-section-card>
  <uik-heading slot="title" level="2">Release activity</uik-heading>
  <uik-text as="p">Track run history and highlight the latest status.</uik-text>
  <uik-timeline
    aria-label="Release run history"
    json-items='[{"title":"Deploy queued","description":"Waiting for approvals from compliance.","meta":"09:12","status":"Queued"},{"title":"Build completed","description":"Artifacts uploaded to the registry.","meta":"09:18","status":"Success"},{"title":"Deploy running","description":"Applying updates to production.","meta":"09:22","status":"Running"}]'
  ></uik-timeline>
</uik-section-card>
```

## Keyboard expectations

Timeline items are static list entries. If you place interactive controls inside
an entry (like links or buttons), focus order follows the DOM order within each
item.
