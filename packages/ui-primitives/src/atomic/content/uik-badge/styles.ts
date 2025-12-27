import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
  }

  .badge {
    --_uik-badge-bg: oklch(var(--uik-component-badge-default-bg));
    --_uik-badge-fg: oklch(var(--uik-component-badge-default-fg));
    --_uik-badge-border-color: oklch(var(--uik-component-badge-default-border));
    --_uik-badge-shadow: var(--uik-component-badge-default-shadow);

    display: inline-flex;
    align-items: center;
    padding: var(--uik-component-badge-base-padding-y)
      var(--uik-component-badge-base-padding-x);
    font-size: var(--uik-component-badge-base-font-size);
    font-weight: var(--uik-component-badge-base-font-weight);
    line-height: var(--uik-component-badge-base-line-height);
    color: var(--_uik-badge-fg);
    background-color: var(--_uik-badge-bg);
    border-color: var(--_uik-badge-border-color);
    border-style: var(--uik-border-style-solid);
    border-width: var(--uik-component-badge-base-border-width);
    border-radius: var(--uik-component-badge-base-radius);
    box-shadow: var(--_uik-badge-shadow);
    transition:
      color var(--uik-motion-transition-colors),
      background-color var(--uik-motion-transition-colors),
      border-color var(--uik-motion-transition-colors),
      box-shadow var(--uik-motion-transition-shadow);
  }

  .variant-default {
    --_uik-badge-bg: oklch(var(--uik-component-badge-default-bg));
    --_uik-badge-fg: oklch(var(--uik-component-badge-default-fg));
    --_uik-badge-border-color: oklch(var(--uik-component-badge-default-border));
    --_uik-badge-shadow: var(--uik-component-badge-default-shadow);
  }

  .variant-secondary {
    --_uik-badge-bg: oklch(var(--uik-component-badge-secondary-bg));
    --_uik-badge-fg: oklch(var(--uik-component-badge-secondary-fg));
    --_uik-badge-border-color: oklch(
      var(--uik-component-badge-secondary-border)
    );
    --_uik-badge-shadow: var(--uik-component-badge-secondary-shadow);
  }

  .variant-danger {
    --_uik-badge-bg: oklch(var(--uik-component-badge-danger-bg));
    --_uik-badge-fg: oklch(var(--uik-component-badge-danger-fg));
    --_uik-badge-border-color: oklch(var(--uik-component-badge-danger-border));
    --_uik-badge-shadow: var(--uik-component-badge-danger-shadow);
  }

  .variant-outline {
    --_uik-badge-bg: oklch(var(--uik-component-badge-outline-bg));
    --_uik-badge-fg: oklch(var(--uik-component-badge-outline-fg));
    --_uik-badge-border-color: oklch(var(--uik-component-badge-outline-border));
    --_uik-badge-shadow: var(--uik-component-badge-outline-shadow);
  }
`;
