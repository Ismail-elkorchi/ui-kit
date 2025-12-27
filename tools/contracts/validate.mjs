import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Ajv from "ajv";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../..");
const buildHint = "npm run contracts:validate:build";

const paths = {
  tokensCss: path.join(repoRoot, "packages/ui-tokens/dist/base.css"),
  primitives: {
    contracts: path.join(
      repoRoot,
      "packages/ui-primitives/contracts/components.json",
    ),
    cem: path.join(
      repoRoot,
      "packages/ui-primitives/dist/custom-elements.json",
    ),
    storiesDir: path.join(repoRoot, "packages/ui-primitives/stories"),
    register: path.join(repoRoot, "packages/ui-primitives/register.ts"),
    index: path.join(repoRoot, "packages/ui-primitives/index.ts"),
    packageJson: path.join(repoRoot, "packages/ui-primitives/package.json"),
  },
  shell: {
    contracts: path.join(repoRoot, "packages/ui-shell/contracts/entries.json"),
    cem: path.join(repoRoot, "packages/ui-shell/dist/custom-elements.json"),
    register: path.join(repoRoot, "packages/ui-shell/register.ts"),
    index: path.join(repoRoot, "packages/ui-shell/index.ts"),
  },
};

const schemaPaths = {
  primitives: path.join(
    repoRoot,
    "tools/contracts/schemas/contracts-components.schema.json",
  ),
  shell: path.join(
    repoRoot,
    "tools/contracts/schemas/contracts-entries.schema.json",
  ),
};

const ajv = new Ajv({ allErrors: true, strict: false });

const readJson = async (filePath) =>
  JSON.parse(await fs.readFile(filePath, "utf8"));
const readText = async (filePath) => fs.readFile(filePath, "utf8");

const reportMissingArtifacts = (missing) => {
  console.error("Contract validation requires build artifacts.");
  console.error("Missing:");
  for (const item of missing) {
    console.error(`- ${item.label} (${path.relative(repoRoot, item.path)})`);
  }
  console.error(
    `Run \`${buildHint}\` to build required artifacts, then retry.`,
  );
};

const ensureArtifacts = async (artifacts) => {
  const missing = [];
  for (const artifact of artifacts) {
    try {
      await fs.access(artifact.path);
    } catch {
      missing.push(artifact);
    }
  }
  if (missing.length) {
    reportMissingArtifacts(missing);
    process.exitCode = 1;
    return false;
  }
  return true;
};

const loadSchemaValidator = async (schemaPath) => {
  const schema = await readJson(schemaPath);
  return ajv.compile(schema);
};

const formatSchemaErrors = (errors) =>
  (errors ?? []).map((error) => {
    const pointer = error.instancePath
      ? `at ${error.instancePath}`
      : "at (root)";
    const message = error.message ?? "is invalid";
    return `${pointer} ${message}`;
  });

const stripDescription = (value) => value.split(" (")[0].trim();

const expandBracePattern = (value) => {
  const match = value.match(/\{([^}]+)\}/);
  if (!match) return [value];
  const [token, inner] = match;
  const rangeMatch = inner.match(/^(\d+)\.\.(\d+)$/);
  const options = rangeMatch
    ? Array.from(
        { length: Number(rangeMatch[2]) - Number(rangeMatch[1]) + 1 },
        (_, i) => String(Number(rangeMatch[1]) + i),
      )
    : inner.split("|");
  return options.flatMap((option) =>
    expandBracePattern(value.replace(token, option)),
  );
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const matchTokenPattern = (pattern, tokenSet) => {
  const cleaned = stripDescription(pattern);
  const expansions = expandBracePattern(cleaned);
  const tokens = [...tokenSet];

  for (const expanded of expansions) {
    if (expanded.includes("*")) {
      const regex = new RegExp(
        `^${escapeRegExp(expanded).replace(/\\\*/g, ".*")}$`,
      );
      if (!tokens.some((token) => regex.test(token))) {
        return { ok: false, pattern: expanded };
      }
    } else if (!tokenSet.has(expanded)) {
      return { ok: false, pattern: expanded };
    }
  }

  return { ok: true };
};

