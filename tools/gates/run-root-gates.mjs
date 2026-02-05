import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..");
const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";

const runStep = (label, command, args) => {
  console.log(`RUNNING: ${label}`);
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    shell: false,
  });
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const steps = [
  ["ATO script guard", "node", ["tools/architecture/check-no-global-ato.mjs"]],
  ["Build deps", npmBin, ["run", "build:deps"]],
  ["ESM relative imports", "node", ["tools/esm/check-relative-imports.mjs"]],
  [
    "Architecture boundaries",
    "node",
    ["tools/architecture/check-boundaries.mjs"],
  ],
  [
    "Docs API drift",
    "node",
    ["apps/docs/tools/generate-docs-content.mjs", "--api", "--check"],
  ],
  ["Docs import validation", "node", ["tools/docs/validate-docs-imports.mjs"]],
  [
    "Docs perf route guard",
    "node",
    ["tools/docs/check-no-perf-route-special-casing.mjs"],
  ],
  ["Docs token usage", "node", ["tools/tokens/check-docs-token-usage.mjs"]],
  [
    "Scaffold token hooks",
    "node",
    ["tools/contracts/check-scaffold-token-hooks.mjs"],
  ],
  ["Baseline drift", "node", ["tools/baseline/generate.mjs", "--check"]],
  ["Contracts drift", npmBin, ["run", "contracts:validate"]],
  ["Queue validation", "node", ["tools/ato.mjs", "q", "validate", "--json"]],
  ["Cycle finish check", "node", ["tools/ato/check-cycle-finish.mjs"]],
  ["Docs tests", npmBin, ["-w", "apps/docs", "run", "test"]],
  ["UI tokens tests", npmBin, ["-w", "packages/ui-tokens", "run", "test"]],
  [
    "UI primitives tests",
    npmBin,
    ["-w", "packages/ui-primitives", "run", "test"],
  ],
  ["UI shell tests", npmBin, ["-w", "packages/ui-shell", "run", "test"]],
  ["UI patterns tests", npmBin, ["-w", "packages/ui-patterns", "run", "test"]],
  ["Storybook tests", npmBin, ["run", "test-storybook"]],
  ["Visual regression", npmBin, ["run", "test-visual"]],
];

steps.forEach(([label, command, args]) => {
  runStep(label, command, args);
});
