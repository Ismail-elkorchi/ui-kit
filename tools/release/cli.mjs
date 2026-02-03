#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../..");

const publishablePackages = [
  {
    name: "@ismail-elkorchi/ui-tokens",
    dir: "packages/ui-tokens",
  },
  {
    name: "@ismail-elkorchi/ui-primitives",
    dir: "packages/ui-primitives",
  },
  {
    name: "@ismail-elkorchi/ui-patterns",
    dir: "packages/ui-patterns",
  },
  {
    name: "@ismail-elkorchi/ui-shell",
    dir: "packages/ui-shell",
  },
];

const docsPackage = {
  name: "@ismail-elkorchi/ui-docs",
  dir: "apps/docs",
};

const internalPackageNames = publishablePackages.map((pkg) => pkg.name);
const notesDir = path.join(repoRoot, "tools/release/notes");

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
};

const runCapture = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    const message = result.stderr?.trim() || result.stdout?.trim();
    throw new Error(message || `Command failed: ${command} ${args.join(" ")}`);
  }
  return result.stdout.trim();
};

const ensureCleanGit = () => {
  const status = runCapture("git", ["status", "--porcelain=v1"]);
  if (status) {
    throw new Error(
      "Git working tree is not clean. Commit or revert changes before releasing.",
    );
  }
};

const readJson = (filePath) =>
  JSON.parse(fs.readFileSync(filePath, "utf8"));

const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
};

const parseVersion = (value) => {
  const normalized = value.startsWith("v") ? value.slice(1) : value;
  const match =
    /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(normalized);
  if (!match) {
    throw new Error(
      `Invalid version '${value}'. Use semver like 0.3.0 or 0.3.0-beta.1.`,
    );
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    pre: match[4] ?? null,
    raw: normalized,
  };
};

