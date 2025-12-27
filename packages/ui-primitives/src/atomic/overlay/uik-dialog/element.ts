import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { styles } from "./styles";
import { buildDescribedBy, createId, hasSlotContent } from "../../../internal";

type SlotName = "title" | "description";
type OverlayCloseReason = "escape" | "outside" | "programmatic" | "toggle";

/**
 * Native dialog wrapper with slots for title, description, and actions.
 * @attr open
 * @attr modal (boolean)
 * @slot title
 * @slot description
 * @slot default (body)
 * @slot actions
 * @part base
 * @part panel
 * @part title
 * @part description
 * @part body
 * @part actions
 * @event Native close and cancel bubble from <dialog>.
 * @event overlay-close (detail: {reason}) (escape | programmatic | toggle)
 * @a11y Uses native dialog semantics; forwards aria-* attributes to <dialog>.
 * @a11y Escape closes and overlay-close reports reason; focus returns to the opener.
 * @cssprop --uik-component-dialog-bg
 * @cssprop --uik-component-dialog-fg
 * @cssprop --uik-component-dialog-border
 * @cssprop --uik-component-dialog-radius
 * @cssprop --uik-component-dialog-padding
 * @cssprop --uik-component-dialog-shadow
 * @cssprop --uik-component-dialog-max-width
 * @cssprop --uik-component-dialog-title-fg
 * @cssprop --uik-component-dialog-description-fg
 * @cssprop --uik-component-dialog-actions-gap
 * @cssprop --uik-scrim-color
 * @cssprop --uik-scrim-opacity
 */
@customElement("uik-dialog")
export class UikDialog extends LitElement {
  @property({ type: Boolean, reflect: true, useDefault: true }) accessor open =
    false;
  @property({ type: Boolean, reflect: true, useDefault: true }) accessor modal =
    true;
  @property({ attribute: "aria-label" }) accessor ariaLabelValue = "";
  @property({ attribute: "aria-labelledby" }) accessor ariaLabelledbyValue = "";
  @property({ attribute: "aria-describedby" }) accessor ariaDescribedbyValue =
    "";

  private readonly dialogId = createId("uik-dialog");
  private readonly titleId = `${this.dialogId}-title`;
  private readonly descriptionId = `${this.dialogId}-description`;
  private pendingCloseReason: OverlayCloseReason | null = null;
  private focusReturnElement: HTMLElement | null = null;

  static override readonly styles = styles;

  private get dialogElement(): HTMLDialogElement | null {
    return this.renderRoot.querySelector("dialog");
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has("open") && this.open) {
      this.captureFocusOrigin();
    }

    if (changed.has("open") || changed.has("modal")) {
      this.syncOpenState();
    }
  }

  showModal() {
    this.modal = true;
    this.open = true;
  }

  show() {
    this.modal = false;
    this.open = true;
  }

  close(returnValue?: string) {
    this.pendingCloseReason ??= "programmatic";
    this.dialogElement?.close(returnValue);
    this.open = false;
  }

  private syncOpenState() {
    const dialog = this.dialogElement;
    if (!dialog) return;
    if (this.open) {
      if (dialog.open) return;
      if (this.modal) {
        dialog.showModal();
      } else {
        dialog.show();
      }
    } else if (dialog.open) {
      this.pendingCloseReason ??= "programmatic";
      dialog.close();
    }
  }

  private hasSlotContent(name: SlotName): boolean {
    return hasSlotContent(this, name);
  }

  private onClose = () => {
    const reason = this.pendingCloseReason ?? "programmatic";
    this.pendingCloseReason = null;
    if (this.open) {
      this.open = false;
    }
    this.dispatchEvent(
      new CustomEvent("overlay-close", {
        detail: { reason },
        bubbles: true,
        composed: true,
      }),
    );
    this.restoreFocus();
  };

  private onCancel = () => {
    this.pendingCloseReason ??= "escape";
  };

  private captureFocusOrigin() {
    const active = document.activeElement;
    if (active instanceof HTMLElement && !this.contains(active)) {
      this.focusReturnElement = active;
    }
  }

  private restoreFocus() {
    const target = this.focusReturnElement;
    this.focusReturnElement = null;
    if (target?.isConnected) {
      target.focus();
    }
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    this.pendingCloseReason = "escape";
    this.close();
  };

  override render() {
    const hasTitle = this.hasSlotContent("title");
    const hasDescription = this.hasSlotContent("description");
    const describedBy = buildDescribedBy(
      this.ariaDescribedbyValue,
      hasDescription ? this.descriptionId : null,
    );

    const ariaLabel = hasTitle ? undefined : this.ariaLabelValue || undefined;
    const ariaLabelledby = hasTitle
      ? this.titleId
      : this.ariaLabelledbyValue || undefined;
    const ariaModal = this.modal ? "true" : undefined;

    return html`
      <dialog
        part="base"
        @cancel=${this.onCancel}
        @close=${this.onClose}
        @keydown=${this.onKeyDown}
        aria-label=${ifDefined(ariaLabel)}
        aria-labelledby=${ifDefined(ariaLabelledby)}
        aria-describedby=${ifDefined(describedBy)}
        aria-modal=${ifDefined(ariaModal)}
      >
        <div part="panel" class="panel">
          <h2
            part="title"
            class="title"
            id=${this.titleId}
            ?hidden=${!hasTitle}
          >
            <slot name="title"></slot>
          </h2>
          <div
            part="description"
            class="description"
            id=${this.descriptionId}
            ?hidden=${!hasDescription}
          >
            <slot name="description"></slot>
          </div>
          <div part="body" class="body">
            <slot></slot>
          </div>
          <div part="actions" class="actions">
            <slot name="actions"></slot>
          </div>
        </div>
      </dialog>
    `;
  }
}
