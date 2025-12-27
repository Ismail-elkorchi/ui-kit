import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const getAbsolutePath = (value: string) =>
  dirname(require.resolve(join(value, "package.json")));
const getEntryPath = (value: string) => require.resolve(value);
const getPackageRoot = (value: string) => dirname(getEntryPath(value));

/** @type {import('@storybook/web-components-vite').StorybookConfig} */
const config = {
  stories: ["../packages/**/*.stories.@(js|ts)"],
  staticDirs: ["../packages/ui-tokens/dist"],
  addons: [
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-vitest"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/web-components-vite"),
    options: {},
  },
  viteFinal: async (baseConfig) => {
    const config = baseConfig ?? {};
    const resolve = config.resolve ?? {};
    const baseAlias = resolve.alias ?? [];
    const aliasEntries = Array.isArray(baseAlias)
      ? baseAlias
      : Object.entries(baseAlias).map(([find, replacement]) => ({
          find,
          replacement,
        }));
    const dedupe = new Set([
      ...(resolve.dedupe ?? []),
      "lit",
      "lit-html",
      "lit-element",
      "@lit/reactive-element",
    ]);
    const conditions = new Set(resolve.conditions ?? []);
    if (conditions.has("development")) conditions.delete("development");
    const optimizeDeps = config.optimizeDeps ?? {};
    const include = new Set([
      ...(optimizeDeps.include ?? []),
      "lit",
      "lit-html",
      "lit-element",
      "@lit/reactive-element",
    ]);
    const alias = [
      ...aliasEntries,
      { find: /^lit$/, replacement: getEntryPath("lit") },
      { find: /^lit\//, replacement: `${getPackageRoot("lit")}/` },
      { find: /^lit-html$/, replacement: getEntryPath("lit-html") },
      { find: /^lit-html\//, replacement: `${getPackageRoot("lit-html")}/` },
      { find: /^lit-element$/, replacement: getEntryPath("lit-element") },
      {
        find: /^lit-element\//,
        replacement: `${getPackageRoot("lit-element")}/`,
      },
      {
        find: /^@lit\/reactive-element$/,
        replacement: getEntryPath("@lit/reactive-element"),
      },
      {
        find: /^@lit\/reactive-element\//,
        replacement: `${getPackageRoot("@lit/reactive-element")}/`,
      },
    ];

    return {
      ...config,
      resolve: {
        ...resolve,
        alias,
        dedupe: [...dedupe],
        conditions: conditions.size > 0 ? [...conditions] : resolve.conditions,
      },
      optimizeDeps: {
        ...optimizeDeps,
        include: [...include],
      },
    };
  },
};

export default config;
