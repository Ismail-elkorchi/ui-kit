import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { styles } from "./styles";
import type { UikOption } from "./uik-option";
import { createId } from "../../../internal";
import "./uik-option";

export interface UikListboxActiveDetail {
  id: string;
  value: string;
  option: UikOption;
}

export interface UikListboxSelectDetail {
  value: string;
  values: string[];
  option: UikOption;
}

/**
 * Listbox selection container with roving focus support.
 * @attr value
 * @attr selection-mode (single | multiple)
 * @attr focus-mode (roving | activedescendant)
 * @slot default (uik-option children)
 * @part base
 * @event listbox-active (detail: {id, value, option})
 * @event listbox-select (detail: {value, values, option})
 * @a11y Roving focus with Arrow/Home/End; Enter/Space selects the focused option.
 * @cssprop --uik-component-listbox-* (bg, fg, border, radius, padding, shadow)
 */
@customElement("uik-listbox")
export class UikListbox extends LitElement {
  @property({ type: String }) accessor value = "";
  @property({ attribute: false }) accessor selectedValues: string[] = [];
  @property({ type: String, reflect: true, attribute: "selection-mode" })
  accessor selectionMode: "single" | "multiple" = "single";
  @property({ type: String, reflect: true, attribute: "focus-mode" })
  accessor focusMode: "roving" | "activedescendant" = "roving";
  @property({ type: String }) accessor activeId = "";
  @property({ attribute: "aria-label" }) accessor ariaLabelValue = "";
  @property({ attribute: "aria-labelledby" }) accessor ariaLabelledbyValue = "";

  @state() private accessor isEmpty = true;

  private readonly listboxId = createId("uik-listbox");

  static override readonly styles = styles;

  private get listboxPanelId() {
    return `${this.id}-panel`;
  }

  private get listboxElement(): HTMLDivElement | null {
    return this.renderRoot.querySelector(".listbox");
  }

  override connectedCallback() {
    super.connectedCallback();
    if (!this.id) this.id = this.listboxId;
    this.syncAria();
    this.addEventListener("click", this.onOptionClick);
    this.addEventListener("focusin", this.onOptionFocus);
    this.addEventListener("keydown", this.onKeyDown);
  }

  override disconnectedCallback() {
    this.removeEventListener("click", this.onOptionClick);
    this.removeEventListener("focusin", this.onOptionFocus);
    this.removeEventListener("keydown", this.onKeyDown);
    super.disconnectedCallback();
  }

  override firstUpdated() {
    this.syncOptions();
    this.syncAria();
  }

  override updated(changed: Map<string, unknown>) {
    if (
      changed.has("value") ||
      changed.has("selectedValues") ||
      changed.has("selectionMode") ||
      changed.has("focusMode") ||
      changed.has("activeId")
    ) {
      this.syncOptions();
    }

    if (
      changed.has("ariaLabelValue") ||
      changed.has("ariaLabelledbyValue") ||
      changed.has("selectionMode")
    ) {
      this.syncAria();
    }
  }

  moveActiveByKey(key: string) {
    const options = this.getEnabledOptions();
    if (options.length === 0) return false;

    const currentIndex = options.findIndex(
      (option) => option.id === this.activeId,
    );
    let nextIndex = currentIndex === -1 ? 0 : currentIndex;

    switch (key) {
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = options.length - 1;
        break;
      case "ArrowDown":
        nextIndex =
          currentIndex === -1 ? 0 : (currentIndex + 1) % options.length;
        break;
      case "ArrowUp":
        nextIndex =
          currentIndex === -1
            ? options.length - 1
            : (currentIndex - 1 + options.length) % options.length;
        break;
      default:
        return false;
    }

    const nextOption = options[nextIndex];
    if (!nextOption) return false;

    this.setActiveOption(nextOption, this.focusMode === "roving");
    return true;
  }

  selectActive() {
    const activeOption = this.getOptions().find(
      (option) => option.id === this.activeId,
    );
    if (!activeOption) return;
    this.selectOption(activeOption);
  }

  private getOptions(): UikOption[] {
    return Array.from(this.querySelectorAll<UikOption>("uik-option"));
  }

  private getEnabledOptions(): UikOption[] {
    return this.getOptions().filter((option) => !option.disabled);
  }

  private getSelectedValues(): string[] {
    if (this.selectionMode === "multiple") {
      return this.selectedValues;
    }
    return this.value ? [this.value] : [];
  }

