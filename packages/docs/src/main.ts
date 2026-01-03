import { createBreakpointObserver } from "@ismail-elkorchi/ui-tokens";

import { mountDocsApp } from "./app";

const appRoot = document.getElementById("app");
if (!appRoot) {
  throw new Error("Docs root element not found.");
}

mountDocsApp(appRoot);
createBreakpointObserver();
