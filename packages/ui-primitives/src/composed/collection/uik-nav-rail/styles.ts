import {css} from 'lit';

export const styles = css`
  :host {
    display: block;
  }

  .rail {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--uik-component-nav-rail-gap);
    align-items: center;
    width: var(--uik-component-nav-rail-width);
    height: 100%;
    padding-block: var(--uik-component-nav-rail-padding-y);
    color: oklch(var(--uik-component-nav-rail-fg));
    background-color: oklch(var(--uik-component-nav-rail-bg));
  }

  :host([orientation='horizontal']) .rail {
    flex-direction: row;
    width: auto;
    height: auto;
    padding-inline: var(--uik-component-nav-rail-padding-y);
  }

  .item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--uik-component-nav-rail-item-size);
    height: var(--uik-component-nav-rail-item-size);
  }

  .indicator {
    position: absolute;
    inset-block: var(--uik-space-0);
    inset-inline-start: var(--uik-space-0);
    width: var(--uik-component-nav-rail-item-indicator-width);
    background-color: oklch(var(--uik-component-nav-rail-item-indicator-bg));
    border-top-right-radius: var(--uik-component-nav-rail-item-indicator-radius);
    border-bottom-right-radius: var(--uik-component-nav-rail-item-indicator-radius);
  }

  :host([orientation='horizontal']) .indicator {
    inset-block-end: var(--uik-space-0);
    inset-inline: var(--uik-space-0);
    width: auto;
    height: var(--uik-component-nav-rail-item-indicator-width);
    border-radius: var(--uik-component-nav-rail-item-indicator-radius);
  }

  uik-button {
    width: 100%;
    height: 100%;
  }
`;