  private setSelection(values: string[], option: UikOption) {
    if (this.selectionMode === "multiple") {
      this.selectedValues = values;
      this.value = values[0] ?? "";
    } else {
      const nextValue = values[0] ?? "";
      this.value = nextValue;
      this.selectedValues = nextValue ? [nextValue] : [];
    }

    const detail: UikListboxSelectDetail = {
      value: this.value,
      values: this.getSelectedValues(),
      option,
    };
    this.dispatchEvent(
      new CustomEvent("listbox-select", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private setActiveOption(option: UikOption, shouldFocus: boolean) {
    if (option.disabled) return;
    if (option.id === this.activeId) return;
    this.activeId = option.id;
    this.emitActive(option);
    if (shouldFocus) {
      void this.updateComplete.then(() => option.focus());
    }
  }

  private emitActive(option: UikOption) {
    const detail: UikListboxActiveDetail = {
      id: option.id,
      value: option.value,
      option,
    };
    this.dispatchEvent(
      new CustomEvent("listbox-active", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private syncOptions() {
    const options = this.getOptions();
    this.isEmpty = options.length === 0;
    this.toggleAttribute("data-empty", this.isEmpty);
    const selectedValues = new Set(this.getSelectedValues());

    options.forEach((option) => {
      option.selected = selectedValues.has(option.value);
    });

    const enabledOptions = options.filter((option) => !option.disabled);
    const firstEnabled = enabledOptions[0];
    if (!firstEnabled) {
      this.activeId = "";
      return;
    }

    let nextActiveId = this.activeId;
    if (!enabledOptions.some((option) => option.id === nextActiveId)) {
      const selectedOption = enabledOptions.find((option) =>
        selectedValues.has(option.value),
      );
      nextActiveId = selectedOption?.id ?? firstEnabled.id;
    }

    const activeChanged = nextActiveId !== this.activeId;
    if (activeChanged) {
      this.activeId = nextActiveId;
    }

    options.forEach((option) => {
      const isActive = option.id === nextActiveId;
      option.active = isActive;
      option.tabIndexValue = this.focusMode === "roving" && isActive ? 0 : -1;
    });

    if (activeChanged) {
      const activeOption = options.find((option) => option.id === nextActiveId);
      if (activeOption) this.emitActive(activeOption);
    }
  }

  private syncAria() {
    const listbox = this.listboxElement;
    if (!listbox) return;
    if (this.selectionMode === "multiple") {
      listbox.setAttribute("aria-multiselectable", "true");
    } else {
      listbox.removeAttribute("aria-multiselectable");
    }
    if (this.ariaLabelledbyValue) {
      listbox.setAttribute("aria-labelledby", this.ariaLabelledbyValue);
      listbox.removeAttribute("aria-label");
      return;
    }
    if (this.ariaLabelValue) {
      listbox.setAttribute("aria-label", this.ariaLabelValue);
      listbox.removeAttribute("aria-labelledby");
      return;
    }
    listbox.removeAttribute("aria-label");
    listbox.removeAttribute("aria-labelledby");
  }

  private resolveOptionFromEvent(event: Event): UikOption | null {
    const path = event.composedPath();
    for (const node of path) {
      if (node instanceof HTMLElement && node.tagName === "UIK-OPTION") {
        return node as UikOption;
      }
    }
    return null;
  }

  private selectOption(option: UikOption) {
    if (option.disabled) return;
    if (this.selectionMode === "multiple") {
      const values = new Set(this.selectedValues);
      if (values.has(option.value)) {
        values.delete(option.value);
      } else {
        values.add(option.value);
      }
      this.setSelection(Array.from(values), option);
      return;
    }

    this.setSelection([option.value], option);
  }

  private onOptionClick = (event: Event) => {
    const option = this.resolveOptionFromEvent(event);
    if (!option) return;
    this.setActiveOption(option, this.focusMode === "roving");
    this.selectOption(option);
  };

  private onOptionFocus = (event: FocusEvent) => {
    if (this.focusMode !== "roving") return;
    const option = this.resolveOptionFromEvent(event);
    if (!option) return;
    this.activeId = option.id;
    this.emitActive(option);
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    const handled = this.moveActiveByKey(event.key);
    if (handled) {
      event.preventDefault();
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.selectActive();
    }
  };

  private onSlotChange = () => {
    this.syncOptions();
  };

  override render() {
    const listboxTabIndex =
      this.focusMode === "activedescendant" ? "0" : undefined;
    const ariaLabel = this.ariaLabelledbyValue
      ? undefined
      : this.ariaLabelValue || undefined;
    const ariaLabelledby = this.ariaLabelledbyValue || undefined;
    return html`
      <div
        part="base"
        class="listbox"
        id=${this.listboxPanelId}
        role="listbox"
        tabindex=${ifDefined(listboxTabIndex)}
        aria-label=${ifDefined(ariaLabel)}
        aria-labelledby=${ifDefined(ariaLabelledby)}
      >
        <slot @slotchange=${this.onSlotChange}></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uik-listbox": UikListbox;
  }
}
