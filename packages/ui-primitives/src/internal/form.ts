export type FormValue = string | null;

export function getElementInternals(
  host: HTMLElement,
): ElementInternals | null {
  if (typeof host.attachInternals !== "function") return null;
  try {
    return host.attachInternals();
  } catch {
    return null;
  }
}

export function reflectFormValue(host: HTMLElement, value: FormValue) {
  if (value === null) {
    if (host.hasAttribute("value")) host.removeAttribute("value");
    return;
  }

  if (host.getAttribute("value") !== value) {
    host.setAttribute("value", value);
  }
}

export function dispatchFormFallbackEvent(
  host: HTMLElement,
  internals: ElementInternals | null,
  type: "input" | "change",
  event?: Event,
) {
  if (internals) return;
  if (event?.composed) return;
  host.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
}
