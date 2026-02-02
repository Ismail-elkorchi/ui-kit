import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import Ajv from "ajv";
import { marked } from "marked";
import MiniSearch from "minisearch";
import prettier from "prettier";
import { getHighlighter } from "shiki";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
const docsRoot = path.join(repoRoot, "apps/docs");
const contentRoot = path.join(docsRoot, "content");
const manifestPath = path.join(contentRoot, "manifest.json");
const manifestSchemaPath = path.join(contentRoot, "manifest.schema.json");
const generatedContentDir = path.join(contentRoot, "generated");
const apiSchemaPath = path.join(generatedContentDir, "api.schema.json");
const apiOutputPath = path.join(generatedContentDir, "api.json");
const manifestOutputPath = path.join(
  docsRoot,
  "src/generated/docs-manifest.json",
);
const componentsManifestPath = path.join(
  docsRoot,
  "src/generated/docs-components.json",
);
const pagesOutputDir = path.join(docsRoot, "src/generated/pages");
const searchIndexPath = path.join(
  docsRoot,
  "src/generated/docs-search-index.json",
);

const codeHighlightTheme = "github-light";
const supportedLanguages = new Map([
  ["bash", "bash"],
  ["css", "css"],
  ["html", "html"],
  ["js", "javascript"],
  ["json", "json"],
  ["sh", "bash"],
  ["shell", "bash"],
  ["ts", "typescript"],
]);
const highlightLanguages = Array.from(new Set(supportedLanguages.values()));

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

const formatJson = async (data) =>
  prettier.format(JSON.stringify(data), {
    parser: "json",
  });

const normalizeVisibility = (value) =>
  value === "internal" ? "internal" : "public";

const normalizeLanguage = (value) => {
  const key = String(value ?? "")
    .trim()
    .toLowerCase();
  return supportedLanguages.get(key) ?? "";
};

const createHighlighter = async () =>
  getHighlighter({
    themes: [codeHighlightTheme],
    langs: highlightLanguages,
  });

const extractTokenScopes = (token) => {
  const scopes = [];
  const explanation = token?.explanation ?? [];
  for (const entry of explanation) {
    if (Array.isArray(entry?.scopes)) {
      entry.scopes.forEach((scopeEntry) => {
        if (typeof scopeEntry === "string") {
          scopes.push(scopeEntry);
        } else if (typeof scopeEntry?.scopeName === "string") {
          scopes.push(scopeEntry.scopeName);
        }
      });
    } else if (typeof entry?.scope === "string") {
      scopes.push(entry.scope);
    }
  }
  return scopes.map((scope) => scope.toLowerCase());
};

const resolveTokenCategory = (scopes) => {
  const hasScope = (value) => scopes.some((scope) => scope.includes(value));
  if (hasScope("comment")) return "comment";
  if (hasScope("string.regexp") || hasScope("regexp")) return "regex";
  if (hasScope("string")) return "string";
  if (
    hasScope("keyword") ||
    hasScope("storage") ||
    hasScope("modifier") ||
    hasScope("type.modifier")
  ) {
    return "keyword";
  }
  if (hasScope("constant.numeric") || hasScope("number")) return "number";
  if (hasScope("constant.language.boolean") || hasScope("boolean")) {
    return "boolean";
  }
  if (hasScope("entity.name.function") || hasScope("support.function")) {
    return "function";
  }
  if (
    hasScope("entity.name.type") ||
    hasScope("entity.name.class") ||
    hasScope("support.type")
  ) {
    return "type";
  }
  if (hasScope("entity.name.tag")) return "tag";
  if (hasScope("entity.other.attribute-name") || hasScope("attribute-name")) {
    return "attr-name";
  }
  if (hasScope("attribute-value")) return "attr-value";
  if (
    hasScope("variable.other.property") ||
    hasScope("variable.other.member") ||
    hasScope("property")
  ) {
    return "property";
  }
  if (hasScope("operator")) return "operator";
  if (hasScope("punctuation")) return "punctuation";
  if (hasScope("namespace")) return "namespace";
  if (hasScope("variable")) return "variable";
  if (hasScope("constant")) return "constant";
  return "";
};

const buildTokenClasses = (token) => {
  const scopes = extractTokenScopes(token);
  const category = resolveTokenCategory(scopes);
  const fontStyle = token?.fontStyle ?? 0;
  if (!category && !fontStyle) return "";
  const classes = ["docs-code-token"];
  if (category) classes.push(`tok-${category}`);
  if (fontStyle & 1) classes.push("is-italic");
  if (fontStyle & 2) classes.push("is-bold");
  if (fontStyle & 4) classes.push("is-underline");
  return classes.join(" ");
};

