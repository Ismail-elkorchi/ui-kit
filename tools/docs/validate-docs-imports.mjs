import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..");
const docsContentRoot = path.join(repoRoot, "apps/docs/content");
const apiModelPath = path.join(docsContentRoot, "generated", "api.json");
const packagesRoot = path.join(repoRoot, "packages");

const specifierPattern = /@ismail-elkorchi\/[a-z0-9-]+(?:\/[a-z0-9-./]+)?/gi;

const collectMarkdownFiles = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const nextPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(nextPath)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(nextPath);
    }
  }
  return files;
};

const loadPackageExports = async () => {
  const entries = await fs.readdir(packagesRoot, { withFileTypes: true });
  const exportsByName = new Map();
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const packagePath = path.join(packagesRoot, entry.name, "package.json");
    try {
      const pkg = JSON.parse(await fs.readFile(packagePath, "utf8"));
      if (pkg?.name) {
        exportsByName.set(pkg.name, pkg.exports ?? {});
      }
    } catch {
      continue;
    }
  }
  return exportsByName;
};

const collectSpecifiers = async (files) => {
  const occurrences = [];
  for (const file of files) {
    const contents = await fs.readFile(file, "utf8");
    const matches = contents.match(specifierPattern) ?? [];
    for (const match of matches) {
      occurrences.push({ file, specifier: match });
    }
  }
  return occurrences;
};

const collectApiSpecifiers = async () => {
  const apiModel = JSON.parse(await fs.readFile(apiModelPath, "utf8"));
  const specifiers = new Set();
  for (const pkg of apiModel.packages ?? []) {
    if (!pkg?.id) continue;
    specifiers.add(`@ismail-elkorchi/${pkg.id}/register`);
  }
  return Array.from(specifiers);
};

const normalizeSpecifier = (specifier) => specifier.replace(/\s+/g, "");

const resolveExports = (exportsField) => {
  if (!exportsField) return null;
  if (typeof exportsField === "string") return exportsField;
  if (typeof exportsField === "object") return exportsField;
  return null;
};

const validateSpecifier = (specifier, exportsByName) => {
  const normalized = normalizeSpecifier(specifier);
  const parts = normalized.split("/");
  if (parts.length < 2) return { ok: false, reason: "Invalid scope format." };
  const packageName = `${parts[0]}/${parts[1]}`;
  const subpath = parts.slice(2).join("/");

  const exportsField = resolveExports(exportsByName.get(packageName));
  if (!exportsField) {
    return { ok: false, reason: `Unknown package ${packageName}.` };
  }

  if (!subpath) {
    if (typeof exportsField === "string") return { ok: true };
    if (exportsField["."] || exportsField["./index"]) return { ok: true };
    return { ok: false, reason: `Missing root export for ${packageName}.` };
  }

  if (typeof exportsField === "string") {
    return { ok: false, reason: `No subpath exports for ${packageName}.` };
  }

  const exportKey = `./${subpath}`;
  if (Object.prototype.hasOwnProperty.call(exportsField, exportKey)) {
    return { ok: true };
  }

  return {
    ok: false,
    reason: `Missing export ${exportKey} in ${packageName}.`,
  };
};

const run = async () => {
  const files = await collectMarkdownFiles(docsContentRoot);
  const exportsByName = await loadPackageExports();
  const occurrences = await collectSpecifiers(files);
  const apiSpecifiers = await collectApiSpecifiers();
  for (const specifier of apiSpecifiers) {
    occurrences.push({ file: apiModelPath, specifier });
  }
  const issues = [];

  for (const { file, specifier } of occurrences) {
    const result = validateSpecifier(specifier, exportsByName);
    if (!result.ok) {
      issues.push(
        `${path.relative(repoRoot, file)}: ${specifier} (${result.reason})`,
      );
    }
  }

  if (issues.length > 0) {
    throw new Error(
      `Docs import validation failed:\n${issues.sort().join("\n")}`,
    );
  }

  process.stdout.write("Docs import validation: ok\n");
};

await run();
