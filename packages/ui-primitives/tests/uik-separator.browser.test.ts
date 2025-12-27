import { beforeEach, describe, expect, it } from "vitest";

import type { UikSeparator } from "../src/atomic/layout/uik-separator";
import "../src/atomic/layout/uik-separator";

describe("uik-separator", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders a vertical separator with aria-orientation", async () => {
    const separator = document.createElement("uik-separator") as UikSeparator;
    separator.orientation = "vertical";
    document.body.append(separator);

    await separator.updateComplete;

    const line = separator.shadowRoot?.querySelector('[part="base"]');
    expect(line?.getAttribute("role")).toBe("separator");
    expect(line?.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("renders horizontal separator as hr", async () => {
    const separator = document.createElement("uik-separator") as UikSeparator;
    document.body.append(separator);

    await separator.updateComplete;

    const line = separator.shadowRoot?.querySelector('[part="base"]');
    expect(line?.tagName).toBe("HR");
  });
});
