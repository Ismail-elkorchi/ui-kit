# Shell layout

Compose an application shell that keeps navigation, context, and status aligned
in a single layout system.

## App shell structure

```example-html
<uik-shell-layout isSecondarySidebarVisible>
  <uik-shell-sidebar
    slot="primary-sidebar"
    heading="Workspace"
    subtitle="Operations"
  >
    <uik-stack gap="2">
      <uik-button variant="ghost" aria-current="page">Overview</uik-button>
      <uik-button variant="ghost">Deployments</uik-button>
      <uik-button variant="ghost">Usage</uik-button>
      <uik-button variant="ghost">Settings</uik-button>
    </uik-stack>
    <div slot="footer">
      <uik-text as="p" size="sm" tone="muted">Plan: Pro</uik-text>
    </div>
  </uik-shell-sidebar>

  <uik-shell-secondary-sidebar
    slot="secondary-sidebar"
    heading="Status"
    isOpen
  >
    <uik-stack gap="2">
      <uik-text as="p">All systems operational.</uik-text>
      <uik-button variant="secondary">View logs</uik-button>
    </uik-stack>
  </uik-shell-secondary-sidebar>

  <uik-box slot="main-content" padding="4">
    <uik-stack gap="4">
      <uik-page-hero>
        <uik-badge slot="eyebrow" variant="secondary">Operations</uik-badge>
        <uik-heading slot="title" level="1">Deployments</uik-heading>
        <uik-text slot="summary" as="p">
          Track active releases and keep teammates aligned on rollout status.
        </uik-text>
        <uik-stack slot="links" direction="horizontal" gap="2" align="center">
          <uik-link href="#">View runbook</uik-link>
          <uik-link href="#">Release checklist</uik-link>
        </uik-stack>
      </uik-page-hero>
      <uik-section-card>
        <uik-heading slot="title" level="2">Upcoming deployments</uik-heading>
        <uik-text as="p">Queue changes for the next release window.</uik-text>
        <div slot="actions">
          <uik-button variant="secondary">Schedule</uik-button>
          <uik-button>Deploy now</uik-button>
        </div>
      </uik-section-card>
    </uik-stack>
  </uik-box>

  <uik-shell-status-bar
    slot="status-bar"
    message="Syncing pipeline"
    tone="info"
    meta="All systems nominal"
  >
    <uik-button slot="context-actions" variant="ghost">
      Pause build
    </uik-button>
    <uik-button slot="global-controls" variant="secondary">
      View status
    </uik-button>
  </uik-shell-status-bar>
</uik-shell-layout>
```
