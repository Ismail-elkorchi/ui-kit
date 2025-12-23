import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

@customElement('uik-icon')
export class UikIcon extends LitElement {
  @property({type: String, reflect: true, useDefault: true}) accessor size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
  @property({type: String, reflect: true, useDefault: true}) accessor tone:
    | 'default'
    | 'muted'
    | 'danger'
    | 'success'
    | 'warning'
    | 'info'
    | 'inverse' = 'default';
  @property({attribute: 'aria-label'}) accessor ariaLabelValue = '';
  @property({attribute: 'aria-hidden'}) accessor ariaHiddenValue = '';

  static override readonly styles = css`
    :host {
      display: inline-flex;
    }

    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--uik-component-icon-size-md);
      height: var(--uik-component-icon-size-md);
      color: oklch(var(--uik-component-icon-color-default));
    }

    :host([size='xs']) .icon {
      width: var(--uik-component-icon-size-xs);
      height: var(--uik-component-icon-size-xs);
    }

    :host([size='sm']) .icon {
      width: var(--uik-component-icon-size-sm);
      height: var(--uik-component-icon-size-sm);
    }

    :host([size='lg']) .icon {
      width: var(--uik-component-icon-size-lg);
      height: var(--uik-component-icon-size-lg);
    }

    :host([tone='muted']) .icon {
      color: oklch(var(--uik-component-icon-color-muted));
    }

    :host([tone='danger']) .icon {
      color: oklch(var(--uik-component-icon-color-danger));
    }

    :host([tone='success']) .icon {
      color: oklch(var(--uik-component-icon-color-success));
    }

    :host([tone='warning']) .icon {
      color: oklch(var(--uik-component-icon-color-warning));
    }

    :host([tone='info']) .icon {
      color: oklch(var(--uik-component-icon-color-info));
    }

    :host([tone='inverse']) .icon {
      color: oklch(var(--uik-component-icon-color-inverse));
    }

    ::slotted(svg) {
      width: 100%;
      height: 100%;
      fill: currentcolor;
      stroke: currentcolor;
    }
  `;

  override render() {
    return html`
      <span
        part="base"
        class="icon"
        role=${ifDefined(this.ariaLabelValue ? 'img' : undefined)}
        aria-label=${ifDefined(this.ariaLabelValue || undefined)}
        aria-hidden=${ifDefined(this.ariaHiddenValue || undefined)}>
        <slot></slot>
      </span>
    `;
  }
}
