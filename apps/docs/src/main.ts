import { mountDocsApp } from "./app";

const appRoot = document.getElementById("app");
if (!appRoot) {
  throw new Error("Docs root element not found.");
}

const startApp = async () => {
  const tokensPromise = import("@ismail-elkorchi/ui-tokens").then(
    ({ createBreakpointObserver }) => {
      const run = () => createBreakpointObserver();
      if ("requestIdleCallback" in window) {
        (
          window as Window & {
            requestIdleCallback: (
              callback: IdleRequestCallback,
              options?: IdleRequestOptions,
            ) => number;
          }
        ).requestIdleCallback(run, { timeout: 2000 });
      } else {
        globalThis.setTimeout(run, 0);
      }
    },
  );
  await mountDocsApp(appRoot);
  await tokensPromise;
};
void startApp();
