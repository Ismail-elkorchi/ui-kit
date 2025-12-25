import {css} from 'lit';

export const styles = css`
  :host {
    display: block;
  }

  .nav {
    display: flex;
    flex-direction: column;
    gap: var(--uik-space-0);
    width: 100%;
    box-sizing: border-box;
  }

  .item {
    display: flex;
    align-items: center;
    gap: var(--uik-component-nav-item-gap);
    min-height: var(--uik-component-nav-item-height);
    width: 100%;
    box-sizing: border-box;
  }

  .toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--uik-component-nav-item-height);
    height: var(--uik-component-nav-item-height);
    padding: var(--uik-space-0);
    border: var(--uik-border-width-0) solid transparent;
    background: none;
    color: oklch(var(--uik-component-nav-toggle-fg));
    cursor: pointer;
  }

  .toggle:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 var(--uik-focus-ring-offset-default) oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0 calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
        oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
  }

  .link,
  .label {
    flex: 1 1 auto;
    min-width: var(--uik-space-0);
    display: inline-flex;
    align-items: center;
    gap: var(--uik-component-nav-item-gap);
    padding-inline: var(--uik-component-nav-item-padding-x);
    padding-block: var(--uik-component-nav-item-padding-y);
    border-radius: var(--uik-component-nav-item-radius);
    border: var(--uik-border-width-0) solid oklch(var(--uik-component-nav-item-bg));
    background-color: oklch(var(--uik-component-nav-item-bg));
    font-family: var(--uik-typography-font-family-sans);
    font-size: var(--uik-typography-font-size-2);
    font-weight: var(--uik-typography-font-weight-medium);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-component-nav-text-default));
    text-decoration: none;
    cursor: pointer;
  }

  .label {
    background-color: transparent;
    border-color: transparent;
  }

  .link:hover {
    background-color: oklch(var(--uik-component-nav-item-hover-bg));
    color: oklch(var(--uik-component-nav-text-hover));
  }

  .link[data-current='true'] {
    background-color: oklch(var(--uik-component-nav-item-active-bg));
    color: oklch(var(--uik-component-nav-text-active));
  }

  .link[data-disabled='true']:hover,
  .label[data-disabled='true']:hover {
    background-color: oklch(var(--uik-component-nav-item-bg));
    color: oklch(var(--uik-component-nav-text-default));
  }

  .link[data-disabled='true'],
  .label[data-disabled='true'],
  .toggle:disabled {
    cursor: not-allowed;
    opacity: var(--uik-field-disabled-opacity);
  }

  .link:focus-visible,
  .label:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 var(--uik-focus-ring-offset-default) oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0 calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
        oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
  }

  @media (forced-colors: active) {
    .link:focus-visible,
    .label:focus-visible,
    .toggle:focus-visible {
      outline: var(--uik-border-width-1) solid currentcolor;
      outline-offset: var(--uik-space-1);
      box-shadow: none;
    }
  }
`;
