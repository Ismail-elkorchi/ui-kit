import "@ismail-elkorchi/ui-tokens/index.css";
import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import type { UikResizablePanelsResizeDetail } from "../src/atomic/layout/uik-resizable-panels";
import "../src/atomic/layout/uik-resizable-panels";

const createRect = (width: number, height: number): DOMRect =>
  new DOMRect(0, 0, width, height);

const setRect = (element: HTMLElement, width: number, height: number) => {
  element.getBoundingClientRect = () => createRect(width, height);
};

describe("uik-resizable-panels", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("resizes with keyboard and emits detail", async () => {
    const panels = document.createElement("uik-resizable-panels");
    panels.startSize = 200;
    panels.minStartSize = 120;
    panels.minEndSize = 160;
    panels.step = 10;
    panels.stepLarge = 40;
    document.body.append(panels);

    await panels.updateComplete;

    const base = panels.shadowRoot?.querySelector<HTMLElement>('[part="base"]');
    const handle =
      panels.shadowRoot?.querySelector<HTMLElement>('[part="handle"]');
    if (!base || !handle) throw new Error("Expected handle and base.");
    setRect(panels, 600, 400);
    setRect(base, 600, 400);
    setRect(handle, 10, 400);

    let lastDetail: UikResizablePanelsResizeDetail | null = null;
    panels.addEventListener("resizable-panels-resize", (event) => {
      lastDetail = (event as CustomEvent<UikResizablePanelsResizeDetail>)
        .detail;
    });

    handle.focus();
    await userEvent.keyboard("{ArrowRight}");
    await panels.updateComplete;

    expect(panels.startSize).toBe(210);
    expect(lastDetail?.source).toBe("keyboard");
    expect(lastDetail?.phase).toBe("move");
    expect(lastDetail?.startSize).toBe(210);
    expect(lastDetail?.endSize).toBe(600 - 10 - 210);
    expect(lastDetail?.ratio).toBeGreaterThan(0);

    await userEvent.keyboard("{Shift>}{ArrowRight}{/Shift}");
    await panels.updateComplete;
    expect(panels.startSize).toBe(250);
  });

  it("emits pointer resize phases", async () => {
    const panels = document.createElement("uik-resizable-panels");
    panels.startSize = 200;
    panels.minStartSize = 120;
    panels.minEndSize = 160;
    document.body.append(panels);

    await panels.updateComplete;

    const base = panels.shadowRoot?.querySelector<HTMLElement>('[part="base"]');
    const handle =
      panels.shadowRoot?.querySelector<HTMLElement>('[part="handle"]');
    if (!base || !handle) throw new Error("Expected handle and base.");
    setRect(panels, 600, 400);
    setRect(base, 600, 400);
    setRect(handle, 10, 400);

    const phases: string[] = [];
    panels.addEventListener("resizable-panels-resize", (event) => {
      phases.push(
        (event as CustomEvent<UikResizablePanelsResizeDetail>).detail.phase,
      );
    });

    handle.dispatchEvent(
      new PointerEvent("pointerdown", {
        button: 0,
        clientX: 200,
        pointerId: 1,
        bubbles: true,
      }),
    );
    handle.dispatchEvent(
      new PointerEvent("pointermove", {
        button: 0,
        clientX: 240,
        pointerId: 1,
        bubbles: true,
      }),
    );
    handle.dispatchEvent(
      new PointerEvent("pointerup", {
        button: 0,
        clientX: 240,
        pointerId: 1,
        bubbles: true,
      }),
    );

    await panels.updateComplete;

    expect(phases).toEqual(["start", "move", "end"]);
    expect(panels.startSize).toBe(240);
  });
});
