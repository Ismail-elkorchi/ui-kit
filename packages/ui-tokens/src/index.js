const THEME_ATTRIBUTE = "data-uik-theme";
const DENSITY_ATTRIBUTE = "data-uik-density";
const BREAKPOINT_ATTRIBUTE = "data-uik-breakpoint";

const DEFAULT_BREAKPOINTS = ["sm", "md", "lg", "xl"];

function setTheme(element, theme) {
  if (!element || typeof element.setAttribute !== "function") return;
  if (theme == null || theme === "") {
    if (typeof element.removeAttribute === "function") {
      element.removeAttribute(THEME_ATTRIBUTE);
    }
    return;
  }
  element.setAttribute(THEME_ATTRIBUTE, String(theme));
}

function setDensity(element, density) {
  if (!element || typeof element.setAttribute !== "function") return;
  if (density == null || density === "") {
    if (typeof element.removeAttribute === "function") {
      element.removeAttribute(DENSITY_ATTRIBUTE);
    }
    return;
  }
  element.setAttribute(DENSITY_ATTRIBUTE, String(density));
}

function toKebab(segment) {
  return segment
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

function getCssVarName(token) {
  const key = typeof token === "string" ? token : String(token);
  return `--uik-${key.split(".").map(toKebab).join("-")}`;
}

function resolveBreakpoints(source, names) {
  const styleTarget = source ?? document.documentElement;
  if (!styleTarget || typeof getComputedStyle !== "function") return [];
  const styles = getComputedStyle(styleTarget);
  return names
    .map((name) => ({
      name,
      value: styles.getPropertyValue(`--uik-breakpoint-${name}`).trim(),
    }))
    .filter((entry) => entry.value);
}

function createBreakpointObserver(options = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return { update() {}, disconnect() {} };
  }

  const target = options.target ?? document.documentElement;
  const source = options.source ?? target;
  const names =
    Array.isArray(options.names) && options.names.length > 0
      ? options.names
      : DEFAULT_BREAKPOINTS;
  const attribute = options.attribute ?? BREAKPOINT_ATTRIBUTE;

  if (!target || typeof target.setAttribute !== "function") {
    return { update() {}, disconnect() {} };
  }

  const breakpoints = resolveBreakpoints(source, names);
  if (breakpoints.length === 0) {
    return { update() {}, disconnect() {} };
  }

  const queries = breakpoints.map((entry) => ({
    ...entry,
    query: `(max-width: ${entry.value})`,
    mql: window.matchMedia(`(max-width: ${entry.value})`),
  }));

  const update = () => {
    const match = queries.find((entry) => entry.mql.matches);
    const next = match?.name ?? queries[queries.length - 1]?.name;
    if (next) {
      target.setAttribute(attribute, next);
    } else if (typeof target.removeAttribute === "function") {
      target.removeAttribute(attribute);
    }
  };

  const addListener = (mql, handler) => {
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handler);
    } else if (typeof mql.addListener === "function") {
      mql.addListener(handler);
    }
  };

  const removeListener = (mql, handler) => {
    if (typeof mql.removeEventListener === "function") {
      mql.removeEventListener("change", handler);
    } else if (typeof mql.removeListener === "function") {
      mql.removeListener(handler);
    }
  };

  queries.forEach((entry) => addListener(entry.mql, update));
  update();

  return {
    update,
    disconnect() {
      queries.forEach((entry) => removeListener(entry.mql, update));
    },
  };
}

export {
  THEME_ATTRIBUTE,
  DENSITY_ATTRIBUTE,
  BREAKPOINT_ATTRIBUTE,
  setTheme,
  setDensity,
  getCssVarName,
  createBreakpointObserver,
};
