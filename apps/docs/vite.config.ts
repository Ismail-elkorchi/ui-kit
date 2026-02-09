import path from "node:path";
import { defineConfig } from "vite";

const normalizeModulePath = (value: string) => value.replace(/\\/g, "/");

const splitUikChunks = (id: string, packageName: string) => {
  const normalizedId = normalizeModulePath(id);
  const marker = `/${packageName}/dist/src/`;
  const markerIndex = normalizedId.indexOf(marker);
  if (markerIndex < 0) return null;
  const rest = normalizedId.slice(markerIndex + marker.length);
  if (!rest) return `${packageName}-shared`;

  const match = rest.match(/(uik-[^/]+)(?:\/|\.|$)/);
  if (match) {
    return `${packageName}-${match[1]}`;
  }

  if (rest.startsWith("internal/")) {
    const moduleName =
      rest
        .slice("internal/".length)
        .split("/")[0]
        ?.replace(/\.[a-z]+$/i, "") || "shared";
    return `${packageName}-internal-${moduleName}`;
  }

  return `${packageName}-shared`;
};

const splitLitChunks = (id: string) => {
  const normalizedId = normalizeModulePath(id);
  if (normalizedId.includes("/node_modules/lit/directives/style-map.js")) {
    return "lit-style-map";
  }
  if (normalizedId.includes("/node_modules/lit/directives/")) {
    return "lit-directives";
  }
  if (
    normalizedId.includes("/node_modules/lit/") ||
    normalizedId.includes("/node_modules/@lit/")
  ) {
    return "lit-core";
  }
  return null;
};

export default defineConfig({
  plugins: [],
  build: {
    manifest: true,
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const lit = splitLitChunks(id);
          if (lit) return lit;
          const primitives = splitUikChunks(id, "ui-primitives");
          if (primitives) return primitives;
          const shell = splitUikChunks(id, "ui-shell");
          if (shell) return shell;
          return undefined;
        },
      },
    },
  },
});
