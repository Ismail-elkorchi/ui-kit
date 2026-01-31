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

export default defineConfig({
  plugins: [nonBlockingStylesheetLinks()],
  build: {
    manifest: true,
    outDir: "dist",
    emptyOutDir: true,
  },
});
