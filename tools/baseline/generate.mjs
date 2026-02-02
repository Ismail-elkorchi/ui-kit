import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../..");
const sourcePath = path.join(repoRoot, "tools/baseline/support-matrix.json");
const docsRoot = path.join(repoRoot, "apps/docs");
const docsContentPath = path.join(docsRoot, "content/baseline-support.md");
const docsPublicPath = path.join(docsRoot, "public/baseline-support.json");

const allowedBaseline = new Set(["widely", "newly", "not-baseline"]);

const readJson = async (filePath) =>
  JSON.parse(await fs.readFile(filePath, "utf8"));

const normalizeText = (value) => String(value ?? "").trim();

const escapeTableCell = (value) =>
  normalizeText(value).replace(/\|/g, "\\|").replace(/\n/g, " ");

const formatBaseline = (value) => {
  switch (value) {
    case "widely":
      return "Widely";
    case "newly":
      return "Newly";
    case "not-baseline":
      return "Not Baseline";
    default:
      return value;
  }
};

const formatMarkdownTable = (header, rows) => {
  const tableRows = [header, ...rows];
  const widths = header.map((_, index) =>
    Math.max(...tableRows.map((row) => row[index].length)),
  );
  const formatRow = (row) =>
    `| ${row.map((cell, index) => cell.padEnd(widths[index])).join(" | ")} |`;
  const separator = `| ${widths.map((width) => "-".repeat(width)).join(" | ")} |`;
  return [formatRow(header), separator, ...rows.map(formatRow)].join("\n");
};

const normalizeFeatures = (features) => {
  if (!Array.isArray(features)) {
    throw new Error("support-matrix.json must include a features array.");
  }

  const seen = new Set();
  const normalized = features.map((feature) => {
    const id = normalizeText(feature.id);
    const name = normalizeText(feature.name);
    const category = normalizeText(feature.category);
    const baseline = normalizeText(feature.baseline);

    if (!id || !name || !category || !baseline) {
      throw new Error(
        `Feature entries must include id, name, category, baseline. Missing in ${id || "<unknown>"}.`,
      );
    }
    if (!allowedBaseline.has(baseline)) {
      throw new Error(`Unsupported baseline value '${baseline}' for ${id}.`);
    }
    if (seen.has(id)) {
      throw new Error(`Duplicate feature id '${id}'.`);
    }
    seen.add(id);

    return {
      ...feature,
      id,
      name,
      category,
      baseline,
      usage: normalizeText(feature.usage),
      evidence: normalizeText(feature.evidence),
      gating: normalizeText(feature.gating),
    };
  });

  return normalized.sort((a, b) => a.id.localeCompare(b.id));
};

const renderMarkdown = (features) => {
  const rows = features.map((feature) => {
    const evidence = feature.evidence ? `[Source](${feature.evidence})` : "—";
    const gating = feature.gating ? feature.gating : "—";
    return [
      escapeTableCell(feature.name),
      escapeTableCell(feature.category),
      formatBaseline(feature.baseline),
      escapeTableCell(feature.usage),
      escapeTableCell(gating),
      escapeTableCell(evidence),
    ];
  });
  const header = [
    "Feature",
    "Category",
    "Baseline",
    "Usage",
    "Gating/Fallback",
    "Evidence",
  ];
  const table = formatMarkdownTable(header, rows);

  return [
    "# Baseline Support Matrix",
    "",
    "## Overview",
    "",
    "This matrix lists platform features used by UIK and their Baseline classifications.",
    "Baseline Newly and Not Baseline entries are treated as progressive enhancements.",
    "",
    "## Matrix",
    "",
    ...table.split("\n"),
  ].join("\n");
};

const writeOrCheck = async (filePath, contents, check, mismatches) => {
  if (!check) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, contents, "utf8");
    return;
  }
  try {
    const current = await fs.readFile(filePath, "utf8");
    if (current !== contents) {
      mismatches.push(filePath);
    }
  } catch {
    mismatches.push(filePath);
  }
};

const run = async () => {
  const check = process.argv.includes("--check");
  const mismatches = [];
  const source = await readJson(sourcePath);
  const normalizedFeatures = normalizeFeatures(source.features ?? []);
  const output = {
    schemaVersion: source.schemaVersion ?? 1,
    features: normalizedFeatures,
  };

  const jsonPayload = `${JSON.stringify(output, null, 2)}\n`;
  const markdownPayload = `${renderMarkdown(normalizedFeatures)}\n`;

  await writeOrCheck(docsPublicPath, jsonPayload, check, mismatches);
  await writeOrCheck(docsContentPath, markdownPayload, check, mismatches);

  if (check && mismatches.length) {
    throw new Error(
      `Baseline support outputs out of date:\n${mismatches.join("\n")}`,
    );
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
