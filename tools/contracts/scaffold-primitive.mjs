import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../..");

const parseArgs = (args) => {
  const options = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = args[i + 1];
    if (next && !next.startsWith("--")) {
      options[key] = next;
      i += 1;
    } else {
      options[key] = true;
    }
  }
  return options;
};

const toPascalCase = (value) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");

const toCamelCase = (value) => {
  const parts = value.split(/[-_\s]+/).filter(Boolean);
  if (parts.length === 0) return "";
  return [
    parts[0].toLowerCase(),
    ...parts.slice(1).map((part) => part[0].toUpperCase() + part.slice(1)),
  ].join("");
};

const toTitle = (value) =>
  value
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");

const ensureDir = async (filePath) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
};

const writeFileIfMissing = async (filePath, contents) => {
  try {
    await fs.access(filePath);
    throw new Error(`File already exists: ${filePath}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await ensureDir(filePath);
  await fs.writeFile(filePath, contents);
};

const appendLineIfMissing = async (filePath, line, match = line) => {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const hasMatch =
      match instanceof RegExp ? match.test(content) : content.includes(match);
    if (hasMatch) return;
    const next = content.endsWith("\n") ? content : `${content}\n`;
    await fs.writeFile(filePath, `${next}${line}\n`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await ensureDir(filePath);
    await fs.writeFile(filePath, `${line}\n`);
  }
};

const updateExports = async (
  packageJsonPath,
  key,
  value,
  { allowMissing = false } = {},
) => {
  let pkg;
  try {
    pkg = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT" || !allowMissing) throw error;
    pkg = { name: "uik-scaffold-fixture", exports: {} };
  }
  pkg.exports = pkg.exports ?? {};
  if (!pkg.exports[key]) {
    pkg.exports[key] = value;
  }
  await fs.writeFile(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`);
};

const ensureResolver = async (resolverPath) => {
  try {
    const content = await fs.readFile(resolverPath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const resolver = {
      name: "UIK Tokens",
      version: "0.0",
      resolutionOrder: [{ $ref: "#/sets/base" }],
      sets: { base: { sources: [] } },
      modifiers: {},
    };
    await ensureDir(resolverPath);
    await fs.writeFile(resolverPath, `${JSON.stringify(resolver, null, 2)}\n`);
    return resolver;
  }
};

const updateResolverSources = async (resolverPath, componentRef) => {
  const resolver = await ensureResolver(resolverPath);
  resolver.sets = resolver.sets ?? {};
  resolver.sets.base = resolver.sets.base ?? {};
  resolver.sets.base.sources = resolver.sets.base.sources ?? [];
  const sources = resolver.sets.base.sources;
  const existing = sources.some((entry) => entry?.$ref === componentRef);
  if (!existing) {
    let insertIndex = sources.length;
    for (let i = sources.length - 1; i >= 0; i -= 1) {
      const ref = sources[i]?.$ref;
      if (typeof ref === "string" && ref.startsWith("components/")) {
        insertIndex = i + 1;
        break;
      }
    }
    sources.splice(insertIndex, 0, { $ref: componentRef });
    await fs.writeFile(resolverPath, `${JSON.stringify(resolver, null, 2)}\n`);
  }
};

const run = async () => {
  const options = parseArgs(process.argv.slice(2));
  const rawTag = options.tag ?? options.name;
  if (!rawTag) {
    throw new Error(
      "Usage: node tools/contracts/scaffold-primitive.mjs --tag uik-foo [--class UikFoo] [--out-dir /tmp/out] [--layer atomic|composed] [--group content|control|layout|feedback|overlay|collection]",
    );
  }

  const tagName = rawTag.startsWith("uik-") ? rawTag : `uik-${rawTag}`;
  const tagPattern = /^uik-[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!tagPattern.test(tagName)) {
    throw new Error(
      `Tag "${tagName}" must be lowercase kebab-case (example: uik-foo-bar).`,
    );
  }
  const kebabId = tagName.replace(/^uik-/, "");
  const tokenNamespace = toCamelCase(kebabId);
  const className = options.class ?? `Uik${toPascalCase(kebabId)}`;
  const layer = options.layer ?? "atomic";
  const group = options.group ?? "content";
  const summary = options.summary ?? `Token-driven ${kebabId} primitive.`;
  const outDir = options["out-dir"] ?? options.outDir ?? null;
  const rootDir = outDir ? path.resolve(outDir) : repoRoot;
  const allowMissing = Boolean(outDir);

  const componentDir = path.join(
    rootDir,
    "packages/ui-primitives/src",
    layer,
    group,
    tagName,
  );
  const elementPath = path.join(componentDir, "element.ts");
  const stylesPath = path.join(componentDir, "styles.ts");
  const indexPath = path.join(componentDir, "index.ts");

  await fs.mkdir(componentDir, { recursive: true });

  const elementSource = [
    "import {LitElement, html} from 'lit';",
    "import {customElement} from 'lit/decorators.js';",
    "",
    "import {styles} from './styles';",
    "",
    "/**",
    ` * ${summary}`,
    " * @slot default",
    " * @part base",
    ` * @cssprop --uik-component-${kebabId}-bg`,
    ` * @cssprop --uik-component-${kebabId}-fg`,
    ` * @cssprop --uik-component-${kebabId}-border`,
    ` * @cssprop --uik-component-${kebabId}-border-width`,
    ` * @cssprop --uik-component-${kebabId}-radius`,
    ` * @cssprop --uik-component-${kebabId}-padding`,
    " */",
    `@customElement('${tagName}')`,
    `export class ${className} extends LitElement {`,
    "  static override styles = styles;",
    "",
    "  override render() {",
    '    return html`<div class="base" part="base"><slot></slot></div>`;',
    "  }",
    "}",
    "",
  ].join("\n");

  await writeFileIfMissing(elementPath, elementSource);

  const stylesSource = [
    "import {css} from 'lit';",
    "",
    "export const styles = css`",
    "  :host {",
    "    display: block;",
    "  }",
    "",
    "  .base {",
    `    padding: var(--uik-component-${kebabId}-padding);`,
    `    color: oklch(var(--uik-component-${kebabId}-fg));`,
    `    background-color: oklch(var(--uik-component-${kebabId}-bg));`,
    `    border-radius: var(--uik-component-${kebabId}-radius);`,
    `    border: var(--uik-component-${kebabId}-border-width) solid oklch(var(--uik-component-${kebabId}-border));`,
    "  }",
    "`;",
    "",
  ].join("\n");

  await writeFileIfMissing(stylesPath, stylesSource);

  await writeFileIfMissing(
    indexPath,
    `export {${className}} from './element';\n`,
  );

  const primitivesIndex = path.join(rootDir, "packages/ui-primitives/index.ts");
  const primitivesRegister = path.join(
    rootDir,
    "packages/ui-primitives/register.ts",
  );

  await appendLineIfMissing(
    primitivesIndex,
    `export {${className}} from './src/${layer}/${group}/${tagName}';`,
  );
  await appendLineIfMissing(
    primitivesRegister,
    `import './src/${layer}/${group}/${tagName}';`,
  );

  const exportsEntry = {
    types: `./dist/src/${layer}/${group}/${tagName}/index.d.ts`,
    import: `./dist/src/${layer}/${group}/${tagName}/index.js`,
    default: `./dist/src/${layer}/${group}/${tagName}/index.js`,
  };
  await updateExports(
    path.join(rootDir, "packages/ui-primitives/package.json"),
    `./${tagName}`,
    exportsEntry,
    { allowMissing },
  );

  const storyPath = path.join(
    rootDir,
    "packages/ui-primitives/stories",
    `${tagName}.stories.ts`,
  );
  const storyTitle = toTitle(kebabId);
  const storySource = [
    "import '@ismail-elkorchi/ui-primitives/register';",
    "import type {Meta, StoryObj} from '@storybook/web-components-vite';",
    "import {html} from 'lit';",
    "",
    "import {runA11y} from '../../../.storybook/a11y';",
    "",
    `type ${className}Args = Record<string, never>;`,
    "",
    `const meta: Meta<${className}Args> = {`,
    `  title: 'Primitives/${storyTitle}',`,
    `  component: '${tagName}',`,
    "  tags: ['autodocs'],",
    `  render: () => html\`<${tagName}>${storyTitle}</${tagName}>\`,`,
    "};",
    "",
    "export default meta;",
    "",
    `export const Default: StoryObj<${className}Args> = {`,
    "  play: async ({canvasElement}: {canvasElement: HTMLElement}) => runA11y(canvasElement),",
    "};",
    "",
  ].join("\n");

  await writeFileIfMissing(storyPath, storySource);

  const testPath = path.join(
    rootDir,
    "packages/ui-primitives/tests",
    `${tagName}.browser.test.ts`,
  );
  await writeFileIfMissing(
    testPath,
    `import {describe, expect, it} from 'vitest';\n\nimport '@ismail-elkorchi/ui-primitives/register';\n\nconst nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));\n\ndescribe('${tagName}', () => {\n  it('renders', async () => {\n    document.body.innerHTML = '<${tagName}>${storyTitle}</${tagName}>';\n    await customElements.whenDefined('${tagName}');\n    await nextFrame();\n    const element = document.querySelector('${tagName}');\n    expect(element).toBeTruthy();\n  });\n});\n`,
  );

  const tokensPath = path.join(
    rootDir,
    "packages/ui-tokens/tokens/components",
    `${kebabId}.json`,
  );
  await writeFileIfMissing(
    tokensPath,
    `{
  "component": {
    "${tokenNamespace}": {
      "bg": {
        "$value": "{surface.bg}",
        "$type": "color",
        "$description": "Component ${kebabId} background."
      },
      "fg": {
        "$value": "{text.default}",
        "$type": "color",
        "$description": "Component ${kebabId} foreground."
      },
      "border": {
        "$value": "{border.muted}",
        "$type": "color",
        "$description": "Component ${kebabId} border."
      },
      "borderWidth": {
        "$value": "{border.width.1}",
        "$type": "dimension",
        "$description": "Component ${kebabId} border width."
      },
      "radius": {
        "$value": "{radius.3}",
        "$type": "dimension",
        "$description": "Component ${kebabId} radius."
      },
      "padding": {
        "$value": "{space.4}",
        "$type": "dimension",
        "$description": "Component ${kebabId} padding."
      }
    }
  }
}
`,
  );

  const resolverPath = path.join(
    rootDir,
    "packages/ui-tokens/tokens/uik.resolver.json",
  );
  await updateResolverSources(resolverPath, `components/${kebabId}.json`);

  console.log(
    `Scaffolded ${tagName} in ${path.relative(rootDir, componentDir)}.`,
  );
};

await run();
