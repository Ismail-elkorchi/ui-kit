export const THEME_ATTRIBUTE: 'data-uik-theme';
export const DENSITY_ATTRIBUTE: 'data-uik-density';
export function setTheme(element: Element, theme: 'light' | 'dark'): void;
export function setDensity(element: Element, density: 'comfortable' | 'compact'): void;
export function getCssVarName(token: string): string;
