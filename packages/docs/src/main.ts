import "@ismail-elkorchi/ui-tokens/base.css";
import { createBreakpointObserver } from "@ismail-elkorchi/ui-tokens";

import { mountDocsApp } from "./app";
import "./styles.css";

const appRoot = document.getElementById("app");
if (!appRoot) {
  throw new Error("Docs root element not found.");
}

mountDocsApp(appRoot);
createBreakpointObserver();
