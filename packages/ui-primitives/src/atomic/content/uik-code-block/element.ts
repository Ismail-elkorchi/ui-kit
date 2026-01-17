import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { styles } from "./styles.js";

export interface UikCodeBlockCopyDetail {
  value: string;
  success: boolean;
}

/**
 * Read-only code block with optional copy action.
 * @attr copy (boolean)
 * @attr inline (boolean)
 * @attr copy-label
 * @slot default
 * @slot copy-label
 * @part base
 * @part content
 * @part copy-button
 * @part inline
 * @event code-block-copy (detail: {value, success})
 * @cssprop --uik-component-code-block-bg
 * @cssprop --uik-component-code-block-fg
 * @cssprop --uik-component-code-block-border
 * @cssprop --uik-component-code-block-border-width
 * @cssprop --uik-component-code-block-radius
 * @cssprop --uik-component-code-block-padding-x
 * @cssprop --uik-component-code-block-padding-y
 * @cssprop --uik-component-code-block-font-family
 * @cssprop --uik-component-code-block-font-size
 * @cssprop --uik-component-code-block-font-weight
 * @cssprop --uik-component-code-block-line-height
 * @cssprop --uik-component-code-block-max-height
 * @cssprop --uik-component-code-block-copy-offset
 * @cssprop --uik-component-code-block-copy-bg
 * @cssprop --uik-component-code-block-copy-fg
 * @cssprop --uik-component-code-block-copy-border
 * @cssprop --uik-component-code-block-copy-border-width
 * @cssprop --uik-component-code-block-copy-radius
 * @cssprop --uik-component-code-block-copy-padding-x
 * @cssprop --uik-component-code-block-copy-padding-y
 * @cssprop --uik-component-code-block-copy-font-size
 * @cssprop --uik-component-code-block-copy-font-weight
 * @cssprop --uik-component-code-block-copy-line-height
 * @cssprop --uik-component-code-block-copy-focus-offset
 * @cssprop --uik-component-code-block-copy-focus-width
 * @cssprop --uik-component-code-block-copy-disabled-opacity
 */
@customElement("uik-code-block")
export class UikCodeBlock extends LitElement {
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor copy = false;
  @property({ type: Boolean, reflect: true, useDefault: true })
  accessor inline = false;
  @property({ type: String, attribute: "copy-label" })
  accessor copyLabel = "Copy";
  @property({ attribute: "aria-label" }) accessor ariaLabelValue = "";
  @property({ attribute: "aria-labelledby" }) accessor ariaLabelledbyValue = "";

  static override readonly styles = styles;

  private getCodeText(): string {
    const slot =
      this.renderRoot.querySelector<HTMLSlotElement>("slot:not([name])");
    const nodes = slot?.assignedNodes({ flatten: true }) ?? [];
    return nodes.map((node) => node.textContent ?? "").join("");
  }

  private onCopy = async () => {
    const value = this.getCodeText();
    if (!value) return;

    let success = false;
    try {
      await navigator.clipboard.writeText(value);
      success = true;
    } catch {
      success = false;
    }

    const detail: UikCodeBlockCopyDetail = { value, success };
    this.dispatchEvent(
      new CustomEvent("code-block-copy", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  };

  override render() {
    const ariaLabel = this.ariaLabelValue || undefined;
    const ariaLabelledby = this.ariaLabelledbyValue || undefined;

    if (this.inline) {
      return html`
        <code
          part="inline"
          class="inline"
          aria-label=${ifDefined(ariaLabel)}
          aria-labelledby=${ifDefined(ariaLabelledby)}
        >
          <slot></slot>
        </code>
      `;
    }

    return html`
      <div part="base" class="wrapper">
        <pre
          part="content"
          class="content"
          tabindex="0"
          aria-label=${ifDefined(ariaLabel)}
          aria-labelledby=${ifDefined(ariaLabelledby)}
        >
          <code class="code"><slot></slot></code>
        </pre>
        ${this.copy
          ? html`
              <button
                part="copy-button"
                class="copy"
                type="button"
                aria-label=${this.copyLabel}
                @click=${this.onCopy}
              >
                <slot name="copy-label">${this.copyLabel}</slot>
              </button>
            `
          : null}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-code-block": UikCodeBlock;
  }
}
