import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import "@ismail-elkorchi/ui-primitives/uik-box";
import "@ismail-elkorchi/ui-primitives/uik-surface";

import { styles } from "./styles.js";

/**
 * Section card pattern for grouping related content.
 * @slot title - Section heading content.
 * @slot actions - Optional actions for the section.
 * @slot default - Section body content.
 * @part base - Surface wrapper.
 * @part content - Content container.
 * @part header - Header container.
 * @part title - Title container.
 * @part actions - Actions container.
 * @part body - Body container.
 */
@customElement("uik-section-card")
export class UikSectionCard extends LitElement {
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

  private hasDefaultContent(): boolean {
    return Array.from(this.childNodes).some((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        return !(node as Element).hasAttribute("slot");
      }
      if (node.nodeType === Node.TEXT_NODE) {
        return Boolean(node.textContent && node.textContent.trim().length > 0);
      }
      return false;
    });
  }

  override render() {
    const hasTitle = this.hasSlotContent("title");
    const hasActions = this.hasSlotContent("actions");
    const hasBody = this.hasDefaultContent();
    const hasHeader = hasTitle || hasActions;

    return html`
      <uik-surface part="base" class="surface" variant="card" bordered>
        <uik-box part="content" class="content" padding="4">
          <div part="header" class="header" ?hidden=${!hasHeader}>
            <div part="title" class="title" ?hidden=${!hasTitle}>
              <slot name="title" @slotchange=${this.handleSlotChange}></slot>
            </div>
            <div part="actions" class="actions" ?hidden=${!hasActions}>
              <slot name="actions" @slotchange=${this.handleSlotChange}></slot>
            </div>
          </div>
          <div part="body" class="body" ?hidden=${!hasBody}>
            <slot @slotchange=${this.handleSlotChange}></slot>
          </div>
        </uik-box>
      </uik-surface>
    `;
  }
}
