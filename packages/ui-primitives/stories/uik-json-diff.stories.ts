import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

type JsonDiffArgs = {
  useJson: boolean;
};

const beforeValue = {
  status: "queued",
  owner: "docs",
  flags: ["alpha"],
  meta: {
    count: 2,
    label: "Preview",
  },
};

const afterValue = {
  status: "done",
  owner: "docs",
  flags: ["alpha", "bravo"],
  meta: {
    count: 3,
    label: "Preview",
  },
  extra: true,
};

const beforeJson = JSON.stringify(beforeValue, null, 2);
const afterJson = JSON.stringify(afterValue, null, 2);

const meta: Meta<JsonDiffArgs> = {
  title: "Primitives/JSON Diff",
  component: "uik-json-diff",
  tags: ["autodocs"],
  args: {
    useJson: false,
  },
  render: (args) => {
    const jsonBefore = args.useJson ? beforeJson : "";
    const jsonAfter = args.useJson ? afterJson : "";
    const before = args.useJson ? undefined : beforeValue;
    const after = args.useJson ? undefined : afterValue;
    return html`
      <uik-json-diff
        aria-label="Sample JSON diff"
        .jsonBefore=${jsonBefore}
        .jsonAfter=${jsonAfter}
        .before=${before}
        .after=${after}
        style="max-width: var(--uik-layout-panel-width-lg);"
      ></uik-json-diff>
    `;
  },
};

export default meta;

export const Default: StoryObj<JsonDiffArgs> = {};

export const JSONAttributes: StoryObj<JsonDiffArgs> = {
  args: {
    useJson: true,
  },
};

export const Visual: StoryObj<JsonDiffArgs> = {
  tags: ["visual"],
  render: () => html`
    <uik-json-diff
      aria-label="JSON diff visual"
      .before=${beforeValue}
      .after=${afterValue}
      style="max-width: var(--uik-layout-panel-width-lg);"
    ></uik-json-diff>
  `,
};
