import { mountDocsApp } from "./app";

const appRoot = document.getElementById("app");
if (!appRoot) {
  throw new Error("Docs root element not found.");
}

const startApp = async () => {
  const { createBreakpointObserver } =
    await import("@ismail-elkorchi/ui-tokens");
  createBreakpointObserver();
  await mountDocsApp(appRoot);
};
if ("requestAnimationFrame" in window) {
  requestAnimationFrame(() => {
    globalThis.setTimeout(() => {
      void startApp();
    }, 0);
  });
} else {
  globalThis.setTimeout(() => {
    void startApp();
  }, 0);
}
