import {readdirSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const primitivesRoot = path.join(root, 'packages', 'ui-primitives');
const tokensDistRoot = path.join(root, 'packages', 'ui-tokens', 'dist');

const walk = dir => {
  const entries = readdirSync(dir, {withFileTypes: true});
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }
    files.push(fullPath);
  }
  return files;
};

const isIgnoredPrimitive = filePath => {
  const normalized = filePath.split(path.sep).join('/');
  return (
    normalized.includes('/dist/') ||
    normalized.includes('/node_modules/') ||
    normalized.includes('.stories.') ||
    normalized.includes('.test.') ||
    normalized.includes('.spec.')
  );
};

const primitiveFiles = walk(primitivesRoot).filter(filePath => {
  if (!filePath.endsWith('.ts')) return false;
  if (isIgnoredPrimitive(filePath)) return false;
  return true;
});

const tokenCssFiles = statSync(tokensDistRoot, {throwIfNoEntry: false})
  ? walk(tokensDistRoot).filter(filePath => filePath.endsWith('.css'))
  : [];

const tokenDefines = new Set();
const primitiveDefines = new Set();
const primitiveRefs = new Set();

const defineRegex = /--uik-[a-z0-9-]+\s*:/g;
const varRegex = /var\(\s*(--uik-[a-z0-9-]+)\s*\)/g;

for (const filePath of tokenCssFiles) {
  const content = readFileSync(filePath, 'utf8');
  const matches = content.match(defineRegex) ?? [];
  for (const match of matches) {
    tokenDefines.add(match.replace(':', '').trim());
  }
}

for (const filePath of primitiveFiles) {
  const content = readFileSync(filePath, 'utf8');
  const defineMatches = content.match(defineRegex) ?? [];
  for (const match of defineMatches) {
    primitiveDefines.add(match.replace(':', '').trim());
  }
  let varMatch;
  while ((varMatch = varRegex.exec(content)) !== null) {
    primitiveRefs.add(varMatch[1]);
  }
}

const referencedNotInTokens = [...primitiveRefs].filter(name => !tokenDefines.has(name));
const internalRefs = referencedNotInTokens.filter(name => primitiveDefines.has(name));
const unknownRefs = referencedNotInTokens.filter(name => !primitiveDefines.has(name));

const tokensUnusedByPrimitives = [...tokenDefines].filter(name => !primitiveRefs.has(name));

const result = {
  primitives: {
    files: primitiveFiles.length,
    definedCustomProperties: [...primitiveDefines].sort(),
    referencedCustomProperties: [...primitiveRefs].sort(),
  },
  tokens: {
    cssFiles: tokenCssFiles.length,
    definedCustomProperties: [...tokenDefines].sort(),
  },
  drift: {
    referencedNotInTokens: referencedNotInTokens.sort(),
    internalRefs: internalRefs.sort(),
    unknownRefs: unknownRefs.sort(),
    tokensUnusedByPrimitives: tokensUnusedByPrimitives.sort(),
  },
};

console.log(JSON.stringify(result, null, 2));
