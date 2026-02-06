import "@ismail-elkorchi/ui-tokens/index.css";
import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import "../index";

describe("uik-shell-secondary-sidebar", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("dispatches close event on Escape", async () => {
    const sidebar = document.createElement("uik-shell-secondary-sidebar");
    sidebar.isOpen = true;
    sidebar.innerHTML = `<button type="button">Inside</button>`;
    document.body.append(sidebar);

    await sidebar.updateComplete;

    let closeEvents = 0;
    let reason = "";
    sidebar.addEventListener("secondary-sidebar-close", (event) => {
      closeEvents += 1;
      reason = (event as CustomEvent<{ reason: string }>).detail.reason;
    });

    sidebar.querySelector("button")?.focus();
    await userEvent.keyboard("{Escape}");

    expect(closeEvents).toBe(1);
    expect(reason).toBe("escape");
  });

  it("restores focus to configured target or the previously focused element", async () => {
    const returnTarget = document.createElement("button");
    returnTarget.id = "return-target";
    returnTarget.type = "button";
    returnTarget.textContent = "Toggle secondary";
    document.body.append(returnTarget);

    const sidebar = document.createElement("uik-shell-secondary-sidebar");
    sidebar.focusReturnTarget = "#return-target";
    sidebar.innerHTML = `<button type="button">Inside</button>`;
    document.body.append(sidebar);

    sidebar.addEventListener("secondary-sidebar-close", () => {
      sidebar.isOpen = false;
    });

    returnTarget.focus();
    sidebar.isOpen = true;
    await sidebar.updateComplete;

    sidebar.querySelector("button")?.focus();
    await userEvent.keyboard("{Escape}");
    await sidebar.updateComplete;

    expect(document.activeElement).toBe(returnTarget);

    sidebar.focusReturnTarget = null;

    const fallbackTarget = document.createElement("button");
    fallbackTarget.id = "fallback-target";
    fallbackTarget.type = "button";
    fallbackTarget.textContent = "Fallback focus target";
    document.body.append(fallbackTarget);

    fallbackTarget.focus();
    sidebar.innerHTML = `<button type="button">Inside (fallback)</button>`;
    sidebar.isOpen = true;
    await sidebar.updateComplete;

    sidebar.querySelector("button")?.focus();
    await userEvent.keyboard("{Escape}");
    await sidebar.updateComplete;

    expect(document.activeElement).toBe(fallbackTarget);
  });

  it("retains slotted content across close and reopen", async () => {
    const sidebar = document.createElement("uik-shell-secondary-sidebar");
    sidebar.innerHTML = `<div data-outline-item>Outline item</div>`;
    document.body.append(sidebar);

    sidebar.isOpen = true;
    await sidebar.updateComplete;

    const initialItem = sidebar.querySelector<HTMLElement>(
      "[data-outline-item]",
    );
    expect(initialItem?.textContent).toContain("Outline item");

    sidebar.isOpen = false;
    await sidebar.updateComplete;
    expect(sidebar.querySelector("[data-shell-slot='default']")).toBeTruthy();

    sidebar.isOpen = true;
    await sidebar.updateComplete;

    const reopenedItem = sidebar.querySelector<HTMLElement>(
      "[data-outline-item]",
    );
    expect(reopenedItem).toBe(initialItem);
    expect(reopenedItem?.textContent).toContain("Outline item");
  });
});
