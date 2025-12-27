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
  const content = await fs.readFile(filePath, "utf8");
  const hasMatch =
    match instanceof RegExp ? match.test(content) : content.includes(match);
  if (hasMatch) return;
  const next = content.endsWith("\n") ? content : `${content}\n`;
  await fs.writeFile(filePath, `${next}${line}\n`);
};

const updateExports = async (packageJsonPath, key, value) => {
  const pkg = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  pkg.exports = pkg.exports ?? {};
  if (!pkg.exports[key]) {
    pkg.exports[key] = value;
  }
  await fs.writeFile(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`);
};

const run = async () => {
  const options = parseArgs(process.argv.slice(2));
  const rawTag = options.tag ?? options.name;
  if (!rawTag) {
    throw new Error(
      "Usage: node tools/contracts/scaffold-primitive.mjs --tag uik-foo [--layer atomic|composed] [--group content|control|layout|feedback|overlay|collection]",
    );
  }

  const tagName = rawTag.startsWith("uik-") ? rawTag : `uik-${rawTag}`;
  const id = tagName.replace(/^uik-/, "");
  const className = `Uik${toPascalCase(id)}`;
  const layer = options.layer ?? "atomic";
  const group = options.group ?? "content";
  const summary = options.summary ?? `Token-driven ${id} primitive.`;

  const componentDir = path.join(
    repoRoot,
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
    ` * @cssprop --uik-component-${id}-bg`,
    ` * @cssprop --uik-component-${id}-fg`,
    ` * @cssprop --uik-component-${id}-border`,
    ` * @cssprop --uik-component-${id}-radius`,
    ` * @cssprop --uik-component-${id}-padding`,
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
    `    padding: var(--uik-component-${id}-padding);`,
    `    color: oklch(var(--uik-component-${id}-fg));`,
    `    background-color: oklch(var(--uik-component-${id}-bg));`,
    `    border-radius: var(--uik-component-${id}-radius);`,
    `    border: var(--uik-border-width-1) solid oklch(var(--uik-component-${id}-border));`,
    "  }",
    "`;",
    "",
  ].join("\n");

  await writeFileIfMissing(stylesPath, stylesSource);

  await writeFileIfMissing(
    indexPath,
    `export {${className}} from './element';\n`,
  );

  const primitivesIndex = path.join(
    repoRoot,
    "packages/ui-primitives/index.ts",
  );
  const primitivesRegister = path.join(
    repoRoot,
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
    path.join(repoRoot, "packages/ui-primitives/package.json"),
    `./${tagName}`,
    exportsEntry,
  );

  const storyPath = path.join(
    repoRoot,
    "packages/ui-primitives/stories",
    `${tagName}.stories.ts`,
  );
  const storyTitle = toTitle(id);
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
    repoRoot,
    "packages/ui-primitives/tests",
    `${tagName}.browser.test.ts`,
  );
  await writeFileIfMissing(
    testPath,
    `import {describe, expect, it} from 'vitest';\n\nimport '@ismail-elkorchi/ui-primitives/register';\n\nconst nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));\n\ndescribe('${tagName}', () => {\n  it('renders', async () => {\n    document.body.innerHTML = '<${tagName}>${storyTitle}</${tagName}>';\n    await customElements.whenDefined('${tagName}');\n    await nextFrame();\n    const element = document.querySelector('${tagName}');\n    expect(element).toBeTruthy();\n  });\n});\n`,
  );

  const tokensPath = path.join(
    repoRoot,
    "packages/ui-tokens/tokens/components",
    `${id}.json`,
  );
  await writeFileIfMissing(
    tokensPath,
    `{
  "component": {
    "${id}": {
      "bg": {
        "$value": "{surface.bg}",
        "$type": "color",
        "$description": "Component ${id} background."
      },
      "fg": {
        "$value": "{text.default}",
        "$type": "color",
        "$description": "Component ${id} foreground."
      },
      "border": {
        "$value": "{border.muted}",
        "$type": "color",
        "$description": "Component ${id} border."
      },
      "radius": {
        "$value": "{radius.3}",
        "$type": "dimension",
        "$description": "Component ${id} radius."
      },
      "padding": {
        "$value": "{space.4}",
        "$type": "dimension",
        "$description": "Component ${id} padding."
      }
    }
  }
}
`,
  );

  console.log(
    `Scaffolded ${tagName} in ${path.relative(repoRoot, componentDir)}.`,
  );
};

await run();
