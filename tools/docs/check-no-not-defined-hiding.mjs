import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..");
const docsSrcDir = path.join(repoRoot, "apps/docs/src");

const isCssFile = (entry) => entry.isFile() && entry.name.endsWith(".css");

const readCssFiles = async () => {
  const entries = await fs.readdir(docsSrcDir, { withFileTypes: true });
  const files = entries.filter(isCssFile).map((entry) => entry.name);
  return Promise.all(
    files.map(async (name) => {
      const filePath = path.join(docsSrcDir, name);
      const contents = await fs.readFile(filePath, "utf8");
      return { filePath, contents };
    }),
  );
};

const rulePattern = /uik-[a-z0-9-]+:not\(:defined\)[^{]*\{[^}]*\}/g;
const hidesPattern =
  /(visibility\s*:\s*hidden|display\s*:\s*none|opacity\s*:\s*0)/i;

const run = async () => {
  const files = await readCssFiles();
  const violations = [];

  for (const { filePath, contents } of files) {
    const matches = contents.match(rulePattern) ?? [];
    for (const match of matches) {
      if (hidesPattern.test(match)) {
        violations.push(`${filePath}: ${match.trim()}`);
      }
    }
  }

  if (violations.length) {
    console.error("Docs :not(:defined) hiding is not allowed:");
    violations.forEach((entry) => console.error(`- ${entry}`));
    process.exit(1);
  }

  process.stdout.write("Docs :not(:defined) hiding check: ok\n");
};

await run();
