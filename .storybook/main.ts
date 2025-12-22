import {dirname, join} from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const getAbsolutePath = (value: string) =>
  dirname(require.resolve(join(value, 'package.json')));

/** @type {import('@storybook/web-components-vite').StorybookConfig} */
const config = {
  stories: ['../packages/**/*.stories.@(js|ts)'],
  staticDirs: ['../packages/ui-tokens/dist'],
  addons: [
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-vitest'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/web-components-vite'),
    options: {},
  },
  viteFinal: async (baseConfig: unknown) => baseConfig,
};

export default config;
