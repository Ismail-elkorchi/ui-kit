import eslint from '@eslint/js';
import {defineConfig} from 'eslint/config';
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

const strictTypeChecked = tseslint.configs.strictTypeChecked.map(config => ({
  ...config,
  files: config.files ?? tsFiles,
  ignores: [...(config.ignores ?? []), '**/*.d.ts'],
}));

const stylisticTypeChecked = tseslint.configs.stylisticTypeChecked.map(config => ({
  ...config,
  files: config.files ?? tsFiles,
}));

const importRecommended = importPlugin.flatConfigs.recommended;
const importTypescript = importPlugin.flatConfigs.typescript;
const litRecommended = lit.configs['flat/recommended'];
const wcRecommended = wc.configs['flat/recommended'];

export default defineConfig([
  {
    ignores: ['**/dist/**', '**/.tsbuildinfo', '**/node_modules/**', '**/coverage/**'],
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

  ...strictTypeChecked,
  ...stylisticTypeChecked,

  {
    files: tsFiles,
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: tsconfigProjects,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
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
        {packageDir: [import.meta.dirname, './packages/ui-shell', './packages/ui-primitives', './packages/ui-tokens']},
      ],
      'import/no-internal-modules': [
        'error',
        {
          allow: ['lit/decorators.js', '@ismail-elkorchi/ui-primitives/*'],
        },
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
    files: ['packages/ui-shell/test-router.js'],
    languageOptions: {
      globals: {...globals.node, ...globals.es2021, ...globals.browser},
    },
    rules: {
      'no-console': 'off',
    },
  },

  eslintConfigPrettier,
]);
