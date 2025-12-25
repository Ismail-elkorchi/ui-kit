import docsContent from './generated/docs-content.json';

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
  if (!page.sections.length) return '';
  return `<nav aria-label="On this page" class="docs-toc"><ul class="docs-list">${page.sections
    .map(
      sectionItem =>
        `<li><uik-text as="p" class="docs-paragraph"><uik-link href="#${sectionItem.id}">${sectionItem.title}</uik-link></uik-text></li>`,
    )
    .join('')}</ul></nav>`;
};

export const renderPageSections = (page: DocPage) => {
  return page.sections
    .map(sectionItem => {
      return `
        <section class="docs-section" id="${sectionItem.id}">
          <uik-heading level="2">${sectionItem.title}</uik-heading>
          <div class="docs-section-body">${sectionItem.body}</div>
        </section>
      `;
    })
    .join('');
};
