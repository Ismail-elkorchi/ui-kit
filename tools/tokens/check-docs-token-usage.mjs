import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");

const stylesPath = path.join(repoRoot, "packages", "docs", "src", "styles.css");
const indexPath = path.join(repoRoot, "packages", "docs", "index.html");

const hexColor = /#([0-9a-fA-F]{3,8})\b/;
const rgbColor = /\brgba?\(/;
const hslColor = /\bhsla?\(/;
const pxValue = /\b(\d+(?:\.\d+)?)px\b/g;

const toLines = (text) => text.split(/\r?\n/);

const extractInlineStyles = (html) => {
  const matches = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
  if (matches.length === 0) return [];
  return matches.map((match) => match[1] ?? "");
};

const scanLines = (label, filePath, lines, issues) => {
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    if (hexColor.test(line)) {
      issues.push({
        filePath,
        lineNumber,
        message: `${label}: literal hex color detected.`,
      });
    }
    if (rgbColor.test(line)) {
      issues.push({
        filePath,
        lineNumber,
        message: `${label}: literal rgb() color detected.`,
      });
    }
    if (hslColor.test(line)) {
      issues.push({
        filePath,
        lineNumber,
        message: `${label}: literal hsl() color detected.`,
      });
    }

    for (const match of line.matchAll(pxValue)) {
      const value = Number.parseFloat(match[1] ?? "");
      if (Number.isNaN(value) || value === 0) continue;
      issues.push({
        filePath,
        lineNumber,
        message: `${label}: literal px value detected.`,
      });
    }
  });
};

const run = async () => {
  const issues = [];
  const styles = await readFile(stylesPath, "utf8");
  scanLines("docs styles", stylesPath, toLines(styles), issues);

  const indexHtml = await readFile(indexPath, "utf8");
  const inlineStyles = extractInlineStyles(indexHtml);
  inlineStyles.forEach((block, idx) => {
    scanLines(
      `docs index inline style ${idx + 1}`,
      indexPath,
      toLines(block),
      issues,
    );
  });

  if (issues.length) {
    console.error("Docs token usage check failed.");
    issues.forEach((issue) => {
      console.error(
        `- ${path.relative(repoRoot, issue.filePath)}:${issue.lineNumber} ${issue.message}`,
      );
    });
    process.exit(1);
  }

  console.log("Docs token usage check: ok");
};

run().catch((error) => {
  console.error("Docs token usage check failed.");
  console.error(error);
  process.exit(1);
});
