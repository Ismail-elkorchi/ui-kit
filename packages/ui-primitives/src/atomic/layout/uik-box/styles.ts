import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  :host([inline]) {
    display: inline-block;
  }

  .box {
    padding: var(--uik-component-box-padding-0);
    background-color: oklch(
      var(--uik-component-box-bg) / var(--uik-component-box-bg-opacity)
    );
    border-color: oklch(
      var(--uik-component-box-border-color) /
        var(--uik-component-box-border-opacity)
    );
    border-style: var(--uik-border-style-solid);
    border-width: var(--uik-component-box-border-width);
    border-radius: var(--uik-component-box-radius);
  }

  :host([padding="1"]) .box {
    padding: var(--uik-component-box-padding-1);
  }

  :host([padding="2"]) .box {
    padding: var(--uik-component-box-padding-2);
  }

  :host([padding="3"]) .box {
    padding: var(--uik-component-box-padding-3);
  }

  :host([padding="4"]) .box {
    padding: var(--uik-component-box-padding-4);
  }

  :host([padding="5"]) .box {
    padding: var(--uik-component-box-padding-5);
  }

  :host([padding="6"]) .box {
    padding: var(--uik-component-box-padding-6);
  }
`;
