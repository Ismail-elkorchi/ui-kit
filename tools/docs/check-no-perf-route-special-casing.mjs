import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..");
const appPath = path.join(repoRoot, "apps/docs/src/app.ts");

const run = async () => {
  const contents = await fs.readFile(appPath, "utf8");
  const forbidden = ["perf-shell", "perf-primitives"];
  const hits = forbidden.filter((needle) => contents.includes(needle));
  if (hits.length > 0) {
    throw new Error(
      `Docs perf route special-casing detected in ${appPath}: ${hits.join(", ")}`,
    );
  }
  process.stdout.write("Docs perf route guard: ok\n");
};

await run();
