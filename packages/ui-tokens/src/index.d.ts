export const THEME_ATTRIBUTE: 'data-uik-theme';
export const DENSITY_ATTRIBUTE: 'data-uik-density';
export const BREAKPOINT_ATTRIBUTE: 'data-uik-breakpoint';
export type ThemeName = 'light' | 'dark' | (string & {});
export type DensityName = 'comfortable' | 'compact' | (string & {});
export type BreakpointName = 'sm' | 'md' | 'lg' | 'xl' | (string & {});
export function setTheme(element: Element | null | undefined, theme?: ThemeName | null): void;
export function setDensity(element: Element | null | undefined, density?: DensityName | null): void;
export function getCssVarName(token: string): string;
export function createBreakpointObserver(options?: {
  target?: Element | null;
  source?: Element | null;
  names?: BreakpointName[];
  attribute?: string;
}): {
  update: () => void;
  disconnect: () => void;
};
