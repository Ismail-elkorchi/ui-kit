interface MediaQueryState {
  query: MediaQueryList;
  value: boolean;
}

const setupQuery = (media: string): MediaQueryState | null => {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return null;
  }
  const query = window.matchMedia(media);
  const state: MediaQueryState = { query, value: query.matches };
  const handler = (event: MediaQueryListEvent) => {
    state.value = event.matches;
  };
  query.addEventListener("change", handler);
  return state;
};

let forcedColorsState: MediaQueryState | null | undefined;
let reducedMotionState: MediaQueryState | null | undefined;
let lastMatchMedia: typeof window.matchMedia | null = null;

const ensureMatchMedia = () => {
  if (typeof window === "undefined") return;
  if (window.matchMedia === lastMatchMedia) return;
  lastMatchMedia = window.matchMedia;
  forcedColorsState = undefined;
  reducedMotionState = undefined;
};

export const getForcedColors = () => {
  ensureMatchMedia();
  if (forcedColorsState === undefined) {
    forcedColorsState = setupQuery("(forced-colors: active)");
  }
  if (!forcedColorsState) return false;
  forcedColorsState.value = forcedColorsState.query.matches;
  return forcedColorsState.value;
};

export const getReducedMotion = () => {
  ensureMatchMedia();
  if (reducedMotionState === undefined) {
    reducedMotionState = setupQuery("(prefers-reduced-motion: reduce)");
  }
  if (!reducedMotionState) return false;
  reducedMotionState.value = reducedMotionState.query.matches;
  return reducedMotionState.value;
};
