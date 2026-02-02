import path from "node:path";
import { defineConfig } from "vite";

const splitUikChunks = (id: string, packageName: string) => {
  const marker = `${path.sep}${packageName}${path.sep}dist${path.sep}src${path.sep}`;
  if (!id.includes(marker)) return null;
  const [, rest] = id.split(marker);
  if (!rest) return `${packageName}-shared`;
  const match = rest.match(/(uik-[^\\/]+)[\\/]/);
  if (match) {
    return `${packageName}-${match[1]}`;
  }
  if (rest.startsWith(`internal${path.sep}`)) {
    return `${packageName}-internal`;
  }
  return `${packageName}-shared`;
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
