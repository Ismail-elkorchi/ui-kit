import docsContent from './generated/docs-content.json';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export interface DocTocItem {
  id: string;
  title: string;
  level: number;
}

export interface DocSection {
  id: string;
  title: string;
  body: string;
}

export interface DocPage {
  id: string;
  title: string;
  summary: string;
  sections: DocSection[];
  toc: DocTocItem[];
}

interface DocsContent {
  docsPages: DocPage[];
  labPages: DocPage[];
}

const content = docsContent as DocsContent;

export const docsPages = content.docsPages;
export const labPages = content.labPages;

export const buildPageMap = () => {
  const map = new Map<string, DocPage>();
  for (const page of docsPages) {
    map.set(`docs/${page.id}`, page);
  }
  for (const page of labPages) {
    map.set(`lab/${page.id}`, page);
  }
  return map;
};

export const renderToc = (page: DocPage) => {
  if (page.toc.length === 0) return '';
  return `<nav aria-label="On this page" class="docs-toc"><ul class="docs-toc-list">${page.toc
    .map(
      item =>
        `<li class="docs-toc-item" data-level="${String(item.level)}"><uik-text as="p" class="docs-paragraph"><uik-link href="#${item.id}">${escapeHtml(
          item.title,
        )}</uik-link></uik-text></li>`,
    )
    .join('')}</ul></nav>`;
};

export const renderPageSections = (page: DocPage) => {
  return page.sections
    .map(sectionItem => {
      return `
        <section class="docs-section" id="${sectionItem.id}">
          <uik-heading level="2" class="docs-heading docs-section-heading" data-heading-level="2">
            <a class="docs-heading-anchor" href="#${sectionItem.id}" aria-label="Link to ${escapeHtml(
              sectionItem.title,
            )}">#</a>
            <span class="docs-heading-text">${escapeHtml(sectionItem.title)}</span>
          </uik-heading>
          <div class="docs-section-body">${sectionItem.body}</div>
        </section>
      `;
    })
    .join('');
};
