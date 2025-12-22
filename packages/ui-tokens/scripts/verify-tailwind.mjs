/**
 * @file verify-tailwind.mjs
 * @description Validates Tailwind v4 can parse the generated theme CSS.
 */

import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(here, '..');
const distDir = path.join(pkgRoot, 'dist');
const tempDir = path.join(pkgRoot, '.tailwind-verify');

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findBinary(binaryName, startDir) {
  let current = startDir;
  while (true) {
    const candidate = path.join(current, 'node_modules', '.bin', binaryName);
    if (await exists(candidate)) return candidate;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

async function runTailwind(binary, input, output, content) {
  return new Promise((resolve, reject) => {
    const args = ['-i', input, '-o', output, '--content', content];
    const proc = spawn(binary, args, { stdio: 'inherit' });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Tailwind CLI exited with code ${code}`));
    });
  });
}

async function verify() {
  const binary = await findBinary('tailwindcss', pkgRoot);
  if (!binary) {
    throw new Error('Tailwind CLI not found. Install tailwindcss in the workspace root.');
  }

  const strictCss = path.join(distDir, 'uik-tailwind.strict.css');
  const compatCss = path.join(distDir, 'uik-tailwind.compat.css');
  if (!(await exists(strictCss)) || !(await exists(compatCss))) {
    throw new Error('Tailwind theme CSS not found in dist/. Run the build first.');
  }

  await rm(tempDir, { recursive: true, force: true });
  await mkdir(tempDir, { recursive: true });

  const contentPath = path.join(tempDir, 'content.html');
  await writeFile(
    contentPath,
    '<div class="bg-uik-surface-bg text-uik-text-default border-uik-border-default rounded-uik-3 shadow-uik-2 bg-uik-intent-primary-bg-default ring-uik-focus-ring-default text-uik-2"></div>'
  );

  const modes = [
    { name: 'strict', themeFile: '../dist/uik-tailwind.strict.css', output: 'out.strict.css' },
    { name: 'compat', themeFile: '../dist/uik-tailwind.compat.css', output: 'out.compat.css' }
  ];

  try {
    for (const mode of modes) {
      const inputPath = path.join(tempDir, `input.${mode.name}.css`);
      await writeFile(
        inputPath,
        `@import "tailwindcss";\n@import "${mode.themeFile}";\n`
      );
      await runTailwind(binary, inputPath, path.join(tempDir, mode.output), contentPath);
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }

  console.log('ui-tokens: Tailwind verification passed.');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  verify().catch((error) => {
    console.error('ui-tokens: Tailwind verification failed:', error.message);
    process.exit(1);
  });
}
