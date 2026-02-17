import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import "../src/atomic/control/uik-pagination";

describe("uik-pagination", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders pages and emits pagination-change", async () => {
    const pagination = document.createElement("uik-pagination");
    pagination.page = 2;
    pagination.pageCount = 5;
    document.body.append(pagination);

    await pagination.updateComplete;

    const current = pagination.shadowRoot?.querySelector(
      'button[aria-current="page"]',
    );
    const currentText = current?.textContent ?? "";
    expect(currentText.trim()).toBe("2");

    let selected = 0;
    pagination.addEventListener("pagination-change", (event) => {
      selected = (event as CustomEvent<{ page: number }>).detail.page;
    });

    const next =
      pagination.shadowRoot?.querySelector<HTMLButtonElement>("button.next");
    if (!next) throw new Error("Expected next button.");
    await userEvent.click(next);

    expect(selected).toBe(3);
  });

  it("clamps pages within the page count", async () => {
    const pagination = document.createElement("uik-pagination");
    pagination.page = 12;
    pagination.pageCount = 3;
    document.body.append(pagination);

    await pagination.updateComplete;

    expect(pagination.page).toBe(3);
  });
});
