import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = path.join(packageRoot, 'src');

const importRegex = /\b(?:import|export)\s[^'"\n]*?from\s+['"]([^'"]+)['"]/g;
const dynamicImportRegex = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;
const commentBlock = /\/\*[\s\S]*?\*\//g;
const commentLine = /(^|\s)\/\/.*$/gm;
const layers = new Set(['internal', 'structures', 'patterns']);

function stripComments(source) {
  return source.replace(commentBlock, '').replace(commentLine, '$1');
}

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...walk(full));
      continue;
    }
    if (entry.endsWith('.ts')) files.push(full);
  }
  return files;
}

function getLayer(filePath) {
  const relative = path.relative(srcRoot, filePath);
  const [root] = relative.split(path.sep);
  if (layers.has(root)) return root;
  return null;
}

function resolveImport(fromFile, spec) {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(fromFile), spec);
  const candidates = [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return base;
}

const files = walk(srcRoot);
const errors = [];

for (const file of files) {
  const sourceLayer = getLayer(file);
  if (!sourceLayer) continue;
  const raw = readFileSync(file, 'utf8');
  const text = stripComments(raw);

  const specs = [];
  let match;
  while ((match = importRegex.exec(text))) {
    specs.push(match[1]);
  }
  while ((match = dynamicImportRegex.exec(text))) {
    specs.push(match[1]);
  }

  for (const spec of specs) {
    if (!spec.startsWith('.')) continue;
    const resolved = resolveImport(file, spec);
    const targetLayer = resolved ? getLayer(resolved) : null;
    if (!targetLayer) continue;

    if (sourceLayer === 'internal' && targetLayer !== 'internal') {
      errors.push(`${path.relative(packageRoot, file)}: internal cannot import ${spec}`);
      continue;
    }

    if (sourceLayer === 'structures' && targetLayer === 'patterns') {
      errors.push(`${path.relative(packageRoot, file)}: structures cannot import ${spec}`);
      continue;
    }
  }
}

if (errors.length > 0) {
  console.error('Layering violations found:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}
