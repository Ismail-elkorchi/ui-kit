import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const lighthouseModule = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const lighthouse = lighthouseModule.default ?? lighthouseModule;
const { launch } = chromeLauncher;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
const docsRoot = path.join(repoRoot, "apps/docs");
const artifactsRoot = path.join(repoRoot, ".ato/runs/artifacts");
const viteBin = path.join(repoRoot, "node_modules/.bin/vite");

const defaultChecks = {
  performance: true,
  accessibility: true,
  bestPractices: true,
  seo: true,
  lcp: true,
  cls: true,
  tbt: true,
  inp: true,
};

const buildChecks = (overrides = {}) => ({ ...defaultChecks, ...overrides });

const routes = [
  {
    id: "perf-shell",
    path: "/lab/perf-shell",
    checks: buildChecks({ seo: false }),
  },
  {
    id: "perf-primitives",
    path: "/lab/perf-primitives",
    checks: buildChecks({ seo: false }),
  },
  {
    id: "seo-getting-started",
    path: "/docs/getting-started",
  },
];

const thresholds = {
  performance: 0.8,
  accessibility: 0.95,
  bestPractices: 0.95,
  seo: 0.8,
  lcpMs: 2500,
  cls: 0.02,
  tbtMs: 300,
  inpMs: 200,
};

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

const getAuditValue = (lhr, ids, { required = true } = {}) => {
  const idList = Array.isArray(ids) ? ids : [ids];
  for (const id of idList) {
    const audit = lhr.audits?.[id];
    if (audit && typeof audit.numericValue === "number") {
      return audit.numericValue;
    }
  }
  if (!required) return null;
  throw new Error(`Missing audit value for ${idList.join(", ")}.`);
};

const ensureReportArray = (report) => {
  if (Array.isArray(report)) return report;
  return [report];
};

const writeReports = async (outputDir, routeId, reportJson, reportHtml) => {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, `${routeId}.json`),
    `${reportJson}\n`,
  );
  await fs.writeFile(path.join(outputDir, `${routeId}.html`), reportHtml);
};

const formatScore = (value) => `${Math.round(value * 100)}`;

const runLighthouse = async (baseUrl, route, chrome) => {
  const options = {
    port: chrome.port,
    logLevel: "error",
    output: ["json", "html"],
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
  };

  const config = {
    extends: "lighthouse:default",
    settings: {
      formFactor: "desktop",
      throttlingMethod: "devtools",
      screenEmulation: {
        mobile: false,
        width: 1365,
        height: 768,
        deviceScaleFactor: 1,
        disabled: false,
      },
    },
  };

  const url = `${baseUrl}${route.path}`;
  const result = await lighthouse(url, options, config);
  if (!result || !result.lhr || !result.report) {
    throw new Error(`Lighthouse failed for ${route.path}.`);
  }

  const [jsonReport, htmlReport] = ensureReportArray(result.report);
  const lhr = result.lhr;
  const metrics = {
    performance: lhr.categories?.performance?.score ?? 0,
    accessibility: lhr.categories?.accessibility?.score ?? 0,
    bestPractices: lhr.categories?.["best-practices"]?.score ?? 0,
    seo: lhr.categories?.seo?.score ?? 0,
    lcpMs: getAuditValue(lhr, [
      "largest-contentful-paint",
      "metrics/largest-contentful-paint",
    ]),
    cls: getAuditValue(lhr, [
      "cumulative-layout-shift",
      "metrics/cumulative-layout-shift",
    ]),
    tbtMs: getAuditValue(lhr, [
      "total-blocking-time",
      "metrics/total-blocking-time",
    ]),
    inpMs: getAuditValue(
      lhr,
      ["interaction-to-next-paint", "metrics/interaction-to-next-paint"],
      { required: false },
    ),
  };

  return { url, metrics, reportJson: jsonReport, reportHtml: htmlReport };
};