const isStringArray = (value) =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const loadTokenSet = async () => {
  const css = await readText(paths.tokensCss);
  const matches = css.match(/--uik-[a-z0-9-]+(?=\s*:)/g) ?? [];
  return new Set(matches);
};

const loadCemTagNames = (cem) => {
  const tags = new Set();
  for (const module of cem.modules ?? []) {
    for (const declaration of module.declarations ?? []) {
      if (declaration?.tagName) {
        tags.add(declaration.tagName);
      }
    }
  }
  return tags;
};

const validateEntryArrays = (entry, errors) => {
  const fields = ["attributes", "slots", "parts", "events", "a11y", "cssVars"];
  for (const field of fields) {
    if (!isStringArray(entry[field])) {
      errors.push(
        `Contract ${entry.id}: ${field} must be an array of strings.`,
      );
    }
  }
};

const validateCssVars = (entry, tokenSet, errors, warnings) => {
  if (!tokenSet.size) return;
  for (const value of entry.cssVars ?? []) {
    const cleaned = stripDescription(value);
    if (!cleaned.startsWith("--uik-")) {
      warnings.push(
        `Contract ${entry.id}: cssVar '${value}' does not start with --uik-.`,
      );
      continue;
    }
    if (entry.kind !== "utility" && !cleaned.startsWith("--uik-component-")) {
      warnings.push(
        `Contract ${entry.id}: cssVar '${value}' is not a component token.`,
      );
    }
    const match = matchTokenPattern(cleaned, tokenSet);
    if (!match.ok) {
      errors.push(
        `Contract ${entry.id}: token '${match.pattern}' not found in base.css.`,
      );
    }
  }
};

const validateContracts = async ({
  name,
  contractsPath,
  cemPath,
  tokenSet,
  enforceStories,
  schemaValidator,
}) => {
  const errors = [];
  const warnings = [];
  const contracts = await readJson(contractsPath);
  if (schemaValidator) {
    const valid = schemaValidator(contracts);
    if (!valid) {
      for (const message of formatSchemaErrors(schemaValidator.errors)) {
        errors.push(`${name}: schema ${message}.`);
      }
    }
  }
  const cem = await readJson(cemPath);
  const cemTags = loadCemTagNames(cem);
  const entries = contracts.components ?? contracts.entries ?? [];
  const seenIds = new Set();
  const seenTags = new Set();

  if (!Array.isArray(entries) || entries.length === 0) {
    errors.push(`${name}: contracts are missing entries.`);
  }

  for (const entry of entries) {
    if (!entry.id) {
      errors.push(`${name}: contract entry missing id.`);
      continue;
    }
    if (seenIds.has(entry.id)) {
      errors.push(`${name}: duplicate contract id '${entry.id}'.`);
    }
    seenIds.add(entry.id);

    if (!entry.summary) {
      errors.push(`${name}: contract ${entry.id} missing summary.`);
    }

    const kind = entry.kind ?? "component";
    if (kind === "component") {
      if (!entry.tagName) {
        errors.push(`${name}: contract ${entry.id} missing tagName.`);
      } else {
        if (!cemTags.has(entry.tagName)) {
          errors.push(
            `${name}: ${entry.tagName} not found in custom-elements.json.`,
          );
        }
        const expectedId = entry.tagName.replace(/^uik-/, "");
        if (entry.id !== expectedId) {
          errors.push(
            `${name}: contract id '${entry.id}' does not match tagName '${entry.tagName}'.`,
          );
        }
        if (seenTags.has(entry.tagName)) {
          errors.push(`${name}: duplicate tagName '${entry.tagName}'.`);
        }
        seenTags.add(entry.tagName);
      }
    } else if (kind !== "utility") {
      errors.push(
        `${name}: contract ${entry.id} has unsupported kind '${kind}'.`,
      );
    }

    validateEntryArrays(entry, errors);
    validateCssVars(entry, tokenSet, errors, warnings);
  }

  for (const tagName of cemTags) {
    if (!seenTags.has(tagName)) {
      errors.push(`${name}: missing contract entry for ${tagName}.`);
    }
  }

  if (enforceStories) {
    for (const tagName of cemTags) {
      const storyPath = path.join(
        paths.primitives.storiesDir,
        `${tagName}.stories.ts`,
      );
      try {
        await fs.access(storyPath);
      } catch {
        errors.push(
          `${name}: missing story for ${tagName} at ${path.relative(repoRoot, storyPath)}.`,
        );
      }
    }
  }

  return { errors, warnings, cemTags };
};

