import path from "node:path";
import { defineConfig } from "vite";

const nonBlockingStylesheetLinks = () => ({
  name: "docs-non-blocking-stylesheets",
  enforce: "post",
  transformIndexHtml(html, ctx) {
    if (!ctx?.bundle) return html;
    return html.replace(
      /<link\s+rel="stylesheet"([^>]*?)>/g,
      (match, attrs) => {
        if (attrs.includes("media=")) return match;
        const safeAttrs = attrs
          .replace(/\smedia="[^"]*"/g, "")
          .replace(/\sonload="[^"]*"/g, "");
        return [
          `<link rel="preload" as="style"${safeAttrs}>`,
          `<link rel="stylesheet"${safeAttrs} media="print" onload="this.media='all'">`,
          `<noscript><link rel="stylesheet"${safeAttrs}></noscript>`,
        ].join("");
      },
    );
  },
});

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
  plugins: [nonBlockingStylesheetLinks()],
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
