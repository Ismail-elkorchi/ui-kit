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

function resolveSystemTheme() {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveThemeValue(value, fallback) {
  const candidate = value == null || value === "" ? fallback : value;
  if (candidate == null || candidate === "") return null;
  if (candidate === "system") return resolveSystemTheme();
  return String(candidate);
}

function resolveDensityValue(value, fallback) {
  const candidate = value == null || value === "" ? fallback : value;
  if (candidate == null || candidate === "") return null;
  return String(candidate);
}

function getSafeStorage(candidate) {
  try {
    const storage =
      candidate ?? (typeof window !== "undefined" ? window.localStorage : null);
    if (!storage) return null;
    const testKey = "__uik_storage_test__";
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return storage;
  } catch {
    return null;
  }
}

function createUikPreferencesController(options = {}) {
  const root =
    options.root ??
    (typeof document !== "undefined" ? document.documentElement : null);
  const storageKey = options.storageKey ?? "uik-preferences";
  const storage = getSafeStorage(options.storage);
  const defaults = {
    theme: options.defaults?.theme ?? "system",
    density: options.defaults?.density ?? "comfortable",
  };
  const persist = options.persist ?? false;
  let state = {
    theme: resolveThemeValue(null, defaults.theme),
    density: resolveDensityValue(null, defaults.density),
  };

  const applyToRoot = (next) => {
    if (!root) return;
    setTheme(root, next.theme);
    setDensity(root, next.density);
  };

  const load = () => {
    if (!storage) return null;
    try {
      const raw = storage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return {
        theme: parsed.theme ?? null,
        density: parsed.density ?? null,
      };
    } catch {
      return null;
    }
  };

  const save = (next = state) => {
    if (!storage) return false;
    try {
      storage.setItem(
        storageKey,
        JSON.stringify({
          theme: next.theme ?? null,
          density: next.density ?? null,
        }),
      );
      return true;
    } catch {
      return false;
    }
  };

  const apply = (next) => {
    const source = next ?? load() ?? defaults;
    state = {
      theme: resolveThemeValue(source.theme, defaults.theme),
      density: resolveDensityValue(source.density, defaults.density),
    };
    applyToRoot(state);
    if (persist) save(state);
    return { ...state };
  };

  const setThemePreference = (theme) => {
    state = {
      ...state,
      theme: resolveThemeValue(theme, defaults.theme),
    };
    applyToRoot(state);
    if (persist) save(state);
    return { ...state };
  };

  const setDensityPreference = (density) => {
    state = {
      ...state,
      density: resolveDensityValue(density, defaults.density),
    };
    applyToRoot(state);
    if (persist) save(state);
    return { ...state };
  };

  return {
    apply,
    load,
    save,
    setTheme: setThemePreference,
    setDensity: setDensityPreference,
  };
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
  createUikPreferencesController,
  getCssVarName,
  createBreakpointObserver,
};
