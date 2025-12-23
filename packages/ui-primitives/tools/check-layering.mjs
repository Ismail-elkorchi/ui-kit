import {readdirSync, readFileSync, statSync, existsSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = path.join(packageRoot, 'src');

const importRegex = /\b(?:import|export)\s[^'"\n]*?from\s+['"]([^'"]+)['"]/g;
const dynamicImportRegex = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;
const commentBlock = /\/\*[\s\S]*?\*\//g;
const commentLine = /(^|\s)\/\/.*$/gm;

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
  const parts = relative.split(path.sep);
  const root = parts[0];
  if (root === 'internal' || root === 'atomic' || root === 'composed') return root;
  return null;
}

function getComponentRoot(filePath) {
  const relative = path.relative(srcRoot, filePath);
  const parts = relative.split(path.sep);
  if (parts.length < 3) return null;
  const [layer, kind, component] = parts;
  if ((layer === 'atomic' || layer === 'composed') && kind && component) {
    return path.join(srcRoot, layer, kind, component);
  }
  return null;
}

function resolveImport(fromFile, spec) {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(fromFile), spec);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, 'index.ts'),
  ];
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
  const sourceComponentRoot = getComponentRoot(file);
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
    const targetLayer = getLayer(resolved);
    if (!targetLayer) continue;

    if (sourceLayer === 'internal' && (targetLayer === 'atomic' || targetLayer === 'composed')) {
      errors.push(`${path.relative(packageRoot, file)}: internal cannot import ${spec}`);
      continue;
    }

    if (sourceLayer === 'atomic') {
      if (targetLayer === 'composed') {
        errors.push(`${path.relative(packageRoot, file)}: atomic cannot import ${spec}`);
        continue;
      }
      if (targetLayer === 'atomic') {
        const targetComponentRoot = getComponentRoot(resolved);
        if (!sourceComponentRoot || !targetComponentRoot || sourceComponentRoot !== targetComponentRoot) {
          errors.push(`${path.relative(packageRoot, file)}: atomic cannot import ${spec}`);
        }
      }
    }

    if (sourceLayer === 'composed') {
      if (targetLayer === 'composed') {
        const targetComponentRoot = getComponentRoot(resolved);
        if (!sourceComponentRoot || !targetComponentRoot || sourceComponentRoot !== targetComponentRoot) {
          errors.push(`${path.relative(packageRoot, file)}: composed cannot import ${spec}`);
        }
      }
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
