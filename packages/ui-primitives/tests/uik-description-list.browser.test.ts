import "@ismail-elkorchi/ui-tokens/index.css";
import { beforeEach, describe, expect, it } from "vitest";

import type { UikDescriptionList } from "../src/atomic/content/uik-description-list";
import "../src/atomic/content/uik-description-list";

const buildList = (layout?: string) => {
  const list = document.createElement("uik-description-list");
  if (layout) {
    list.setAttribute("layout", layout);
  }
  list.style.width = "480px";
  list.innerHTML = `
    <dt>Queue</dt>
    <dd>Active</dd>
  `;
  document.body.append(list);
  return list;
};

const getPairRects = (list: UikDescriptionList) => {
  const term = list.querySelector("dt");
  const value = list.querySelector("dd");
  if (!term || !value) {
    throw new Error("Expected dt/dd pair in description list.");
  }
  return {
    term: term.getBoundingClientRect(),
    value: value.getBoundingClientRect(),
  };
};

const nextFrame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

const readPx = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getThreshold = (list: UikDescriptionList) => {
  const styles = getComputedStyle(list);
  const term = readPx(
    styles.getPropertyValue("--uik-component-description-list-term-width"),
  );
  const gap = readPx(
    styles.getPropertyValue("--uik-component-description-list-column-gap"),
  );
  return term + gap;
};

describe("uik-description-list responsive layout", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("uses columns by default when width exceeds term width plus gap", async () => {
    const list = buildList();
    await list.updateComplete;
    await nextFrame();
    const threshold = getThreshold(list);
    list.style.width = `${String(threshold + 40)}px`;
    await nextFrame();

    const { term, value } = getPairRects(list);

    expect(Math.round(term.top)).toBe(Math.round(value.top));
    expect(Math.round(value.left)).toBeGreaterThan(Math.round(term.left));
  });

  it("stacks terms and values when width is below term width plus gap", async () => {
    const list = buildList();
    await list.updateComplete;
    await nextFrame();
    const threshold = getThreshold(list);
    list.style.width = `${String(Math.max(0, threshold - 1))}px`;
    await nextFrame();

    const { term, value } = getPairRects(list);

    expect(Math.round(value.top)).toBeGreaterThan(Math.round(term.top));
    expect(Math.round(value.left)).toBe(Math.round(term.left));
  });

  it("honors layout=stacked regardless of breakpoint", async () => {
    const list = buildList("stacked");
    await list.updateComplete;
    await nextFrame();
    const threshold = getThreshold(list);
    list.style.width = `${String(threshold + 120)}px`;
    await nextFrame();

    const { term, value } = getPairRects(list);

    expect(Math.round(value.top)).toBeGreaterThan(Math.round(term.top));
    expect(Math.round(value.left)).toBe(Math.round(term.left));
  });
});
