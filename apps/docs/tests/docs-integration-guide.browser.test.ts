import "@ismail-elkorchi/ui-tokens/base.css";
import { describe, expect, it } from "vitest";

describe("integration guide", () => {
  it("register entrypoints are loadable", async () => {
    await import("@ismail-elkorchi/ui-primitives/register");
    await import("@ismail-elkorchi/ui-patterns/register");
    await import("@ismail-elkorchi/ui-shell/register");

    expect(customElements.get("uik-button")).toBeTruthy();
    expect(customElements.get("uik-section-card")).toBeTruthy();
    expect(customElements.get("uik-shell-layout")).toBeTruthy();
  });
});
