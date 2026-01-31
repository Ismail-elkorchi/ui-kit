import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = scriptDir;
const args = process.argv.slice(2);

const CYCLE_FINISH_ENTRY = "cmd:ato cycle finish --json";
const CYCLE_FINISH_RE = /\bcycle\s+finish\b/i;

const printUsage = () => {
  console.error(
    "Usage: node ato.mjs <command> [args...]\n" +
      "Examples:\n" +
      "  node ato.mjs q validate --json\n" +
      "  node ato.mjs gate run --mode full --json\n" +
      "  node ato.mjs cycle start --json\n" +
      "  node ato.mjs cycle finish --json\n" +
      "  node ato.mjs cycle finish --check --json",
  );
};

const run = (command, commandArgs, options = {}) => {
  const result = spawnSync(command, commandArgs, {
    cwd: repoRoot,
    stdio: "inherit",
    ...options,
  });
  if (result.error) throw result.error;
  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }
};

const hasFlag = (list, flag) => list.includes(flag);

const removeFlag = (list, flag) => {
  let idx = list.indexOf(flag);
  while (idx !== -1) {
    list.splice(idx, 1);
    idx = list.indexOf(flag);
  }
};

const consumeFlagValue = (list, flag) => {
  const idx = list.indexOf(flag);
  if (idx === -1) return null;
  if (idx === list.length - 1) {
    throw new Error(`Missing value for ${flag}.`);
  }
  const value = list[idx + 1];
  list.splice(idx, 2);
  return value;
};

