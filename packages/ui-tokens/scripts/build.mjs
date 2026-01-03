/**
 * @file build.mjs
 * @description Terrazzo-based build pipeline for ui-tokens.
 */

import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { defineConfig, parse, build as terrazzoBuild } from "@terrazzo/parser";
import css from "@terrazzo/plugin-css";

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(here, "..");
const distDir = path.join(pkgRoot, "dist");
const srcDir = path.join(pkgRoot, "src");
const resolverPath = path.join(pkgRoot, "tokens", "uik.resolver.json");

const args = new Set(process.argv.slice(2));
const resolvedOnly = args.has("--resolved-only");

const cwdUrl = pathToFileURL(`${pkgRoot}${path.sep}`);

function toKebab(segment) {
  return segment
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

function getCssVarName(tokenId) {
  return `--uik-${tokenId.split(".").map(toKebab).join("-")}`;
}

async function listTokenFiles(dir) {
  const absolute = path.join(pkgRoot, dir);
  const entries = await readdir(absolute, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort()
    .map((name) => path.join(absolute, name));
}

async function readJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function extractReducedMotionVars(cssText) {
  const matches = new Set();
  for (const line of cssText.split("\n")) {
    const match = line.match(/--uik-motion-(duration|delay)-[a-z0-9-]+/);
    if (match) {
      matches.add(match[0]);
    }
  }
  return [...matches].sort();
}

function injectReducedMotion(cssText) {
  const vars = extractReducedMotionVars(cssText);
  if (vars.length === 0) return cssText;

  const reduceLines = vars.map((name) => `      ${name}: 0ms;`);
  const reduceLinesInline = vars.map((name) => `    ${name}: 0ms;`);
  const snippet = [
    "",
    "  @media (prefers-reduced-motion: reduce) {",
    "    :root {",
    ...reduceLines,
    "    }",
    "  }",
    "",
    "  :where([data-uik-motion='reduced']) {",
    ...reduceLinesInline,
    "  }",
    "",
  ].join("\n");

  const insertIndex = cssText.lastIndexOf("\n}");
  if (insertIndex === -1) return cssText;
  return `${cssText.slice(0, insertIndex)}${snippet}${cssText.slice(insertIndex)}`;
}

function formatFixed(value, decimals) {
  if (typeof value !== "number" || Number.isNaN(value)) return String(value);
  return value.toFixed(decimals);
}

function formatOklchRaw(value) {
  const [l, c, h] = value.components ?? [];
  return `${formatFixed(l, 2)} ${formatFixed(c, 3)} ${formatFixed(h, 0)}`;
}

function oklchRawTransform(token) {
  if (token.$type !== "color") return undefined;
  const value = token.$value;
  if (value?.colorSpace !== "oklch" || !Array.isArray(value.components))
    return undefined;
  return formatOklchRaw(value);
}

function oklchWrappedTransform(token) {
  if (token.$type !== "color") return undefined;
  const value = token.$value;
  if (value?.colorSpace !== "oklch" || !Array.isArray(value.components))
    return undefined;
  return `oklch(${formatOklchRaw(value)})`;
}

function buildLayerBlock(selector, varMap, { colorScheme } = {}) {
  const hasVars = varMap && varMap.size > 0;
  if (!hasVars && !colorScheme) return "";
  const entries = hasVars ? [...varMap.entries()] : [];
  entries.sort(([a], [b]) => a.localeCompare(b, "en"));
  const lines = entries.map(([name, value]) => `    ${name}: ${value};`);
  if (colorScheme) {
    lines.unshift(`    color-scheme: ${colorScheme};`);
  }
  return ["@layer base {", `  ${selector} {`, ...lines, "  }", "}"].join("\n");
}

function wrapMedia(query, block) {
  if (!block) return "";
  return [`@media ${query} {`, block, "}"].join("\n");
}

function parseVarMap(cssText) {
  const map = new Map();
  const regex = /(--uik-[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let match;
  while ((match = regex.exec(cssText))) {
    map.set(match[1], match[2].trim());
  }
  return map;
}

function diffVarMap(currentMap, baselineMap) {
  const diff = new Map();
  for (const [name, value] of currentMap.entries()) {
    const baselineValue = baselineMap.get(name);
    if (baselineValue !== value) {
      diff.set(name, value);
    }
  }
  return diff;
}

function resolveVarValue(value, varMap, stack = new Set()) {
  if (!value || typeof value !== "string") return value;
  const regex = /var\(\s*(--uik-[a-z0-9-]+)\s*(?:,[^)]+)?\)/gi;
  return value.replace(regex, (match, name) => {
    if (stack.has(name)) return match;
    if (!varMap.has(name)) return match;
    const replacement = varMap.get(name);
    stack.add(name);
    const resolved = resolveVarValue(replacement, varMap, stack);
    stack.delete(name);
    return resolved;
  });
}

function resolveVarMap(varMap) {
  const resolved = new Map();
  for (const [name, value] of varMap.entries()) {
    resolved.set(name, resolveVarValue(value, varMap));
  }
  return resolved;
}

function contentsToString(contents) {
  if (typeof contents === "string") return contents;
  return Buffer.from(contents).toString("utf8");
}

function normalizeOutputs(outputs) {
  if (Array.isArray(outputs)) return outputs;
  if (outputs?.outputFiles) return outputs.outputFiles;
  return [];
}

function findOutputByName(outputs, filename) {
  return outputs.find(
    (output) =>
      output.filename === filename ||
      output.filename.endsWith(`/${filename}`) ||
      output.filename.endsWith(`\\${filename}`),
  );
}

async function terrazzoBuildCssText(
  tokenFiles,
  filename,
  baseSelector,
  transform,
) {
  const config = defineConfig(
    {
      tokens: tokenFiles,
      plugins: [
        css({
          filename,
          baseSelector,
          variableName: (token) => getCssVarName(token.id),
          transform,
        }),
      ],
    },
    { cwd: cwdUrl },
  );

  const inputs = await Promise.all(
    tokenFiles.map(async (file) => ({
      filename: pathToFileURL(file),
      src: await readFile(file, "utf8"),
    })),
  );

  const { tokens, sources } = await parse(inputs, { config });
  const outputs = normalizeOutputs(
    await terrazzoBuild(tokens, { sources, config }),
  );
  const output = findOutputByName(outputs, filename);
  if (!output) {
    const names = outputs.map((entry) => entry.filename).join(", ");
    throw new Error(
      `Terrazzo build missing output ${filename}. Outputs: ${names}`,
    );
  }
  return contentsToString(output.contents);
}

const parseCache = new Map();

async function parseTokenFiles(files) {
  const cacheKey = files.join("|");
  if (parseCache.has(cacheKey)) return parseCache.get(cacheKey);

  const inputs = await Promise.all(
    files.map(async (file) => ({
      filename: pathToFileURL(file),
      src: await readFile(file, "utf8"),
    })),
  );

  const config = defineConfig({ tokens: files, plugins: [] }, { cwd: cwdUrl });
  const { tokens } = await parse(inputs, { config });
  parseCache.set(cacheKey, tokens);
  return tokens;
}

const tailwindRules = [
  {
    namespace: "color",
    match: (key, type) => type === "color",
    name: (key) => toKebab(stripPrefix(key, "color.")),
    value: (key) => {
      if (key === "scrim.color") {
        return `oklch(var(${getCssVarName("scrim.color")})/var(${getCssVarName("scrim.opacity")}))`;
      }
      return `oklch(var(${getCssVarName(key)}))`;
    },
  },
  {
    namespace: "shadow",
    match: (key, type) => type === "shadow",
    name: (key) => toKebab(stripPrefix(key, "shadow.")),
    value: (key) => `var(${getCssVarName(key)})`,
  },
  {
    namespace: "radius",
    match: (key, type) =>
      type === "dimension" &&
      (key.startsWith("radius.") ||
        key.endsWith(".radius") ||
        key.includes(".radius.")),
    name: (key) => toKebab(stripPrefix(key, "radius.")),
    value: (key) => `var(${getCssVarName(key)})`,
  },
  {
    namespace: "border-width",
    match: (key) =>
      key.startsWith("border.width.") ||
      key.includes("borderWidth") ||
      key === "separator.thickness",
    name: (key) => toKebab(stripPrefix(key, "border.width.")),
    value: (key) => `var(${getCssVarName(key)})`,
  },
  {
    namespace: "outline-width",
    match: (key) =>
      key.startsWith("outline.width.") ||
      key === "focus.ring.width" ||
      key.includes("focusRingWidth"),
    name: (key) => toKebab(stripPrefix(key, "outline.width.")),
    value: (key) => `var(${getCssVarName(key)})`,
  },
  {
    namespace: "font",
    match: (key) => key.includes("fontFamily"),
    name: (key) => toKebab(stripPrefix(key, "typography.fontFamily.")),
    value: (key) => `var(${getCssVarName(key)})`,
  },
  {
    namespace: "font-weight",
    match: (key) => key.includes("fontWeight"),
    name: (key) => toKebab(stripPrefix(key, "typography.fontWeight.")),
    value: (key) => `var(${getCssVarName(key)})`,
  },
  {
    namespace: "text",
    match: (key) => key.includes("fontSize"),
    name: (key) => toKebab(stripPrefix(key, "typography.fontSize.")),
    value: (key) => `var(${getCssVarName(key)})`,
  },
  {
    namespace: "leading",
    match: (key) => key.includes("lineHeight"),
    name: (key) => toKebab(stripPrefix(key, "typography.lineHeight.")),
    value: (key) => `var(${getCssVarName(key)})`,
  },
  {
    namespace: "tracking",
    match: (key) => key.includes("letterSpacing"),
    name: (key) => toKebab(stripPrefix(key, "typography.letterSpacing.")),
    value: (key) => `var(${getCssVarName(key)})`,
  },
  {
    namespace: "ease",
    match: (key) =>
      key.startsWith("motion.ease.") || key.includes("transitionEase"),
    name: (key) => toKebab(stripPrefix(key, "motion.ease.")),
    value: (key) => `var(${getCssVarName(key)})`,
  },
  {
    namespace: "duration",
    match: (key) =>
      key.startsWith("motion.duration.") || key.includes("transitionDuration"),
    name: (key) => toKebab(stripPrefix(key, "motion.duration.")),
    value: (key) => `var(${getCssVarName(key)})`,
  },
  {
    namespace: "delay",
    match: (key) => key.startsWith("motion.delay."),
    name: (key) => toKebab(stripPrefix(key, "motion.delay.")),
    value: (key) => `var(${getCssVarName(key)})`,
  },
  {
    namespace: "transition",
    match: (key) => key.startsWith("motion.transition."),
    name: (key) => toKebab(stripPrefix(key, "motion.transition.")),
    value: (key) => `var(${getCssVarName(key)})`,
  },
  {
    namespace: "opacity",
    match: (key, type) =>
      type === "number" &&
      (key.startsWith("opacity.") || key.endsWith(".opacity")),
    name: (key) => toKebab(stripPrefix(key, "opacity.")),
    value: (key) => `var(${getCssVarName(key)})`,
  },
  {
    namespace: "blur",
    match: (key) => key.startsWith("blur."),
    name: (key) => toKebab(stripPrefix(key, "blur.")),
    value: (key) => `var(${getCssVarName(key)})`,
  },
  {
    namespace: "z",
    match: (key) => key.startsWith("z."),
    name: (key) => toKebab(stripPrefix(key, "z.")),
    value: (key) => `var(${getCssVarName(key)})`,
  },
  {
    namespace: "spacing",
    match: (key, type) => type === "dimension",
    name: (key) => toKebab(stripAnyPrefix(key, ["space.", "size.", "layout."])),
    value: (key) => `var(${getCssVarName(key)})`,
  },
];

function stripPrefix(value, prefix) {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

function stripAnyPrefix(value, prefixes) {
  for (const prefix of prefixes) {
    if (value.startsWith(prefix)) return value.slice(prefix.length);
  }
  return value;
}

function buildTailwindTheme(tokens) {
  const lines = new Map();

  for (const token of Object.values(tokens)) {
    const key = token.id;
    if (!key) continue;
    const type = token.$type ?? null;

    for (const rule of tailwindRules) {
      if (!rule.match(key, type)) continue;
      const name = rule.name(key, type);
      if (!name) break;
      const value = rule.value(key, type);
      lines.set(`--${rule.namespace}-uik-${name}`, value);
      break;
    }
  }

  const output = [...lines.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `  ${name}: ${value};`);

  return `@theme inline {\n${output.join("\n")}\n}`;
}

function buildTailwindStrictTheme(tokens) {
  const namespaces = [
    ...new Set(tailwindRules.map((rule) => rule.namespace)),
  ].sort();
  const resetLines = namespaces
    .map((name) => `  --${name}-*: initial;`)
    .join("\n");
  return `@theme {\n${resetLines}\n}\n\n${buildTailwindTheme(tokens)}`;
}

async function copySrcToDist() {
  await mkdir(distDir, { recursive: true });
  await copyFile(path.join(srcDir, "index.js"), path.join(distDir, "index.js"));
  await copyFile(
    path.join(srcDir, "index.d.ts"),
    path.join(distDir, "index.d.ts"),
  );
}

async function loadResolver() {
  const resolver = await readJson(resolverPath);
  return { resolver, resolverDir: path.dirname(resolverPath) };
}

function resolveRef(resolver, ref) {
  if (!ref?.startsWith("#/")) return null;
  const segments = ref.replace(/^#\//, "").split("/");
  let current = resolver;
  for (const segment of segments) {
    current = current?.[segment];
    if (!current) return null;
  }
  return current;
}

function resolveSourcesForContext(resolver, resolverDir, context) {
  const sources = [];

  for (const step of resolver.resolutionOrder ?? []) {
    const entry = resolveRef(resolver, step.$ref);
    if (!entry) continue;

    if (entry.sources) {
      for (const source of entry.sources) {
        if (source?.$ref) {
          sources.push(path.resolve(resolverDir, source.$ref));
        }
      }
      continue;
    }

    if (entry.contexts) {
      const modifierKey = step.$ref?.split("/").pop();
      const contextValue = modifierKey ? context[modifierKey] : undefined;
      const contextSources = entry.contexts?.[contextValue] ?? [];
      for (const source of contextSources) {
        if (source?.$ref) {
          sources.push(path.resolve(resolverDir, source.$ref));
        }
      }
    }
  }

  return sources;
}

function buildResolvedTokenTree(tokens, valuesById) {
  const output = {};
  const sortedTokens = Object.values(tokens).sort((a, b) =>
    a.id.localeCompare(b.id, "en"),
  );

  for (const token of sortedTokens) {
    const value = valuesById.get(token.id);
    if (value === undefined || value === null) continue;

    const entry = { $value: value, $type: token.$type };
    if (token.$description) entry.$description = token.$description;
    if (token.$deprecated) entry.$deprecated = token.$deprecated;

    const parts = token.id.split(".");
    let node = output;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const part = parts[i];
      node[part] ??= {};
      node = node[part];
    }
    node[parts[parts.length - 1]] = entry;
  }

  return output;
}

function buildValuesById(tokens, varMap) {
  const valuesById = new Map();
  for (const token of Object.values(tokens)) {
    const varName = getCssVarName(token.id);
    const value = varMap.get(varName);
    if (value !== undefined) {
      valuesById.set(token.id, value);
    }
  }
  return valuesById;
}

async function buildResolvedTokens() {
  const { resolver, resolverDir } = await loadResolver();
  const variants = [
    {
      name: "light.comfortable",
      context: { theme: "light", density: "comfortable" },
    },
    { name: "light.compact", context: { theme: "light", density: "compact" } },
    {
      name: "dark.comfortable",
      context: { theme: "dark", density: "comfortable" },
    },
    { name: "dark.compact", context: { theme: "dark", density: "compact" } },
  ];

  for (const variant of variants) {
    const sources = resolveSourcesForContext(
      resolver,
      resolverDir,
      variant.context,
    );
    const tokens = await parseTokenFiles(sources);
    const cssText = await terrazzoBuildCssText(
      sources,
      `_terrazzo.resolved.${variant.name}.css`,
      ":root",
      oklchWrappedTransform,
    );
    const varMap = parseVarMap(cssText);
    const resolvedMap = resolveVarMap(varMap);
    const valuesById = buildValuesById(tokens, resolvedMap);
    const resolvedTree = buildResolvedTokenTree(tokens, valuesById);

    await writeFile(
      path.join(distDir, `tokens.resolved.${variant.name}.json`),
      `${JSON.stringify(resolvedTree, null, 2)}\n`,
    );
  }
}

async function buildCssOutputs() {
  const [foundationSources, semanticSources, componentSources] =
    await Promise.all([
      listTokenFiles("tokens/foundation"),
      listTokenFiles("tokens/semantic"),
      listTokenFiles("tokens/components"),
    ]);

  const baseSources = [
    ...foundationSources,
    ...semanticSources,
    ...componentSources,
  ];

  const themeLightSources = [
    ...baseSources,
    path.join(pkgRoot, "tokens/themes/light.json"),
  ];
  const themeDarkSources = [
    ...baseSources,
    path.join(pkgRoot, "tokens/themes/dark.json"),
  ];
  const densityCompactSources = [
    ...baseSources,
    path.join(pkgRoot, "tokens/density/compact.json"),
  ];

  const foundationCssText = await terrazzoBuildCssText(
    foundationSources,
    "_terrazzo.foundation.css",
    ":root",
    oklchRawTransform,
  );
  const baseCssText = await terrazzoBuildCssText(
    baseSources,
    "_terrazzo.base.css",
    ":where(:root, [data-uik-theme])",
    oklchRawTransform,
  );
  const lightCssText = await terrazzoBuildCssText(
    themeLightSources,
    "_terrazzo.light.css",
    ":where(:root:not([data-uik-theme]), [data-uik-theme='light'])",
    oklchRawTransform,
  );
  const darkCssText = await terrazzoBuildCssText(
    themeDarkSources,
    "_terrazzo.dark.css",
    ":where([data-uik-theme='dark'])",
    oklchRawTransform,
  );
  const compactCssText = await terrazzoBuildCssText(
    densityCompactSources,
    "_terrazzo.compact.css",
    ":where([data-uik-density='compact'])",
    oklchRawTransform,
  );

  const foundationMap = parseVarMap(foundationCssText);
  const baseAllMap = parseVarMap(baseCssText);
  const lightAllMap = parseVarMap(lightCssText);
  const darkAllMap = parseVarMap(darkCssText);
  const compactAllMap = parseVarMap(compactCssText);

  const foundationVars = new Set(foundationMap.keys());
  const themeBaseMap = new Map(
    [...baseAllMap.entries()].filter(([name]) => !foundationVars.has(name)),
  );

  const baselineMap = new Map([
    ...foundationMap.entries(),
    ...themeBaseMap.entries(),
  ]);
  const lightDiffMap = diffVarMap(lightAllMap, baselineMap);
  const darkDiffMap = diffVarMap(darkAllMap, baselineMap);
  const compactDiffMap = diffVarMap(compactAllMap, baselineMap);

  const comfortableResetMap = new Map();
  for (const name of compactDiffMap.keys()) {
    const value = baselineMap.get(name);
    if (value !== undefined) {
      comfortableResetMap.set(name, value);
    }
  }

  const foundationBlock = injectReducedMotion(
    buildLayerBlock(":root", foundationMap),
  );
  const themeBaseBlock = buildLayerBlock(
    ":where(:root, [data-uik-theme])",
    themeBaseMap,
  );
  const lightBlock = buildLayerBlock(
    ":where(:root:not([data-uik-theme]), [data-uik-theme='light'])",
    lightDiffMap,
    { colorScheme: "light" },
  );
  const darkBlock = buildLayerBlock(
    ":where([data-uik-theme='dark'])",
    darkDiffMap,
    { colorScheme: "dark" },
  );
  const systemDarkBlock = wrapMedia(
    "(prefers-color-scheme: dark)",
    buildLayerBlock(":where(:root:not([data-uik-theme]))", darkDiffMap, {
      colorScheme: "dark",
    }),
  );
  const compactBlock = buildLayerBlock(
    ":where([data-uik-density='compact'])",
    compactDiffMap,
  );
  const comfortableBlock = buildLayerBlock(
    ":where(:root, [data-uik-density='comfortable'])",
    comfortableResetMap,
  );

  await mkdir(path.join(distDir, "themes"), { recursive: true });

  await writeFile(
    path.join(distDir, "themes/uik-theme-base.css"),
    `${themeBaseBlock}\n`,
  );
  await writeFile(
    path.join(distDir, "themes/uik-light.css"),
    [themeBaseBlock, lightBlock].filter(Boolean).join("\n\n") + "\n",
  );
  await writeFile(
    path.join(distDir, "themes/uik-dark.css"),
    [themeBaseBlock, darkBlock].filter(Boolean).join("\n\n") + "\n",
  );
  await writeFile(
    path.join(distDir, "themes/uik-density-comfortable.css"),
    `${comfortableBlock}\n`,
  );
  await writeFile(
    path.join(distDir, "themes/uik-density-compact.css"),
    `${compactBlock}\n`,
  );

  const baseCss = [
    foundationBlock,
    comfortableBlock,
    compactBlock,
    themeBaseBlock,
    lightBlock,
    darkBlock,
    systemDarkBlock,
  ]
    .filter(Boolean)
    .join("\n\n");

  await writeFile(path.join(distDir, "base.css"), `${baseCss}\n`);

  const baseTokens = await parseTokenFiles(baseSources);
  const tailwindCompat = buildTailwindTheme(baseTokens);
  const tailwindStrict = buildTailwindStrictTheme(baseTokens);
  await writeFile(
    path.join(distDir, "uik-tailwind.compat.css"),
    `${tailwindCompat}\n`,
  );
  await writeFile(
    path.join(distDir, "uik-tailwind.strict.css"),
    `${tailwindStrict}\n`,
  );
  await writeFile(
    path.join(distDir, "index.css"),
    `${baseCss}\n\n${tailwindStrict}\n`,
  );
}

async function runBuild() {
  if (!resolvedOnly) {
    await rm(distDir, { recursive: true, force: true });
  }

  await mkdir(distDir, { recursive: true });
  await buildResolvedTokens();
  await copySrcToDist();

  if (!resolvedOnly) {
    await buildCssOutputs();
  }
}

runBuild().catch((error) => {
  console.error("ui-tokens: Build failed:", error.message);
  process.exit(1);
});
