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
 * @attr variant
 * @slot title - Optional header title.
 * @slot controls - Optional variant controls (e.g. uik-tabs or uik-select).
 * @slot preview - Live example markup.
 * @slot code - Code snippet (use uik-code-block).
 * @part base - Surface wrapper.
 * @part header - Header container.
 * @part title - Title container.
 * @part controls - Controls container.
 * @part preview - Preview container.
 * @part code - Code container.
 * @part tabs - Tabs wrapper (when tabs render).
 */
@customElement("uik-example")
export class UikExample extends LitElement {
  @property({ type: String }) override accessor title = "";
  @property({ type: String, reflect: true }) accessor variant = "";

  static override readonly styles = styles;

  private pendingVariantSync = false;

  private handleSlotChange = () => {
    this.requestUpdate();
    this.requestVariantSync();
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

  private requestVariantSync() {
    if (this.pendingVariantSync) return;
    this.pendingVariantSync = true;
    queueMicrotask(() => {
      this.pendingVariantSync = false;
      this.syncVariants();
    });
  }

  private getSlottedElements(name: string) {
    return Array.from(this.children).filter(
      (element) => element.getAttribute("slot") === name,
    ) as HTMLElement[];
  }

  private collectVariants(elements: HTMLElement[]) {
    const variants = new Set<string>();
    elements.forEach((element) => {
      const variant = element.getAttribute("data-variant")?.trim();
      if (variant) variants.add(variant);
    });
    return variants;
  }

  private applyVariantVisibility(activeVariant: string) {
    const update = (elements: HTMLElement[]) => {
      const variants = this.collectVariants(elements);
      const hasVariants = variants.size > 0;
      elements.forEach((element) => {
        const variant = element.getAttribute("data-variant")?.trim() ?? "";
        const visible = hasVariants
          ? variant === activeVariant
          : variant.length === 0;
        element.toggleAttribute("hidden", !visible);
      });
    };
    update(this.getSlottedElements("preview"));
    update(this.getSlottedElements("code"));
  }

  private syncControlsSelection(activeVariant: string) {
    if (!activeVariant) return;
    const controls = this.getSlottedElements("controls");
    controls.forEach((control) => {
      if (control.tagName === "UIK-TABS") {
        const tabs = control as unknown as { activeId?: string };
        if (tabs.activeId !== activeVariant) {
          tabs.activeId = activeVariant;
        }
        return;
      }
      if (control.tagName === "UIK-SELECT") {
        const select = control as unknown as { value?: string };
        if (select.value !== activeVariant) {
          select.value = activeVariant;
        }
        return;
      }
      if (control instanceof HTMLSelectElement) {
        if (control.value !== activeVariant) {
          control.value = activeVariant;
        }
      }
    });
  }

  private syncVariants() {
    const previewVariants = this.collectVariants(
      this.getSlottedElements("preview"),
    );
    const codeVariants = this.collectVariants(this.getSlottedElements("code"));
    const variants = new Set([...previewVariants, ...codeVariants]);
    const hasVariants = variants.size > 0;
    const requested = this.variant.trim();
    let activeVariant = "";
    if (requested && variants.has(requested)) {
      activeVariant = requested;
    } else if (hasVariants) {
      activeVariant = variants.values().next().value ?? "";
    }
    this.syncControlsSelection(activeVariant);
    if (hasVariants) {
      this.applyVariantVisibility(activeVariant);
    } else {
      this.applyVariantVisibility("");
    }
  }

  private isFromControls(event: Event) {
    return event
      .composedPath()
      .some(
        (node) =>
          node instanceof HTMLElement &&
          node.getAttribute("slot") === "controls",
      );
  }

  private onControlsTabsSelect = (event: Event) => {
    if (!this.isFromControls(event)) return;
    const detail = (event as CustomEvent<{ id?: string }>).detail;
    const next = detail?.id?.trim();
    if (next) {
      this.variant = next;
    }
  };

  private onControlsChange = (event: Event) => {
    if (!this.isFromControls(event)) return;
    const target = event.target as
      | HTMLSelectElement
      | { value?: string }
      | null;
    const next = target && typeof target.value === "string" ? target.value : "";
    if (next) {
      this.variant = next;
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("tabs-select", this.onControlsTabsSelect);
    this.addEventListener("change", this.onControlsChange);
  }

  override disconnectedCallback() {
    this.removeEventListener("tabs-select", this.onControlsTabsSelect);
    this.removeEventListener("change", this.onControlsChange);
    super.disconnectedCallback();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has("variant")) {
      this.requestVariantSync();
    }
  }

  override render() {
    const hasTitleSlot = this.hasSlotContent("title");
    const titleText = this.title?.trim();
    const hasTitle = Boolean(titleText) || hasTitleSlot;
    const hasControls = this.hasSlotContent("controls");
    const hasPreview = this.hasSlotContent("preview");
    const hasCode = this.hasSlotContent("code");
    const showTabs = hasPreview && hasCode;
    const showHeader = hasTitle || hasControls;

    return html`
      <uik-surface part="base" class="surface" variant="card" bordered>
        <div part="header" class="header" ?hidden=${!showHeader}>
          <div part="title" class="title">
            <slot name="title" @slotchange=${this.handleSlotChange}
              >${this.title}</slot
            >
          </div>
          <div part="controls" class="controls" ?hidden=${!hasControls}>
            <slot name="controls" @slotchange=${this.handleSlotChange}></slot>
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
