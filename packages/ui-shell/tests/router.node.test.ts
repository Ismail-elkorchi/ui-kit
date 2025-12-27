import { describe, expect, it, vi } from "vitest";

import type { UikShellNavigationDetail } from "../index";
import { UIK_SHELL_NAVIGATION_EVENT, UikShellRouter } from "../index";

class TestCustomEvent<T> extends Event {
  readonly detail: T;

  constructor(type: string, eventInit?: CustomEventInit<T>) {
    super(type, eventInit);
    this.detail = eventInit?.detail as T;
  }
}

const globalWindow = new EventTarget();
(globalThis as { window?: EventTarget }).window = globalWindow;
(globalThis as { CustomEvent?: typeof TestCustomEvent }).CustomEvent =
  TestCustomEvent as unknown as typeof CustomEvent;

describe("UikShellRouter", () => {
  it("tracks current route and emits navigation events", () => {
    const router = new UikShellRouter({
      routes: [
        { id: "page1", label: "Page 1" },
        { id: "page2", label: "Page 2" },
      ],
      initialView: "page1",
    });

    expect(router.current.view).toBe("page1");

    const subscriber = vi.fn();
    router.subscribe(subscriber);

    const windowListener = vi.fn();
    globalWindow.addEventListener(
      UIK_SHELL_NAVIGATION_EVENT,
      windowListener as EventListener,
    );

    router.navigate("page2");

    expect(subscriber).toHaveBeenCalledWith({
      view: "page2",
      subview: undefined,
    });
    expect(windowListener).toHaveBeenCalled();

    const event = windowListener.mock.calls[0]?.[0] as
      | CustomEvent<UikShellNavigationDetail>
      | undefined;
    expect(event?.detail.from.view).toBe("page1");
    expect(event?.detail.to.view).toBe("page2");
    expect(event?.detail.route.id).toBe("page2");
  });
});
