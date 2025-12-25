import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import ts from 'typescript';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const schemaPaths = {
  primitives: path.join(repoRoot, 'tools/contracts/schemas/contracts-components.schema.json'),
  shell: path.join(repoRoot, 'tools/contracts/schemas/contracts-entries.schema.json'),
};

const buildHint = 'npm run contracts:validate:build';

const toPosixPath = value => value.replace(/\\/g, '/');

const parseArgs = args => {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = args[index + 1];
    if (next && !next.startsWith('--')) {
      options[key] = next;
      index += 1;
    } else {
      options[key] = true;
    }
  }
  return options;
};

const readJson = async filePath => JSON.parse(await fs.readFile(filePath, 'utf8'));

const reportMissingArtifacts = (missing, context) => {
  console.error(`Contracts ${context} requires build artifacts.`);
  console.error('Missing:');
  for (const item of missing) {
    console.error(`- ${item.label} (${path.relative(repoRoot, item.path)})`);
  }
  console.error(`Run \`${buildHint}\` to build required artifacts, then retry.`);
};

const ensureArtifacts = async (artifacts, context) => {
  const missing = [];
  for (const artifact of artifacts) {
    try {
      await fs.access(artifact.path);
    } catch {
      missing.push(artifact);
    }
  }
  if (missing.length) {
    reportMissingArtifacts(missing, context);
    process.exitCode = 1;
    return false;
  }
  return true;
};

const normalizeComment = comment => {
  if (!comment) return '';
  if (typeof comment === 'string') return comment.trim();
  return comment
    .map(part => (typeof part === 'string' ? part : part.text ?? ''))
    .join('')
    .trim();
};

const getTagValue = (tag, sourceFile) => {
  const comment = normalizeComment(tag.comment);
  if (comment) return comment;
  if ('name' in tag && tag.name) {
    return tag.name.getText(sourceFile).trim();
  }
  return '';
};

const collectJsDoc = (node, sourceFile) => {
  const entries = {
    summary: '',
    attributes: [],
    slots: [],
    parts: [],
    events: [],
    a11y: [],
    cssVars: [],
    notes: [],
    contract: null,
  };

  const jsDocs = node.jsDoc ?? [];
  for (const doc of jsDocs) {
    const description = normalizeComment(doc.comment);
    if (description && !entries.summary) {
      entries.summary = description;
    }
    for (const tag of doc.tags ?? []) {
      const tagName = tag.tagName?.escapedText?.toString() ?? '';
      const value = getTagValue(tag, sourceFile);
      if (!value && tagName !== 'uikContract') continue;
      switch (tagName) {
        case 'summary':
          if (value) entries.summary = value;
          break;
        case 'attr':
        case 'attribute':
          if (value) entries.attributes.push(value);
          break;
        case 'slot':
          if (value) entries.slots.push(value);
          break;
        case 'part':
        case 'csspart':
          if (value) entries.parts.push(value);
          break;
        case 'event':
        case 'fires':
          if (value) entries.events.push(value);
          break;
        case 'a11y':
        case 'accessibility':
          if (value) entries.a11y.push(value);
          break;
        case 'cssprop':
        case 'cssproperty':
        case 'cssvar':
          if (value) entries.cssVars.push(value);
          break;
        case 'note':
          if (value) entries.notes.push(value);
          break;
        case 'uikContract':
          entries.contract = value;
          break;
        default:
          break;
      }
    }
  }

  return entries;
};

const parseContractConfig = value => {
  const result = {};
  if (!value) return result;
  const tokens = value.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    const [key, ...rest] = token.split('=');
    if (!key || rest.length === 0) continue;
    result[key] = rest.join('=');
  }
  return result;
};

