/**
 * @file verify.mjs
 * @description Verifies that the build output (dist/) matches requirements.
 */

import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(here, '..');
const distDir = path.join(pkgRoot, 'dist');

const requiredFiles = [
  'index.js',
  'index.d.ts',
  'base.css',
  'index.css',
  'uik-tailwind.strict.css',
  'uik-tailwind.compat.css',
  'themes/uik-theme-base.css',
  'themes/uik-light.css',
  'themes/uik-dark.css',
  'themes/uik-density-comfortable.css',
  'themes/uik-density-compact.css',
  'tokens.resolved.light.comfortable.json',
  'tokens.resolved.light.compact.json',
  'tokens.resolved.dark.comfortable.json',
  'tokens.resolved.dark.compact.json'
];

async function verify() {
  for (const file of requiredFiles) {
    const filePath = path.join(distDir, file);
    try {
      await stat(filePath);
    } catch {
      throw new Error(`Missing required file: ${file}`);
    }
  }

  console.log('ui-tokens: Verification passed.');
}

verify().catch((error) => {
  console.error('ui-tokens: Verification failed:', error.message);
  process.exit(1);
});
