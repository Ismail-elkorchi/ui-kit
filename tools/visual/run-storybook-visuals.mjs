import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..");
const storybookRoot = path.join(repoRoot, "storybook-static");
const snapshotRoot = path.join(scriptDir, "__snapshots__");

const updateSnapshots =
  process.argv.includes("--update") || process.env.UPDATE_SNAPSHOTS === "1";

const viewPort = { width: 1200, height: 900 };
const deviceScaleFactor = 1;
// Allow a tiny diff budget to absorb subpixel text rendering variance.
const maxDiffPixels = 120;
const pixelThreshold = 0.1;

const variants = [
  { theme: "light", density: "comfortable", forcedColors: "none" },
  { theme: "light", density: "compact", forcedColors: "none" },
  { theme: "dark", density: "comfortable", forcedColors: "none" },
  { theme: "dark", density: "compact", forcedColors: "none" },
  { theme: "light", density: "comfortable", forcedColors: "active" },
  { theme: "light", density: "compact", forcedColors: "active" },
  { theme: "dark", density: "comfortable", forcedColors: "active" },
  { theme: "dark", density: "compact", forcedColors: "active" },
];

const runCommand = (label, command, args) => {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (typeof result.status === "number" && result.status !== 0) {
    throw new Error(`${label} failed with exit ${result.status}.`);
  }
};

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".woff2", "font/woff2"],
  [".woff", "font/woff"],
  [".ttf", "font/ttf"],
  [".map", "application/json; charset=utf-8"],
  [".ico", "image/x-icon"],
]);

const getMimeType = (filePath) =>
  mimeTypes.get(path.extname(filePath).toLowerCase()) ||
  "application/octet-stream";

const serveStatic = (root) =>
  new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const requestUrl = new URL(req.url ?? "/", "http://127.0.0.1");
      let filePath = decodeURIComponent(requestUrl.pathname);
      if (filePath.endsWith("/")) {
        filePath = `${filePath}index.html`;
      }
      if (filePath === "/") filePath = "/index.html";
      const resolvedPath = path.normalize(path.join(root, filePath));
      if (!resolvedPath.startsWith(root)) {
        res.statusCode = 403;
        res.end("Forbidden");
        return;
      }
      let targetPath = resolvedPath;
      if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
        targetPath = path.join(targetPath, "index.html");
      }
      if (!fs.existsSync(targetPath)) {
        res.statusCode = 404;
        res.end("Not found");
        return;
      }
      res.setHeader("Content-Type", getMimeType(targetPath));
      res.setHeader("Cache-Control", "no-store");
      fs.createReadStream(targetPath).pipe(res);
    });

    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = address && typeof address === "object" ? address.port : null;
      if (!port) {
        reject(new Error("Failed to bind preview server port."));
        return;
      }
      resolve({ server, port });
    });
  });

const readStoryIndex = () => {
  const indexPath = path.join(storybookRoot, "index.json");
  const storiesPath = path.join(storybookRoot, "stories.json");
  let indexData;
  if (fs.existsSync(indexPath)) {
    indexData = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  } else if (fs.existsSync(storiesPath)) {
    indexData = JSON.parse(fs.readFileSync(storiesPath, "utf8"));
  } else {
    throw new Error("Storybook index.json/stories.json not found.");
  }
  const entries = indexData.entries || indexData.stories || indexData;
  return Object.values(entries);
};

const getTags = (entry) => {
  const tags = new Set();
  const sources = [entry.tags, entry.parameters?.tags, entry.meta?.tags];
  sources.forEach((source) => {
    if (Array.isArray(source)) {
      source.forEach((tag) => tags.add(String(tag)));
    }
  });
  return tags;
};

const normalizeSlug = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const readPng = (filePath) => PNG.sync.read(fs.readFileSync(filePath));

const writePng = (filePath, png) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, PNG.sync.write(png));
};

const comparePngs = ({ current, baseline, diffPath }) => {
  if (current.width !== baseline.width || current.height !== baseline.height) {
    return {
      diffPixels: Number.POSITIVE_INFINITY,
      reason: `size ${current.width}x${current.height} != ${baseline.width}x${baseline.height}`,
    };
  }
  const diff = new PNG({ width: current.width, height: current.height });
  const diffPixels = pixelmatch(
    current.data,
    baseline.data,
    diff.data,
    current.width,
    current.height,
    { threshold: pixelThreshold },
  );
  if (diffPixels > 0) {
    writePng(diffPath, diff);
  }
  return { diffPixels, reason: "" };
};

