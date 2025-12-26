import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {marked} from 'marked';
import MiniSearch from 'minisearch';
import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/index.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../../..');
const docsRoot = path.join(repoRoot, 'packages/docs');
const contentRoot = path.join(docsRoot, 'content');
const manifestPath = path.join(contentRoot, 'manifest.json');
const outputPath = path.join(docsRoot, 'src/generated/docs-content.json');
const searchIndexPath = path.join(docsRoot, 'src/generated/docs-search-index.json');

const supportedLanguages = new Map([
  ['bash', 'bash'],
  ['css', 'css'],
  ['html', 'markup'],
  ['js', 'javascript'],
  ['json', 'json'],
  ['sh', 'bash'],
  ['ts', 'typescript'],
]);

loadLanguages(['bash', 'css', 'javascript', 'json', 'markup', 'typescript']);

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

const stripInlineMarkdown = value =>
  value
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();

const stripHeadingMarkup = rawLine => rawLine.replace(/^#{1,6}\s+/, '').trim();

const stripHtml = value => value.replace(/<[^>]+>/g, '').trim();

const normalizeSearchText = value =>
  stripHtml(String(value ?? ''))
    .replace(/\s+/g, ' ')
    .trim();

const normalizeLanguage = value => {
  const key = String(value ?? '').trim().toLowerCase();
  return supportedLanguages.get(key) ?? '';
};

const highlightCodeBlock = (code, language) => {
  if (!language) return escapeHtml(code);
  const grammar = Prism.languages[language];
  if (!grammar) return escapeHtml(code);
  return Prism.highlight(code, grammar, language);
};

const createSlugger = () => {
  const counts = new Map();
  return {
    slug(value) {
      const baseCandidate = slugify(stripInlineMarkdown(String(value)));
      const base = baseCandidate || 'section';
      const nextCount = (counts.get(base) ?? 0) + 1;
      counts.set(base, nextCount);
      return nextCount === 1 ? base : `${base}-${nextCount - 1}`;
    },
  };
};

const createRenderer = slugger => {
  const renderer = new marked.Renderer();
  renderer.paragraph = text => `<uik-text as="p" class="docs-paragraph">${text}</uik-text>`;
  renderer.list = (body, ordered) => {
    const tag = ordered ? 'ol' : 'ul';
    return `<${tag} class="docs-list">${body}</${tag}>`;
  };
  renderer.listitem = text => `<li><uik-text as="p" class="docs-paragraph">${text}</uik-text></li>`;
  renderer.code = (code, infostring) => {
    const rawLanguage = (infostring ?? '').trim().split(/\s+/)[0] ?? '';
    const language = normalizeLanguage(rawLanguage);
    const langClass = language ? `language-${escapeHtml(language)}` : '';
    const highlighted = highlightCodeBlock(code, language);
    return `
      <div class="docs-code-block">
        <div class="docs-code-actions">
          <uik-button
            variant="ghost"
            size="sm"
            class="docs-code-copy"
            data-docs-action="copy-code"
            aria-label="Copy code block">
            Copy
          </uik-button>
        </div>
        <pre class="docs-code"><code class="${langClass}">${highlighted}</code></pre>
      </div>
    `.trim();
  };
  renderer.codespan = text => `<code>${escapeHtml(text)}</code>`;
  renderer.heading = (text, level, raw) => {
    const safeLevel = Math.min(Math.max(level, 1), 6);
    const plain = raw ? stripInlineMarkdown(stripHeadingMarkup(raw)) : stripHtml(text);
    const id = slugger.slug(plain);
    const label = escapeHtml(plain);
    return `
      <uik-heading level="${safeLevel}" id="${id}" class="docs-heading" data-heading-level="${safeLevel}">
        <a class="docs-heading-anchor" href="#${id}" aria-label="Link to ${label}">#</a>
        <span class="docs-heading-text">${text}</span>
      </uik-heading>
    `.trim();
  };
  return renderer;
};

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
    const bodyMarkdown = buffer.join('\n').trim();
    if (!bodyMarkdown) return;
    sections.push({title: currentTitle ?? introTitle, bodyMarkdown});
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

const extractHeadingsFromMarkdown = markdown => {
  const tokens = marked.lexer(markdown);
  return tokens
    .filter(token => token.type === 'heading')
    .map(token => ({
      level: token.depth,
      title: stripInlineMarkdown(stripHeadingMarkup(token.raw ?? token.text ?? '')),
      raw: token.raw ?? '',
    }));
};

const buildSectionsAndTocFromRawSections = rawSections => {
  const tocSlugger = createSlugger();
  const htmlSlugger = createSlugger();

  const sections = rawSections.map(section => ({
    id: tocSlugger.slug(section.title),
    title: section.title,
    bodyMarkdown: section.bodyMarkdown,
  }));

  sections.forEach(section => {
    htmlSlugger.slug(section.title);
  });

  const toc = [];
  for (const section of sections) {
    toc.push({id: section.id, title: section.title, level: 2});

    const headings = extractHeadingsFromMarkdown(section.bodyMarkdown)
      .filter(heading => heading.level >= 2)
      .map(heading => ({
        id: tocSlugger.slug(heading.title),
        title: heading.title,
        level: heading.level,
      }));

    toc.push(...headings);
  }

  const renderer = createRenderer(htmlSlugger);
  const renderedSections = sections.map(section => ({
    id: section.id,
    title: section.title,
    body: marked.parse(section.bodyMarkdown, {renderer, gfm: true, mangle: false, headerIds: false}).trim(),
  }));

  return {sections: renderedSections, toc};
};

const buildMarkdownPageSections = (markdown, introTitle = 'Overview') =>
  buildSectionsAndTocFromRawSections(parseMarkdownSections(markdown, introTitle));

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
  const componentsTitle = entry.componentsTitle ?? 'Components and contracts';
  const rawSections = parseMarkdownSections(readme, 'Overview').filter(
    section => section.title.toLowerCase() !== componentsTitle.toLowerCase(),
  );

  const contracts = entry.contracts ? await readJson(entry.contracts) : null;
  const cem = entry.cem ? await readJson(entry.cem) : null;
  const components = contracts ? buildComponentsFromContracts(contracts, cem) : [];

  const nextSections = [...rawSections];

  if (components.length) {
    const cards = renderComponentCards(components);
    nextSections.push({title: componentsTitle, bodyMarkdown: `<div class="docs-components">${cards}</div>`});
  }

  const {sections, toc} = buildSectionsAndTocFromRawSections(nextSections);

  return {
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    sections,
    toc,
  };
};

