import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import "@ismail-elkorchi/ui-tokens/index.css";
import "@ismail-elkorchi/ui-primitives/register";
import "@ismail-elkorchi/ui-shell/register";

/** @type {import('@storybook/web-components').Preview} */
const preview = {
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
    backgrounds: {
      options: {
        "uik-surface": {
          name: "uik-surface",
          value: "oklch(var(--uik-surface-bg))",
        },
        "uik-card": {
          name: "uik-card",
          value: "oklch(var(--uik-surface-card))",
        },
      },
    },
  },

  initialGlobals: {
    backgrounds: {
      value: "uik-surface",
    },
    theme: "light",
    density: "comfortable",
  },

  globalTypes: {
    theme: {
      description: "UIK theme",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        showName: true,
      },
    },
    density: {
      description: "UIK density",
      defaultValue: "comfortable",
      toolbar: {
        icon: "contrast",
        items: [
          { value: "comfortable", title: "Comfortable" },
          { value: "compact", title: "Compact" },
        ],
        showName: true,
      },
    },
  },

  decorators: [
    (Story, context) => {
      const root = document.documentElement;
      const theme = context.globals.theme ?? "light";
      const density = context.globals.density ?? "comfortable";
      root.setAttribute("data-uik-theme", theme);
      root.setAttribute("data-uik-density", density);
      if (!root.lang) root.lang = "en";
      const title = context.title ?? "Story";
      const name = context.name ? ` • ${context.name}` : "";
      document.title = `${title}${name}`;
      const skipMainWrapper =
        context.parameters?.uikA11y?.skipMainWrapper === true;
      const mainRole = skipMainWrapper ? undefined : "main";
      return html`<div
        data-uik-story-root
        tabindex="0"
        role=${ifDefined(mainRole)}
        style="display: block; min-height: var(--uik-space-0);"
      >
        ${Story()}
      </div>`;
    },
  ],
};

export default preview;
