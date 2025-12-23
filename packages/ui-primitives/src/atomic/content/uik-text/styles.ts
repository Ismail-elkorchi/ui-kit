import {css} from 'lit';

export const styles = css`
  :host {
    display: block;
  }

  .text {
    margin: var(--uik-space-0);
    font-family: var(--uik-typography-font-family-sans);
    font-size: var(--uik-component-text-size-md);
    font-weight: var(--uik-component-text-weight-regular);
    line-height: var(--uik-component-text-line-height-md);
    color: oklch(var(--uik-component-text-color-default));
  }

  :host([size='sm']) .text {
    font-size: var(--uik-component-text-size-sm);
    line-height: var(--uik-component-text-line-height-sm);
  }

  :host([size='lg']) .text {
    font-size: var(--uik-component-text-size-lg);
    line-height: var(--uik-component-text-line-height-lg);
  }

  :host([size='xl']) .text {
    font-size: var(--uik-component-text-size-xl);
    line-height: var(--uik-component-text-line-height-xl);
  }

  :host([weight='medium']) .text {
    font-weight: var(--uik-component-text-weight-medium);
  }

  :host([weight='semibold']) .text {
    font-weight: var(--uik-component-text-weight-semibold);
  }

  :host([weight='bold']) .text {
    font-weight: var(--uik-component-text-weight-bold);
  }

  :host([tone='muted']) .text {
    color: oklch(var(--uik-component-text-color-muted));
  }

  :host([tone='strong']) .text {
    color: oklch(var(--uik-component-text-color-strong));
  }

  :host([tone='danger']) .text {
    color: oklch(var(--uik-component-text-color-danger));
  }

  :host([tone='success']) .text {
    color: oklch(var(--uik-component-text-color-success));
  }

  :host([tone='warning']) .text {
    color: oklch(var(--uik-component-text-color-warning));
  }

  :host([tone='info']) .text {
    color: oklch(var(--uik-component-text-color-info));
  }

  :host([truncate]) .text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
