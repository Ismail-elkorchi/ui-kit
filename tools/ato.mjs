import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const queuePath = path.join(repoRoot, ".ato/queue/items.jsonl");

const printUsage = () => {
  console.error(
    "Usage: node tools/ato.mjs q validate [--json]\n" +
      "       node tools/ato.mjs gate run --mode <fast|full> [--json]",
  );
};

const stableStringify = (value) => {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    return `{${entries
      .map(([key, entryValue]) => {
        return `${JSON.stringify(key)}:${stableStringify(entryValue)}`;
      })
      .join(",")}}`;
  }
  return JSON.stringify(value);
};

const buildCoreSnapshot = (item) => ({
  id: item.id,
  title: item.title,
  type: item.type,
  status: item.status,
  target: item.target,
  deps: item.deps,
  created_at: item.created_at,
  completed_at: item.completed_at ?? null,
  notes: item.notes,
  spec: item.spec ?? null,
  details: item.details ?? null,
});

const computeCoreHash = (item) => {
  const snapshot = buildCoreSnapshot(item);
  const serialized = stableStringify(snapshot);
  return crypto.createHash("sha256").update(serialized).digest("hex");
};

const isIsoDate = (value) => {
  if (typeof value !== "string") return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString() === value;
};

const readQueueItems = () => {
  if (!fs.existsSync(queuePath)) {
    return { ok: false, errors: [{ message: "Queue file missing." }] };
  }
  const raw = fs.readFileSync(queuePath, "utf8");
  const lines = raw.split("\n").filter((line) => line.trim().length > 0);
  const items = [];
  const errors = [];
  lines.forEach((line, index) => {
    try {
      items.push(JSON.parse(line));
    } catch (error) {
      errors.push({
        message: "Invalid JSON in queue file.",
        line: index + 1,
      });
    }
  });
  if (errors.length) return { ok: false, errors };
  return { ok: true, items };
};

const validateQueue = () => {
  const parsed = readQueueItems();
  if (!parsed.ok) return parsed;
  const items = parsed.items ?? [];
  const errors = [];
  const allowedStatuses = new Set([
    "queued",
    "in_progress",
    "blocked",
    "done",
    "dropped",
    "canceled",
    "cancelled",
  ]);

  items.forEach((item) => {
    if (!item?.id || typeof item.id !== "string") {
      errors.push({ id: item?.id ?? "(missing)", message: "Missing id." });
      return;
    }
    if (!item.title || typeof item.title !== "string") {
      errors.push({ id: item.id, message: "Missing title." });
    }
    if (!allowedStatuses.has(item.status)) {
      errors.push({
        id: item.id,
        message: `Invalid status '${item.status}'.`,
      });
    }
    if (!isIsoDate(item.created_at)) {
      errors.push({ id: item.id, message: "created_at must be ISO." });
    }
    if (item.updated_at && !isIsoDate(item.updated_at)) {
      errors.push({ id: item.id, message: "updated_at must be ISO." });
    }
    if (item.status === "done") {
      if (!isIsoDate(item.completed_at)) {
        errors.push({ id: item.id, message: "completed_at must be ISO." });
      }
      if (!item.frozen?.core_hash) {
        errors.push({ id: item.id, message: "Missing frozen.core_hash." });
      } else if (item.frozen.core_hash !== computeCoreHash(item)) {
        errors.push({ id: item.id, message: "frozen.core_hash mismatch." });
      }
    }
  });

  if (errors.length) {
    return { ok: false, errors };
  }
  return { ok: true };
};

const runCommand = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
  });
  if (result.error) {
    throw result.error;
  }
  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }
};

const runGate = (mode) => {
  const steps = [];
  if (mode === "full") {
    steps.push(["npm", ["run", "format"]]);
    steps.push(["npm", ["run", "contracts:generate"]]);
    steps.push(["npm", ["run", "contracts:validate:build"]]);
    steps.push(["npm", ["test"]]);
    steps.push([
      process.execPath,
      [path.join("tools", "ato.mjs"), "q", "validate", "--json"],
    ]);
  } else if (mode === "fast") {
    steps.push(["npm", ["test"]]);
  } else {
    throw new Error(`Unsupported gate mode '${mode}'.`);
  }

  steps.forEach(([command, args]) => runCommand(command, args));
};

const args = process.argv.slice(2);
if (args.length === 0) {
  printUsage();
  process.exit(1);
}

if (args[0] === "q" && args[1] === "validate") {
  const result = validateQueue();
  const wantsJson = args.includes("--json");
  if (wantsJson) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  }
  if (!result.ok) {
    if (!wantsJson) {
      console.error("Queue validation failed.");
      result.errors?.forEach((entry) => {
        const prefix = entry.id ? `[${entry.id}] ` : "";
        console.error(`${prefix}${entry.message}`);
      });
    }
    process.exit(1);
  }
  if (!wantsJson) {
    console.log("Queue validation passed.");
  }
  process.exit(0);
}

if (args[0] === "gate" && args[1] === "run") {
  const modeIndex = args.findIndex((entry) => entry === "--mode");
  const mode = modeIndex === -1 ? "" : args[modeIndex + 1];
  try {
    runGate(mode);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
  const wantsJson = args.includes("--json");
  if (wantsJson) {
    process.stdout.write(`${JSON.stringify({ ok: true, mode }, null, 2)}\n`);
  }
  process.exit(0);
}

printUsage();
process.exit(1);
