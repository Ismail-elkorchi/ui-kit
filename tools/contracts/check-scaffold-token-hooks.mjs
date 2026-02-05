import { promises as fs } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..");
const fixtureRoot = "/tmp/uik-scaffold-fixture";
const tagName = "uik-scaffold-fixture";
const kebabId = "scaffold-fixture";
const tokenNamespace = "scaffoldFixture";

const runScaffolder = () => {
  const result = spawnSync(
    "node",
    [
      path.join(repoRoot, "tools/contracts/scaffold-primitive.mjs"),
      "--tag",
      tagName,
      "--class",
      "UikScaffoldFixture",
      "--out-dir",
      fixtureRoot,
      "--layer",
      "atomic",
      "--group",
      "content",
    ],
    { cwd: repoRoot, stdio: "inherit" },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const readJson = async (filePath) =>
  JSON.parse(await fs.readFile(filePath, "utf8"));

const ensureFixture = async () => {
  await fs.rm(fixtureRoot, { recursive: true, force: true });
  await fs.mkdir(fixtureRoot, { recursive: true });
  runScaffolder();
};

const getComponentVars = (contents) => {
  const matches = contents.match(/--uik-component-[a-z0-9-]+/g) ?? [];
  return Array.from(new Set(matches));
};

const isKebabCase = (value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

const run = async () => {
  await ensureFixture();
  const errors = [];

  const tokensPath = path.join(
    fixtureRoot,
    "packages/ui-tokens/tokens/components",
    `${kebabId}.json`,
  );
  try {
    const tokens = await readJson(tokensPath);
    const component = tokens.component ?? {};
    if (!component[tokenNamespace]) {
      errors.push(
        `Token namespace must be component.${tokenNamespace} in ${tokensPath}.`,
      );
    }
    if (component[kebabId]) {
      errors.push(
        `Token namespace must not use kebab-case key "${kebabId}" in ${tokensPath}.`,
      );
    }
  } catch (error) {
    errors.push(`Missing or invalid tokens file: ${tokensPath}`);
  }

  if (!isKebabCase(kebabId)) {
    errors.push(`Component id must be kebab-case: ${kebabId}`);
  }

  const stylesPath = path.join(
    fixtureRoot,
    "packages/ui-primitives/src/atomic/content",
    tagName,
    "styles.ts",
  );
  try {
    const styles = await fs.readFile(stylesPath, "utf8");
    const vars = getComponentVars(styles);
    if (vars.length === 0) {
      errors.push(`No component CSS vars found in ${stylesPath}.`);
    }
    for (const varName of vars) {
      if (!varName.startsWith(`--uik-component-${kebabId}-`)) {
        errors.push(
          `Component var "${varName}" must start with --uik-component-${kebabId}-.`,
        );
      }
      if (!/^--uik-component-[a-z0-9-]+$/.test(varName)) {
        errors.push(`Component var "${varName}" must be kebab-case.`);
      }
    }
  } catch (error) {
    errors.push(`Missing scaffolded styles file: ${stylesPath}`);
  }

  const resolverPath = path.join(
    fixtureRoot,
    "packages/ui-tokens/tokens/uik.resolver.json",
  );
  try {
    const resolver = await readJson(resolverPath);
    const sources = resolver?.sets?.base?.sources ?? [];
    const ref = `components/${kebabId}.json`;
    const hasRef = sources.some((entry) => entry?.$ref === ref);
    if (!hasRef) {
      errors.push(
        `uik.resolver.json must include ${ref} in sets.base.sources.`,
      );
    }
  } catch (error) {
    errors.push(`Missing or invalid resolver file: ${resolverPath}`);
  }

  if (errors.length) {
    console.error("Scaffold token hook validation failed:");
    errors.forEach((message) => console.error(`- ${message}`));
    process.exit(1);
  }

  console.log("Scaffold token hook validation: ok");
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
