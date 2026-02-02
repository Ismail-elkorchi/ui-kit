import "@ismail-elkorchi/ui-primitives/register";
import "@ismail-elkorchi/ui-patterns/uik-example";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const codeSample = `<uik-stack direction="horizontal" gap="2" align="center">
  <uik-button variant="solid">Create</uik-button>
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
    <uik-example title="Preview + Code">
      <div slot="preview">
        <uik-stack direction="horizontal" gap="2" align="center">
          <uik-button variant="solid">Create</uik-button>
          <uik-input
            placeholder="Workspace name"
            aria-label="Workspace name"
          ></uik-input>
        </uik-stack>
      </div>
      <uik-code-block slot="code" copyable>${codeSample}</uik-code-block>
    </uik-example>
  `,
};

export default meta;

type Story = StoryObj;

export const Default: Story = {};
