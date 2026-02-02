import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import "@ismail-elkorchi/ui-primitives/uik-surface";
import "@ismail-elkorchi/ui-primitives/uik-tab";
import "@ismail-elkorchi/ui-primitives/uik-tab-panel";
import "@ismail-elkorchi/ui-primitives/uik-tabs";

import { styles } from "./styles.js";

/**
 * Preview + code example pattern.
 * @attr title
 * @slot title - Optional header title.
 * @slot preview - Live example markup.
 * @slot code - Code snippet (use uik-code-block).
 * @part base - Surface wrapper.
 * @part header - Header container.
 * @part title - Title container.
 * @part preview - Preview container.
 * @part code - Code container.
 * @part tabs - Tabs wrapper (when tabs render).
 */
@customElement("uik-example")
export class UikExample extends LitElement {
  @property({ type: String }) override accessor title = "";

  static override readonly styles = styles;

  private handleSlotChange = () => {
    this.requestUpdate();
  };

  private hasSlotContent(name: string): boolean {
    const elements = Array.from(this.children).filter(
      (element) => element.getAttribute("slot") === name,
    );
    if (elements.length === 0) return false;
    return elements.some((element) => {
      const text = element.textContent;
      if (text && text.trim().length > 0) return true;
      return element.childElementCount > 0;
    });
  }

  override render() {
    const hasTitleSlot = this.hasSlotContent("title");
    const titleText = this.title?.trim();
    const hasTitle = Boolean(titleText) || hasTitleSlot;
    const hasPreview = this.hasSlotContent("preview");
    const hasCode = this.hasSlotContent("code");
    const showTabs = hasPreview && hasCode;

    return html`
      <uik-surface part="base" class="surface" variant="card" bordered>
        <div part="header" class="header" ?hidden=${!hasTitle}>
          <div part="title" class="title">
            <slot name="title" @slotchange=${this.handleSlotChange}
              >${this.title}</slot
            >
          </div>
        </div>
        ${showTabs
          ? html`
              <uik-tabs part="tabs" class="tabs" activation="manual">
                <uik-tab slot="tab" value="preview">Preview</uik-tab>
                <uik-tab slot="tab" value="code">Code</uik-tab>
                <uik-tab-panel slot="panel" value="preview">
                  <div part="preview" class="panel preview">
                    <slot
                      name="preview"
                      @slotchange=${this.handleSlotChange}
                    ></slot>
                  </div>
                </uik-tab-panel>
                <uik-tab-panel slot="panel" value="code">
                  <div part="code" class="panel code">
                    <slot
                      name="code"
                      @slotchange=${this.handleSlotChange}
                    ></slot>
                  </div>
                </uik-tab-panel>
              </uik-tabs>
            `
          : html`
              <div part="preview" class="panel preview" ?hidden=${!hasPreview}>
                <slot
                  name="preview"
                  @slotchange=${this.handleSlotChange}
                ></slot>
              </div>
              <div part="code" class="panel code" ?hidden=${!hasCode}>
                <slot name="code" @slotchange=${this.handleSlotChange}></slot>
              </div>
            `}
      </uik-surface>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-example": UikExample;
  }
}