const bumpVersion = (current, type) => {
  const parsed = parseVersion(current);
  if (parsed.pre) {
    throw new Error(
      "Pre-release bumps are not supported. Provide an explicit --version.",
    );
  }
  let { major, minor, patch } = parsed;
  if (type === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (type === "minor") {
    minor += 1;
    patch = 0;
  } else if (type === "patch") {
    patch += 1;
  } else {
    throw new Error(`Unknown bump type '${type}'.`);
  }
  return `${major}.${minor}.${patch}`;
};

const getPackageJsonPath = (dir) => path.join(repoRoot, dir, "package.json");

const getCurrentVersion = () => {
  const versions = publishablePackages.map((pkg) => {
    const pkgJson = readJson(getPackageJsonPath(pkg.dir));
    return { name: pkg.name, version: pkgJson.version };
  });
  const unique = new Set(versions.map((entry) => entry.version));
  if (unique.size !== 1) {
    const detail = versions
      .map((entry) => `${entry.name}@${entry.version}`)
      .join(", ");
    throw new Error(
      `Publishable packages are out of sync: ${detail}. Align versions first.`,
    );
  }
  return versions[0].version;
};

const updateInternalDeps = (pkgJson, newVersion) => {
  const depFields = [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ];
  depFields.forEach((field) => {
    if (!pkgJson[field]) return;
    internalPackageNames.forEach((name) => {
      if (pkgJson[field][name]) {
        pkgJson[field][name] = newVersion;
      }
    });
  });
};

const updateVersions = (newVersion) => {
  publishablePackages.forEach((pkg) => {
    const pkgPath = getPackageJsonPath(pkg.dir);
    const pkgJson = readJson(pkgPath);
    pkgJson.version = newVersion;
    updateInternalDeps(pkgJson, newVersion);
    writeJson(pkgPath, pkgJson);
  });
  const docsPath = getPackageJsonPath(docsPackage.dir);
  const docsJson = readJson(docsPath);
  docsJson.version = newVersion;
  updateInternalDeps(docsJson, newVersion);
  writeJson(docsPath, docsJson);
};

const getLastTag = () => {
  const tags = runCapture("git", ["tag", "--list", "--sort=-creatordate"]);
  const list = tags.split("\n").filter(Boolean);
  return list[0] ?? null;
};

const getCommitSummary = (range, count = 20) => {
  if (range) {
    const log = runCapture("git", ["log", "--oneline", range]);
    return log.split("\n").filter(Boolean);
  }
  const log = runCapture("git", ["log", `-n`, String(count), "--oneline"]);
  return log.split("\n").filter(Boolean);
};

const getChangedFiles = (range) => {
  if (!range) return [];
  try {
    const diff = runCapture("git", ["diff", "--name-only", range]);
    return diff.split("\n").filter(Boolean);
  } catch {
    return [];
  }
};

const getChangedPackages = (files) => {
  const packages = new Set();
  files.forEach((file) => {
    if (file.startsWith("packages/ui-tokens/")) {
      packages.add("@ismail-elkorchi/ui-tokens");
    } else if (file.startsWith("packages/ui-primitives/")) {
      packages.add("@ismail-elkorchi/ui-primitives");
    } else if (file.startsWith("packages/ui-patterns/")) {
      packages.add("@ismail-elkorchi/ui-patterns");
    } else if (file.startsWith("packages/ui-shell/")) {
      packages.add("@ismail-elkorchi/ui-shell");
    } else if (file.startsWith("apps/docs/")) {
      packages.add("@ismail-elkorchi/ui-docs");
    }
  });
  return Array.from(packages);
};

const generateReleaseNotes = (version) => {
  fs.mkdirSync(notesDir, { recursive: true });
  const lastTag = getLastTag();
  const range = lastTag ? `${lastTag}..HEAD` : null;
  const summary = getCommitSummary(range);
  const files = range ? getChangedFiles(range) : getChangedFiles("HEAD~20..HEAD");
  const changedPackages = getChangedPackages(files);
  const head = runCapture("git", ["rev-parse", "HEAD"]);
  const notes = [
    `# v${version}`,
    "",
    `- Commit: ${head}`,
    `- Range: ${range ?? "last 20 commits"}`,
    `- Changed packages: ${
      changedPackages.length ? changedPackages.join(", ") : "(none)"
    }`,
    "",
    "## Summary",
    ...summary.map((line) => `- ${line}`),
    "",
  ].join("\n");
  const notesPath = path.join(notesDir, `v${version}.md`);
  fs.writeFileSync(notesPath, notes);
  return notesPath;
};

const runChecks = () => {
  run("npm", ["run", "format"]);
  run("npm", ["run", "contracts:generate"]);
  run("npm", ["run", "contracts:validate:build"]);
  run("npm", ["test"]);
  run("node", ["ato.mjs", "q", "validate", "--json"]);
  run("node", ["ato.mjs", "gate", "run", "--mode", "full", "--json"]);
};

const command = process.argv[2];
const args = process.argv.slice(3);

const getArg = (flag) => {
  const index = args.indexOf(flag);
  if (index === -1) return null;
  return args[index + 1] ?? null;
};

const hasFlag = (flag) => args.includes(flag);

const resolveTargetVersion = () => {
  const explicit = getArg("--version") ?? getArg("-v");
  if (explicit) return parseVersion(explicit).raw;
  const bump = getArg("--type") ?? getArg("-t");
  if (bump) return bumpVersion(getCurrentVersion(), bump);
  throw new Error("Provide --version or --type (major|minor|patch).");
};

try {
  if (!command || command === "help" || command === "--help") {
    console.log(
      "Usage: node tools/release/cli.mjs <check|bump|tag|release> [--version x.y.z | --type patch]",
    );
    process.exit(0);
  }

  if (command === "check") {
    ensureCleanGit();
    runChecks();
    process.exit(0);
  }

  if (command === "bump") {
    ensureCleanGit();
    const nextVersion = resolveTargetVersion();
    updateVersions(nextVersion);
    if (hasFlag("--commit")) {
      run("git", [
        "add",
        ...publishablePackages.map((pkg) => getPackageJsonPath(pkg.dir)),
        getPackageJsonPath(docsPackage.dir),
      ]);
      run("git", ["commit", "-m", `chore(release): v${nextVersion}`]);
    }
    console.log(`Bumped to v${nextVersion}.`);
    process.exit(0);
  }

  if (command === "tag") {
    ensureCleanGit();
    const currentVersion = getCurrentVersion();
    const explicit = getArg("--version") ?? getArg("-v");
    const version = explicit ? parseVersion(explicit).raw : currentVersion;
    const notesPath = generateReleaseNotes(version);
    run("git", ["add", notesPath]);
    run("git", ["commit", "-m", `chore(release): notes v${version}`]);
    run("git", ["tag", "-a", `v${version}`, "-m", `v${version}`]);
    console.log(`Tagged v${version}. Notes: ${notesPath}`);
    process.exit(0);
  }

  if (command === "release") {
    ensureCleanGit();
    const nextVersion = resolveTargetVersion();
    updateVersions(nextVersion);
    runChecks();
    const notesPath = generateReleaseNotes(nextVersion);
    run("git", [
      "add",
      ...publishablePackages.map((pkg) => getPackageJsonPath(pkg.dir)),
      getPackageJsonPath(docsPackage.dir),
      notesPath,
    ]);
    run("git", ["commit", "-m", `chore(release): v${nextVersion}`]);
    run("git", ["tag", "-a", `v${nextVersion}`, "-m", `v${nextVersion}`]);
    run("npm", ["-w", "apps/docs", "run", "build"]);
    console.log(`Release v${nextVersion} complete.`);
    process.exit(0);
  }

  throw new Error(`Unknown command '${command}'.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
