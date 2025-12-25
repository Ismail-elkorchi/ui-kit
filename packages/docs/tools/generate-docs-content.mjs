import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {marked} from 'marked';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../../..');
const docsRoot = path.join(repoRoot, 'packages/docs');
const contentRoot = path.join(docsRoot, 'content');
const manifestPath = path.join(contentRoot, 'manifest.json');
const outputPath = path.join(docsRoot, 'src/generated/docs-content.json');

const escapeHtml = value =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const slugify = value =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const renderer = new marked.Renderer();
renderer.paragraph = text => `<uik-text as="p" class="docs-paragraph">${text}</uik-text>`;
renderer.list = (body, ordered) => {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag} class="docs-list">${body}</${tag}>`;
};
renderer.listitem = text => `<li><uik-text as="p" class="docs-paragraph">${text}</uik-text></li>`;
renderer.code = code => `<pre class="docs-code"><code>${escapeHtml(code)}</code></pre>`;
renderer.codespan = text => `<code>${escapeHtml(text)}</code>`;
renderer.heading = (text, level) => {
  const safeLevel = Math.min(Math.max(level, 1), 6);
  return `<uik-heading level="${safeLevel}">${text}</uik-heading>`;
};

marked.use({
  renderer,
  gfm: true,
  mangle: false,
  headerIds: false,
});

const readRepoFile = async relativePath => {
  const filePath = path.resolve(repoRoot, relativePath);
  return fs.readFile(filePath, 'utf8');
};

const stripTopHeading = markdown =>
  markdown.replace(/^#\s+.*\n+/, '');

const parseMarkdownSections = (markdown, introTitle = 'Overview') => {
  const lines = stripTopHeading(markdown.replace(/\r\n/g, '\n')).split('\n');
  const sections = [];
  let currentTitle = null;
  let buffer = [];

  const flush = () => {
    const body = buffer.join('\n').trim();
    if (!body) return;
    const title = currentTitle ?? introTitle;
    sections.push({
      id: slugify(title),
      title,
      body: marked.parse(body).trim(),
    });
  };

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.*)$/);
    if (headingMatch) {
      flush();
      currentTitle = headingMatch[1].trim();
      buffer = [];
      continue;
    }
    buffer.push(line);
  }

  flush();
  return sections;
};

const readJson = async relativePath => JSON.parse(await readRepoFile(relativePath));

const normalizeTypeText = value =>
  value
    .replace(/\s+/g, ' ')
    .replace(/\|/g, '|')
    .trim();

const formatAttributesFromCem = attributes => {
  if (!attributes?.length) return [];
  return attributes.map(attribute => {
    const name = attribute.name ?? '';
    const rawType = attribute.type?.text ? normalizeTypeText(attribute.type.text) : '';
    return rawType ? `${name} (${rawType})` : name;
  });
};

const buildComponentsFromContracts = (contracts, cem) => {
  const entries = contracts.components ?? contracts.entries ?? [];
  const cemEntries = cem?.modules
    ? new Map(
        cem.modules
          .flatMap(module => module.declarations ?? [])
          .filter(declaration => declaration?.tagName)
          .map(declaration => [declaration.tagName, declaration]),
      )
    : new Map();

  return entries.map(entry => {
    const kind = entry.kind ?? 'component';
    const tagName = entry.tagName;
    const cemEntry = tagName ? cemEntries.get(tagName) : null;
    const name = entry.name ?? (tagName ? `<${tagName}>` : entry.id);
    const id = entry.id ?? (tagName ? tagName.replace(/^uik-/, '') : slugify(name));
    const attributes =
      entry.attributes && entry.attributes.length ? entry.attributes : formatAttributesFromCem(cemEntry?.attributes);

    return {
      id,
      name,
      kind,
      summary: entry.summary ?? '',
      attributes: attributes ?? [],
      slots: entry.slots ?? [],
      parts: entry.parts ?? [],
      events: entry.events ?? [],
      a11y: entry.a11y ?? [],
      cssVars: entry.cssVars ?? [],
      notes: entry.notes ?? [],
    };
  });
};

const renderInlineMarkdown = value => marked.parseInline(value);

const renderComponentCards = components => {
  const buildList = items => {
    if (!items.length) {
      return '<uik-text as="p" class="docs-paragraph">None.</uik-text>';
    }
    const listItems = items
      .map(item => `<li><uik-text as="p" class="docs-paragraph">${renderInlineMarkdown(item)}</uik-text></li>`)
      .join('');
    return `<ul class="docs-list">${listItems}</ul>`;
  };

  return components
    .map(component => {
      const summary = component.summary ? escapeHtml(component.summary) : '';
      const notesRow = component.notes?.length
        ? `
            <div class="docs-component-row">
              <uik-text as="p" class="docs-component-label">Notes</uik-text>
              ${buildList(component.notes)}
            </div>
          `
        : '';

      return `
        <article class="docs-card docs-component" id="component-${component.id}">
          <header class="docs-card-header">
            <uik-heading level="3"><code>${escapeHtml(component.name)}</code></uik-heading>
            ${summary ? `<uik-text as="p" class="docs-paragraph">${summary}</uik-text>` : ''}
          </header>
          <div class="docs-component-grid">
            <div class="docs-component-row">
              <uik-text as="p" class="docs-component-label">API</uik-text>
              ${buildList(component.attributes ?? [])}
            </div>
            <div class="docs-component-row">
              <uik-text as="p" class="docs-component-label">Slots</uik-text>
              ${buildList(component.slots ?? [])}
            </div>
            <div class="docs-component-row">
              <uik-text as="p" class="docs-component-label">Parts</uik-text>
              ${buildList(component.parts ?? [])}
            </div>
            <div class="docs-component-row">
              <uik-text as="p" class="docs-component-label">Events</uik-text>
              ${buildList(component.events ?? [])}
            </div>
            <div class="docs-component-row">
              <uik-text as="p" class="docs-component-label">A11y</uik-text>
              ${buildList(component.a11y ?? [])}
            </div>
            <div class="docs-component-row">
              <uik-text as="p" class="docs-component-label">CSS Vars</uik-text>
              ${buildList(component.cssVars ?? [])}
            </div>
            ${notesRow}
          </div>
        </article>
      `;
    })
    .join('');
};

const buildComponentsPage = async entry => {
  const readme = await readRepoFile(entry.readme);
  const sections = parseMarkdownSections(readme, 'Overview');
  const componentsTitle = entry.componentsTitle ?? 'Components and contracts';
  const withoutComponents = sections.filter(
    section => section.title.toLowerCase() !== componentsTitle.toLowerCase(),
  );

  const contracts = entry.contracts ? await readJson(entry.contracts) : null;
  const cem = entry.cem ? await readJson(entry.cem) : null;
  const components = contracts ? buildComponentsFromContracts(contracts, cem) : [];

  if (components.length) {
    const cards = renderComponentCards(components);
    withoutComponents.push({
      id: slugify(componentsTitle),
      title: componentsTitle,
      body: `<div class="docs-components">${cards}</div>`,
    });
  }

  return {
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    sections: withoutComponents,
  };
};

const buildMarkdownPage = async entry => {
  const markdown = await readRepoFile(entry.source);
  return {
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    sections: parseMarkdownSections(markdown, 'Overview'),
  };
};

const buildPages = async entries => {
  const pages = [];
  for (const entry of entries) {
    if (entry.type === 'components') {
      pages.push(await buildComponentsPage(entry));
    } else {
      pages.push(await buildMarkdownPage(entry));
    }
  }
  return pages;
};

const run = async () => {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const docsPages = await buildPages(manifest.docs ?? []);
  const labPages = await buildPages(manifest.lab ?? []);
  const output = {docsPages, labPages};

  await fs.mkdir(path.dirname(outputPath), {recursive: true});
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
};

await run();
