import "@ismail-elkorchi/ui-tokens/index.css";
import { beforeEach, describe, expect, it } from "vitest";

import type { UikHeading } from "../src/atomic/content/uik-heading";
import "../src/atomic/content/uik-heading";

const nextFrame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

const getLineHeight = (element: HTMLElement) => {
  const value = getComputedStyle(element).getPropertyValue(
    "--uik-heading-line-height-2",
  );
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Expected line-height token, got: ${value}`);
  }
  return parsed;
};

const buildHeading = (options: {
  density?: "compact" | "comfortable";
  leading?: "compact" | "roomy";
  level?: number;
}) => {
  const wrapper = document.createElement("div");
  if (options.density) {
    wrapper.setAttribute("data-uik-density", options.density);
  }
  const heading = document.createElement("uik-heading") as UikHeading;
  heading.setAttribute("level", String(options.level ?? 2));
  if (options.leading) {
    heading.setAttribute("leading", options.leading);
  }
  heading.textContent = "Section heading";
  wrapper.append(heading);
  document.body.append(wrapper);
  return heading;
};

describe("uik-heading density and leading", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("uses tighter line-height when data-uik-density=compact", async () => {
    const defaultHeading = buildHeading({ level: 2 });
    const compactHeading = buildHeading({ level: 2, density: "compact" });

    await defaultHeading.updateComplete;
    await compactHeading.updateComplete;
    await nextFrame();

    const defaultLineHeight = getLineHeight(defaultHeading);
    const compactLineHeight = getLineHeight(compactHeading);

    expect(compactLineHeight).toBeLessThan(defaultLineHeight);
  });

  it("uses roomy line-height when leading=roomy", async () => {
    const defaultHeading = buildHeading({ level: 2 });
    const roomyHeading = buildHeading({ level: 2, leading: "roomy" });

    await defaultHeading.updateComplete;
    await roomyHeading.updateComplete;
    await nextFrame();

    const defaultLineHeight = getLineHeight(defaultHeading);
    const roomyLineHeight = getLineHeight(roomyHeading);

    expect(roomyLineHeight).toBeGreaterThan(defaultLineHeight);
  });
});