const renderHighlightedCode = (code, language, highlighter) => {
  if (!language || !highlighter) return escapeHtml(code);
  let tokens;
  try {
    if (typeof highlighter.codeToTokens === "function") {
      const result = highlighter.codeToTokens(code, {
        lang: language,
        theme: codeHighlightTheme,
        includeExplanation: true,
      });
      tokens = Array.isArray(result) ? result : result?.tokens;
    } else if (typeof highlighter.codeToThemedTokens === "function") {
      tokens = highlighter.codeToThemedTokens(code, {
        lang: language,
        theme: codeHighlightTheme,
        includeExplanation: true,
      });
    } else {
      return escapeHtml(code);
    }
  } catch {
    return escapeHtml(code);
  }
  if (!Array.isArray(tokens)) return escapeHtml(code);
  return tokens
    .map((line) => {
      const segments = [];
      for (const token of line) {
        const className = buildTokenClasses(token);
        const content = escapeHtml(String(token.content ?? ""));
        const last = segments[segments.length - 1];
        if (last && last.className === className) {
          last.content += content;
        } else {
          segments.push({ className, content });
        }
      }
      return segments
        .map((segment) =>
          segment.className
            ? `<span class="${segment.className}">${segment.content}</span>`
            : segment.content,
        )
        .join("");
    })
    .join("\n");
};

const normalizeSnippet = (value) => stripBlankLines(String(value ?? "")).trim();

const containsScriptTag = (value) => /<\s*script\b/i.test(value);

const buildCodeBlockMarkup = ({ code, language, highlighter, slot }) => {
  const langValue = String(language ?? "");
  const langClass = langValue ? `language-${escapeHtml(langValue)}` : "";
  const codeClass = ["docs-code-content", langClass].filter(Boolean).join(" ");
  const highlighted = renderHighlightedCode(code, langValue, highlighter);
  const slotAttr = slot ? ` slot=\"${slot}\"` : "";
  return stripBlankLines(`
    <uik-code-block${slotAttr} class=\"docs-code-block\" copyable>
      <span class=\"${codeClass}\" data-language=\"${escapeHtml(
        langValue,
      )}\">${highlighted}</span>
    </uik-code-block>
  `);
};

const buildExampleMarkup = ({ previewHtml, code, language, highlighter }) => {
  const preview = stripBlankLines(String(previewHtml ?? "")).trim();
  const snippet = normalizeSnippet(code);
  const codeBlock = buildCodeBlockMarkup({
    code: snippet,
    language,
    highlighter,
    slot: "code",
  });
  return stripBlankLines(`
<uik-example>
  <div slot=\"preview\">${preview}</div>
  ${codeBlock}
</uik-example>
  `);
};

const admonitionConfig = new Map([
  ["NOTE", { variant: "info", label: "Note" }],
  ["TIP", { variant: "success", label: "Tip" }],
  ["IMPORTANT", { variant: "neutral", label: "Important" }],
  ["WARNING", { variant: "warning", label: "Warning" }],
  ["CAUTION", { variant: "danger", label: "Caution" }],
]);

const parseAdmonition = (text) => {
  const lines = String(text ?? "").split("\n");
  if (lines.length === 0) return null;
  const firstLine = lines[0].trim();
  const match = firstLine.match(
    /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s+(.*))?$/i,
  );
  if (!match) return null;
  const type = match[1].toUpperCase();
  const config = admonitionConfig.get(type);
  if (!config) return null;
  const trailing = match[2]?.trim() ?? "";
  const bodyLines = [];
  if (trailing) bodyLines.push(trailing);
  bodyLines.push(...lines.slice(1));
  const bodyMarkdown = bodyLines.join("\n").trim();
  return { ...config, bodyMarkdown };
};

