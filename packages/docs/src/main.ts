import { mountDocsApp } from "./app";

const appRoot = document.getElementById("app");
if (!appRoot) {
  throw new Error("Docs root element not found.");
}

void mountDocsApp(appRoot);

const scheduleBreakpointObserver = () => {
  const run = () => {
    void import("@ismail-elkorchi/ui-tokens").then(
      ({ createBreakpointObserver }) => {
        createBreakpointObserver();
      },
    );
  };
  if ("requestIdleCallback" in window) {
    (
      window as Window & {
        requestIdleCallback: (
          callback: IdleRequestCallback,
          options?: IdleRequestOptions,
        ) => number;
      }
    ).requestIdleCallback(run);
  } else {
    globalThis.setTimeout(run, 0);
  }
};

scheduleBreakpointObserver();
