// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import path from 'node:path';

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import importPlugin from 'eslint-plugin-import';
import lit from 'eslint-plugin-lit';
import litA11y from 'eslint-plugin-lit-a11y';
import wc from 'eslint-plugin-wc';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const tsFiles = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'];
const jsFiles = ['**/*.js', '**/*.cjs', '**/*.mjs'];
const allSources = [...tsFiles, ...jsFiles];

const tsconfigProjects = ['./tsconfig.base.json', './packages/*/tsconfig.build.json'];
const packageDirs = [
  import.meta.dirname,
  path.join(import.meta.dirname, 'packages/ui-shell'),
  path.join(import.meta.dirname, 'packages/ui-primitives'),
  path.join(import.meta.dirname, 'packages/ui-tokens'),
];

const strictTypeChecked = tseslint.configs.strictTypeChecked.map(config => ({
  ...config,
  files: config.files ?? tsFiles,
  ignores: [
    ...(config.ignores ?? []),
    '**/*.d.ts',
    '**/*.config.*',
    'vitest.config.ts',
    'vite.config.ts',
    '.storybook/**',
  ],
}));

const stylisticTypeChecked = tseslint.configs.stylisticTypeChecked.map(config => ({
  ...config,
  files: config.files ?? tsFiles,
  ignores: [...(config.ignores ?? []), '**/*.config.*', 'vitest.config.ts', 'vite.config.ts', '.storybook/**'],
}));

const importRecommended = importPlugin.flatConfigs.recommended;
const importTypescript = importPlugin.flatConfigs.typescript;
const litRecommended = lit.configs['flat/recommended'];
const wcRecommended = wc.configs['flat/recommended'];

export default defineConfig([
  {
    ignores: [
      '**/dist/**',
      '**/.tsbuildinfo',
      '**/*.d.ts',
      '**/node_modules/**',
      '**/coverage/**',
      '**/storybook-static/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],
  },

  eslint.configs.recommended,

  {
    files: allSources,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    linterOptions: {reportUnusedDisableDirectives: true},
  },

  {
    files: ['packages/**/scripts/**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {...globals.node, ...globals.es2021},
    },
  },

  ...strictTypeChecked,
  ...stylisticTypeChecked,

  {
    files: tsFiles,
    ignores: ['.storybook/**'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: tsconfigProjects,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
      lit,
      'lit-a11y': litA11y,
      wc,
    },
    settings: {
      wc: {
        elementBaseClasses: ['LitElement', 'HTMLElement'],
      },
      ...importTypescript.settings,
      'import/resolver': {
        ...(importTypescript.settings?.['import/resolver'] ?? {}),
        typescript: {
          project: tsconfigProjects,
        },
      },
    },
    rules: {
      ...importRecommended.rules,
      ...importTypescript.rules,
      ...litRecommended.rules,
      ...litA11y.configs.recommended.rules,
      ...wcRecommended.rules,

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {prefer: 'type-imports', fixStyle: 'separate-type-imports'},
      ],
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {ignoreArrowShorthand: true, ignoreVoidOperator: false},
      ],
      '@typescript-eslint/no-unnecessary-condition': ['error', {allowConstantLoopConditions: true}],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',

      'import/no-default-export': 'error',
      'import/no-named-export': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {packageDir: packageDirs},
      ],
      'import/no-relative-packages': 'error',
      'import/group-exports': 'off',
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: {order: 'asc', caseInsensitive: true},
        },
      ],
      'import/prefer-default-export': 'off',

      'no-console': ['error', {allow: ['warn', 'error']}],
      'wc/file-name-matches-element': [
        'error',
        {
          transform: ['kebab'],
        },
      ],
    },
  },

  {
    files: ['packages/**/*.{ts,tsx,mts,cts}'],
    rules: {
      'import/no-internal-modules': [
        'error',
        {
          allow: [
            'lit/decorators.js',
            'lit/directives/if-defined.js',
            'vitest/browser',
            '@ismail-elkorchi/ui-primitives/*',
            '@ismail-elkorchi/ui-shell/*',
            '@ismail-elkorchi/ui-tokens/*',
          ],
        },
      ],
    },
  },

  {
    files: ['.storybook/**/*'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {project: false},
      globals: {...globals.node, ...globals.es2021},
    },
    rules: {
      'import/no-default-export': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/no-internal-modules': 'off',
      'no-console': 'off',
    },
  },

  {
    files: ['**/*.stories.@(ts|js|tsx|jsx|mjs|cjs)'],
    languageOptions: {
      parserOptions: {project: tsconfigProjects},
    },
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
      'import/no-default-export': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/no-relative-packages': 'off',
      'import/no-internal-modules': 'off',
      'no-console': 'off',
    },
  },

  {
    files: ['**/*.@(test|spec).@(ts|js|tsx|jsx|mjs|cjs)'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },

  {
    files: [
      '**/*.config.ts',
      '**/*.config.tsx',
      '**/*.config.mts',
      '**/*.config.cts',
      'vitest.config.ts',
      'vite.config.ts',
    ],
    languageOptions: {
      parserOptions: {
        ...(tseslint.configs.disableTypeChecked.languageOptions?.parserOptions ?? {}),
      },
      globals: {...globals.node, ...globals.es2021},
    },
    rules: {
      ...(tseslint.configs.disableTypeChecked.rules ?? {}),
      'import/no-default-export': 'off',
      'import/no-internal-modules': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
  },

  {
    files: ['**/*.config.cjs', 'tools/**/*.mjs'],
    languageOptions: {
      parserOptions: {project: false},
      globals: {...globals.node, ...globals.es2021},
    },
  },

  ...storybook.configs['flat/recommended'],
  eslintConfigPrettier,
]);