const renderAdmonition = (token, parser) => {
  const payload = parseAdmonition(token?.text ?? "");
  if (!payload) return null;
  const { variant, label, bodyMarkdown } = payload;
  const title = escapeHtml(label);
  const body = bodyMarkdown
    ? parser.parse(marked.lexer(bodyMarkdown, parser.options)).trim()
    : "";
  const bodyMarkup = body ? `\n${body}\n` : "";
  return `
    <uik-alert class="docs-admonition" variant="${variant}">
      <span slot="title">${title}</span>${bodyMarkup}
    </uik-alert>
  `.trim();
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

marked.use({
  extensions: [
    {
      name: "blockquote",
      renderer(token) {
        return renderAdmonition(token, this.parser) ?? false;
      },
    },
  ],
});

const createRenderer = (slugger, highlighter) => {
  const renderer = new marked.Renderer();
  renderer.highlighter = highlighter;
  renderer.paragraph = (text) =>
    `<uik-text as="p" class="docs-paragraph">${text}</uik-text>`;
  renderer.blockquote = (quote) =>
    `<blockquote class="docs-blockquote">${quote}</blockquote>`;
  renderer.table = (header, body) => {
    const tableBody = body ? `<tbody>${body}</tbody>` : "";
    return `
      <div class="docs-table-wrap">
        <table class="docs-table">
          <thead>${header}</thead>
          ${tableBody}
        </table>
      </div>
    `.trim();
  };
  renderer.list = (body, ordered) => {
    const tag = ordered ? "ol" : "ul";
    return `<${tag} class="docs-list">${body}</${tag}>`;
  };
  renderer.listitem = (text) =>
    `<li><uik-text as="p" class="docs-paragraph">${text}</uik-text></li>`;
  renderer.code = (code, infostring) => {
    const rawLanguage = (infostring ?? "").trim().split(/\s+/)[0] ?? "";
    const isExample = rawLanguage === "example-html";
    const language = normalizeLanguage(isExample ? "html" : rawLanguage);
    if (isExample) {
      if (containsScriptTag(code)) {
        throw new Error("example-html fences may not include <script> tags.");
      }
      const snippet = normalizeSnippet(code);
      return buildExampleMarkup({
        previewHtml: snippet,
        code: snippet,
        language,
        highlighter: renderer.highlighter,
      });
    }
    return buildCodeBlockMarkup({
      code,
      language,
      highlighter: renderer.highlighter,
    });
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

const stripParens = (value) => {
  const text = String(value ?? "").trim();
  if (text.startsWith("(") && text.endsWith(")")) {
    return text.slice(1, -1).trim();
  }
  return text;
};

const parseContractEntry = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const match = raw.match(/^([^()]+?)(?:\s*\((.+)\))?$/);
  const name = match ? match[1].trim() : raw;
  const detail = match?.[2]?.trim() ?? "";
  return { name, detail };
};

const mergeNamedItems = (primary, secondary, fields) => {
  const map = new Map();
  for (const item of primary ?? []) {
    if (!item?.name) continue;
    map.set(item.name, { ...item });
  }
  for (const item of secondary ?? []) {
    if (!item?.name) continue;
    if (!map.has(item.name)) {
      map.set(item.name, { ...item });
      continue;
    }
    const existing = map.get(item.name);
    for (const field of fields) {
      if (existing[field] === undefined || existing[field] === "") {
        if (item[field] !== undefined && item[field] !== "") {
          existing[field] = item[field];
        }
      }
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    String(a.name).localeCompare(String(b.name)),
  );
};

const toCemAttributes = (attributes) =>
  (attributes ?? [])
    .map((attribute) => ({
      name: attribute?.name ?? "",
      type: attribute?.type?.text ? normalizeTypeText(attribute.type.text) : "",
      description: stripParens(attribute?.description ?? ""),
      default: attribute?.default ?? "",
    }))
    .filter((attribute) => attribute.name);

const toCemProperties = (members) =>
  (members ?? [])
    .filter(
      (member) =>
        member?.kind === "field" &&
        member?.privacy !== "private" &&
        member?.privacy !== "protected",
    )
    .map((member) => ({
      name: member?.name ?? "",
      type: member?.type?.text ? normalizeTypeText(member.type.text) : "",
      description: stripParens(member?.description ?? ""),
      default: member?.default ?? "",
    }))
    .filter((member) => member.name);

const toCemSlots = (slots) =>
  (slots ?? [])
    .map((slot) => ({
      name: slot?.name ?? "",
      description: stripParens(slot?.description ?? ""),
    }))
    .filter((slot) => slot.name);

const toCemParts = (parts) =>
  (parts ?? [])
    .map((part) => ({
      name: part?.name ?? "",
      description: stripParens(part?.description ?? ""),
    }))
    .filter((part) => part.name);

const toCemCssProperties = (properties) =>
  (properties ?? [])
    .map((property) => ({
      name: property?.name ?? "",
      description: stripParens(property?.description ?? ""),
    }))
    .filter((property) => property.name);

const toContractAttributes = (attributes) =>
  (attributes ?? [])
    .map(parseContractEntry)
    .filter(Boolean)
    .map((entry) => ({
      name: entry.name,
      type: entry.detail ?? "",
      description: "",
      default: "",
    }))
    .filter((entry) => entry.name);

const toContractNamedList = (items) =>
  (items ?? [])
    .map(parseContractEntry)
    .filter(Boolean)
    .map((entry) => ({
      name: entry.name,
      description: entry.detail ?? "",
    }))
    .filter((entry) => entry.name);

const buildApiComponents = (contracts, cem) => {
  const entries = contracts?.components ?? contracts?.entries ?? [];
  const contractMap = new Map(
    entries
      .filter((entry) => entry?.tagName)
      .map((entry) => [entry.tagName, entry]),
  );
  const cemMap = new Map(
    cem?.modules
      ? cem.modules
          .flatMap((module) => module.declarations ?? [])
          .filter((declaration) => declaration?.tagName)
          .map((declaration) => [declaration.tagName, declaration])
      : [],
  );

  const tagNames = Array.from(
    new Set([...contractMap.keys(), ...cemMap.keys()]),
  ).sort((a, b) => a.localeCompare(b));

  return tagNames.map((tagName) => {
    const contractEntry = contractMap.get(tagName);
    const cemEntry = cemMap.get(tagName);
    const summary = contractEntry?.summary ?? cemEntry?.description ?? "";
    const attributes = mergeNamedItems(
      toCemAttributes(cemEntry?.attributes),
      toContractAttributes(contractEntry?.attributes),
      ["type", "description", "default"],
    );
    const properties = toCemProperties(cemEntry?.members).sort((a, b) =>
      String(a.name).localeCompare(String(b.name)),
    );
    const slots = mergeNamedItems(
      toCemSlots(cemEntry?.slots),
      toContractNamedList(contractEntry?.slots),
      ["description"],
    );
    const parts = mergeNamedItems(
      toCemParts(cemEntry?.cssParts),
      toContractNamedList(contractEntry?.parts),
      ["description"],
    );
    const cssCustomProperties = mergeNamedItems(
      toCemCssProperties(cemEntry?.cssProperties),
      toContractNamedList(contractEntry?.cssVars),
      ["description"],
    );
    const events = toContractNamedList(contractEntry?.events);

    return {
      id: contractEntry?.id ?? (tagName ? tagName.replace(/^uik-/, "") : ""),
      tagName,
      name: contractEntry?.name ?? `<${tagName}>`,
      kind: contractEntry?.kind ?? "component",
      summary,
      attributes,
      properties,
      events,
      slots,
      cssParts: parts,
      cssCustomProperties,
      a11y: contractEntry?.a11y ?? [],
      notes: contractEntry?.notes ?? [],
    };
  });
};

const apiPackageDefinitions = [
  {
    id: "ui-primitives",
    name: "Primitives",
    contracts: "packages/ui-primitives/contracts/components.json",
    cem: "packages/ui-primitives/dist/custom-elements.json",
  },
  {
    id: "ui-shell",
    name: "Shell",
    contracts: "packages/ui-shell/contracts/entries.json",
    cem: "packages/ui-shell/dist/custom-elements.json",
  },
  {
    id: "ui-patterns",
    name: "Patterns",
    contracts: null,
    cem: "packages/ui-patterns/dist/custom-elements.json",
  },
];

const buildDocsApiModel = async () => {
  const packages = [];
  for (const definition of apiPackageDefinitions) {
    const contracts = definition.contracts
      ? await readJson(definition.contracts)
      : null;
    const cem = definition.cem ? await readJson(definition.cem) : null;
    packages.push({
      id: definition.id,
      name: definition.name,
      contracts: definition.contracts,
      cem: definition.cem,
      components: buildApiComponents(contracts, cem),
    });
  }

  return {
    $schema: "./api.schema.json",
    schemaVersion: "1.0.0",
    packages,
  };
};

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
    id: "patterns",
    label: "Patterns",
    description: "Composed UI blocks built from primitives.",
    tags: [
      "uik-empty-state",
      "uik-example",
      "uik-page-hero",
      "uik-section-card",
    ],
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

const buildComponentsFromApi = (components, packageMeta) =>
  (components ?? []).map((component) => {
    const tagName = component.tagName ?? "";
    const groupMeta = resolveComponentGroup(tagName);
    return {
      ...component,
      group: groupMeta?.id ?? "utilities",
      groupLabel: groupMeta?.label ?? "Utilities",
      groupDescription: groupMeta?.description ?? "",
      packageId: packageMeta?.id ?? "",
      packageLabel: packageMeta?.name ?? "",
    };
  });

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

const buildSectionsAndTocFromRawSections = (rawSections, highlighter) => {
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

  const renderer = createRenderer(htmlSlugger, highlighter);
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

const buildMarkdownPageSections = (
  markdown,
  introTitle = "Overview",
  highlighter,
) =>
  buildSectionsAndTocFromRawSections(
    parseMarkdownSections(markdown, introTitle),
    highlighter,
  );

const componentPreviewTemplates = {
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
    html: `<uik-code-block copyable>npm run build</uik-code-block>`,
  }),
  "uik-combobox": () => ({
    layout: "start",
    size: "md",
    html: `<uik-combobox open placeholder="Search" aria-label="Assignee" data-docs-portfolio="combobox">
<span slot="label">Assignee</span>
</uik-combobox>`,
    snippetHtml: `<uik-combobox open placeholder="Search" aria-label="Assignee">
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
    snippetHtml: `<uik-command-palette placeholder="Search commands">
<span slot="title">Command palette</span>
<span slot="description">Type to filter commands.</span>
<uik-visually-hidden slot="label">Search commands</uik-visually-hidden>
</uik-command-palette>`,
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
      snippetHtml: `<uik-dialog open>
<span slot="title">Release notes</span>
<uik-text as="p">Updates are ready to install.</uik-text>
<div slot="actions">
<uik-button variant="ghost" size="sm">Close</uik-button>
<uik-button size="sm">Install</uik-button>
</div>
</uik-dialog>`,
    };
  },
  "uik-empty-state": () => ({
    layout: "center",
    size: "md",
    html: `<uik-empty-state>
<span slot="title">No messages</span>
<span slot="description">You are all caught up.</span>
<p>Try refreshing later.</p>
<div slot="actions">
<button type="button">New message</button>
</div>
</uik-empty-state>`,
  }),
  "uik-example": () => ({
    layout: "start",
    size: "lg",
    html: `<uik-example title="Example">
<div slot="preview">
<uik-stack direction="horizontal" gap="2" align="center">
<uik-button variant="solid">Create</uik-button>
<uik-input placeholder="Workspace name" aria-label="Workspace name"></uik-input>
</uik-stack>
</div>
<uik-code-block slot="code" copyable>&lt;uik-button&gt;Create&lt;/uik-button&gt;</uik-code-block>
</uik-example>`,
    snippetHtml: `<uik-example>
<div slot="preview">
<uik-button variant="solid">Create</uik-button>
</div>
<uik-code-block slot="code" copyable>&lt;uik-button&gt;Create&lt;/uik-button&gt;</uik-code-block>
</uik-example>`,
  }),
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
    snippetHtml: `<uik-nav></uik-nav>`,
  }),
  "uik-nav-rail": () => ({
    layout: "start",
    size: "md",
    html: `<uik-nav-rail orientation="horizontal" data-docs-portfolio="nav-rail"></uik-nav-rail>`,
    snippetHtml: `<uik-nav-rail orientation="horizontal"></uik-nav-rail>`,
  }),
  "uik-option": () => ({
    layout: "start",
    size: "sm",
    html: `<uik-listbox aria-label="Options">
<uik-option selected>Active item</uik-option>
<uik-option>Inactive item</uik-option>
</uik-listbox>`,
  }),
  "uik-page-hero": () => ({
    layout: "start",
    size: "lg",
    html: `<uik-page-hero>
<span slot="eyebrow">v0.2.0</span>
<span slot="title">UI Kit</span>
<span slot="summary">Build consistent interfaces with tokens and primitives.</span>
<div slot="links">
<a href="#">API Reference</a>
</div>
<div slot="panel">
<button type="button">Get started</button>
</div>
</uik-page-hero>`,
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
  "uik-section-card": () => ({
    layout: "start",
    size: "md",
    html: `<uik-section-card>
<span slot="title">Account</span>
<div>Update your profile details.</div>
<div slot="actions">
<button type="button">Save</button>
</div>
</uik-section-card>`,
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
    snippetHtml: `<uik-tree-view></uik-tree-view>`,
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
      snippetHtml: `<uik-visually-hidden>Screen reader hint</uik-visually-hidden>`,
    };
  },
  "uik-shell-activity-bar": () => ({
    layout: "fill",
    size: "lg",
    html: `<uik-shell-activity-bar data-docs-portfolio="shell-activity-bar">
<span slot="footer">v0.2.0</span>
</uik-shell-activity-bar>`,
    snippetHtml: `<uik-shell-activity-bar>
<span slot="footer">v0.2.0</span>
</uik-shell-activity-bar>`,
  }),
  "uik-shell-layout": () => ({
    layout: "shell",
    size: "xl",
    html: `<uik-shell-layout isSecondarySidebarVisible class="docs-portfolio-shell-layout">
<uik-shell-activity-bar slot="activity-bar" data-docs-portfolio="shell-activity-bar"></uik-shell-activity-bar>
<uik-shell-sidebar slot="primary-sidebar" heading="Workspace" subtitle="Design">
<p>Primary sidebar</p>
</uik-shell-sidebar>
<div slot="main-content" class="docs-portfolio-shell-main">
<p>Main content</p>
</div>
<uik-shell-secondary-sidebar slot="secondary-sidebar" isOpen heading="Details">
<p>Secondary sidebar</p>
</uik-shell-secondary-sidebar>
<uik-shell-status-bar slot="status-bar" message="Ready" tone="info" meta="Connected"></uik-shell-status-bar>
</uik-shell-layout>`,
    snippetHtml: `<uik-shell-layout isSecondarySidebarVisible>
<uik-shell-activity-bar slot="activity-bar"></uik-shell-activity-bar>
<uik-shell-sidebar slot="primary-sidebar" heading="Workspace" subtitle="Design">
<p>Primary sidebar</p>
</uik-shell-sidebar>
<div slot="main-content">
<p>Main content</p>
</div>
<uik-shell-secondary-sidebar slot="secondary-sidebar" isOpen heading="Details">
<p>Secondary sidebar</p>
</uik-shell-secondary-sidebar>
<uik-shell-status-bar slot="status-bar" message="Ready" tone="info" meta="Connected"></uik-shell-status-bar>
</uik-shell-layout>`,
  }),
  "uik-shell-secondary-sidebar": () => ({
    layout: "fill",
    size: "lg",
    html: `<uik-shell-secondary-sidebar isOpen heading="Details">
<p>Secondary sidebar</p>
<span slot="footer">Footer actions</span>
</uik-shell-secondary-sidebar>`,
  }),
  "uik-shell-sidebar": () => ({
    layout: "fill",
    size: "lg",
    html: `<uik-shell-sidebar heading="Navigation" subtitle="Workspace">
<p>Primary sidebar</p>
<span slot="footer">Footer links</span>
</uik-shell-sidebar>`,
  }),
  "uik-shell-status-bar": () => ({
    layout: "fill",
    size: "sm",
    html: `<uik-shell-status-bar message="Deploying" tone="success" meta="2m left"></uik-shell-status-bar>`,
  }),
};

const resolveComponentPreview = (component) => {
  if (!component?.tagName) return null;
  const template = componentPreviewTemplates[component.tagName];
  const result = template
    ? typeof template === "function"
      ? template(component)
      : template
    : null;
  const previewHtml = result?.previewHtml ?? result?.html ?? "";
  const snippetHtml = result?.snippetHtml ?? previewHtml;
  if (previewHtml) {
    return {
      layout: result?.layout ?? "center",
      size: result?.size ?? "md",
      previewHtml,
      snippetHtml,
    };
  }
  const fallbackBody = component.summary
    ? escapeHtml(component.summary)
    : "Example";
  const fallbackHtml = `<${component.tagName}>${fallbackBody}</${component.tagName}>`;
  return {
    layout: "center",
    size: "md",
    previewHtml: fallbackHtml,
    snippetHtml: fallbackHtml,
  };
};

const buildComponentPageId = (component) =>
  component?.tagName ? `components/${component.tagName}` : "components";
const buildComponentPageHref = (component) =>
  `/docs/${buildComponentPageId(component)}`;

const renderComponentPortfolio = (components) => {
  const renderPreview = (component) => resolveComponentPreview(component);

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
${preview.previewHtml}
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
  const formatApiItem = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    const name = String(item.name ?? "").trim();
    if (!name) return "";
    const details = [];
    if (item.type) details.push(String(item.type).trim());
    if (item.default) details.push(`default: ${item.default}`);
    if (item.description) details.push(String(item.description).trim());
    return details.length ? `${name} (${details.join("; ")})` : name;
  };
  const buildList = (items) => {
    if (!items.length) {
      return '<uik-text as="p" class="docs-paragraph">None.</uik-text>';
    }
    const listItems = items
      .map(formatApiItem)
      .filter(Boolean)
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
        )}" data-component-tag="${escapeHtml(component.tagName ?? "")}">
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
            ${buildRow("Attributes", component.attributes ?? [])}
            ${buildRow("Properties", component.properties ?? [])}
            ${buildRow("Slots", component.slots ?? [])}
            ${buildRow("Parts", component.cssParts ?? [])}
            ${buildRow("Events", component.events ?? [])}
            ${buildRow("A11y", component.a11y ?? [])}
            ${buildRow("Tokens", component.cssCustomProperties ?? [])}
            ${notesRow}
          </uik-description-list>
        </article>
      `;
    })
    .map(stripBlankLines)
    .join("\n");
};

const componentPackageDescriptions = new Map([
  [
    "ui-primitives",
    "Foundational components for layout, typography, forms, and feedback.",
  ],
  [
    "ui-patterns",
    "Composed patterns that bundle primitives into common UI blocks.",
  ],
  [
    "ui-shell",
    "Shell layout primitives that structure application chrome and panels.",
  ],
]);
const componentPackageOrder = ["ui-primitives", "ui-patterns", "ui-shell"];
const sortPackagesByOrder = (packages = []) => {
  const order = new Map(componentPackageOrder.map((id, index) => [id, index]));
  return [...packages].sort((a, b) => {
    const rankA = order.get(a.id) ?? Number.POSITIVE_INFINITY;
    const rankB = order.get(b.id) ?? Number.POSITIVE_INFINITY;
    if (rankA !== rankB) return rankA - rankB;
    return String(a.id ?? "").localeCompare(String(b.id ?? ""));
  });
};

const renderComponentIndexCard = (component) => {
  const preview = resolveComponentPreview(component);
  if (!preview) return "";
  const summary = component.summary ? escapeHtml(component.summary) : "";
  const displayName = component.tagName
    ? `<${component.tagName}>`
    : component.name;
  const layout = preview.layout ?? "center";
  const size = preview.size ?? "md";
  return stripBlankLines(`
<article class="docs-card docs-portfolio-card" data-component-tag="${escapeHtml(
    component.tagName ?? "",
  )}" data-component-package="${escapeHtml(component.packageId ?? "")}">
<div class="docs-portfolio-preview" data-preview-layout="${layout}" data-preview-size="${size}">
${preview.previewHtml}
</div>
<div class="docs-portfolio-meta">
<uik-heading level="3"><code>${escapeHtml(displayName)}</code></uik-heading>
${summary ? `<uik-text as="p" class="docs-paragraph">${summary}</uik-text>` : ""}
<uik-link href="${buildComponentPageHref(component)}" class="docs-portfolio-link">View details</uik-link>
</div>
</article>`);
};

const renderComponentIndexGroup = (packageMeta, components) => {
  const cards = components.map(renderComponentIndexCard).filter(Boolean);
  if (!cards.length) return "";
  const description = componentPackageDescriptions.get(packageMeta.id) ?? "";
  const countLabel = `${components.length} component${
    components.length === 1 ? "" : "s"
  }`;
  return stripBlankLines(`
<section class="docs-portfolio-group" data-portfolio-group="${escapeHtml(
    packageMeta.id ?? "",
  )}">
<header class="docs-portfolio-group-header">
  <div class="docs-portfolio-group-title">
    <uik-heading level="3">${escapeHtml(
      packageMeta.name ?? packageMeta.id ?? "Components",
    )}</uik-heading>
    ${
      description
        ? `<uik-text as="p" class="docs-paragraph">${escapeHtml(
            description,
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
};

const renderComponentsIndex = (packages) => {
  const sections = sortPackagesByOrder(packages)
    .map((pkg) => {
      const components = buildComponentsFromApi(pkg.components ?? [], pkg);
      return renderComponentIndexGroup(pkg, components);
    })
    .filter(Boolean);
  if (!sections.length) return "";
  return `<div class="docs-portfolio">${sections.join("\n")}</div>`;
};

const buildComponentUsageMarkup = (component, packageMeta) => {
  const preview = resolveComponentPreview(component);
  const markupSource =
    preview?.snippetHtml ??
    preview?.previewHtml ??
    (component.tagName ? `<${component.tagName}></${component.tagName}>` : "");
  const markup = stripBlankLines(markupSource).trim();
  const importPath = packageMeta?.id
    ? `@ismail-elkorchi/${packageMeta.id}/register`
    : "@ismail-elkorchi/ui-primitives/register";
  return stripBlankLines(`
<script type="module">
  import "${importPath}";
</script>

${markup}
  `);
};

const buildComponentDetailPage = (component, packageMeta, highlighter) => {
  const preview = resolveComponentPreview(component);
  const overview =
    component.summary?.trim() ||
    `Reference for ${component.tagName ?? component.name ?? "component"}.`;
  const usageMarkup = buildComponentUsageMarkup(component, packageMeta);
  const exampleMarkup = preview
    ? buildExampleMarkup({
        previewHtml: preview.previewHtml,
        code: usageMarkup,
        language: "html",
        highlighter,
      })
    : "";
  const apiMarkup = stripBlankLines(
    `<div class="docs-components" data-component-api="${escapeHtml(
      component.tagName ?? "",
    )}">
${renderComponentCards([component])}
</div>`,
  );

  const rawSections = [
    { title: "Overview", bodyMarkdown: overview },
    ...(exampleMarkup ? [{ title: "Usage", bodyMarkdown: exampleMarkup }] : []),
    { title: "API", bodyMarkdown: apiMarkup },
  ];

  const { sections, toc } = buildSectionsAndTocFromRawSections(
    rawSections,
    highlighter,
  );

  return {
    id: buildComponentPageId(component),
    title: component.name ?? component.tagName ?? "Component",
    summary: component.summary ?? "",
    navLabel: component.name ?? component.tagName ?? undefined,
    group: packageMeta?.name ?? "Components",
    kind: "Component",
    package: packageMeta?.id ?? undefined,
    type: "component",
    visibility: "public",
    navHidden: true,
    sections,
    toc,
  };
};

const buildComponentDetailPages = (apiPackages, highlighter) => {
  const pages = [];
  for (const pkg of sortPackagesByOrder(apiPackages)) {
    const components = buildComponentsFromApi(pkg.components ?? [], pkg);
    for (const component of components) {
      pages.push(buildComponentDetailPage(component, pkg, highlighter));
    }
  }
  return pages;
};

const buildComponentsIndexPage = async (entry, apiPackages, highlighter) => {
  const intro = entry.summary?.trim() || "Browse UIK components by package.";
  const indexMarkup = renderComponentsIndex(apiPackages ?? []);
  const rawSections = [
    { title: "Overview", bodyMarkdown: intro },
    ...(indexMarkup
      ? [{ title: "Components", bodyMarkdown: indexMarkup }]
      : []),
  ];
  const { sections, toc } = buildSectionsAndTocFromRawSections(
    rawSections,
    highlighter,
  );
  return {
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    navLabel: entry.navLabel ?? entry.title,
    group: entry.group ?? undefined,
    kind: entry.kind ?? undefined,
    package: entry.package ?? undefined,
    type: entry.type ?? "components-index",
    visibility: normalizeVisibility(entry.visibility),
    sections,
    toc,
  };
};

const buildComponentsPage = async (entry, apiLookup, highlighter) => {
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

  const apiPackage = apiLookup?.get(entry.package ?? "");
  const components = buildComponentsFromApi(
    apiPackage?.components ?? [],
    apiPackage,
  );

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

  const { sections, toc } = buildSectionsAndTocFromRawSections(
    nextSections,
    highlighter,
  );

  return {
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    navLabel: entry.navLabel ?? entry.title,
    group: entry.group ?? undefined,
    kind: entry.kind ?? undefined,
    package: entry.package ?? undefined,
    type: entry.type ?? "components",
    visibility: normalizeVisibility(entry.visibility),
    sections,
    toc,
  };
};

const buildMarkdownPage = async (entry, highlighter) => {
  const markdown = await readRepoFile(entry.source);
  const { sections, toc } = buildMarkdownPageSections(
    markdown,
    "Overview",
    highlighter,
  );
  return {
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    navLabel: entry.navLabel ?? entry.title,
    group: entry.group ?? undefined,
    kind: entry.kind ?? undefined,
    package: entry.package ?? undefined,
    type: entry.type ?? "markdown",
    visibility: normalizeVisibility(entry.visibility),
    sections,
    toc,
  };
};

const buildPages = async (entries, apiLookup, apiPackages, highlighter) => {
  const pages = [];
  for (const entry of entries) {
    if (entry.type === "components") {
      pages.push(await buildComponentsPage(entry, apiLookup, highlighter));
    } else if (entry.type === "components-index") {
      pages.push(
        await buildComponentsIndexPage(entry, apiPackages, highlighter),
      );
    } else {
      pages.push(await buildMarkdownPage(entry, highlighter));
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
  visibility: page.visibility ?? "public",
  navHidden: page.navHidden ?? undefined,
  toc: page.toc ?? [],
});

const writePageContent = async (kind, page) => {
  const output = { sections: page.sections ?? [] };
  const outputDir = path.join(pagesOutputDir, kind);
  const payload = await formatJson(output);
  const outputPath = path.join(outputDir, `${page.id}.json`);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, payload);
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

const validateApiModel = async (apiModel) => {
  const schema = JSON.parse(await fs.readFile(apiSchemaPath, "utf8"));
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  const valid = ajv.validate(schema, apiModel);
  if (!valid) {
    const details = ajv.errorsText(ajv.errors, { separator: "\n" });
    throw new Error(`Docs API schema validation failed:\n${details}`);
  }
};

const validateManifest = async (manifest) => {
  const schema = JSON.parse(await fs.readFile(manifestSchemaPath, "utf8"));
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  const valid = ajv.validate(schema, manifest);
  if (!valid) {
    const details = ajv.errorsText(ajv.errors, { separator: "\n" });
    throw new Error(`Docs manifest schema validation failed:\n${details}`);
  }
};

const writeOrCheck = async (filePath, content, check, mismatches) => {
  if (!check) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content);
    return;
  }
  try {
    const current = await fs.readFile(filePath, "utf8");
    if (current !== content) {
      mismatches.push(filePath);
    }
  } catch {
    mismatches.push(filePath);
  }
};

const run = async () => {
  const args = new Set(process.argv.slice(2));
  const check = args.has("--check");
  const apiOnly = args.has("--api");
  const mismatches = [];

  const apiModel = await buildDocsApiModel();
  await validateApiModel(apiModel);
  const apiPayload = await formatJson(apiModel);
  await writeOrCheck(apiOutputPath, apiPayload, check, mismatches);

  if (apiOnly) {
    if (mismatches.length) {
      throw new Error(`Docs API output out of date:\n${mismatches.join("\n")}`);
    }
    return;
  }

  const highlighter = await createHighlighter();
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  await validateManifest(manifest);
  const apiPackages = apiModel.packages ?? [];
  const apiLookup = new Map(apiPackages.map((pkg) => [pkg.id, pkg]));
  const docsPages = await buildPages(
    manifest.docs ?? [],
    apiLookup,
    apiPackages,
    highlighter,
  );
  const labPages = await buildPages(
    manifest.lab ?? [],
    apiLookup,
    apiPackages,
    highlighter,
  );
  const componentDetailPages = buildComponentDetailPages(
    apiPackages,
    highlighter,
  );
  const componentPageMeta = componentDetailPages.map(toPageMeta);
  const componentPageIds = componentPageMeta.map((page) => page.id);
  const output = {
    docsPages: docsPages.map(toPageMeta),
    labPages: labPages.map(toPageMeta),
    componentPageIds,
  };
  const componentOutput = {
    componentPages: componentPageMeta,
  };
  const isPublicPage = (page) => page.visibility !== "internal";
  const docsPagesForSearch = [...docsPages, ...componentDetailPages];
  const searchIndex = buildSearchIndex(
    docsPagesForSearch.filter(isPublicPage),
    labPages.filter(isPublicPage),
  );

  const manifestPayload = await formatJson(output);
  const componentsPayload = await formatJson(componentOutput);
  const searchPayload = await formatJson(searchIndex);

  await writeOrCheck(manifestOutputPath, manifestPayload, check, mismatches);
  await writeOrCheck(
    componentsManifestPath,
    componentsPayload,
    check,
    mismatches,
  );
  if (!check) {
    await Promise.all([
      ...docsPages.map((page) => writePageContent("docs", page)),
      ...componentDetailPages.map((page) => writePageContent("docs", page)),
      ...labPages.map((page) => writePageContent("lab", page)),
    ]);
  } else {
    for (const page of docsPages) {
      const outputPath = path.join(pagesOutputDir, "docs", `${page.id}.json`);
      const payload = await formatJson({ sections: page.sections ?? [] });
      await writeOrCheck(outputPath, payload, true, mismatches);
    }
    for (const page of componentDetailPages) {
      const outputPath = path.join(pagesOutputDir, "docs", `${page.id}.json`);
      const payload = await formatJson({ sections: page.sections ?? [] });
      await writeOrCheck(outputPath, payload, true, mismatches);
    }
    for (const page of labPages) {
      const outputPath = path.join(pagesOutputDir, "lab", `${page.id}.json`);
      const payload = await formatJson({ sections: page.sections ?? [] });
      await writeOrCheck(outputPath, payload, true, mismatches);
    }
  }
  await writeOrCheck(searchIndexPath, searchPayload, check, mismatches);

  if (check && mismatches.length) {
    throw new Error(
      `Docs generated output out of date:\n${mismatches.join("\n")}`,
    );
  }
};

await run();
