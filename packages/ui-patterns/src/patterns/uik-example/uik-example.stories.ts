import "@ismail-elkorchi/ui-primitives/register";
import "@ismail-elkorchi/ui-patterns/uik-example";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const codeSampleComfortable = `<uik-stack direction="horizontal" gap="2" align="center">
  <uik-button variant="solid">Create</uik-button>
  <uik-input
    placeholder="Workspace name"
    aria-label="Workspace name"
  ></uik-input>
</uik-stack>`;

const codeSampleCompact = `<uik-stack direction="horizontal" gap="1" align="center">
  <uik-button variant="secondary">Create</uik-button>
  <uik-input
    placeholder="Workspace name"
    aria-label="Workspace name"
  ></uik-input>
</uik-stack>`;

const meta: Meta = {
  title: "Patterns/Example",
  component: "uik-example",
  tags: ["autodocs", "visual"],
  parameters: {
    layout: "padded",
  },
  render: () => html`
    <uik-example title="Preview + Code" variant="comfortable">
      <uik-tabs slot="controls" activation="manual">
        <uik-tab slot="tab" value="comfortable">Comfortable</uik-tab>
        <uik-tab slot="tab" value="compact">Compact</uik-tab>
      </uik-tabs>
      <div slot="preview" data-variant="comfortable">
        <uik-stack direction="horizontal" gap="2" align="center">
          <uik-button variant="solid">Create</uik-button>
          <uik-input
            placeholder="Workspace name"
            aria-label="Workspace name"
          ></uik-input>
        </uik-stack>
      </div>
      <div slot="preview" data-variant="compact">
        <uik-stack direction="horizontal" gap="1" align="center">
          <uik-button variant="secondary">Create</uik-button>
          <uik-input
            placeholder="Workspace name"
            aria-label="Workspace name"
          ></uik-input>
        </uik-stack>
      </div>
      <uik-code-block slot="code" copyable data-variant="comfortable"
        >${codeSampleComfortable}</uik-code-block
      >
      <uik-code-block slot="code" copyable data-variant="compact"
        >${codeSampleCompact}</uik-code-block
      >
    </uik-example>
  `,
};

export default meta;

type Story = StoryObj;

export const Default: Story = {};
