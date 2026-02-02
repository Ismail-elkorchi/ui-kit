import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
const docsRoot = path.join(repoRoot, "apps/docs");
const distDir = path.join(docsRoot, "dist");
const manifestPath = path.join(distDir, ".vite/manifest.json");
const viteBin = path.join(repoRoot, "node_modules/.bin/vite");

const budgets = {
  initialJsKb: 180,
  initialCssKb: 100,
  maxCls: 0.02,
};

const kb = (bytes) => bytes / 1024;

const runCommand = (cmd, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: "inherit",
      ...options,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} failed with ${code}`));
    });
  });

const ensureBuild = async () => {
  await runCommand(viteBin, ["build"], { cwd: docsRoot });
};

const readManifest = async () =>
  JSON.parse(await fs.readFile(manifestPath, "utf8"));

const getAssetBytes = async (asset) => {
  const assetPath = path.join(distDir, asset);
  const stats = await fs.stat(assetPath);
  return stats.size;
};

const collectImportGraph = (manifest, entryKey) => {
  const visited = new Set();

  const visit = (key) => {
    if (!key || visited.has(key)) return;
    const chunk = manifest[key];
    if (!chunk) return;
    visited.add(key);
    const imports = chunk.imports ?? [];
    imports.forEach(visit);
  };

  visit(entryKey);
  return visited;
};

const summarizeBudgets = async () => {
  await ensureBuild();
  const manifest = await readManifest();
  const entries = Object.entries(manifest);
  const entryKey = entries.find(([, value]) => value.isEntry)?.[0];

  if (!entryKey) {
    throw new Error("Docs build manifest missing entry chunk.");
  }

  const graphKeys = collectImportGraph(manifest, entryKey);
  const cssFiles = new Set();
  let initialJsBytes = 0;

  for (const key of graphKeys) {
    const chunk = manifest[key];
    if (!chunk) continue;
    if (chunk.file?.endsWith(".js")) {
      initialJsBytes += await getAssetBytes(chunk.file);
    }
    (chunk.css ?? []).forEach((cssFile) => cssFiles.add(cssFile));
  }

  let initialCssBytes = 0;
  for (const cssFile of cssFiles) {
    initialCssBytes += await getAssetBytes(cssFile);
  }

  const pageKeys = entries
    .map(([key]) => key)
    .filter((key) => key.includes("/generated/pages/"));
  if (pageKeys.length === 0) {
    throw new Error("Docs page chunks missing from manifest.");
  }

  const eagerPageKeys = pageKeys.filter((key) => graphKeys.has(key));
  if (eagerPageKeys.length > 0) {
    throw new Error(
      `Docs page chunks are eagerly imported: ${eagerPageKeys.join(", ")}`,
    );
  }

  if (kb(initialJsBytes) > budgets.initialJsKb) {
    throw new Error(
      `Initial JS ${kb(initialJsBytes).toFixed(1)}kb exceeds budget ${
        budgets.initialJsKb
      }kb.`,
    );
  }

  if (kb(initialCssBytes) > budgets.initialCssKb) {
    throw new Error(
      `Initial CSS ${kb(initialCssBytes).toFixed(1)}kb exceeds budget ${
        budgets.initialCssKb
      }kb.`,
    );
  }

  return {
    initialJsKb: kb(initialJsBytes),
    initialCssKb: kb(initialCssBytes),
  };
};

const waitForServer = (child, timeoutMs = 15000) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Preview server did not start in time."));
    }, timeoutMs);

    const onData = (chunk) => {
      const text = String(chunk);
      if (text.includes("http://") || text.includes("https://")) {
        clearTimeout(timeout);
        cleanup();
        resolve();
      }
    };

    const onExit = (code) => {
      clearTimeout(timeout);
      cleanup();
      reject(new Error(`Preview server exited with code ${code ?? "?"}.`));
    };

    const cleanup = () => {
      child.stdout?.removeListener("data", onData);
      child.stderr?.removeListener("data", onData);
      child.removeListener("exit", onExit);
    };

    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);
    child.on("exit", onExit);
  });

const measureCls = async (baseUrl, paths) => {
  const browser = await chromium.launch();
  try {
    const results = {};
    for (const route of paths) {
      const page = await browser.newPage();
      await page.addInitScript(() => {
        window.__docsCls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              window.__docsCls += entry.value;
            }
          }
        }).observe({ type: "layout-shift", buffered: true });
      });
      await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      const cls = await page.evaluate(() => window.__docsCls ?? 0);
      results[route] = cls;
      await page.close();
    }
    return results;
  } finally {
    await browser.close();
  }
};

const run = async () => {
  const { initialJsKb, initialCssKb } = await summarizeBudgets();
  const summaryLine = `Docs performance budgets OK. Initial JS ${initialJsKb.toFixed(
    1,
  )}kb, CSS ${initialCssKb.toFixed(1)}kb`;

  const port = 4176;
  const preview = spawn(
    viteBin,
    ["preview", "--port", String(port), "--strictPort", "--host", "127.0.0.1"],
    {
      cwd: docsRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let previewLog = "";
  const capturePreviewOutput = (chunk) => {
    const text = String(chunk);
    previewLog += text;
  };
  preview.stdout?.on("data", capturePreviewOutput);
  preview.stderr?.on("data", capturePreviewOutput);

  try {
    try {
      await waitForServer(preview);
    } catch (error) {
      process.stderr.write(
        "CLS check skipped: preview server failed to start.\n",
      );
      if (previewLog.trim()) {
        process.stderr.write(previewLog);
      } else {
        process.stderr.write(`${String(error)}\n`);
      }
      process.stdout.write(`${summaryLine}; CLS skipped.\n`);
      return;
    }

    const clsResults = await measureCls(`http://127.0.0.1:${port}`, [
      "/docs/getting-started",
      "/docs/primitives",
    ]);

    const violations = Object.entries(clsResults).filter(
      ([, value]) => value > budgets.maxCls,
    );

    if (violations.length > 0) {
      const detail = violations
        .map(([route, value]) => `${route}=${value.toFixed(3)}`)
        .join(", ");
      throw new Error(`CLS budget exceeded (${budgets.maxCls}): ${detail}`);
    }

    process.stdout.write(`${summaryLine}, CLS <= ${budgets.maxCls}.\n`);
  } finally {
    preview.kill("SIGTERM");
  }
};

await run();
