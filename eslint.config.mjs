import eslint from '@eslint/js';
import {defineConfig} from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import lit from 'eslint-plugin-lit';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const tsFiles = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'];
const jsFiles = ['**/*.js', '**/*.cjs', '**/*.mjs'];
const allSources = [...tsFiles, ...jsFiles];

const strictTypeChecked = tseslint.configs.strictTypeChecked.map(config => ({
  ...config,
  files: config.files ?? tsFiles,
  ignores: [...(config.ignores ?? []), '**/*.d.ts']
}));

const stylisticTypeChecked = tseslint.configs.stylisticTypeChecked.map(config => ({
  ...config,
  files: config.files ?? tsFiles
}));

export default defineConfig([
  {
    ignores: ['**/dist/**', '**/.tsbuildinfo', '**/node_modules/**', '**/coverage/**']
  },

  eslint.configs.recommended,

  {
    files: allSources,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {...globals.browser}
    },
    linterOptions: {reportUnusedDisableDirectives: true}
  },

  ...strictTypeChecked,
  ...stylisticTypeChecked,

  {
    files: tsFiles,
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.base.json', './packages/*/tsconfig.build.json'],
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {import: importPlugin, lit},
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.base.json', './packages/*/tsconfig.build.json']
        }
      }
    },
    rules: {
      ...importPlugin.configs.recommended.rules,
      ...importPlugin.configs.typescript?.rules,
      ...lit.configs.recommended.rules,

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {prefer: 'type-imports', fixStyle: 'separate-type-imports'}
      ],
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {ignoreArrowShorthand: true, ignoreVoidOperator: false}
      ],
      '@typescript-eslint/no-unnecessary-condition': ['error', {allowConstantLoopConditions: true}],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',

      'import/no-default-export': 'warn',
      'import/no-extraneous-dependencies': [
        'error',
        {packageDir: [import.meta.dirname, './packages/ui-shell', './packages/ui-primitives', './packages/ui-tokens']}
      ],
      'import/no-relative-packages': 'error',
      'import/order': [
        'warn',
        {
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: {order: 'asc', caseInsensitive: true}
        }
      ],

      'no-console': ['warn', {allow: ['warn', 'error']}]
    }
  },

  {
    files: ['packages/ui-shell/test-router.js'],
    languageOptions: {
      globals: {...globals.node, ...globals.es2021, ...globals.browser}
    },
    rules: {
      'no-console': 'off'
    }
  },

  eslintConfigPrettier
]);
