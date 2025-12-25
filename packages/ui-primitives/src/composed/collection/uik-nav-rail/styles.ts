import {css} from 'lit';

export const styles = css`
  :host {
    display: block;
  }

  .rail {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--uik-component-nav-rail-gap);
    width: var(--uik-component-nav-rail-width);
    height: 100%;
    padding-block: var(--uik-component-nav-rail-padding-y);
    color: oklch(var(--uik-component-nav-rail-fg));
    background-color: oklch(var(--uik-component-nav-rail-bg));
    box-sizing: border-box;
  }

  :host([orientation='horizontal']) .rail {
    flex-direction: row;
    width: auto;
    height: auto;
    padding-inline: var(--uik-component-nav-rail-padding-y);
  }

  .item {
    width: var(--uik-component-nav-rail-item-size);
    height: var(--uik-component-nav-rail-item-size);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .indicator {
    position: absolute;
    inset-inline-start: var(--uik-space-0);
    inset-block: var(--uik-space-0);
    width: var(--uik-component-nav-rail-item-indicator-width);
    background-color: oklch(var(--uik-component-nav-rail-item-indicator-bg));
    border-top-right-radius: var(--uik-component-nav-rail-item-indicator-radius);
    border-bottom-right-radius: var(--uik-component-nav-rail-item-indicator-radius);
  }

  :host([orientation='horizontal']) .indicator {
    inset-inline: var(--uik-space-0);
    inset-block-end: var(--uik-space-0);
    width: auto;
    height: var(--uik-component-nav-rail-item-indicator-width);
    border-radius: var(--uik-component-nav-rail-item-indicator-radius);
  }

  uik-button {
    width: 100%;
    height: 100%;
  }
`;
