const THEME_ATTRIBUTE = 'data-uik-theme';
const DENSITY_ATTRIBUTE = 'data-uik-density';

function setTheme(element, theme) {
  if (!element || typeof element.setAttribute !== 'function') return;
  if (theme == null || theme === '') {
    if (typeof element.removeAttribute === 'function') {
      element.removeAttribute(THEME_ATTRIBUTE);
    }
    return;
  }
  element.setAttribute(THEME_ATTRIBUTE, String(theme));
}

function setDensity(element, density) {
  if (!element || typeof element.setAttribute !== 'function') return;
  if (density == null || density === '') {
    if (typeof element.removeAttribute === 'function') {
      element.removeAttribute(DENSITY_ATTRIBUTE);
    }
    return;
  }
  element.setAttribute(DENSITY_ATTRIBUTE, String(density));
}

function toKebab(segment) {
  return segment
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

function getCssVarName(token) {
  const key = typeof token === 'string' ? token : String(token);
  return `--uik-${key.split('.').map(toKebab).join('-')}`;
}

export { THEME_ATTRIBUTE, DENSITY_ATTRIBUTE, setTheme, setDensity, getCssVarName };
