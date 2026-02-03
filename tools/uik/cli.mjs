#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..");
const nodeBin = process.execPath;

const helpText = `UIK tooling

Usage:
  uik <command>

Commands:
  gates                       Run the full gate chain (npm test).
  contracts generate          Generate contracts.
  contracts validate          Validate contracts with build precondition.
  docs generate               Generate docs baseline + content.
  release check               Run release gate checks.
  release bump [--type <t>]   Bump versions (major|minor|patch) or --version.
  release tag [--version]     Create release notes + tag.
  release                     Full release (check + bump + tag + docs build).

Examples:
  node tools/uik/cli.mjs gates
  node tools/uik/cli.mjs contracts generate
  node tools/uik/cli.mjs docs generate
  node tools/uik/cli.mjs release check
`;

const run = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }
};

const runNode = (script, args = []) => run(nodeBin, [script, ...args]);

const args = process.argv.slice(2);
if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
  console.log(helpText);
  process.exit(0);
}

const [command, subcommand, ...rest] = args;

switch (command) {
  case "gates":
    run("npm", ["test"]);
    break;
  case "contracts":
    if (subcommand === "generate") {
      run("npm", ["run", "contracts:generate"]);
      break;
    }
    if (subcommand === "validate") {
      run("npm", ["run", "contracts:validate:build"]);
      break;
    }
    console.error("Unknown contracts subcommand.");
    console.log(helpText);
    process.exit(1);
  case "docs":
    if (subcommand === "generate") {
      run("npm", ["-w", "apps/docs", "run", "deps:build"]);
      run("npm", ["-w", "apps/docs", "run", "generate:baseline"]);
      run("npm", ["-w", "apps/docs", "run", "generate:content"]);
      break;
    }
    console.error("Unknown docs subcommand.");
    console.log(helpText);
    process.exit(1);
  case "release":
    if (!subcommand) {
      runNode(path.join("tools", "release", "cli.mjs"), ["release", ...rest]);
      break;
    }
    if (["check", "bump", "tag", "release"].includes(subcommand)) {
      runNode(path.join("tools", "release", "cli.mjs"), [subcommand, ...rest]);
      break;
    }
    console.error("Unknown release subcommand.");
    console.log(helpText);
    process.exit(1);
  default:
    console.error("Unknown command.");
    console.log(helpText);
    process.exit(1);
}
