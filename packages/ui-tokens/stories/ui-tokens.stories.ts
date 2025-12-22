import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';

const surfaces = [
  {name: 'surface-bg', token: '--uik-surface-bg'},
  {name: 'surface-card', token: '--uik-surface-card'},
  {name: 'surface-muted', token: '--uik-surface-muted'},
  {name: 'surface-popover', token: '--uik-surface-popover'},
];

const text = [
  {name: 'text-default', token: '--uik-text-default'},
  {name: 'text-muted', token: '--uik-text-muted'},
  {name: 'text-secondary', token: '--uik-text-secondary'},
  {name: 'text-link', token: '--uik-text-link-default'},
];

const borders = [
  {name: 'border-default', token: '--uik-border-default'},
  {name: 'border-muted', token: '--uik-border-muted'},
  {name: 'border-strong', token: '--uik-border-strong'},
];

const intents = [
  {name: 'primary-bg', token: '--uik-intent-primary-bg-default'},
  {name: 'danger-bg', token: '--uik-intent-danger-bg-default'},
  {name: 'success-bg', token: '--uik-intent-success-bg-default'},
  {name: 'warning-bg', token: '--uik-intent-warning-bg-default'},
];

const meta: Meta = {
  title: 'Tokens/Overview',
  tags: ['autodocs'],
  parameters: {layout: 'padded'},
  render: () => html`
    <div class="flex flex-col gap-8">
      <section class="flex flex-col gap-3">
        <h2 class="text-sm font-semibold">Surfaces</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${surfaces.map(
            item => html`
              <div class="flex items-center gap-3 p-3 border border-border rounded-md">
                <div
                  style="width: 36px; height: 36px; border-radius: 8px; background: oklch(var(${item.token})); border: 1px solid oklch(var(--uik-border-default));"></div>
                <div class="flex flex-col">
                  <span class="text-sm">${item.name}</span>
                  <span class="text-xs text-muted-foreground">${item.token}</span>
                </div>
              </div>
            `
          )}
        </div>
      </section>

      <section class="flex flex-col gap-3">
        <h2 class="text-sm font-semibold">Text</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${text.map(
            item => html`
              <div class="flex items-center gap-3 p-3 border border-border rounded-md">
                <div class="text-sm" style="color: oklch(var(${item.token}));">Aa</div>
                <div class="flex flex-col">
                  <span class="text-sm" style="color: oklch(var(${item.token}));">${item.name}</span>
                  <span class="text-xs text-muted-foreground">${item.token}</span>
                </div>
              </div>
            `
          )}
        </div>
      </section>

      <section class="flex flex-col gap-3">
        <h2 class="text-sm font-semibold">Borders</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${borders.map(
            item => html`
              <div class="flex items-center gap-3 p-3 border border-border rounded-md">
                <div
                  style="width: 36px; height: 36px; border-radius: 8px; border: 3px solid oklch(var(${item.token})); background: oklch(var(--uik-surface-bg));"></div>
                <div class="flex flex-col">
                  <span class="text-sm">${item.name}</span>
                  <span class="text-xs text-muted-foreground">${item.token}</span>
                </div>
              </div>
            `
          )}
        </div>
      </section>

      <section class="flex flex-col gap-3">
        <h2 class="text-sm font-semibold">Intent</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${intents.map(
            item => html`
              <div class="flex items-center gap-3 p-3 border border-border rounded-md">
                <div
                  style="width: 36px; height: 36px; border-radius: 8px; background: oklch(var(${item.token}));"></div>
                <div class="flex flex-col">
                  <span class="text-sm">${item.name}</span>
                  <span class="text-xs text-muted-foreground">${item.token}</span>
                </div>
              </div>
            `
          )}
        </div>
      </section>
    </div>
  `,
};

export default meta;

type Story = StoryObj;

export const Overview: Story = {};
