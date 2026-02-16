import { beforeEach, describe, expect, it } from "vitest";

import { createUikScrollSpyController } from "../index";

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const waitForActiveId = async (
  getActiveId: () => string | null,
  expectedId: string,
  timeoutMs = 2000,
) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (getActiveId() === expectedId) return;
    await nextFrame();
  }
  throw new Error(`Expected active section to be ${expectedId}.`);
};

describe("createUikScrollSpyController", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("tracks active sections inside a scroll container", async () => {
    const container = document.createElement("div");
    container.style.height = "220px";
    container.style.overflow = "auto";
    container.style.position = "relative";
    container.innerHTML = `
      <section id="one" style="height: 220px;">One</section>
      <section id="two" style="height: 220px;">Two</section>
      <section id="three" style="height: 220px;">Three</section>
    `;
    document.body.append(container);

    let activeId: string | null = null;
    const controller = createUikScrollSpyController({
      root: container,
      scope: container,
      targets: "section[id]",
      activationOffset: 16,
      onActiveIdChange: (id) => {
        activeId = id;
      },
    });
    controller.connect();

    await waitForActiveId(() => activeId, "one");

    const second = document.getElementById("two");
    if (!second) throw new Error("Expected second section.");
    const nextTop = second.offsetTop;
    container.scrollTo({ top: nextTop });
    await waitForActiveId(() => activeId, "two");

    const third = document.getElementById("three");
    if (!third) throw new Error("Expected third section.");
    container.scrollTo({ top: third.offsetTop });
    await waitForActiveId(() => activeId, "three");

    controller.disconnect();
    expect(controller.getActiveId()).toBeNull();
  });
});
