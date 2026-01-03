import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    height: var(--uik-component-button-md-height);
  }

  :host([size="sm"]) {
    height: var(--uik-component-button-sm-height);
  }

  :host([size="lg"]) {
    height: var(--uik-component-button-lg-height);
  }

  :host([size="icon"]) {
    width: var(--uik-component-button-md-height);
    height: var(--uik-component-button-md-height);
  }

  button {
    --_uik-button-bg: oklch(var(--uik-component-button-solid-bg-default));
    --_uik-button-bg-hover: oklch(var(--uik-component-button-solid-bg-hover));
    --_uik-button-bg-active: oklch(var(--uik-component-button-solid-bg-active));
    --_uik-button-fg: oklch(var(--uik-component-button-solid-fg));
    --_uik-button-border-color: oklch(var(--uik-component-button-solid-border));
    --_uik-button-shadow: var(--uik-component-button-solid-shadow);
    --_uik-button-padding-x: var(--uik-component-button-md-padding-x);
    --_uik-button-padding-y: var(--uik-component-button-md-padding-y);
    --_uik-button-radius: var(--uik-component-button-md-radius);

    display: inline-flex;
    gap: var(--uik-component-button-base-gap);
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: var(--_uik-button-padding-y) var(--_uik-button-padding-x);
    font-family: var(--uik-component-button-base-font-family);
    font-size: var(--uik-component-button-base-font-size);
    font-weight: var(--uik-component-button-base-font-weight);
    line-height: var(--uik-component-button-base-line-height);
    color: var(--_uik-button-fg);
    white-space: nowrap;
    cursor: pointer;
    background-color: var(--_uik-button-bg);
    border-color: var(--_uik-button-border-color);
    border-style: var(--uik-border-style-solid);
    border-width: var(--uik-component-button-base-border-width);
    border-radius: var(--_uik-button-radius);
    box-shadow: var(--_uik-button-shadow);
    transition:
      color var(--uik-component-button-base-transition-duration)
        var(--uik-component-button-base-transition-ease),
      background-color var(--uik-component-button-base-transition-duration)
        var(--uik-component-button-base-transition-ease),
      border-color var(--uik-component-button-base-transition-duration)
        var(--uik-component-button-base-transition-ease),
      box-shadow var(--uik-motion-transition-shadow);
  }

  button:hover {
    color: var(--_uik-button-fg-hover, var(--_uik-button-fg));
    background-color: var(--_uik-button-bg-hover);
  }

  button:active {
    background-color: var(--_uik-button-bg-active);
  }

  button:focus-visible {
    outline: none;
    box-shadow:
      var(--_uik-button-shadow),
      0 0 0 var(--uik-component-button-base-focus-ring-offset)
        oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0
        calc(
          var(--uik-component-button-base-focus-ring-offset) +
            var(--uik-component-button-base-focus-ring-width)
        )
        oklch(
          var(--uik-component-button-base-focus-ring) /
            var(--uik-component-button-base-focus-ring-opacity)
        );
  }

  :host(:focus-visible) button {
    outline: none;
    box-shadow:
      var(--_uik-button-shadow),
      0 0 0 var(--uik-component-button-base-focus-ring-offset)
        oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0
        calc(
          var(--uik-component-button-base-focus-ring-offset) +
            var(--uik-component-button-base-focus-ring-width)
        )
        oklch(
          var(--uik-component-button-base-focus-ring) /
            var(--uik-component-button-base-focus-ring-opacity)
        );
  }

  button:disabled {
    pointer-events: none;
    opacity: var(--uik-component-button-base-disabled-opacity);
  }

  .size-default {
    --_uik-button-padding-x: var(--uik-component-button-md-padding-x);
    --_uik-button-padding-y: var(--uik-component-button-md-padding-y);
    --_uik-button-radius: var(--uik-component-button-md-radius);
  }

  .size-sm {
    --_uik-button-padding-x: var(--uik-component-button-sm-padding-x);
    --_uik-button-padding-y: var(--uik-component-button-sm-padding-y);
    --_uik-button-radius: var(--uik-component-button-sm-radius);
  }

  .size-lg {
    --_uik-button-padding-x: var(--uik-component-button-lg-padding-x);
    --_uik-button-padding-y: var(--uik-component-button-lg-padding-y);
    --_uik-button-radius: var(--uik-component-button-lg-radius);
  }

  .size-icon {
    --_uik-button-padding-x: var(--uik-space-0);
    --_uik-button-padding-y: var(--uik-space-0);
    --_uik-button-radius: var(--uik-component-button-md-radius);
  }

  .variant-solid {
    --_uik-button-bg: oklch(var(--uik-component-button-solid-bg-default));
    --_uik-button-bg-hover: oklch(var(--uik-component-button-solid-bg-hover));
    --_uik-button-bg-active: oklch(var(--uik-component-button-solid-bg-active));
    --_uik-button-fg: oklch(var(--uik-component-button-solid-fg));
    --_uik-button-border-color: oklch(var(--uik-component-button-solid-border));
    --_uik-button-shadow: var(--uik-component-button-solid-shadow);
  }

  .variant-danger {
    --_uik-button-bg: oklch(var(--uik-component-button-danger-bg-default));
    --_uik-button-bg-hover: oklch(var(--uik-component-button-danger-bg-hover));
    --_uik-button-bg-active: oklch(
      var(--uik-component-button-danger-bg-active)
    );
    --_uik-button-fg: oklch(var(--uik-component-button-danger-fg));
    --_uik-button-border-color: oklch(
      var(--uik-component-button-danger-border)
    );
    --_uik-button-shadow: var(--uik-component-button-danger-shadow);
  }

  .variant-outline {
    --_uik-button-bg: oklch(var(--uik-component-button-outline-bg-default));
    --_uik-button-bg-hover: oklch(var(--uik-component-button-outline-bg-hover));
    --_uik-button-bg-active: oklch(
      var(--uik-component-button-outline-bg-active)
    );
    --_uik-button-fg: oklch(var(--uik-component-button-outline-fg));
    --_uik-button-border-color: oklch(
      var(--uik-component-button-outline-border)
    );
    --_uik-button-shadow: var(--uik-component-button-outline-shadow);
  }

  .variant-secondary {
    --_uik-button-bg: oklch(var(--uik-component-button-secondary-bg-default));
    --_uik-button-bg-hover: oklch(
      var(--uik-component-button-secondary-bg-hover)
    );
    --_uik-button-bg-active: oklch(
      var(--uik-component-button-secondary-bg-active)
    );
    --_uik-button-fg: oklch(var(--uik-component-button-secondary-fg));
    --_uik-button-border-color: oklch(
      var(--uik-component-button-secondary-border)
    );
    --_uik-button-shadow: var(--uik-component-button-secondary-shadow);
  }

  .variant-ghost {
    --_uik-button-bg: oklch(var(--uik-component-button-ghost-bg-default));
    --_uik-button-bg-hover: oklch(var(--uik-component-button-ghost-bg-hover));
    --_uik-button-bg-active: oklch(var(--uik-component-button-ghost-bg-active));
    --_uik-button-fg: oklch(var(--uik-component-button-ghost-fg));
    --_uik-button-border-color: oklch(var(--uik-component-button-ghost-border));
    --_uik-button-shadow: var(--uik-component-button-ghost-shadow);
  }

  :host([muted]) .variant-ghost {
    --_uik-button-fg: oklch(var(--uik-text-muted));
    --_uik-button-fg-hover: oklch(var(--uik-component-button-ghost-fg));
  }

  :host([active]) .variant-ghost {
    --_uik-button-bg: oklch(var(--uik-component-button-ghost-bg-active));
    --_uik-button-bg-hover: oklch(var(--uik-component-button-ghost-bg-active));
  }

  .variant-link {
    --_uik-button-bg: oklch(var(--uik-component-button-link-bg-default));
    --_uik-button-bg-hover: oklch(var(--uik-component-button-link-bg-hover));
    --_uik-button-bg-active: oklch(var(--uik-component-button-link-bg-active));
    --_uik-button-fg: oklch(var(--uik-component-button-link-fg));
    --_uik-button-border-color: oklch(var(--uik-component-button-link-border));
    --_uik-button-shadow: var(--uik-component-button-link-shadow);

    text-underline-offset: var(--uik-component-button-link-underline-offset);
  }

  .variant-link:hover {
    text-decoration: underline;
    text-decoration-style: var(--uik-component-button-link-decoration-hover);
  }
`;
