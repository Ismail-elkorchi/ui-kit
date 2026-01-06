import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { marked } from "marked";
import MiniSearch from "minisearch";
import Prism from "prismjs";
import loadLanguages from "prismjs/components/index.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
const docsRoot = path.join(repoRoot, "packages/docs");
const contentRoot = path.join(docsRoot, "content");
const manifestPath = path.join(contentRoot, "manifest.json");
const manifestOutputPath = path.join(
  docsRoot,
  "src/generated/docs-manifest.json",
);
const pagesOutputDir = path.join(docsRoot, "src/generated/pages");
const searchIndexPath = path.join(
  docsRoot,
  "src/generated/docs-search-index.json",
);

const supportedLanguages = new Map([
  ["bash", "bash"],
  ["css", "css"],
  ["html", "markup"],
  ["js", "javascript"],
  ["json", "json"],
  ["sh", "bash"],
  ["ts", "typescript"],
]);

loadLanguages(["bash", "css", "javascript", "json", "markup", "typescript"]);

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const stripInlineMarkdown = (value) =>
  value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    .replace(/_{1,3}([^_]+)_{1,3}/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();

const stripHeadingMarkup = (rawLine) =>
  rawLine.replace(/^#{1,6}\s+/, "").trim();

const stripHtml = (value) => value.replace(/<[^>]+>/g, "").trim();
const stripBlankLines = (value) =>
  value
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n");

const normalizeSearchText = (value) =>
  stripHtml(String(value ?? ""))
    .replace(/\s+/g, " ")
    .trim();

const normalizeLanguage = (value) => {
  const key = String(value ?? "")
    .trim()
    .toLowerCase();
  return supportedLanguages.get(key) ?? "";
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
      const base = baseCandidate || "section";
      const nextCount = (counts.get(base) ?? 0) + 1;
      counts.set(base, nextCount);
      return nextCount === 1 ? base : `${base}-${nextCount - 1}`;
    },
  };
};