const validateExports = async (tagNames, errors) => {
  const pkg = await readJson(paths.primitives.packageJson);
  const exportKeys = new Set(Object.keys(pkg.exports ?? {}));

  for (const tagName of tagNames) {
    const key = `./${tagName}`;
    if (!exportKeys.has(key)) {
      errors.push(
        `ui-primitives: missing package.json export for ${tagName} (${key}).`,
      );
    }
  }
};

const validateIndexAndRegister = async (
  tagNames,
  registerPath,
  indexPath,
  errors,
  label,
) => {
  const registerContents = await readText(registerPath);
  const indexContents = await readText(indexPath);

  for (const tagName of tagNames) {
    if (!registerContents.includes(tagName)) {
      errors.push(`${label}: register.ts missing import for ${tagName}.`);
    }
    if (!indexContents.includes(tagName)) {
      errors.push(`${label}: index.ts missing export for ${tagName}.`);
    }
  }
};

const run = async () => {
  const errors = [];
  const warnings = [];
  let primitivesSchemaValidator;
  let shellSchemaValidator;

  const artifactsOk = await ensureArtifacts([
    { label: "ui-tokens base.css", path: paths.tokensCss },
    { label: "ui-primitives custom-elements.json", path: paths.primitives.cem },
    { label: "ui-shell custom-elements.json", path: paths.shell.cem },
  ]);
  if (!artifactsOk) return;

  let tokenSet;
  try {
    tokenSet = await loadTokenSet();
  } catch {
    errors.push(
      `tokens: unable to read base.css (${paths.tokensCss}). Run ui-tokens build first.`,
    );
    tokenSet = new Set();
  }

  try {
    primitivesSchemaValidator = await loadSchemaValidator(
      schemaPaths.primitives,
    );
  } catch {
    errors.push(
      `schema: unable to read primitives schema (${path.relative(repoRoot, schemaPaths.primitives)}).`,
    );
  }

  try {
    shellSchemaValidator = await loadSchemaValidator(schemaPaths.shell);
  } catch {
    errors.push(
      `schema: unable to read shell schema (${path.relative(repoRoot, schemaPaths.shell)}).`,
    );
  }

  const primitives = await validateContracts({
    name: "ui-primitives",
    contractsPath: paths.primitives.contracts,
    cemPath: paths.primitives.cem,
    tokenSet,
    enforceStories: true,
    schemaValidator: primitivesSchemaValidator,
  });
  errors.push(...primitives.errors);
  warnings.push(...primitives.warnings);

  if (primitives.cemTags) {
    await validateExports(primitives.cemTags, errors);
    await validateIndexAndRegister(
      primitives.cemTags,
      paths.primitives.register,
      paths.primitives.index,
      errors,
      "ui-primitives",
    );
  }

  const shell = await validateContracts({
    name: "ui-shell",
    contractsPath: paths.shell.contracts,
    cemPath: paths.shell.cem,
    tokenSet,
    enforceStories: false,
    schemaValidator: shellSchemaValidator,
  });
  errors.push(...shell.errors);
  warnings.push(...shell.warnings);

  if (shell.cemTags) {
    await validateIndexAndRegister(
      shell.cemTags,
      paths.shell.register,
      paths.shell.index,
      errors,
      "ui-shell",
    );
  }

  if (warnings.length) {
    console.warn("Contract warnings:");
    for (const warning of warnings) {
      console.warn(`- ${warning}`);
    }
  }

  if (errors.length) {
    console.error("Contract validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Contract validation passed.");
};

await run();
