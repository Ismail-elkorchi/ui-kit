import { describe, expect, it } from "vitest";

import * as primitives from "../index";
import "../register";

describe("ui-primitives exports", () => {
  it("re-exports primitives from the package index", () => {
    expect(primitives.UikButton).toBeDefined();
    expect(primitives.UikResizablePanels).toBeDefined();
    expect(primitives.UikTooltip).toBeDefined();
    expect(primitives.UikRadioGroup).toBeDefined();
    expect(primitives.UikListbox).toBeDefined();
    expect(primitives.UikOption).toBeDefined();
    expect(primitives.UikCombobox).toBeDefined();
    expect(primitives.UikTabs).toBeDefined();
    expect(primitives.UikTab).toBeDefined();
    expect(primitives.UikTabPanel).toBeDefined();
    expect(primitives.UikDescriptionList).toBeDefined();
    expect(primitives.UikPagination).toBeDefined();
    expect(primitives.UikCodeBlock).toBeDefined();
  });
});
