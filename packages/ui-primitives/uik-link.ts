import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

@customElement('uik-link')
export class UikLink extends LitElement {
  @property({type: String}) accessor href = '';
  @property({type: String}) accessor target = '';
  @property({type: String}) accessor rel = '';
  @property({type: String}) accessor download = '';
  @property({attribute: 'aria-label'}) accessor ariaLabelValue = '';
  @property({attribute: 'aria-labelledby'}) accessor ariaLabelledbyValue = '';
  @property({attribute: 'aria-describedby'}) accessor ariaDescribedbyValue = '';

  static override readonly styles = css`
    :host {
      display: inline-flex;
    }

    a {
      font-family: var(--uik-typography-font-family-sans);
      font-size: var(--uik-typography-font-size-3);
      line-height: var(--uik-typography-line-height-3);
      color: oklch(var(--uik-component-link-fg-default));
      text-decoration: none;
      text-decoration-thickness: var(--uik-border-width-1);
      text-decoration-color: currentcolor;
      text-underline-offset: var(--uik-component-link-underline-offset);
      transition:
        color var(--uik-motion-transition-colors),
        text-decoration-color var(--uik-motion-transition-colors),
        box-shadow var(--uik-motion-transition-shadow);
    }

    a:hover {
      color: oklch(var(--uik-component-link-fg-hover));
      text-decoration-line: underline;
    }

    a:focus-visible {
      outline: none;
      box-shadow:
        0 0 0 var(--uik-focus-ring-offset-default) oklch(var(--uik-focus-ring-offset-bg)),
        0 0 0 calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
          oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
    }

    @media (forced-colors: active) {
      a:focus-visible {
        outline: var(--uik-border-width-1) solid currentcolor;
        outline-offset: var(--uik-space-1);
        box-shadow: none;
      }
    }
  `;

  override render() {
    return html`
      <a
        part="base"
        href=${ifDefined(this.href || undefined)}
        target=${ifDefined(this.target || undefined)}
        rel=${ifDefined(this.rel || undefined)}
        download=${ifDefined(this.download || undefined)}
        aria-label=${ifDefined(this.ariaLabelValue || undefined)}
        aria-labelledby=${ifDefined(this.ariaLabelledbyValue || undefined)}
        aria-describedby=${ifDefined(this.ariaDescribedbyValue || undefined)}>
        <slot></slot>
      </a>
    `;
  }
}
