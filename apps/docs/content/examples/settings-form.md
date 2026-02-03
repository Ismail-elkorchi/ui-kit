# Settings form

Build a production-ready settings surface that pairs validation, hints, and clear
save actions.

## Core settings

```example-html
<uik-section-card>
  <uik-heading slot="title" level="2">Workspace settings</uik-heading>
  <uik-text as="p">Keep core details accurate for your team.</uik-text>
  <uik-stack gap="3">
    <uik-input name="workspaceName">
      <span slot="label">Workspace name</span>
      <span slot="hint">Shown in navigation and invites.</span>
    </uik-input>
    <uik-input name="supportEmail" invalid>
      <span slot="label">Support email</span>
      <span slot="error">Enter a valid shared inbox.</span>
    </uik-input>
    <uik-select name="region">
      <span slot="label">Region</span>
      <span slot="hint">Controls data residency defaults.</span>
      <option value="us">United States</option>
      <option value="eu">Europe</option>
      <option value="apac">Asia Pacific</option>
    </uik-select>
    <uik-switch name="autoUpdates" checked>
      <span slot="label">Auto-apply weekly updates</span>
      <span slot="hint">We will schedule downtime notifications.</span>
    </uik-switch>
  </uik-stack>
  <div slot="actions">
    <uik-button variant="secondary">Cancel</uik-button>
    <uik-button>Save changes</uik-button>
  </div>
</uik-section-card>
```

## Density modes

Switch between comfortable and compact density without changing the layout
structure.

<uik-example title="Density modes" variant="comfortable" data-example="settings-density">
  <uik-select slot="controls" value="comfortable">
    <span slot="label">Density</span>
    <option value="comfortable">Comfortable</option>
    <option value="compact">Compact</option>
  </uik-select>
  <div slot="preview" data-variant="comfortable">
    <uik-section-card>
      <uik-heading slot="title" level="2">Profile details</uik-heading>
      <uik-stack gap="3">
        <uik-input name="displayName">
          <span slot="label">Display name</span>
          <span slot="hint">Shown on public-facing pages.</span>
        </uik-input>
        <uik-input name="supportEmail" invalid>
          <span slot="label">Support email</span>
          <span slot="error">Enter a valid inbox.</span>
        </uik-input>
      </uik-stack>
    </uik-section-card>
  </div>
  <div slot="preview" data-variant="compact" data-uik-density="compact">
    <uik-section-card>
      <uik-heading slot="title" level="2">Profile details</uik-heading>
      <uik-stack gap="3">
        <uik-input name="displayName">
          <span slot="label">Display name</span>
          <span slot="hint">Shown on public-facing pages.</span>
        </uik-input>
        <uik-input name="supportEmail" invalid>
          <span slot="label">Support email</span>
          <span slot="error">Enter a valid inbox.</span>
        </uik-input>
      </uik-stack>
    </uik-section-card>
  </div>
  <uik-code-block
    slot="code"
    class="docs-code-block"
    copyable
    data-variant="comfortable"
  >
    <span class="docs-code-content" data-language="html">
      &lt;uik-section-card&gt;
        &lt;uik-heading slot="title" level="2"&gt;Profile details&lt;/uik-heading&gt;
        &lt;uik-stack gap="3"&gt;
          &lt;uik-input name="displayName"&gt;
            &lt;span slot="label"&gt;Display name&lt;/span&gt;
            &lt;span slot="hint"&gt;Shown on public-facing pages.&lt;/span&gt;
          &lt;/uik-input&gt;
          &lt;uik-input name="supportEmail" invalid&gt;
            &lt;span slot="label"&gt;Support email&lt;/span&gt;
            &lt;span slot="error"&gt;Enter a valid inbox.&lt;/span&gt;
          &lt;/uik-input&gt;
        &lt;/uik-stack&gt;
      &lt;/uik-section-card&gt;
    </span>
  </uik-code-block>
  <uik-code-block
    slot="code"
    class="docs-code-block"
    copyable
    data-variant="compact"
  >
    <span class="docs-code-content" data-language="html">
      &lt;div data-uik-density="compact"&gt;
        &lt;uik-section-card&gt;
          &lt;uik-heading slot="title" level="2"&gt;Profile details&lt;/uik-heading&gt;
          &lt;uik-stack gap="3"&gt;
            &lt;uik-input name="displayName"&gt;
              &lt;span slot="label"&gt;Display name&lt;/span&gt;
              &lt;span slot="hint"&gt;Shown on public-facing pages.&lt;/span&gt;
            &lt;/uik-input&gt;
            &lt;uik-input name="supportEmail" invalid&gt;
              &lt;span slot="label"&gt;Support email&lt;/span&gt;
              &lt;span slot="error"&gt;Enter a valid inbox.&lt;/span&gt;
            &lt;/uik-input&gt;
          &lt;/uik-stack&gt;
        &lt;/uik-section-card&gt;
      &lt;/div&gt;
    </span>
  </uik-code-block>
</uik-example>
