import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..");
const packageJsonPath = path.join(repoRoot, "package.json");

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const scripts = pkg.scripts ?? {};
const issues = [];

Object.entries(scripts).forEach(([name, command]) => {
  const value = String(command);
  const canonicalPattern = /node\s+tools\/ato\.mjs\b/g;
  const stripped = value.replace(canonicalPattern, "");
  const hasGlobalAto = /(^|[\s;&|()])ato(\s|$)/.test(stripped);
  const hasWrongAtoMjs = /(^|[\s;&|()])ato\.mjs(\s|$)/.test(stripped);
  const hasOldWrapper = /\btools\/ato\/ato\.mjs\b/.test(value);

  if (hasOldWrapper || hasWrongAtoMjs || hasGlobalAto) {
    issues.push({ name, command: value });
  }
});

if (issues.length > 0) {
  console.error("Invalid ATO invocation detected in package.json scripts:");
  issues.forEach((issue) => {
    console.error(`- ${issue.name}: ${issue.command}`);
  });
  console.error("Use: node tools/ato.mjs ...");
  process.exit(1);
}
