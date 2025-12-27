import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
  }

  .spinner {
    width: var(--uik-component-spinner-size-md);
    height: var(--uik-component-spinner-size-md);
    border: var(--uik-border-width-2) solid
      oklch(var(--uik-component-spinner-track));
    border-top-color: oklch(var(--uik-component-spinner-indicator-default));
    border-radius: var(--uik-radius-full);
    animation: spin var(--uik-motion-duration-4) var(--uik-motion-delay-0)
      linear infinite;
  }

  :host([size="sm"]) .spinner {
    width: var(--uik-component-spinner-size-sm);
    height: var(--uik-component-spinner-size-sm);
  }

  :host([size="lg"]) .spinner {
    width: var(--uik-component-spinner-size-lg);
    height: var(--uik-component-spinner-size-lg);
  }

  :host([tone="muted"]) .spinner {
    border-top-color: oklch(var(--uik-component-spinner-indicator-muted));
  }

  :host([tone="primary"]) .spinner {
    border-top-color: oklch(var(--uik-component-spinner-indicator-primary));
  }

  :host([tone="danger"]) .spinner {
    border-top-color: oklch(var(--uik-component-spinner-indicator-danger));
  }

  :host([tone="success"]) .spinner {
    border-top-color: oklch(var(--uik-component-spinner-indicator-success));
  }

  :host([tone="warning"]) .spinner {
    border-top-color: oklch(var(--uik-component-spinner-indicator-warning));
  }

  :host([tone="info"]) .spinner {
    border-top-color: oklch(var(--uik-component-spinner-indicator-info));
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation: none;
    }
  }
`;
