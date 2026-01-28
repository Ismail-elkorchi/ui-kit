import fs from "node:fs";
import path from "node:path";

const filePath = path.resolve(".ato/queue/items.jsonl");
const raw = fs.readFileSync(filePath, "utf8");
const lines = raw.split("\n").filter((line) => line.trim().length > 0);

const activeStatuses = new Set(["queued", "in_progress", "blocked"]);

const toFirstLine = (value) => {
  if (Array.isArray(value)) {
    const first = value.find(
      (entry) => typeof entry === "string" && entry.trim().length > 0,
    );
    return first || "";
  }
  if (typeof value === "string") return value;
  return "";
};

const deriveOutcome = (item) => {
  const spec = item.spec || {};
  return (
    toFirstLine(spec.outcome) ||
    toFirstLine(spec.problem) ||
    (typeof item.title === "string" ? item.title : "") ||
    "Define the desired outcome."
  );
};

const deriveScopeText = (item) => {
  const scope = Array.isArray(item.spec?.scope)
    ? item.spec.scope.filter(Boolean)
    : [];
  if (scope.length > 0) return scope.join(", ");
  return "identify concrete repo paths under packages/* or tools/* before edits";
};

const deriveAcceptanceText = (item) => {
  const acceptance = item.spec?.acceptance_criteria;
  if (Array.isArray(acceptance) && acceptance.length > 0) {
    return acceptance.filter(Boolean).join("; ");
  }
  const text = toFirstLine(acceptance);
  if (text) return text;
  return "define and satisfy acceptance criteria in spec";
};

const updated = lines.map((line) => {
  const item = JSON.parse(line);
  if (!item.spec) item.spec = {};

  if (item.spec.goal) delete item.spec.goal;
  if (!item.spec.outcome || String(item.spec.outcome).trim().length === 0) {
    item.spec.outcome = deriveOutcome(item);
  }

  if (activeStatuses.has(item.status)) {
    const scopeText = deriveScopeText(item);
    const acceptanceText = deriveAcceptanceText(item);
    item.spec.plan = {
      steps: [
        `Review scope paths: ${scopeText}.`,
        "Implement changes in the scoped paths to achieve the outcome; remove legacy behavior (no dual paths); comply with package boundary rules.",
        `Validate acceptance criteria: ${acceptanceText}.`,
        "Run verification: npm run format; npm run contracts:validate:build; ato gate run --mode full --json.",
      ],
    };
  } else if (!item.spec.plan) {
    item.spec.plan = {
      steps: [
        "Legacy item completed before spec fields were required. No plan recorded.",
      ],
    };
  }

  return JSON.stringify(item);
});

fs.writeFileSync(filePath, `${updated.join("\n")}\n`);