const readJson = (filePath) => {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const readJsonl = (filePath) => {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split("\n").filter((line) => line.trim().length > 0);
  return lines.map((line) => JSON.parse(line));
};

const writeJsonl = (filePath, items) => {
  const serialized = items.map((item) => JSON.stringify(item)).join("\n");
  fs.writeFileSync(
    filePath,
    serialized.length ? `${serialized}\n` : "",
    "utf8",
  );
};

const hasCycleFinishCheck = (entries) =>
  entries.some((entry) => CYCLE_FINISH_RE.test(String(entry)));

const normalizeAcceptanceChecks = (entries) => {
  const list = Array.isArray(entries)
    ? entries
        .map((entry) => String(entry))
        .filter((entry) => entry.trim().length > 0)
    : [];
  if (hasCycleFinishCheck(list)) {
    return { list, added: false };
  }
  return { list: [...list, CYCLE_FINISH_ENTRY], added: true };
};

const resolveActiveCycle = (root) => {
  const statePath = path.join(root, ".ato", "state.json");
  const state = readJson(statePath);
  const cycleId =
    state && typeof state.activeCycleId === "string"
      ? state.activeCycleId
      : null;
  if (!cycleId) {
    return { error: "Missing activeCycleId in .ato/state.json." };
  }
  const cycleDir = path.join(root, ".ato", "cycles", cycleId);
  const cycleStatePath = path.join(cycleDir, "cycle-state.json");
  const cycleState = readJson(cycleStatePath);
  const queueIdFromState =
    cycleState && typeof cycleState.queue_id === "string"
      ? cycleState.queue_id
      : null;
  const queueId =
    queueIdFromState ||
    (state && typeof state.activeCycleQueueId === "string"
      ? state.activeCycleQueueId
      : null) ||
    (state && typeof state.activeQueueId === "string"
      ? state.activeQueueId
      : null);
  if (!queueId) {
    return { error: "Missing queue id for active cycle." };
  }
  return { cycleId, cycleDir, cycleStatePath, queueId };
};

const runCycleFinishCheck = ({ root, json, args: rawArgs }) => {
  const result = {
    ok: false,
    cycle_id: null,
    queue_id: null,
    added_cycle_finish: false,
    acceptance_checks: [],
    missing_paths: [],
    errors: [],
  };

  const resolved = resolveActiveCycle(root);
  if (resolved.error) {
    result.errors.push(resolved.error);
    if (json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else {
      console.error(resolved.error);
    }
    process.exit(1);
  }

  const { cycleId, cycleDir, cycleStatePath, queueId } = resolved;
  result.cycle_id = cycleId;
  result.queue_id = queueId;

  const queuePath = path.join(root, ".ato", "queue", "items.jsonl");
  const items = readJsonl(queuePath);
  if (!items) {
    result.errors.push("Queue items file missing.");
  } else {
    const found = items.find((item) => item.id === queueId);
    if (!found) {
      result.errors.push(`Queue item ${queueId} not found.`);
    } else if (found.status !== "active") {
      result.errors.push(`Queue item ${queueId} is not active.`);
    } else {
      const acceptance = found.spec?.acceptance_criteria;
      const normalized = normalizeAcceptanceChecks(acceptance);
      result.added_cycle_finish = normalized.added;
      result.acceptance_checks = normalized.list;
      if (normalized.list.length === 0) {
        result.errors.push(`Queue item ${queueId} has no acceptance criteria.`);
      }
    }
  }

  const requiresGate = !hasFlag(rawArgs, "--run-gate");
  const requiredPaths = [
    cycleStatePath,
    path.join(cycleDir, "cycle-start.json"),
    path.join(cycleDir, "selection.json"),
    path.join(cycleDir, "preflight.json"),
    path.join(cycleDir, "contract-index.json"),
    path.join(cycleDir, "contract-extract.json"),
  ];
  if (requiresGate) {
    requiredPaths.push(path.join(cycleDir, "gate-full.json"));
  }
  result.missing_paths = requiredPaths
    .filter((filePath) => !fs.existsSync(filePath))
    .map((filePath) => path.relative(root, filePath));

  if (result.errors.length === 0 && result.missing_paths.length === 0) {
    result.ok = true;
  }

  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    if (result.ok) {
      console.log("cycle finish check: ok");
    } else {
      result.errors.forEach((entry) => console.error(entry));
      if (result.missing_paths.length) {
        console.error(`missing paths: ${result.missing_paths.join(", ")}`);
      }
    }
  }

  process.exit(result.ok ? 0 : 1);
};

const ensureCycleFinishAcceptance = (root) => {
  const resolved = resolveActiveCycle(root);
  if (resolved.error) return { ok: false, reason: resolved.error };
  const { queueId } = resolved;
  const queuePath = path.join(root, ".ato", "queue", "items.jsonl");
  const items = readJsonl(queuePath);
  if (!items) return { ok: false, reason: "Queue items file missing." };
  const index = items.findIndex((item) => item.id === queueId);
  if (index === -1)
    return { ok: false, reason: `Queue item ${queueId} not found.` };
  const item = items[index];
  if (item.status !== "active") {
    return { ok: false, reason: `Queue item ${queueId} is not active.` };
  }
  const normalized = normalizeAcceptanceChecks(item.spec?.acceptance_criteria);
  if (!normalized.added) return { ok: true, added: false };
  const nextSpec = {
    ...(item.spec ?? {}),
    acceptance_criteria: normalized.list,
  };
  const updatedAt = new Date().toISOString();
  const next = { ...item, spec: nextSpec, updated_at: updatedAt };
  items[index] = next;
  writeJsonl(queuePath, items);
  return { ok: true, added: true };
};

const maybeAugmentCycleFinishFlags = (root, cycleArgs) => {
  const resolved = resolveActiveCycle(root);
  if (resolved.error) return { added: [] };
  const { cycleDir } = resolved;
  const added = [];
  const gatePath = path.join(cycleDir, "gate-full.json");

  if (!hasFlag(cycleArgs, "--run-gate") && !fs.existsSync(gatePath)) {
    cycleArgs.push("--run-gate");
    added.push("--run-gate");
  }
  if (!hasFlag(cycleArgs, "--run-pack-verify")) {
    cycleArgs.push("--run-pack-verify");
    added.push("--run-pack-verify");
  }
  return { added };
};

if (args.length === 0) {
  printUsage();
  process.exit(1);
}

if (args[0] === "q" && args[1] === "validate") {
  run(process.execPath, [path.join("tools", "ato.mjs"), ...args]);
  process.exit(0);
}

if (args[0] === "gate" && args[1] === "run") {
  run(process.execPath, [path.join("tools", "ato.mjs"), ...args]);
  process.exit(0);
}

if (args[0] === "cycle" && args[1] === "finish") {
  const json = hasFlag(args, "--json");
  const check = hasFlag(args, "--check") || hasFlag(args, "--dry-run");
  const workingArgs = [...args];
  removeFlag(workingArgs, "--check");
  removeFlag(workingArgs, "--dry-run");
  const rootOverride = consumeFlagValue(workingArgs, "--root") ?? repoRoot;

  if (check) {
    runCycleFinishCheck({ root: rootOverride, json, args: workingArgs });
    process.exit(0);
  }

  const acceptanceResult = ensureCycleFinishAcceptance(repoRoot);
  if (acceptanceResult.ok && acceptanceResult.added) {
    console.error("ato.mjs: added system cycle finish acceptance check.");
  }

  const flagResult = maybeAugmentCycleFinishFlags(repoRoot, workingArgs);
  if (flagResult.added.length) {
    console.error(
      `ato.mjs: auto-added ${flagResult.added.join(", ")} for cycle finish.`,
    );
  }

  run("ato", workingArgs);
  process.exit(0);
}

run("ato", args);
