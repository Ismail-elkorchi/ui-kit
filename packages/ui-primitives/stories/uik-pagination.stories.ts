import "@ismail-elkorchi/ui-primitives/register";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

type PaginationArgs = {
  page: number;
  pageCount: number;
  total: number;
};

const meta: Meta<PaginationArgs> = {
  title: "Primitives/Pagination",
  component: "uik-pagination",
  tags: ["autodocs"],
  args: {
    page: 2,
    pageCount: 8,
    total: 128,
  },
  render: (args) => html`
    <uik-pagination
      .page=${args.page}
      .pageCount=${args.pageCount}
      .total=${args.total}
      aria-label="Pagination"
    ></uik-pagination>
  `,
};

export default meta;

export const Default: StoryObj<PaginationArgs> = {
  ...interactionStory,
};

export const LongRange: StoryObj<PaginationArgs> = {
  ...interactionStory,
  args: {
    page: 6,
    pageCount: 24,
    total: 480,
  },
};
