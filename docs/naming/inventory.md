# UIK Naming Inventory

## Change policy
- Naming coherence overrides external consumer compatibility; public exports may be renamed or removed.

## @ismail-elkorchi/ui-tokens
### Public JS API (src/index.d.ts)
- THEME_ATTRIBUTE (`data-uik-theme`)
- DENSITY_ATTRIBUTE (`data-uik-density`)
- ThemeName, DensityName
- setTheme, setDensity, getCssVarName

### Public asset exports (package.json#exports)
- `./base.css`
- `./index.css`
- `./uik-tailwind.strict.css`
- `./uik-tailwind.compat.css`
- `./themes/uik-theme-base.css`
- `./themes/uik-light.css`
- `./themes/uik-dark.css`
- `./themes/uik-density-comfortable.css`
- `./themes/uik-density-compact.css`
- `./tokens.resolved.light.comfortable.json`
- `./tokens.resolved.light.compact.json`
- `./tokens.resolved.dark.comfortable.json`
- `./tokens.resolved.dark.compact.json`

### Token namespaces
- foundation: blur, border, color, layout, motion, opacity, outline, radius, shadow, size, spacing, typography, z
- semantic: border, elevation, field, focus, icon, intent, scrim, scrollbar, selection, separator, state, surface, text
- components: alert, badge, box, button, checkbox, heading, icon, input, link, progress, radio, radio-group, select, shell, spinner, stack, surface, switch, text, textarea
- themes: light, dark
- density: comfortable, compact

## @ismail-elkorchi/ui-primitives
### Public exports (package.json#exports)
- `./index`, `./register`
- `./uik-alert`
- `./uik-box`
- `./uik-badge`
- `./uik-button`
- `./uik-checkbox`
- `./uik-dialog`
- `./uik-heading`
- `./uik-icon`
- `./uik-input`
- `./uik-link`
- `./uik-popover`
- `./uik-progress`
- `./uik-radio`
- `./uik-radio-group`
- `./uik-separator`
- `./uik-select`
- `./uik-spinner`
- `./uik-stack`
- `./uik-surface`
- `./uik-switch`
- `./uik-text`
- `./uik-textarea`
- `./uik-tooltip`
- `./uik-visually-hidden`

## @ismail-elkorchi/ui-shell
### Public exports (package.json#exports)
- `./index`, `./register`, `./router`
- `./layout`, `./activity-bar`, `./sidebar`, `./secondary-sidebar`, `./status-bar`
- `./tailwind-source.css`

### Router contract
- UIK_SHELL_NAVIGATION_EVENT -> `uik-shell:navigation`
- UikShellRoute
- UikShellLocation
- UikShellNavigationDetail
- UikShellNavigationListener
- UikShellRouterConfig

### Shell events
- `activity-bar-select` from `uik-shell-activity-bar`
- `secondary-sidebar-close` from `uik-shell-secondary-sidebar`

## Unused items
- External consumer compatibility is not a blocker; unused public exports can be renamed or removed.
