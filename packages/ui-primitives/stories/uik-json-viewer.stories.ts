import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

type JsonViewerArgs = {
  expandedDepth: number;
  useJson: boolean;
};

const sample = {
  status: "ok",
  version: "0.3.0",
  flags: {
    exploration: true,
    streaming: false,
  },
  owners: ["docs", "design", "platform"],
  metadata: {
    notes:
      "This is a deliberately long string that should truncate in the preview while remaining copyable in full.",
    updatedAt: "2026-02-02T20:45:00Z",
  },
  nested: {
    list: [
      { id: 1, label: "Alpha" },
      { id: 2, label: "Bravo" },
    ],
  },
};

const sampleJson = JSON.stringify(sample, null, 2);

const meta: Meta<JsonViewerArgs> = {
  title: "Primitives/JSON Viewer",
  component: "uik-json-viewer",
  tags: ["autodocs"],
  args: {
    expandedDepth: 2,
    useJson: false,
  },
  render: (args) => {
    const json = args.useJson ? sampleJson : "";
    const value = args.useJson ? undefined : sample;
    return html`
      <uik-json-viewer
        aria-label="Sample JSON"
        .json=${json}
        .value=${value}
        .expandedDepth=${args.expandedDepth}
        style="max-width: var(--uik-layout-panel-width-lg);"
      ></uik-json-viewer>
    `;
  },
};

export default meta;

export const Default: StoryObj<JsonViewerArgs> = {};

export const JSONAttribute: StoryObj<JsonViewerArgs> = {
  args: {
    useJson: true,
  },
};

export const Visual: StoryObj<JsonViewerArgs> = {
  tags: ["visual"],
  render: () => html`
    <uik-json-viewer
      aria-label="JSON viewer visual"
      .value=${sample}
      .expandedDepth=${3}
      style="max-width: var(--uik-layout-panel-width-lg);"
    ></uik-json-viewer>
  `,
};
