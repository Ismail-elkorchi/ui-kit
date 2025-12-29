import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .pagination {
    display: flex;
    gap: var(--uik-component-pagination-gap);
    align-items: center;
    font-family: var(--uik-component-pagination-font-family);
  }

  .list {
    display: flex;
    gap: var(--uik-component-pagination-gap);
    align-items: center;
    padding: var(--uik-space-0);
    margin: var(--uik-space-0);
    list-style: none;
  }

  .button {
    min-width: var(--uik-component-pagination-button-min-width);
    height: var(--uik-component-pagination-button-height);
    padding: var(--uik-component-pagination-button-padding-y)
      var(--uik-component-pagination-button-padding-x);
    font-family: var(--uik-component-pagination-font-family);
    font-size: var(--uik-component-pagination-button-font-size);
    font-weight: var(--uik-component-pagination-button-font-weight);
    line-height: var(--uik-component-pagination-button-line-height);
    color: oklch(var(--uik-component-pagination-button-fg));
    cursor: pointer;
    background-color: oklch(var(--uik-component-pagination-button-bg));
    border: var(--uik-component-pagination-button-border-width) solid
      oklch(var(--uik-component-pagination-button-border));
    border-radius: var(--uik-component-pagination-button-radius);
  }

  .button:hover {
    background-color: oklch(var(--uik-component-pagination-button-bg-hover));
  }

  .button:active {
    background-color: oklch(var(--uik-component-pagination-button-bg-active));
  }

  .button[aria-current="page"] {
    color: oklch(var(--uik-component-pagination-button-current-fg));
    background-color: oklch(var(--uik-component-pagination-button-current-bg));
    border-color: oklch(var(--uik-component-pagination-button-current-border));
  }

  .button:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 var(--uik-component-pagination-button-focus-offset)
        oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0
        calc(
          var(--uik-component-pagination-button-focus-offset) +
            var(--uik-component-pagination-button-focus-width)
        )
        oklch(var(--uik-focus-ring));
  }

  .button:disabled {
    cursor: default;
    opacity: var(--uik-component-pagination-button-disabled-opacity);
  }

  .ellipsis {
    color: oklch(var(--uik-component-pagination-ellipsis-color));
  }

  .summary {
    font-size: var(--uik-component-pagination-summary-font-size);
    font-weight: var(--uik-component-pagination-summary-font-weight);
    color: oklch(var(--uik-component-pagination-summary-color));
  }
`;
