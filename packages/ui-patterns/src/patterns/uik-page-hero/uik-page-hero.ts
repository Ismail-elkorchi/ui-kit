import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import "@ismail-elkorchi/ui-primitives/uik-box";
import "@ismail-elkorchi/ui-primitives/uik-surface";

import { styles } from "./styles.js";

/**
 * Page hero pattern with content and optional control panel.
 * @slot eyebrow - Eyebrow content (badges or metadata).
 * @slot title - Primary hero title content.
 * @slot summary - Supporting summary content.
 * @slot links - Optional hero links.
 * @slot panel - Optional control panel content.
 * @part base - Surface wrapper.
 * @part content - Content container.
 * @part layout - Layout wrapper.
 * @part body - Content column.
 * @part eyebrow - Eyebrow container.
 * @part title - Title container.
 * @part summary - Summary container.
 * @part links - Links container.
 * @part panel - Panel wrapper.
 * @part panel-surface - Panel surface wrapper.
 * @part panel-content - Panel content container.
 */
@customElement("uik-page-hero")
export class UikPageHero extends LitElement {
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
    const hasEyebrow = this.hasSlotContent("eyebrow");
    const hasTitle = this.hasSlotContent("title");
    const hasSummary = this.hasSlotContent("summary");
    const hasLinks = this.hasSlotContent("links");
    const hasPanel = this.hasSlotContent("panel");

    return html`
      <uik-surface part="base" class="surface" variant="card" bordered>
        <uik-box part="content" class="content" padding="5">
          <div
            part="layout"
            class="layout"
            data-has-panel=${hasPanel ? "true" : "false"}
          >
            <div part="body" class="body">
              <div part="eyebrow" class="eyebrow" ?hidden=${!hasEyebrow}>
                <slot
                  name="eyebrow"
                  @slotchange=${this.handleSlotChange}
                ></slot>
              </div>
              <div part="title" class="title" ?hidden=${!hasTitle}>
                <slot name="title" @slotchange=${this.handleSlotChange}></slot>
              </div>
              <div part="summary" class="summary" ?hidden=${!hasSummary}>
                <slot
                  name="summary"
                  @slotchange=${this.handleSlotChange}
                ></slot>
              </div>
              <div part="links" class="links" ?hidden=${!hasLinks}>
                <slot name="links" @slotchange=${this.handleSlotChange}></slot>
              </div>
            </div>
            <div part="panel" class="panel" ?hidden=${!hasPanel}>
              <uik-surface
                part="panel-surface"
                class="panel-surface"
                variant="elevated"
                bordered
              >
                <uik-box part="panel-content" class="panel-content" padding="4">
                  <slot
                    name="panel"
                    @slotchange=${this.handleSlotChange}
                  ></slot>
                </uik-box>
              </uik-surface>
            </div>
          </div>
        </uik-box>
      </uik-surface>
    `;
  }
}
