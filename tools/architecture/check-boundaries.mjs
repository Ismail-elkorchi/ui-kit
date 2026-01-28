import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packagesRoot = path.join(repoRoot, "packages");
const shellSrcRoot = path.join(packagesRoot, "ui-shell", "src");
const shellStructuresRoot = path.join(shellSrcRoot, "structures");

const readFile = (filePath) => fs.readFileSync(filePath, "utf8");
const fileExists = (filePath) => fs.existsSync(filePath);
const isFile = (filePath) =>
  fileExists(filePath) && fs.statSync(filePath).isFile();

const collectFiles = (dirPath, suffixes) => {
  if (!fileExists(dirPath)) return [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) return collectFiles(entryPath, suffixes);
    if (suffixes.some((suffix) => entry.name.endsWith(suffix)))
      return [entryPath];
    return [];
  });
};

const normalizePath = (filePath) => path.relative(repoRoot, filePath);

const ensureShellElementBoundaries = (issues) => {
  const files = collectFiles(shellSrcRoot, [".ts"]);
  const decoratorPattern = /@customElement\(\s*"([^"]+)"\s*\)/g;

  files.forEach((file) => {
    const contents = readFile(file);
    decoratorPattern.lastIndex = 0;
    let match = decoratorPattern.exec(contents);
    while (match) {
      const tag = match[1];
      if (!tag.startsWith("uik-shell-")) {
        issues.push(
          `ui-shell element tag must start with "uik-shell-": ${tag} in ${normalizePath(file)}`,
        );
      }
      if (!file.startsWith(shellStructuresRoot + path.sep)) {
        issues.push(
          `ui-shell custom element must live under src/structures: ${tag} in ${normalizePath(file)}`,
        );
      }
      match = decoratorPattern.exec(contents);
    }
  });
};

const readPackageJson = (pkgPath) => {
  const filePath = path.join(packagesRoot, pkgPath, "package.json");
  if (!isFile(filePath)) {
    throw new Error(`Missing package.json at ${normalizePath(filePath)}`);
  }
  return JSON.parse(readFile(filePath));
};

const collectInternalDeps = (pkgJson) => {
  const deps = {
    ...(pkgJson.dependencies ?? {}),
    ...(pkgJson.peerDependencies ?? {}),
    ...(pkgJson.optionalDependencies ?? {}),
    ...(pkgJson.devDependencies ?? {}),
  };
  return Object.keys(deps).filter((name) =>
    name.startsWith("@ismail-elkorchi/"),
  );
};

const ensureDependencyDag = (issues) => {
  const rules = {
    "ui-tokens": [],
    "ui-primitives": ["@ismail-elkorchi/ui-tokens"],
    "ui-patterns": [
      "@ismail-elkorchi/ui-primitives",
      "@ismail-elkorchi/ui-tokens",
    ],
    "ui-shell": ["@ismail-elkorchi/ui-primitives"],
    docs: [
      "@ismail-elkorchi/ui-tokens",
      "@ismail-elkorchi/ui-primitives",
      "@ismail-elkorchi/ui-patterns",
      "@ismail-elkorchi/ui-shell",
    ],
  };

  Object.entries(rules).forEach(([pkgName, allowed]) => {
    const pkgJson = readPackageJson(pkgName === "docs" ? "docs" : pkgName);
    const internalDeps = collectInternalDeps(pkgJson);
    internalDeps.forEach((dep) => {
      if (!allowed.includes(dep)) {
        issues.push(
          `Forbidden internal dependency: ${pkgJson.name} depends on ${dep}. Allowed: ${allowed.join(", ") || "(none)"}.`,
        );
      }
    });
  });
};

const ensureDocsImports = (issues) => {
  const docsRoot = path.join(packagesRoot, "docs");
  const files = collectFiles(docsRoot, [".ts", ".js", ".mjs"]);
  const internalImportPattern = /@ismail-elkorchi\/[^\s"']+\/src\//g;
  const relativeImportPattern = /from\s+["']\.\.\/\.\.\/[^"']+/g;

  files.forEach((file) => {
    const contents = readFile(file);
    if (internalImportPattern.test(contents)) {
      issues.push(
        `Docs must not import package internal src paths: ${normalizePath(file)}`,
      );
    }
    if (relativeImportPattern.test(contents)) {
      issues.push(
        `Docs must not use relative imports into other packages: ${normalizePath(file)}`,
      );
    }
  });
};

const main = () => {
  const issues = [];
  ensureShellElementBoundaries(issues);
  ensureDependencyDag(issues);
  ensureDocsImports(issues);

  if (issues.length > 0) {
    console.error(
      "Boundary check failed:\n" + issues.map((item) => `- ${item}`).join("\n"),
    );
    process.exit(1);
  }

  console.log("Boundary check ok.");
};

main();