const waitForStoryReady = async (page) => {
  await page.waitForSelector("[data-uik-story-root]", { state: "attached" });
  await page.waitForFunction(() => {
    const storyRoot = document.querySelector("[data-uik-story-root]");
    const captureRoot = document.querySelector("#storybook-root");
    if (!storyRoot || !captureRoot) return false;
    if (storyRoot.querySelector('[aria-busy="true"]')) return false;
    if (storyRoot.childElementCount === 0) return false;
    return captureRoot.getClientRects().length > 0;
  });
  await page.evaluate(async () => {
    if (document.fonts) {
      await document.fonts.ready;
    }
  });
};

const captureVisuals = async ({ baseUrl, stories }) => {
  const browser = await chromium.launch();
  const failures = [];
  const runId = new Date().toISOString().replace(/[:.]/g, "-");
  const diffRoot = path.join(
    repoRoot,
    ".ato",
    "runs",
    "artifacts",
    "visual-diffs",
    runId,
  );

  try {
    for (const variant of variants) {
      const context = await browser.newContext({
        viewport: viewPort,
        deviceScaleFactor,
        colorScheme: variant.theme === "dark" ? "dark" : "light",
        forcedColors: variant.forcedColors,
        reducedMotion: "reduce",
        locale: "en-US",
      });

      for (const story of stories) {
        const storyId = story.id;
        const globals = `theme:${variant.theme};density:${variant.density}`;
        const url = `${baseUrl}/iframe.html?id=${storyId}&viewMode=story&globals=${encodeURIComponent(
          globals,
        )}`;
        const page = await context.newPage();
        const variantSlug = [
          `theme-${normalizeSlug(variant.theme)}`,
          `density-${normalizeSlug(variant.density)}`,
          `forced-colors-${normalizeSlug(variant.forcedColors)}`,
        ].join("__");
        process.stdout.write(`Capturing ${storyId} (${variantSlug})...\n`);
        await page.goto(url, { waitUntil: "domcontentloaded" });
        await waitForStoryReady(page);

        const locator = page.locator("#storybook-root");
        const storyDir = path.join(snapshotRoot, storyId);
        const snapshotPath = path.join(storyDir, `${variantSlug}.png`);
        const currentBuffer = await locator.screenshot();
        const current = PNG.sync.read(currentBuffer);

        if (updateSnapshots || !fs.existsSync(snapshotPath)) {
          if (!updateSnapshots && !fs.existsSync(snapshotPath)) {
            failures.push({
              storyId,
              variant: variantSlug,
              reason: "missing baseline (run with --update)",
            });
          } else {
            writePng(snapshotPath, current);
          }
        } else {
          const baseline = readPng(snapshotPath);
          const diffPath = path.join(
            diffRoot,
            storyId,
            `${variantSlug}.diff.png`,
          );
          const { diffPixels, reason } = comparePngs({
            current,
            baseline,
            diffPath,
          });
          if (diffPixels > maxDiffPixels) {
            const currentPath = path.join(
              diffRoot,
              storyId,
              `${variantSlug}.current.png`,
            );
            writePng(currentPath, current);
            failures.push({
              storyId,
              variant: variantSlug,
              reason: reason || `diff pixels ${diffPixels} > ${maxDiffPixels}`,
            });
          }
        }
        await page.close();
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  return failures;
};

const main = async () => {
  runCommand("storybook build", "npm", ["run", "build-storybook"]);
  if (!fs.existsSync(storybookRoot)) {
    throw new Error("storybook-static output missing after build.");
  }

  const entries = readStoryIndex();
  const visualStories = entries
    .filter((entry) => entry?.type === "story")
    .filter((entry) => getTags(entry).has("visual"))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));

  if (visualStories.length < 6 || visualStories.length > 12) {
    throw new Error(
      `Expected 6-12 visual stories; found ${visualStories.length}.`,
    );
  }

  ensureDir(snapshotRoot);
  const { server, port } = await serveStatic(storybookRoot);
  const baseUrl = `http://127.0.0.1:${port}`;
  let failures = [];
  try {
    failures = await captureVisuals({ baseUrl, stories: visualStories });
  } finally {
    server.close();
  }

  if (failures.length) {
    console.error("Visual regression failures:");
    failures.forEach((failure) => {
      console.error(
        `- ${failure.storyId} (${failure.variant}): ${failure.reason}`,
      );
    });
    process.exit(1);
  }

  process.stdout.write(
    `Visual regression snapshots verified: ${visualStories.length} stories × ${variants.length} variants.\n`,
  );
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
