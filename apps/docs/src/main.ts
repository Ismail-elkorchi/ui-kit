import { mountDocsApp } from "./app";

const appRoot = document.getElementById("app");
if (!appRoot) {
  throw new Error("Docs root element not found.");
}

void mountDocsApp(appRoot);
