import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type CodeBlockArgs = {
  copy: boolean;
  inline: boolean;
};

const sample = `{
  "queue": "BL-0167",
  "status": "done",
  "owner": "codex"
}`;

const meta: Meta<CodeBlockArgs> = {
  title: "Primitives/Code Block",
  component: "uik-code-block",
  tags: ["autodocs"],
  args: {
    copy: true,
    inline: false,
  },
  render: (args) =>
    args.inline
      ? html`
          <p>
            Run <uik-code-block inline>ato dashboard serve</uik-code-block> to
            launch the local UI.
          </p>
        `
      : html`
          <uik-code-block
            ?copy=${args.copy}
            style="max-width: var(--uik-layout-panel-width-lg);"
            aria-label="Queue payload"
          >
            ${sample}
          </uik-code-block>
        `,
};

export default meta;

export const Default: StoryObj<CodeBlockArgs> = {
  ...interactionStory,
};

export const Inline: StoryObj<CodeBlockArgs> = {
  ...interactionStory,
  args: {
    inline: true,
  },
};
