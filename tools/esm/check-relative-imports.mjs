import fs from "node:fs";
import path from "node:path";

const roots = [
  "packages/ui-primitives/dist",
  "packages/ui-shell/dist",
  "packages/ui-patterns/dist",
];

const isRelativeSpecifier = (specifier) => specifier.startsWith(".");

const hasExtension = (specifier) => {
  if (specifier.endsWith("/")) return true;
  const last = specifier.split("/").pop();
  if (!last || last === "." || last === "..") return true;
  return last.includes(".");
};

const shouldFlag = (specifier) => {
  if (!isRelativeSpecifier(specifier)) return false;
  if (specifier === "." || specifier === "..") return false;
  if (specifier.endsWith("/")) return false;
  return !hasExtension(specifier);
};

const scanFile = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const results = [];

  const fromRe = /\bfrom\s+["']([^"']+)["']/g;
  const importRe = /\bimport\s+["']([^"']+)["']/g;
  const dynamicRe = /\bimport\(\s*["']([^"']+)["']\s*\)/g;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    let match;

    fromRe.lastIndex = 0;
    while ((match = fromRe.exec(line))) {
      const specifier = match[1];
      if (shouldFlag(specifier)) {
        results.push({ filePath, lineNumber, specifier, line: line.trim() });
      }
    }

    importRe.lastIndex = 0;
    while ((match = importRe.exec(line))) {
      const specifier = match[1];
      if (shouldFlag(specifier)) {
        results.push({ filePath, lineNumber, specifier, line: line.trim() });
      }
    }

    dynamicRe.lastIndex = 0;
    while ((match = dynamicRe.exec(line))) {
      const specifier = match[1];
      if (shouldFlag(specifier)) {
        results.push({ filePath, lineNumber, specifier, line: line.trim() });
      }
    }
  });

  return results;
};

const walk = (dir, files = []) => {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }
  return files;
};

const violations = [];
for (const root of roots) {
  const files = walk(root);
  for (const file of files) {
    violations.push(...scanFile(file));
  }
}

if (violations.length) {
  console.error(
    `Found ${violations.length} extensionless relative imports in dist output:`,
  );
  for (const violation of violations) {
    console.error(
      `${violation.filePath}:${violation.lineNumber} ${violation.specifier}`,
    );
  }
  process.exit(1);
}

console.log("ok: no extensionless relative imports in dist output");
