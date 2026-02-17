import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..");
const fixtureRoot = path.join(scriptDir, "fixtures", "cycle-finish");
const atoScript = path.join(repoRoot, "ato.mjs");

const result = spawnSync(
  process.execPath,
  [atoScript, "cycle", "finish", "--check", "--json", "--root", fixtureRoot],
  { encoding: "utf8" },
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

const stdout = (result.stdout ?? "").trim();
const stderr = (result.stderr ?? "").trim();
if (result.status !== 0) {
  if (stdout) console.error(stdout);
  if (stderr) console.error(stderr);
  process.exit(result.status ?? 1);
}

let payload;
try {
  payload = JSON.parse(stdout);
} catch {
  console.error("Invalid JSON output from cycle finish check.");
  if (stdout) console.error(stdout);
  if (stderr) console.error(stderr);
  process.exit(1);
}

const acceptanceChecks = Array.isArray(payload.acceptance_checks)
  ? payload.acceptance_checks
  : [];
const hasCycleFinish = acceptanceChecks.some((entry) =>
  /\bcycle\s+finish\b/i.test(String(entry)),
);

if (!payload.ok || !payload.added_cycle_finish || !hasCycleFinish) {
  console.error(
    "Cycle finish check did not normalize acceptance checks as expected.",
  );
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

process.exit(0);