const buildMarkdownPage = async entry => {
  const markdown = await readRepoFile(entry.source);
  const {sections, toc} = buildMarkdownPageSections(markdown, 'Overview');
  return {
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    sections,
    toc,
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

const buildSearchDocuments = (pages, kind) =>
  pages.flatMap(page => {
    const pageTitle = normalizeSearchText(page.title);
    const summary = normalizeSearchText(page.summary);
    return page.sections.map(section => {
      const sectionTitle = normalizeSearchText(section.title);
      const body = normalizeSearchText(section.body);
      return {
        id: `${kind}/${page.id}#${section.id}`,
        kind,
        pageId: page.id,
        sectionId: section.id,
        pageTitle,
        title: sectionTitle,
        summary,
        body,
        url: `/${kind}/${page.id}#${section.id}`,
      };
    });
  });

const buildSearchIndex = (docsPages, labPages) => {
  const documents = [
    ...buildSearchDocuments(docsPages, 'docs'),
    ...buildSearchDocuments(labPages, 'lab'),
  ];
  const miniSearch = new MiniSearch({
    fields: ['title', 'body', 'pageTitle', 'summary'],
    storeFields: ['id', 'kind', 'pageId', 'sectionId', 'pageTitle', 'title', 'summary', 'body', 'url'],
  });
  miniSearch.addAll(documents);
  return {schemaVersion: 1, index: miniSearch.toJSON()};
};

const run = async () => {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const docsPages = await buildPages(manifest.docs ?? []);
  const labPages = await buildPages(manifest.lab ?? []);
  const output = {docsPages, labPages};
  const searchIndex = buildSearchIndex(docsPages, labPages);

  await fs.mkdir(path.dirname(outputPath), {recursive: true});
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  await fs.writeFile(searchIndexPath, `${JSON.stringify(searchIndex, null, 2)}\n`);
};

await run();
