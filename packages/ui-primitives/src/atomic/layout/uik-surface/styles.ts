import {css} from 'lit';

export const styles = css`
  :host {
    display: block;
  }

  .surface {
    background-color: oklch(var(--uik-component-surface-bg-default));
    border-color: oklch(var(--uik-component-surface-border-color-default));
    border-style: var(--uik-border-style-solid);
    border-width: var(--uik-component-surface-border-width-default);
    border-radius: var(--uik-component-surface-radius);
    box-shadow: var(--uik-component-surface-shadow-default);
  }

  :host([variant='muted']) .surface {
    background-color: oklch(var(--uik-component-surface-bg-muted));
  }

  :host([variant='card']) .surface {
    background-color: oklch(var(--uik-component-surface-bg-card));
    box-shadow: var(--uik-component-surface-shadow-card);
  }

  :host([variant='elevated']) .surface {
    background-color: oklch(var(--uik-component-surface-bg-elevated));
    box-shadow: var(--uik-component-surface-shadow-elevated);
  }

  :host([variant='popover']) .surface {
    background-color: oklch(var(--uik-component-surface-bg-popover));
    box-shadow: var(--uik-component-surface-shadow-popover);
  }

  :host([bordered]) .surface {
    border-color: oklch(var(--uik-component-surface-border-color-bordered));
    border-width: var(--uik-component-surface-border-width-bordered);
  }
`;
