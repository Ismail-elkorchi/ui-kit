import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

@customElement('uik-button')
export class UikButton extends LitElement {
  static formAssociated = true;

  @property({type: String, reflect: true}) accessor variant:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link' = 'default';
  @property({type: String, reflect: true}) accessor size: 'default' | 'sm' | 'lg' | 'icon' = 'default';
  @property({type: String}) accessor type: 'button' | 'submit' | 'reset' = 'button';
  @property({type: Boolean, reflect: true}) accessor disabled = false;
  @property({type: Boolean, reflect: true}) accessor active = false;
  @property({type: Boolean, reflect: true}) accessor muted = false;
  @property({attribute: 'aria-label'}) accessor ariaLabelValue = '';
  @property({attribute: 'aria-labelledby'}) accessor ariaLabelledbyValue = '';

  private readonly internals = this.attachInternals();

  static override readonly styles = css`
    :host {
      display: inline-flex;
      height: var(--uik-component-button-md-height);
    }

    :host([size='sm']) {
      height: var(--uik-component-button-sm-height);
    }

    :host([size='lg']) {
      height: var(--uik-component-button-lg-height);
    }

    :host([size='icon']) {
      width: var(--uik-component-button-md-height);
      height: var(--uik-component-button-md-height);
    }

    button {
      --uik-button-bg: oklch(var(--uik-component-button-solid-bg-default));
      --uik-button-bg-hover: oklch(var(--uik-component-button-solid-bg-hover));
      --uik-button-bg-active: oklch(var(--uik-component-button-solid-bg-active));
      --uik-button-fg: oklch(var(--uik-component-button-solid-fg));
      --uik-button-border-color: oklch(var(--uik-component-button-solid-border));
      --uik-button-shadow: var(--uik-component-button-solid-shadow);
      --uik-button-padding-x: var(--uik-component-button-md-padding-x);
      --uik-button-padding-y: var(--uik-component-button-md-padding-y);
      --uik-button-radius: var(--uik-component-button-md-radius);

      display: inline-flex;
      gap: var(--uik-component-button-base-gap);
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: var(--uik-button-padding-y) var(--uik-button-padding-x);
      font-family: var(--uik-component-button-base-font-family);
      font-size: var(--uik-component-button-base-font-size);
      font-weight: var(--uik-component-button-base-font-weight);
      line-height: var(--uik-component-button-base-line-height);
      color: var(--uik-button-fg);
      white-space: nowrap;
      cursor: pointer;
      background-color: var(--uik-button-bg);
      border-color: var(--uik-button-border-color);
      border-style: var(--uik-border-style-solid);
      border-width: var(--uik-component-button-base-border-width);
      border-radius: var(--uik-button-radius);
      box-shadow: var(--uik-button-shadow);
      transition:
        color var(--uik-component-button-base-transition-duration) var(--uik-component-button-base-transition-ease),
        background-color var(--uik-component-button-base-transition-duration)
          var(--uik-component-button-base-transition-ease),
        border-color var(--uik-component-button-base-transition-duration) var(--uik-component-button-base-transition-ease),
        box-shadow var(--uik-motion-transition-shadow);
    }

    button:hover {
      color: var(--uik-button-fg-hover, var(--uik-button-fg));
      background-color: var(--uik-button-bg-hover);
    }

    button:active {
      background-color: var(--uik-button-bg-active);
    }

    button:focus-visible {
      outline: none;
      box-shadow:
        var(--uik-button-shadow),
        0 0 0 var(--uik-component-button-base-focus-ring-offset) oklch(var(--uik-focus-ring-offset-bg)),
        0 0 0 calc(
            var(--uik-component-button-base-focus-ring-offset) + var(--uik-component-button-base-focus-ring-width)
          )
          oklch(var(--uik-component-button-base-focus-ring) / var(--uik-component-button-base-focus-ring-opacity));
    }

    button:disabled {
      pointer-events: none;
      opacity: var(--uik-component-button-base-disabled-opacity);
    }

    .size-default {
      --uik-button-padding-x: var(--uik-component-button-md-padding-x);
      --uik-button-padding-y: var(--uik-component-button-md-padding-y);
      --uik-button-radius: var(--uik-component-button-md-radius);
    }

    .size-sm {
      --uik-button-padding-x: var(--uik-component-button-sm-padding-x);
      --uik-button-padding-y: var(--uik-component-button-sm-padding-y);
      --uik-button-radius: var(--uik-component-button-sm-radius);
    }

    .size-lg {
      --uik-button-padding-x: var(--uik-component-button-lg-padding-x);
      --uik-button-padding-y: var(--uik-component-button-lg-padding-y);
      --uik-button-radius: var(--uik-component-button-lg-radius);
    }

    .size-icon {
      --uik-button-padding-x: var(--uik-space-0);
      --uik-button-padding-y: var(--uik-space-0);
      --uik-button-radius: var(--uik-component-button-md-radius);
    }

    .variant-default {
      --uik-button-bg: oklch(var(--uik-component-button-solid-bg-default));
      --uik-button-bg-hover: oklch(var(--uik-component-button-solid-bg-hover));
      --uik-button-bg-active: oklch(var(--uik-component-button-solid-bg-active));
      --uik-button-fg: oklch(var(--uik-component-button-solid-fg));
      --uik-button-border-color: oklch(var(--uik-component-button-solid-border));
      --uik-button-shadow: var(--uik-component-button-solid-shadow);
    }

    .variant-destructive {
      --uik-button-bg: oklch(var(--uik-component-button-danger-bg-default));
      --uik-button-bg-hover: oklch(var(--uik-component-button-danger-bg-hover));
      --uik-button-bg-active: oklch(var(--uik-component-button-danger-bg-active));
      --uik-button-fg: oklch(var(--uik-component-button-danger-fg));
      --uik-button-border-color: oklch(var(--uik-component-button-danger-border));
      --uik-button-shadow: var(--uik-component-button-danger-shadow);
    }

    .variant-outline {
      --uik-button-bg: oklch(var(--uik-component-button-outline-bg-default));
      --uik-button-bg-hover: oklch(var(--uik-component-button-outline-bg-hover));
      --uik-button-bg-active: oklch(var(--uik-component-button-outline-bg-active));
      --uik-button-fg: oklch(var(--uik-component-button-outline-fg));
      --uik-button-border-color: oklch(var(--uik-component-button-outline-border));
      --uik-button-shadow: var(--uik-component-button-outline-shadow);
    }

    .variant-secondary {
      --uik-button-bg: oklch(var(--uik-component-button-secondary-bg-default));
      --uik-button-bg-hover: oklch(var(--uik-component-button-secondary-bg-hover));
      --uik-button-bg-active: oklch(var(--uik-component-button-secondary-bg-active));
      --uik-button-fg: oklch(var(--uik-component-button-secondary-fg));
      --uik-button-border-color: oklch(var(--uik-component-button-secondary-border));
      --uik-button-shadow: var(--uik-component-button-secondary-shadow);
    }

    .variant-ghost {
      --uik-button-bg: oklch(var(--uik-component-button-ghost-bg-default));
      --uik-button-bg-hover: oklch(var(--uik-component-button-ghost-bg-hover));
      --uik-button-bg-active: oklch(var(--uik-component-button-ghost-bg-active));
      --uik-button-fg: oklch(var(--uik-component-button-ghost-fg));
      --uik-button-border-color: oklch(var(--uik-component-button-ghost-border));
      --uik-button-shadow: var(--uik-component-button-ghost-shadow);
    }

    :host([muted]) .variant-ghost {
      --uik-button-fg: oklch(var(--uik-text-muted));
      --uik-button-fg-hover: oklch(var(--uik-component-button-ghost-fg));
    }

    :host([active]) .variant-ghost {
      --uik-button-bg: oklch(var(--uik-component-button-ghost-bg-active));
      --uik-button-bg-hover: oklch(var(--uik-component-button-ghost-bg-active));
    }

    .variant-link {
      --uik-button-bg: oklch(var(--uik-component-button-link-bg-default));
      --uik-button-bg-hover: oklch(var(--uik-component-button-link-bg-hover));
      --uik-button-bg-active: oklch(var(--uik-component-button-link-bg-active));
      --uik-button-fg: oklch(var(--uik-component-button-link-fg));
      --uik-button-border-color: oklch(var(--uik-component-button-link-border));
      --uik-button-shadow: var(--uik-component-button-link-shadow);

      text-underline-offset: var(--uik-component-button-link-underline-offset);
    }

    .variant-link:hover {
      text-decoration: underline;
      text-decoration-style: var(--uik-component-button-link-decoration-hover);
    }
  `;

  override render() {
    return html`
      <button
        part="base"
        class="variant-${this.variant} size-${this.size}"
        type=${this.type}
        aria-label=${ifDefined(this.ariaLabelValue || undefined)}
        aria-labelledby=${ifDefined(this.ariaLabelledbyValue || undefined)}
        ?disabled=${this.disabled}
        @click=${this.onClick}>
        <slot></slot>
      </button>
    `;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  private onClick = (event: MouseEvent) => {
    if (this.disabled) return;
    const form = this.internals.form;
    if (!form) return;

    if (this.type === 'submit') {
      event.preventDefault();
      form.requestSubmit();
    } else if (this.type === 'reset') {
      event.preventDefault();
      form.reset();
    }
  };
}
