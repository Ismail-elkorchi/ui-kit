import { describe, expect, it } from "vitest";

import { styles as dialogStyles } from "../src/atomic/overlay/uik-dialog/styles";
import { styles as popoverStyles } from "../src/atomic/overlay/uik-popover/styles";
import { styles as spinnerStyles } from "../src/atomic/feedback/uik-spinner/styles";
import { styles as surfaceStyles } from "../src/atomic/layout/uik-surface/styles";
import { styles as menubarStyles } from "../src/composed/collection/uik-menubar/styles";
import { styles as menuStyles } from "../src/composed/collection/uik-menu/styles";
import { styles as navRailStyles } from "../src/composed/collection/uik-nav-rail/styles";
import { styles as tooltipStyles } from "../src/composed/overlay/uik-tooltip/styles";

const getCssText = (styles: unknown) => {
  if (styles && typeof styles === "object" && "cssText" in styles) {
    return (styles as { cssText: string }).cssText;
  }
  return String(styles);
};

describe("forced-colors and reduced-motion fallbacks", () => {
  it("includes forced-colors fallbacks for overlay and shell surfaces", () => {
    const dialogCss = getCssText(dialogStyles);
    const popoverCss = getCssText(popoverStyles);
    const tooltipCss = getCssText(tooltipStyles);
    const menuCss = getCssText(menuStyles);
    const menubarCss = getCssText(menubarStyles);
    const surfaceCss = getCssText(surfaceStyles);
    const navRailCss = getCssText(navRailStyles);
    const spinnerCss = getCssText(spinnerStyles);

    [
      dialogCss,
      popoverCss,
      tooltipCss,
      menuCss,
      menubarCss,
      surfaceCss,
      navRailCss,
      spinnerCss,
    ].forEach((cssText) => {
      expect(cssText).toContain("@media (forced-colors: active)");
    });

    expect(dialogCss).toContain("CanvasText");
    expect(popoverCss).toContain("Canvas");
    expect(tooltipCss).toContain("Canvas");
    expect(menuCss).toContain("Canvas");
    expect(menubarCss).toContain("Canvas");
    expect(surfaceCss).toContain("CanvasText");
    expect(navRailCss).toContain("Highlight");
    expect(spinnerCss).toContain("CanvasText");
  });

  it("disables spinner animation when reduced motion is requested", () => {
    const spinnerCss = getCssText(spinnerStyles);
    expect(spinnerCss).toContain("@media (prefers-reduced-motion: reduce)");
    expect(spinnerCss).toContain("animation: none");
  });
});
