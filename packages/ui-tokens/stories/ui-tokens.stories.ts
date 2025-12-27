import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import { interactionStory } from "../../../.storybook/a11y";

const surfaces = [
  { name: "surface-bg", token: "--uik-surface-bg" },
  { name: "surface-card", token: "--uik-surface-card" },
  { name: "surface-muted", token: "--uik-surface-muted" },
  { name: "surface-popover", token: "--uik-surface-popover" },
];

const text = [
  { name: "text-default", token: "--uik-text-default" },
  { name: "text-muted", token: "--uik-text-muted" },
  { name: "text-secondary", token: "--uik-text-secondary" },
  { name: "text-link", token: "--uik-text-link-default" },
];

const borders = [
  { name: "border-default", token: "--uik-border-default" },
  { name: "border-muted", token: "--uik-border-muted" },
  { name: "border-strong", token: "--uik-border-strong" },
];

const intents = [
  { name: "primary-bg", token: "--uik-intent-primary-bg-default" },
  { name: "danger-bg", token: "--uik-intent-danger-bg-default" },
  { name: "success-bg", token: "--uik-intent-success-bg-default" },
  { name: "warning-bg", token: "--uik-intent-warning-bg-default" },
];

const meta: Meta = {
  title: "Tokens/Overview",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  render: () => html`
    <style>
      .uik-tokens-stack {
        display: flex;
        flex-direction: column;
        gap: var(--uik-space-8);
      }
      .uik-tokens-section {
        display: flex;
        flex-direction: column;
        gap: var(--uik-space-3);
      }
      .uik-tokens-heading {
        color: oklch(var(--uik-text-default));
        font-size: var(--uik-typography-font-size-3);
        font-weight: var(--uik-typography-font-weight-semibold);
      }
      .uik-tokens-grid {
        display: grid;
        grid-template-columns: repeat(
          auto-fit,
          minmax(var(--uik-space-12), 1fr)
        );
        gap: var(--uik-space-3);
      }
      .uik-tokens-card {
        display: flex;
        align-items: center;
        gap: var(--uik-space-3);
        padding: var(--uik-space-3);
        border: var(--uik-border-width-1) solid oklch(var(--uik-border-default));
        border-radius: var(--uik-radius-3);
        background: oklch(var(--uik-surface-card));
      }
      .uik-tokens-swatch {
        width: var(--uik-space-8);
        height: var(--uik-space-8);
        border-radius: var(--uik-radius-3);
        border: var(--uik-border-width-1) solid oklch(var(--uik-border-default));
        background: oklch(var(--uik-surface-bg));
      }
      .uik-tokens-details {
        display: flex;
        flex-direction: column;
        gap: var(--uik-space-1);
      }
      .uik-tokens-name {
        color: oklch(var(--uik-text-default));
        font-size: var(--uik-typography-font-size-2);
      }
      .uik-tokens-token {
        color: oklch(var(--uik-text-muted));
        font-size: var(--uik-typography-font-size-1);
        font-family: var(--uik-typography-font-family-mono);
      }
      .uik-tokens-sample {
        font-size: var(--uik-typography-font-size-6);
        font-weight: var(--uik-typography-font-weight-semibold);
        line-height: var(--uik-typography-line-height-6);
      }
    </style>
    <div class="uik-tokens-stack">
      <section class="uik-tokens-section">
        <h2 class="uik-tokens-heading">Surfaces</h2>
        <div class="uik-tokens-grid">
          ${surfaces.map(
            (item) => html`
              <div class="uik-tokens-card">
                <div
                  class="uik-tokens-swatch"
                  style="background: oklch(var(${item.token}));"
                ></div>
                <div class="uik-tokens-details">
                  <span class="uik-tokens-name">${item.name}</span>
                  <span class="uik-tokens-token">${item.token}</span>
                </div>
              </div>
            `,
          )}
        </div>
      </section>

      <section class="uik-tokens-section">
        <h2 class="uik-tokens-heading">Text</h2>
        <div class="uik-tokens-grid">
          ${text.map(
            (item) => html`
              <div class="uik-tokens-card">
                <div
                  class="uik-tokens-sample"
                  style="color: oklch(var(${item.token}));"
                >
                  Aa
                </div>
                <div class="uik-tokens-details">
                  <span class="uik-tokens-name">${item.name}</span>
                  <span class="uik-tokens-token">${item.token}</span>
                </div>
              </div>
            `,
          )}
        </div>
      </section>

      <section class="uik-tokens-section">
        <h2 class="uik-tokens-heading">Borders</h2>
        <div class="uik-tokens-grid">
          ${borders.map(
            (item) => html`
              <div class="uik-tokens-card">
                <div
                  class="uik-tokens-swatch"
                  style="border-color: oklch(var(${item.token})); border-width: var(--uik-border-width-2);"
                ></div>
                <div class="uik-tokens-details">
                  <span class="uik-tokens-name">${item.name}</span>
                  <span class="uik-tokens-token">${item.token}</span>
                </div>
              </div>
            `,
          )}
        </div>
      </section>

      <section class="uik-tokens-section">
        <h2 class="uik-tokens-heading">Intent</h2>
        <div class="uik-tokens-grid">
          ${intents.map(
            (item) => html`
              <div class="uik-tokens-card">
                <div
                  class="uik-tokens-swatch"
                  style="background: oklch(var(${item.token}));"
                ></div>
                <div class="uik-tokens-details">
                  <span class="uik-tokens-name">${item.name}</span>
                  <span class="uik-tokens-token">${item.token}</span>
                </div>
              </div>
            `,
          )}
        </div>
      </section>
    </div>
  `,
};

export default meta;

type Story = StoryObj;

export const Overview: Story = {
  ...interactionStory,
};
