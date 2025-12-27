import { beforeEach, describe, expect, it } from "vitest";

import type { UikBox } from "../src/atomic/layout/uik-box";
import type { UikStack } from "../src/atomic/layout/uik-stack";
import type { UikSurface } from "../src/atomic/layout/uik-surface";
import "../src/atomic/layout/uik-box";
import "../src/atomic/layout/uik-stack";
import "../src/atomic/layout/uik-surface";

describe("uik layout primitives", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders box with inline flag", async () => {
    const box = document.createElement("uik-box") as UikBox;
    box.inline = true;
    document.body.append(box);

    await box.updateComplete;

    expect(box.hasAttribute("inline")).toBe(true);
    const base = box.shadowRoot?.querySelector('[part="base"]');
    expect(base).not.toBeNull();
  });

  it("renders stack attributes", async () => {
    const stack = document.createElement("uik-stack") as UikStack;
    stack.direction = "horizontal";
    stack.gap = "5";
    stack.align = "center";
    stack.justify = "between";
    document.body.append(stack);

    await stack.updateComplete;

    expect(stack.getAttribute("direction")).toBe("horizontal");
    expect(stack.getAttribute("gap")).toBe("5");
    expect(stack.getAttribute("align")).toBe("center");
    expect(stack.getAttribute("justify")).toBe("between");
  });

  it("renders surface variants and borders", async () => {
    const surface = document.createElement("uik-surface") as UikSurface;
    surface.variant = "card";
    surface.bordered = true;
    document.body.append(surface);

    await surface.updateComplete;

    expect(surface.getAttribute("variant")).toBe("card");
    expect(surface.hasAttribute("bordered")).toBe(true);
    const base = surface.shadowRoot?.querySelector('[part="base"]');
    expect(base).not.toBeNull();
  });
});