const findClassDeclaration = (sourceFile, className) => {
  let found = null;
  const visit = node => {
    if (ts.isClassDeclaration(node) && node.name?.text === className) {
      found = node;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
};

const collectUtilityContracts = async srcRoot => {
  const entries = [];
  const files = [];

  const walk = async dir => {
    const items = await fs.readdir(dir, {withFileTypes: true});
    for (const item of items) {
      const next = path.join(dir, item.name);
      if (item.isDirectory()) {
        await walk(next);
      } else if (item.isFile() && item.name.endsWith('.ts')) {
        files.push(next);
      }
    }
  };

  await walk(srcRoot);

  for (const filePath of files) {
    const contents = await fs.readFile(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(filePath, contents, ts.ScriptTarget.Latest, true);

    const visit = node => {
      const doc = collectJsDoc(node, sourceFile);
      if (!doc.contract) {
        ts.forEachChild(node, visit);
        return;
      }

      const config = parseContractConfig(doc.contract);
      const id = config.id;
      if (!id) {
        throw new Error(`Missing id in @uikContract for ${path.relative(repoRoot, filePath)}.`);
      }

      const kind = config.kind ?? 'utility';
      const name =
        config.name ??
        (node.name ? `${node.name.getText(sourceFile)}()` : id);

      const entry = {
        kind,
        id,
        name,
        summary: doc.summary,
        attributes: doc.attributes,
        slots: doc.slots,
        parts: doc.parts,
        events: doc.events,
        a11y: doc.a11y,
        cssVars: doc.cssVars,
      };

      if (doc.notes.length) {
        entry.notes = doc.notes;
      }

      entries.push(entry);

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  return entries;
};

const buildComponentContracts = async ({packageRoot, cemPath, includeKind}) => {
  const cem = await readJson(cemPath);
  const entries = [];

  for (const module of cem.modules ?? []) {
    for (const declaration of module.declarations ?? []) {
      if (!declaration?.tagName || !declaration?.name) continue;
      const modulePath = module.path;
      if (!modulePath) continue;

      const filePath = path.join(packageRoot, modulePath);
      const contents = await fs.readFile(filePath, 'utf8');
      const sourceFile = ts.createSourceFile(filePath, contents, ts.ScriptTarget.Latest, true);
      const classNode = findClassDeclaration(sourceFile, declaration.name);
      if (!classNode) {
        throw new Error(`Missing class ${declaration.name} in ${path.relative(repoRoot, filePath)}.`);
      }

      const doc = collectJsDoc(classNode, sourceFile);
      if (!doc.summary) {
        throw new Error(`Missing summary JSDoc for ${declaration.tagName} in ${path.relative(repoRoot, filePath)}.`);
      }

      const entry = {
        id: declaration.tagName.replace(/^uik-/, ''),
        tagName: declaration.tagName,
        summary: doc.summary,
        attributes: doc.attributes,
        slots: doc.slots,
        parts: doc.parts,
        events: doc.events,
        a11y: doc.a11y,
        cssVars: doc.cssVars,
      };

      if (includeKind) {
        entry.kind = 'component';
      }
      if (doc.notes.length) {
        entry.notes = doc.notes;
      }

      entries.push(entry);
    }
  }

  entries.sort((a, b) => a.id.localeCompare(b.id));
  return entries;
};

const writeJson = async (filePath, data) => {
  const output = `${JSON.stringify(data, null, 2)}\n`;
  await fs.writeFile(filePath, output);
  return output;
};

const checkJson = async (filePath, data) => {
  const next = `${JSON.stringify(data, null, 2)}\n`;
  const current = await fs.readFile(filePath, 'utf8');
  if (current !== next) {
    throw new Error(`Contracts out of date at ${path.relative(repoRoot, filePath)}.`);
  }
};

const run = async () => {
  const options = parseArgs(process.argv.slice(2));
  const checkOnly = Boolean(options.check);

  const primitivesRoot = path.join(repoRoot, 'packages/ui-primitives');
  const shellRoot = path.join(repoRoot, 'packages/ui-shell');
  const artifactsOk = await ensureArtifacts(
    [
      {
        label: 'ui-primitives custom-elements.json',
        path: path.join(primitivesRoot, 'dist/custom-elements.json'),
      },
      {
        label: 'ui-shell custom-elements.json',
        path: path.join(shellRoot, 'dist/custom-elements.json'),
      },
    ],
    checkOnly ? 'check' : 'generation',
  );
  if (!artifactsOk) return;

  const primitivesContracts = await buildComponentContracts({
    packageRoot: primitivesRoot,
    cemPath: path.join(primitivesRoot, 'dist/custom-elements.json'),
    includeKind: false,
  });

  const shellComponents = await buildComponentContracts({
    packageRoot: shellRoot,
    cemPath: path.join(shellRoot, 'dist/custom-elements.json'),
    includeKind: true,
  });
  const shellUtilities = await collectUtilityContracts(path.join(shellRoot, 'src'));
  shellUtilities.sort((a, b) => a.id.localeCompare(b.id));

  const primitivesPath = path.join(primitivesRoot, 'contracts/components.json');
  const shellPath = path.join(shellRoot, 'contracts/entries.json');
  const primitivesSchemaRef = toPosixPath(
    path.relative(path.dirname(primitivesPath), schemaPaths.primitives),
  );
  const shellSchemaRef = toPosixPath(
    path.relative(path.dirname(shellPath), schemaPaths.shell),
  );

  const primitivesOutput = {
    $schema: primitivesSchemaRef,
    schemaVersion: '1.0.0',
    components: primitivesContracts,
  };
  const shellOutput = {
    $schema: shellSchemaRef,
    schemaVersion: '1.0.0',
    entries: [...shellComponents, ...shellUtilities],
  };

  if (checkOnly) {
    await checkJson(primitivesPath, primitivesOutput);
    await checkJson(shellPath, shellOutput);
    return;
  }

  await writeJson(primitivesPath, primitivesOutput);
  await writeJson(shellPath, shellOutput);
  console.log('Contracts generated.');
};

await run();
