import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import "@ismail-elkorchi/ui-primitives/uik-heading";
import "@ismail-elkorchi/ui-primitives/uik-surface";
import "@ismail-elkorchi/ui-primitives/uik-text";

import { styles } from "./styles.js";

/**
 * Composed empty state pattern built from primitives.
 * @slot title - Primary heading content.
 * @slot description - Supporting description text.
 * @slot actions - Action buttons or links.
 * @slot default - Optional supporting content.
 * @part base - Surface wrapper.
 * @part content - Content container.
 * @part title - Heading container.
 * @part description - Description container.
 * @part actions - Actions container.
 * @cssprop --uik-space-2
 * @cssprop --uik-space-3
 * @cssprop --uik-space-6
 */
@customElement("uik-empty-state")
export class UikEmptyState extends LitElement {
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
    const hasDescription = this.hasSlotContent("description");
    const hasActions = this.hasSlotContent("actions");
    const hasDefault = this.hasDefaultContent();

    return html`
      <uik-surface part="base" class="surface" variant="card" bordered>
        <div part="content" class="content">
          <uik-heading
            part="title"
            class="title"
            level="2"
            tone="strong"
            ?hidden=${!hasTitle}
          >
            <slot name="title" @slotchange=${this.handleSlotChange}></slot>
          </uik-heading>
          <uik-text
            part="description"
            class="description"
            as="p"
            tone="muted"
            ?hidden=${!hasDescription}
          >
            <slot
              name="description"
              @slotchange=${this.handleSlotChange}
            ></slot>
          </uik-text>
          <div class="body" ?hidden=${!hasDefault}>
            <slot @slotchange=${this.handleSlotChange}></slot>
          </div>
          <div part="actions" class="actions" ?hidden=${!hasActions}>
            <slot name="actions" @slotchange=${this.handleSlotChange}></slot>
          </div>
        </div>
      </uik-surface>
    `;
  }
}