const createRenderer = (slugger) => {
  const renderer = new marked.Renderer();
  renderer.paragraph = (text) =>
    `<uik-text as="p" class="docs-paragraph">${text}</uik-text>`;
  renderer.list = (body, ordered) => {
    const tag = ordered ? "ol" : "ul";
    return `<${tag} class="docs-list">${body}</${tag}>`;
  };
  renderer.listitem = (text) =>
    `<li><uik-text as="p" class="docs-paragraph">${text}</uik-text></li>`;
  renderer.code = (code, infostring) => {
    const rawLanguage = (infostring ?? "").trim().split(/\s+/)[0] ?? "";
    const language = normalizeLanguage(rawLanguage);
    const langClass = language ? `language-${escapeHtml(language)}` : "";
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
  renderer.codespan = (text) => `<code>${escapeHtml(text)}</code>`;
  renderer.heading = (text, level, raw) => {
    const safeLevel = Math.min(Math.max(level, 1), 6);
    const plain = raw
      ? stripInlineMarkdown(stripHeadingMarkup(raw))
      : stripHtml(text);
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

const readRepoFile = async (relativePath) => {
  const filePath = path.resolve(repoRoot, relativePath);
  return fs.readFile(filePath, "utf8");
};

const stripTopHeading = (markdown) => markdown.replace(/^#\s+.*\n+/, "");

const parseMarkdownSections = (markdown, introTitle = "Overview") => {
  const lines = stripTopHeading(markdown.replace(/\r\n/g, "\n")).split("\n");
  const sections = [];
  let currentTitle = null;
  let buffer = [];

  const flush = () => {
    const bodyMarkdown = buffer.join("\n").trim();
    if (!bodyMarkdown) return;
    sections.push({ title: currentTitle ?? introTitle, bodyMarkdown });
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

const readJson = async (relativePath) =>
  JSON.parse(await readRepoFile(relativePath));

const normalizeTypeText = (value) =>
  value.replace(/\s+/g, " ").replace(/\|/g, "|").trim();

const componentGroupDefinitions = [
  {
    id: "shell",
    label: "Shell layout",
    description: "App frame regions and chrome for composing shell layouts.",
    tags: [
      "uik-shell-activity-bar",
      "uik-shell-layout",
      "uik-shell-secondary-sidebar",
      "uik-shell-sidebar",
      "uik-shell-status-bar",
    ],
  },
  {
    id: "layout",
    label: "Layout",
    description: "Structure, spacing, and surface primitives.",
    tags: [
      "uik-box",
      "uik-resizable-panels",
      "uik-separator",
      "uik-stack",
      "uik-surface",
    ],
  },
  {
    id: "typography",
    label: "Typography",
    description: "Text, heading, and icon primitives.",
    tags: ["uik-heading", "uik-icon", "uik-text"],
  },
  {
    id: "actions",
    label: "Actions",
    description: "Buttons and links that trigger user actions.",
    tags: ["uik-button", "uik-link"],
  },
  {
    id: "forms",
    label: "Forms",
    description: "Form-associated inputs and toggles.",
    tags: [
      "uik-checkbox",
      "uik-input",
      "uik-radio",
      "uik-radio-group",
      "uik-select",
      "uik-switch",
      "uik-textarea",
    ],
  },
  {
    id: "navigation",
    label: "Navigation",
    description: "Navigation lists, menus, and tree structures.",
    tags: [
      "uik-menu",
      "uik-menu-item",
      "uik-menubar",
      "uik-nav",
      "uik-nav-rail",
      "uik-tree-view",
    ],
  },
  {
    id: "feedback",
    label: "Feedback",
    description: "Inline status, progress, and indicators.",
    tags: ["uik-alert", "uik-badge", "uik-progress", "uik-spinner"],
  },
  {
    id: "overlays",
    label: "Overlays",
    description: "Dialogs, popovers, and tooltips.",
    tags: ["uik-dialog", "uik-popover", "uik-tooltip"],
  },
  {
    id: "utilities",
    label: "Utilities",
    description: "Accessibility and low-level helpers.",
    tags: ["uik-visually-hidden"],
  },
];

const componentGroupMeta = new Map(
  componentGroupDefinitions.map((group) => [group.id, group]),
);
const componentGroupOrder = componentGroupDefinitions.map((group) => group.id);
const componentTagToGroup = new Map(
  componentGroupDefinitions.flatMap((group) =>
    group.tags.map((tag) => [tag, group.id]),
  ),
);

const resolveComponentGroup = (tagName) => {
  if (!tagName) return componentGroupMeta.get("utilities");
  if (tagName.startsWith("uik-shell-")) {
    return componentGroupMeta.get("shell");
  }
  const groupId = componentTagToGroup.get(tagName) ?? "utilities";
  return componentGroupMeta.get(groupId) ?? componentGroupMeta.get("utilities");
};

const formatAttributesFromCem = (attributes) => {
  if (!attributes?.length) return [];
  return attributes.map((attribute) => {
    const name = attribute.name ?? "";
    const rawType = attribute.type?.text
      ? normalizeTypeText(attribute.type.text)
      : "";
    return rawType ? `${name} (${rawType})` : name;
  });
};

const buildComponentsFromContracts = (contracts, cem) => {
  const entries = contracts.components ?? contracts.entries ?? [];
  const cemEntries = cem?.modules
    ? new Map(
        cem.modules
          .flatMap((module) => module.declarations ?? [])
          .filter((declaration) => declaration?.tagName)
          .map((declaration) => [declaration.tagName, declaration]),
      )
    : new Map();

  return entries.map((entry) => {
    const kind = entry.kind ?? "component";
    const tagName = entry.tagName;
    const cemEntry = tagName ? cemEntries.get(tagName) : null;
    const name = entry.name ?? (tagName ? `<${tagName}>` : entry.id);
    const id =
      entry.id ?? (tagName ? tagName.replace(/^uik-/, "") : slugify(name));
    const groupMeta = resolveComponentGroup(tagName);
    const attributes =
      entry.attributes && entry.attributes.length
        ? entry.attributes
        : formatAttributesFromCem(cemEntry?.attributes);

    return {
      id,
      tagName: tagName ?? "",
      name,
      kind,
      group: groupMeta?.id ?? "utilities",
      groupLabel: groupMeta?.label ?? "Utilities",
      groupDescription: groupMeta?.description ?? "",
      summary: entry.summary ?? "",
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

const renderInlineMarkdown = (value) =>
  marked.parseInline(escapeHtml(String(value ?? "")));

const extractHeadingsFromMarkdown = (markdown) => {
  const tokens = marked.lexer(markdown);
  return tokens
    .filter((token) => token.type === "heading")
    .map((token) => ({
      level: token.depth,
      title: stripInlineMarkdown(
        stripHeadingMarkup(token.raw ?? token.text ?? ""),
      ),
      raw: token.raw ?? "",
    }));
};

const buildSectionsAndTocFromRawSections = (rawSections) => {
  const tocSlugger = createSlugger();
  const htmlSlugger = createSlugger();

  const sections = rawSections.map((section) => ({
    id: tocSlugger.slug(section.title),
    title: section.title,
    bodyMarkdown: section.bodyMarkdown,
  }));

  sections.forEach((section) => {
    htmlSlugger.slug(section.title);
  });

  const toc = [];
  for (const section of sections) {
    toc.push({ id: section.id, title: section.title, level: 2 });

    const headings = extractHeadingsFromMarkdown(section.bodyMarkdown)
      .filter((heading) => heading.level >= 2)
      .map((heading) => ({
        id: tocSlugger.slug(heading.title),
        title: heading.title,
        level: heading.level,
      }));

    toc.push(...headings);
  }

  const renderer = createRenderer(htmlSlugger);
  const renderedSections = sections.map((section) => ({
    id: section.id,
    title: section.title,
    body: marked
      .parse(section.bodyMarkdown, {
        renderer,
        gfm: true,
        mangle: false,
        headerIds: false,
      })
      .trim(),
  }));

  return { sections: renderedSections, toc };
};

const buildMarkdownPageSections = (markdown, introTitle = "Overview") =>
  buildSectionsAndTocFromRawSections(
    parseMarkdownSections(markdown, introTitle),
  );

const renderComponentPortfolio = (components) => {
  const templates = {
    "uik-alert": () => ({
      layout: "start",
      size: "md",
      html: `<uik-alert variant="info"><span slot="title">Heads up</span>Tokens are loaded.</uik-alert>`,
    }),
    "uik-badge": () => ({
      layout: "center",
      size: "sm",
      html: `<uik-badge variant="secondary">Beta</uik-badge>`,
    }),
    "uik-box": () => ({
      layout: "start",
      size: "md",
      html: `<uik-box padding="4"><uik-text as="p">Box content</uik-text></uik-box>`,
    }),
    "uik-button": () => ({
      layout: "center",
      size: "sm",
      html: `<uik-button variant="solid">Primary</uik-button>`,
    }),
    "uik-checkbox": () => ({
      layout: "start",
      size: "md",
      html: `<uik-checkbox checked><span slot="label">Remember me</span></uik-checkbox>`,
    }),
    "uik-code-block": () => ({
      layout: "start",
      size: "md",
      html: `<uik-code-block copy>npm run build</uik-code-block>`,
    }),
    "uik-combobox": () => ({
      layout: "start",
      size: "md",
      html: `<uik-combobox open placeholder="Search" aria-label="Assignee" data-docs-portfolio="combobox">
<span slot="label">Assignee</span>
</uik-combobox>`,
    }),
    "uik-command-palette": () => ({
      layout: "start",
      size: "md",
      html: `<div class="docs-portfolio-command-palette">
<uik-button variant="outline" size="sm" data-docs-portfolio="command-palette-open">Open palette</uik-button>
<uik-command-palette data-docs-portfolio="command-palette" placeholder="Search commands">
<span slot="title">Command palette</span>
<span slot="description">Type to filter commands.</span>
<uik-visually-hidden slot="label">Search commands</uik-visually-hidden>
</uik-command-palette>
</div>`,
    }),
    "uik-description-list": () => ({
      layout: "start",
      size: "sm",
      html: `<uik-description-list density="compact">
<dt>Status</dt><dd>Active</dd>
<dt>Owner</dt><dd>Design</dd>
</uik-description-list>`,
    }),
    "uik-dialog": (component) => {
      const dialogId = `docs-portfolio-dialog-${component.id}`;
      return {
        layout: "center",
        size: "md",
        html: `<div class="docs-portfolio-dialog">
<uik-button variant="outline" size="sm" data-docs-dialog-trigger="${dialogId}">Preview dialog</uik-button>
<uik-dialog id="${dialogId}" style="--uik-component-dialog-max-width: var(--uik-layout-panel-width-sm);">
<span slot="title">Release notes</span>
<uik-text as="p">Updates are ready to install.</uik-text>
<div slot="actions" class="docs-portfolio-dialog-actions">
<uik-button variant="ghost" size="sm" data-docs-dialog-close="${dialogId}">Close</uik-button>
<uik-button size="sm">Install</uik-button>
</div>
</uik-dialog>
</div>`,
      };
    },
    "uik-heading": () => ({
      layout: "start",
      size: "sm",
      html: `<uik-heading level="3">Section heading</uik-heading>`,
    }),
    "uik-icon": () => ({
      layout: "center",
      size: "sm",
      html: `<uik-icon tone="info"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"></path><circle cx="12" cy="12" r="9" stroke-width="2"></circle></svg></uik-icon>`,
    }),
    "uik-input": () => ({
      layout: "start",
      size: "md",
      html: `<uik-input placeholder="Search docs"></uik-input>`,
    }),
    "uik-link": () => ({
      layout: "start",
      size: "sm",
      html: `<uik-link href="#">Explore link</uik-link>`,
    }),
    "uik-listbox": () => ({
      layout: "start",
      size: "md",
      html: `<uik-listbox value="tokens" aria-label="Docs navigation">
<uik-option value="overview">Overview</uik-option>
<uik-option value="tokens">Tokens</uik-option>
<uik-option value="components">Components</uik-option>
</uik-listbox>`,
    }),
    "uik-menu": () => ({
      layout: "start",
      size: "md",
      html: `<uik-menu>
<uik-button slot="trigger" variant="outline" size="sm">Menu</uik-button>
<uik-menu-item id="docs-menu-item-1">Account</uik-menu-item>
<uik-menu-item id="docs-menu-item-2">Settings</uik-menu-item>
<uik-menu-item id="docs-menu-item-3">Sign out</uik-menu-item>
</uik-menu>`,
    }),
    "uik-menu-item": () => ({
      layout: "start",
      size: "sm",
      html: `<div role="menu" aria-label="Menu item preview">
<uik-menu-item active>Active item</uik-menu-item>
</div>`,
    }),
    "uik-menubar": () => ({
      layout: "start",
      size: "md",
      html: `<uik-menubar>
<uik-menu>
<uik-button slot="trigger" variant="ghost" size="sm">File</uik-button>
<uik-menu-item id="docs-menubar-new">New</uik-menu-item>
<uik-menu-item id="docs-menubar-open">Open</uik-menu-item>
</uik-menu>
<uik-menu>
<uik-button slot="trigger" variant="ghost" size="sm">Edit</uik-button>
<uik-menu-item id="docs-menubar-copy">Copy</uik-menu-item>
<uik-menu-item id="docs-menubar-paste">Paste</uik-menu-item>
</uik-menu>
</uik-menubar>`,
    }),
    "uik-nav": () => ({
      layout: "start",
      size: "lg",
      html: `<uik-nav data-docs-portfolio="nav"></uik-nav>`,
    }),
    "uik-nav-rail": () => ({
      layout: "start",
      size: "md",
      html: `<uik-nav-rail orientation="horizontal" data-docs-portfolio="nav-rail"></uik-nav-rail>`,
    }),
    "uik-option": () => ({
      layout: "start",
      size: "sm",
      html: `<uik-listbox aria-label="Options">
<uik-option selected>Active item</uik-option>
<uik-option>Inactive item</uik-option>
</uik-listbox>`,
    }),
    "uik-pagination": () => ({
      layout: "center",
      size: "sm",
      html: `<uik-pagination page="2" page-count="5" total="42"></uik-pagination>`,
    }),
    "uik-popover": () => ({
      layout: "overlay",
      size: "md",
      html: `<uik-popover open placement="bottom">
<uik-button slot="trigger" variant="outline" size="sm">Popover</uik-button>
<uik-text as="p" size="sm">Team settings</uik-text>
</uik-popover>`,
    }),
    "uik-progress": () => ({
      layout: "start",
      size: "sm",
      html: `<uik-progress value="64" max="100"></uik-progress>`,
    }),
    "uik-radio": () => ({
      layout: "start",
      size: "sm",
      html: `<uik-radio checked><span slot="label">Option A</span></uik-radio>`,
    }),
    "uik-radio-group": () => ({
      layout: "start",
      size: "md",
      html: `<uik-radio-group value="daily">
<span slot="label">Frequency</span>
<uik-radio value="daily" checked><span slot="label">Daily</span></uik-radio>
<uik-radio value="weekly"><span slot="label">Weekly</span></uik-radio>
</uik-radio-group>`,
    }),
    "uik-resizable-panels": () => ({
      layout: "fill",
      size: "lg",
      html: `<uik-resizable-panels>
<uik-box slot="start" padding="3"><uik-text as="p" size="sm">Start panel</uik-text></uik-box>
<uik-box slot="end" padding="3"><uik-text as="p" size="sm">End panel</uik-text></uik-box>
</uik-resizable-panels>`,
    }),
    "uik-select": () => ({
      layout: "start",
      size: "md",
      html: `<uik-select value="triage">
<span slot="label">Status</span>
<option value="triage">Triage</option>
<option value="active">Active</option>
<option value="blocked">Blocked</option>
</uik-select>`,
    }),
    "uik-separator": () => ({
      layout: "center",
      size: "sm",
      html: `<uik-separator></uik-separator>`,
    }),
    "uik-spinner": () => ({
      layout: "center",
      size: "sm",
      html: `<uik-spinner tone="primary" size="sm"></uik-spinner>`,
    }),
    "uik-stack": () => ({
      layout: "start",
      size: "sm",
      html: `<uik-stack direction="horizontal" gap="2" align="center">
<uik-badge>One</uik-badge>
<uik-badge variant="secondary">Two</uik-badge>
<uik-badge variant="outline">Three</uik-badge>
</uik-stack>`,
    }),
    "uik-surface": () => ({
      layout: "start",
      size: "md",
      html: `<uik-surface variant="elevated" bordered>
<uik-box padding="4"><uik-text as="p">Surface content</uik-text></uik-box>
</uik-surface>`,
    }),
    "uik-switch": () => ({
      layout: "start",
      size: "md",
      html: `<uik-switch checked><span slot="label">Notifications</span></uik-switch>`,
    }),
    "uik-tab": () => ({
      layout: "start",
      size: "sm",
      html: `<uik-tabs>
<uik-tab value="overview">Overview</uik-tab>
<uik-tab-panel value="overview"><uik-text as="p" size="sm">Panel content</uik-text></uik-tab-panel>
</uik-tabs>`,
    }),
    "uik-tab-panel": () => ({
      layout: "start",
      size: "sm",
      html: `<uik-tabs>
<uik-tab value="activity">Activity</uik-tab>
<uik-tab-panel value="activity"><uik-text as="p" size="sm">Panel content</uik-text></uik-tab-panel>
</uik-tabs>`,
    }),
    "uik-tabs": () => ({
      layout: "start",
      size: "md",
      html: `<uik-tabs>
<uik-tab value="overview">Overview</uik-tab>
<uik-tab value="details">Details</uik-tab>
<uik-tab-panel value="overview"><uik-text as="p" size="sm">Overview panel</uik-text></uik-tab-panel>
<uik-tab-panel value="details"><uik-text as="p" size="sm">Details panel</uik-text></uik-tab-panel>
</uik-tabs>`,
    }),
    "uik-text": () => ({
      layout: "start",
      size: "sm",
      html: `<uik-text as="p" tone="muted">Tokenized text</uik-text>`,
    }),
    "uik-textarea": () => ({
      layout: "start",
      size: "md",
      html: `<uik-textarea rows="2" placeholder="Notes"></uik-textarea>`,
    }),
    "uik-tooltip": () => ({
      layout: "overlay",
      size: "md",
      html: `<uik-tooltip open placement="bottom">
<uik-button slot="trigger" variant="outline" size="sm">Tooltip</uik-button>
Tooltip text
</uik-tooltip>`,
    }),
    "uik-tree-view": () => ({
      layout: "start",
      size: "lg",
      html: `<uik-tree-view data-docs-portfolio="tree-view"></uik-tree-view>`,
    }),
    "uik-visually-hidden": (component) => {
      const hiddenId = `docs-portfolio-hidden-${component.id}`;
      return {
        layout: "start",
        size: "sm",
        html: `<div class="docs-portfolio-hidden">
<uik-button variant="outline" size="sm" aria-describedby="${hiddenId}">Hidden label</uik-button>
<uik-visually-hidden id="${hiddenId}">Screen reader hint</uik-visually-hidden>
</div>`,
      };
    },
    "uik-shell-activity-bar": () => ({
      layout: "fill",
      size: "lg",
      html: `<uik-shell-activity-bar data-docs-portfolio="shell-activity-bar">
<uik-text slot="footer" as="p" size="sm" tone="muted">v0.1.2</uik-text>
</uik-shell-activity-bar>`,
    }),
    "uik-shell-layout": () => ({
      layout: "shell",
      size: "xl",
      html: `<uik-shell-layout isSecondarySidebarVisible class="docs-portfolio-shell-layout">
<uik-shell-activity-bar slot="activity-bar" data-docs-portfolio="shell-activity-bar"></uik-shell-activity-bar>
<uik-shell-sidebar slot="primary-sidebar" heading="Workspace" subtitle="Design">
<uik-text as="p" size="sm" tone="muted">Primary sidebar</uik-text>
</uik-shell-sidebar>
<div slot="main-content" class="docs-portfolio-shell-main">
<uik-text as="p">Main content</uik-text>
</div>
<uik-shell-secondary-sidebar slot="secondary-sidebar" isOpen heading="Details">
<uik-text as="p" size="sm" tone="muted">Secondary sidebar</uik-text>
</uik-shell-secondary-sidebar>
<uik-shell-status-bar slot="status-bar" message="Ready" tone="info" meta="Connected"></uik-shell-status-bar>
</uik-shell-layout>`,
    }),
    "uik-shell-secondary-sidebar": () => ({
      layout: "fill",
      size: "lg",
      html: `<uik-shell-secondary-sidebar isOpen heading="Details">
<uik-text as="p" size="sm" tone="muted">Secondary sidebar</uik-text>
<uik-text slot="footer" as="p" size="sm" tone="muted">Footer actions</uik-text>
</uik-shell-secondary-sidebar>`,
    }),
    "uik-shell-sidebar": () => ({
      layout: "fill",
      size: "lg",
      html: `<uik-shell-sidebar heading="Navigation" subtitle="Workspace">
<uik-text as="p" size="sm" tone="muted">Primary sidebar</uik-text>
<uik-text slot="footer" as="p" size="sm" tone="muted">Footer links</uik-text>
</uik-shell-sidebar>`,
    }),
    "uik-shell-status-bar": () => ({
      layout: "fill",
      size: "sm",
      html: `<uik-shell-status-bar message="Deploying" tone="success" meta="2m left"></uik-shell-status-bar>`,
    }),
  };

  const renderPreview = (component) => {
    if (!component.tagName) return null;
    const template = templates[component.tagName];
    if (!template) return null;
    return typeof template === "function" ? template(component) : template;
  };

  const groups = componentGroupOrder
    .map((groupId) => {
      const meta = componentGroupMeta.get(groupId);
      if (!meta) return null;
      return { meta, items: [] };
    })
    .filter(Boolean);

  const groupLookup = new Map(groups.map((group) => [group.meta.id, group]));

  components.forEach((component) => {
    const groupId = component.group ?? "utilities";
    const group = groupLookup.get(groupId) ?? groupLookup.get("utilities");
    if (group) group.items.push(component);
  });

  const renderCard = (component) => {
    const preview = renderPreview(component);
    if (!preview) return "";
    const summary = component.summary ? escapeHtml(component.summary) : "";
    const displayName = component.tagName
      ? `<${component.tagName}>`
      : component.name;
    const layout = preview.layout ?? "center";
    const size = preview.size ?? "md";
    return stripBlankLines(`
<article class="docs-card docs-portfolio-card" data-component="${escapeHtml(
      component.id,
    )}" data-component-group="${escapeHtml(component.group ?? "utilities")}">
<div class="docs-portfolio-preview" data-preview-layout="${layout}" data-preview-size="${size}">
${preview.html}
</div>
<div class="docs-portfolio-meta">
<uik-heading level="3"><code>${escapeHtml(displayName)}</code></uik-heading>
${summary ? `<uik-text as="p" class="docs-paragraph">${summary}</uik-text>` : ""}
<uik-link href="#component-${component.id}" class="docs-portfolio-link">View contract</uik-link>
</div>
</article>`);
  };

  const groupSections = groups
    .map((group) => {
      if (!group.items.length) return "";
      const cards = group.items.map(renderCard).filter(Boolean);
      if (!cards.length) return "";
      const countLabel = `${group.items.length} component${
        group.items.length === 1 ? "" : "s"
      }`;
      return stripBlankLines(`
<section class="docs-portfolio-group" data-portfolio-group="${escapeHtml(
        group.meta.id,
      )}">
<header class="docs-portfolio-group-header">
  <div class="docs-portfolio-group-title">
    <uik-heading level="3">${escapeHtml(group.meta.label)}</uik-heading>
    ${
      group.meta.description
        ? `<uik-text as="p" class="docs-paragraph">${escapeHtml(
            group.meta.description,
          )}</uik-text>`
        : ""
    }
  </div>
  <uik-badge variant="outline">${countLabel}</uik-badge>
</header>
<div class="docs-portfolio-grid">
${cards.join("\n")}
</div>
</section>`);
    })
    .filter(Boolean);

  if (groupSections.length === 0) return "";

  return `<div class="docs-portfolio">${groupSections.join("\n")}</div>`;
};

const renderComponentCards = (components) => {
  const buildList = (items) => {
    if (!items.length) {
      return '<uik-text as="p" class="docs-paragraph">None.</uik-text>';
    }
    const listItems = items
      .map(
        (item) =>
          `<li><uik-text as="p" class="docs-paragraph">${renderInlineMarkdown(item)}</uik-text></li>`,
      )
      .join("");
    return `<ul class="docs-component-list">${listItems}</ul>`;
  };
  const titleCase = (value) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
  const buildRow = (label, items) =>
    `<dt>${escapeHtml(label)}</dt><dd>${buildList(items)}</dd>`;

  return components
    .map((component) => {
      const summary = component.summary ? escapeHtml(component.summary) : "";
      const groupLabel = component.groupLabel
        ? escapeHtml(component.groupLabel)
        : "";
      const kindLabel = component.kind
        ? escapeHtml(titleCase(component.kind))
        : "";
      const badges = [
        groupLabel
          ? `<uik-badge variant="secondary">${groupLabel}</uik-badge>`
          : "",
        kindLabel
          ? `<uik-badge variant="outline">${kindLabel}</uik-badge>`
          : "",
      ].filter(Boolean);

      const notesRow = component.notes?.length
        ? buildRow("Notes", component.notes)
        : "";

      return `
        <article class="docs-card docs-component" id="component-${component.id}" data-component-group="${escapeHtml(
          component.group ?? "utilities",
        )}">
          <header class="docs-component-header">
            <div class="docs-component-title">
              <uik-heading level="3"><code>${escapeHtml(component.name)}</code></uik-heading>
              ${
                summary
                  ? `<uik-text as="p" class="docs-paragraph">${summary}</uik-text>`
                  : ""
              }
            </div>
            ${
              badges.length
                ? `<div class="docs-component-tags">${badges.join("")}</div>`
                : ""
            }
          </header>
          <uik-separator class="docs-component-separator"></uik-separator>
          <uik-description-list class="docs-component-description" density="compact">
            ${buildRow("API", component.attributes ?? [])}
            ${buildRow("Slots", component.slots ?? [])}
            ${buildRow("Parts", component.parts ?? [])}
            ${buildRow("Events", component.events ?? [])}
            ${buildRow("A11y", component.a11y ?? [])}
            ${buildRow("CSS Vars", component.cssVars ?? [])}
            ${notesRow}
          </uik-description-list>
        </article>
      `;
    })
    .map(stripBlankLines)
    .join("\n");
};

const buildComponentsPage = async (entry) => {
  const readme = await readRepoFile(entry.readme);
  const componentsTitle = entry.componentsTitle ?? "Components and contracts";
  const componentsSourceTitle = entry.componentsSourceTitle ?? componentsTitle;
  const portfolioTitle = entry.portfolioTitle ?? "Portfolio";
  const hiddenTitles = new Set(
    [componentsTitle, componentsSourceTitle]
      .filter(Boolean)
      .map((title) => title.toLowerCase()),
  );
  const rawSections = parseMarkdownSections(readme, "Overview").filter(
    (section) => !hiddenTitles.has(section.title.toLowerCase()),
  );

  const contracts = entry.contracts ? await readJson(entry.contracts) : null;
  const cem = entry.cem ? await readJson(entry.cem) : null;
  const components = contracts
    ? buildComponentsFromContracts(contracts, cem)
    : [];

  const nextSections = [...rawSections];

  if (components.length) {
    const portfolio = renderComponentPortfolio(components);
    if (portfolio) {
      const overviewIndex = rawSections.findIndex(
        (section) => section.title.toLowerCase() === "overview",
      );
      const usageIndex = rawSections.findIndex(
        (section) => section.title.toLowerCase() === "usage",
      );
      const insertIndex =
        overviewIndex !== -1
          ? overviewIndex + 1
          : usageIndex !== -1
            ? usageIndex + 1
            : 0;
      nextSections.splice(insertIndex, 0, {
        title: portfolioTitle,
        bodyMarkdown: portfolio,
      });
    }
    const cards = renderComponentCards(components);
    nextSections.push({
      title: componentsTitle,
      bodyMarkdown: `<div class="docs-components">${cards}</div>`,
    });
  }

  const { sections, toc } = buildSectionsAndTocFromRawSections(nextSections);

  return {
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    navLabel: entry.navLabel ?? entry.title,
    group: entry.group ?? undefined,
    kind: entry.kind ?? undefined,
    package: entry.package ?? undefined,
    type: entry.type ?? "components",
    sections,
    toc,
  };
};

const buildMarkdownPage = async (entry) => {
  const markdown = await readRepoFile(entry.source);
  const { sections, toc } = buildMarkdownPageSections(markdown, "Overview");
  return {
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    navLabel: entry.navLabel ?? entry.title,
    group: entry.group ?? undefined,
    kind: entry.kind ?? undefined,
    package: entry.package ?? undefined,
    type: entry.type ?? "markdown",
    sections,
    toc,
  };
};

const buildPages = async (entries) => {
  const pages = [];
  for (const entry of entries) {
    if (entry.type === "components") {
      pages.push(await buildComponentsPage(entry));
    } else {
      pages.push(await buildMarkdownPage(entry));
    }
  }
  return pages;
};

const toPageMeta = (page) => ({
  id: page.id,
  title: page.title,
  summary: page.summary,
  navLabel: page.navLabel ?? page.title,
  group: page.group ?? undefined,
  kind: page.kind ?? undefined,
  package: page.package ?? undefined,
  type: page.type ?? undefined,
  toc: page.toc ?? [],
});

const writePageContent = async (kind, page) => {
  const output = { sections: page.sections ?? [] };
  const outputDir = path.join(pagesOutputDir, kind);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, `${page.id}.json`),
    `${JSON.stringify(output, null, 2)}\n`,
  );
};

const buildSearchDocuments = (pages, kind) =>
  pages.flatMap((page) => {
    const pageTitle = normalizeSearchText(page.title);
    const summary = normalizeSearchText(page.summary);
    return page.sections.map((section) => {
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
    ...buildSearchDocuments(docsPages, "docs"),
    ...buildSearchDocuments(labPages, "lab"),
  ];
  const miniSearch = new MiniSearch({
    fields: ["title", "body", "pageTitle", "summary"],
    storeFields: [
      "id",
      "kind",
      "pageId",
      "sectionId",
      "pageTitle",
      "title",
      "summary",
      "body",
      "url",
    ],
  });
  miniSearch.addAll(documents);
  return { schemaVersion: 1, index: miniSearch.toJSON() };
};

const run = async () => {
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const docsPages = await buildPages(manifest.docs ?? []);
  const labPages = await buildPages(manifest.lab ?? []);
  const output = {
    docsPages: docsPages.map(toPageMeta),
    labPages: labPages.map(toPageMeta),
  };
  const searchIndex = buildSearchIndex(docsPages, labPages);

  await fs.mkdir(path.dirname(manifestOutputPath), { recursive: true });
  await fs.writeFile(
    manifestOutputPath,
    `${JSON.stringify(output, null, 2)}\n`,
  );
  await Promise.all([
    ...docsPages.map((page) => writePageContent("docs", page)),
    ...labPages.map((page) => writePageContent("lab", page)),
  ]);
  await fs.writeFile(
    searchIndexPath,
    `${JSON.stringify(searchIndex, null, 2)}\n`,
  );
};

await run();