const evaluateThresholds = (routeId, metrics, checks = defaultChecks) => {
  const failures = [];
  const enabled = (key) => checks[key] !== false;
  if (enabled("performance") && metrics.performance < thresholds.performance) {
    failures.push(
      `${routeId}: performance ${formatScore(metrics.performance)} < ${formatScore(
        thresholds.performance,
      )}`,
    );
  }
  if (
    enabled("accessibility") &&
    metrics.accessibility < thresholds.accessibility
  ) {
    failures.push(
      `${routeId}: accessibility ${formatScore(
        metrics.accessibility,
      )} < ${formatScore(thresholds.accessibility)}`,
    );
  }
  if (
    enabled("bestPractices") &&
    metrics.bestPractices < thresholds.bestPractices
  ) {
    failures.push(
      `${routeId}: best-practices ${formatScore(
        metrics.bestPractices,
      )} < ${formatScore(thresholds.bestPractices)}`,
    );
  }
  if (enabled("seo") && metrics.seo < thresholds.seo) {
    failures.push(
      `${routeId}: seo ${formatScore(metrics.seo)} < ${formatScore(
        thresholds.seo,
      )}`,
    );
  }
  if (enabled("lcp") && metrics.lcpMs > thresholds.lcpMs) {
    failures.push(
      `${routeId}: LCP ${metrics.lcpMs.toFixed(0)}ms > ${thresholds.lcpMs}ms`,
    );
  }
  if (enabled("cls") && metrics.cls > thresholds.cls) {
    failures.push(
      `${routeId}: CLS ${metrics.cls.toFixed(3)} > ${thresholds.cls}`,
    );
  }
  if (enabled("tbt") && metrics.tbtMs > thresholds.tbtMs) {
    failures.push(
      `${routeId}: TBT ${metrics.tbtMs.toFixed(0)}ms > ${thresholds.tbtMs}ms`,
    );
  }
  if (
    enabled("inp") &&
    metrics.inpMs !== null &&
    metrics.inpMs > thresholds.inpMs
  ) {
    failures.push(
      `${routeId}: INP ${metrics.inpMs.toFixed(0)}ms > ${thresholds.inpMs}ms`,
    );
  }
  return failures;
};

const run = async () => {
  await ensureBuild();
  const port = 4177;
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
    previewLog += String(chunk);
  };
  preview.stdout?.on("data", capturePreviewOutput);
  preview.stderr?.on("data", capturePreviewOutput);

  const outputDir = path.join(
    artifactsRoot,
    "docs-lighthouse",
    String(Date.now()),
  );

  let chrome;
  try {
    await waitForServer(preview);
    const chromePath = chromium.executablePath();
    chrome = await launch({
      chromePath,
      chromeFlags: [
        "--headless=new",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
      logLevel: "silent",
    });

    const baseUrl = `http://127.0.0.1:${port}`;
    const failures = [];

    for (const route of routes) {
      const { metrics, reportJson, reportHtml } = await runLighthouse(
        baseUrl,
        route,
        chrome,
      );
      await writeReports(outputDir, route.id, reportJson, reportHtml);
      failures.push(...evaluateThresholds(route.id, metrics, route.checks));
      process.stdout.write(
        `Lighthouse ${route.id}: perf ${formatScore(metrics.performance)}, a11y ${formatScore(
          metrics.accessibility,
        )}, LCP ${metrics.lcpMs.toFixed(0)}ms, CLS ${metrics.cls.toFixed(
          3,
        )}, TBT ${metrics.tbtMs.toFixed(0)}ms${
          metrics.inpMs === null ? "" : `, INP ${metrics.inpMs.toFixed(0)}ms`
        }\n`,
      );
    }

    if (failures.length) {
      throw new Error(`Lighthouse thresholds failed:\n${failures.join("\n")}`);
    }

    process.stdout.write(`Lighthouse reports saved to ${outputDir}\n`);
  } catch (error) {
    if (previewLog.trim()) {
      process.stderr.write(previewLog);
    }
    throw error;
  } finally {
    if (chrome) {
      await chrome.kill();
    }
    preview.kill("SIGTERM");
  }
};

await run();
