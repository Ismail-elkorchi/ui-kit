import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {styles} from './styles';
import {createId} from '../../../internal';
import {createEscapeKeyHandler, createOutsideDismissController} from '../../../internal/overlay/dismiss';
import {resolvePlacement} from '../../../internal/overlay/positioning';

type OverlayCloseReason = 'escape' | 'outside' | 'programmatic' | 'toggle';

@customElement('uik-popover')
export class UikPopover extends LitElement {
  @property({type: Boolean, reflect: true, useDefault: true}) accessor open = false;
  @property({type: String, reflect: true, useDefault: true}) accessor placement:
    | 'bottom-start'
    | 'bottom'
    | 'bottom-end'
    | 'top-start'
    | 'top'
    | 'top-end' = 'bottom-start';
  @property({type: String, reflect: true, useDefault: true}) override accessor popover:
    | ''
    | 'auto'
    | 'manual'
    | 'hint' = '';
  @property({attribute: 'aria-label'}) accessor ariaLabelValue = '';
  @property({attribute: 'aria-labelledby'}) accessor ariaLabelledbyValue = '';
  @property({attribute: 'aria-describedby'}) accessor ariaDescribedbyValue = '';

  protected readonly panelId = createId('uik-popover');
  private pointerInPanel = false;
  private pendingCloseReason: OverlayCloseReason | null = null;
  private readonly outsideDismiss = createOutsideDismissController(this, () => {
    this.requestClose('outside');
  });

  static override readonly styles = styles;

  protected readonly panelRole?: string;
  protected readonly openOn: 'click' | 'hover' = 'click';

  protected onTriggerSlotChange() {
    // intended for subclasses
  }

  private get panelElement(): HTMLElement | null {
    return this.renderRoot.querySelector('.panel');
  }

  private get popoverSupported(): boolean {
    return Object.hasOwn(HTMLElement.prototype, 'popover');
  }

  private get usesNativePopover(): boolean {
    return this.popoverSupported && this.popover !== '';
  }

  override firstUpdated() {
    this.syncOpenState();
    this.syncDismissListeners();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('open')) {
      this.syncOpenState();
      this.syncDismissListeners();
      const previous = changed.get('open') as boolean | undefined;
      if (previous && !this.open) {
        this.emitCloseReason();
      }
    }
  }

  show() {
    this.open = true;
  }

  hide() {
    this.requestClose('programmatic');
  }

  toggle() {
    if (this.open) {
      this.requestClose('toggle');
    } else {
      this.open = true;
    }
  }

  private requestClose(reason: OverlayCloseReason) {
    this.pendingCloseReason = reason;
    this.open = false;
  }

  private emitCloseReason() {
    const reason = this.pendingCloseReason ?? 'programmatic';
    this.pendingCloseReason = null;
    this.dispatchEvent(
      new CustomEvent('overlay-close', {
        detail: {reason},
        bubbles: true,
        composed: true,
      }),
    );
  }

  private syncOpenState() {
    const panel = this.panelElement;
    if (!panel) return;

    if (this.usesNativePopover) {
      const popoverElement = panel as HTMLElement & {
        showPopover: () => void;
        hidePopover: () => void;
      };

      if (this.open) {
        popoverElement.showPopover();
      } else {
        popoverElement.hidePopover();
      }
    } else {
      panel.toggleAttribute('hidden', !this.open);
    }
  }

  private onTriggerClick = (event: MouseEvent) => {
    if (this.openOn !== 'click') return;
    if (event.defaultPrevented) return;
    this.toggle();
  };

  private onTriggerKeyDown = (event: KeyboardEvent) => {
    if (this.openOn !== 'click') return;
    if (event.defaultPrevented) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    const path = event.composedPath();
    const hasNativeControl = path.some(
      node =>
        node instanceof HTMLButtonElement ||
        node instanceof HTMLAnchorElement ||
        node instanceof HTMLInputElement ||
        node instanceof HTMLSelectElement ||
        node instanceof HTMLTextAreaElement,
    );
    if (hasNativeControl) return;

    event.preventDefault();
    this.toggle();
  };

  private onTriggerMouseEnter = () => {
    if (this.openOn !== 'hover') return;
    this.open = true;
  };

  private onTriggerMouseLeave = () => {
    if (this.openOn !== 'hover') return;
    if (this.pointerInPanel) return;
    this.open = false;
  };

  private onTriggerFocusIn = () => {
    if (this.openOn !== 'hover') return;
    this.open = true;
  };

  private onTriggerFocusOut = () => {
    if (this.openOn !== 'hover') return;
    if (this.pointerInPanel) return;
    this.open = false;
  };

  private onPanelMouseEnter = () => {
    this.pointerInPanel = true;
  };

  private onPanelMouseLeave = () => {
    this.pointerInPanel = false;
    if (this.openOn === 'hover') {
      this.open = false;
    }
  };

  private readonly onPanelKeyDown = createEscapeKeyHandler(() => {
    this.requestClose('escape');
  });

  private onToggle = (event: Event) => {
    const nextState = (event as Event & {newState?: string}).newState;
    if (nextState === 'open') {
      this.open = true;
    } else if (nextState === 'closed') {
      this.pendingCloseReason ??= 'toggle';
      this.open = false;
    }
  };

  private handleTriggerSlotChange = () => {
    this.onTriggerSlotChange();
  };

  private syncDismissListeners() {
    const shouldDismissOnOutsideClick = this.open && this.openOn === 'click' && !this.usesNativePopover;
    if (shouldDismissOnOutsideClick) {
      this.outsideDismiss.connect();
    } else {
      this.outsideDismiss.disconnect();
    }
  }

  override disconnectedCallback() {
    this.outsideDismiss.disconnect();
    super.disconnectedCallback();
  }

  override render() {
    const shouldSetPopover = this.usesNativePopover ? this.popover : undefined;
    const placement = resolvePlacement(this.placement);

    return html`
      <span
        part="control"
        class="trigger"
        @click=${this.onTriggerClick}
        @keydown=${this.onTriggerKeyDown}
        @mouseenter=${this.onTriggerMouseEnter}
        @mouseleave=${this.onTriggerMouseLeave}
        @focusin=${this.onTriggerFocusIn}
        @focusout=${this.onTriggerFocusOut}>
        <slot name="trigger" @slotchange=${this.handleTriggerSlotChange}></slot>
      </span>
      <div
        part="base"
        class="panel"
        id=${this.panelId}
        data-placement=${placement}
        popover=${ifDefined(shouldSetPopover)}
        role=${ifDefined(this.panelRole)}
        aria-label=${ifDefined(this.ariaLabelValue || undefined)}
        aria-labelledby=${ifDefined(this.ariaLabelledbyValue || undefined)}
        aria-describedby=${ifDefined(this.ariaDescribedbyValue || undefined)}
        aria-hidden=${ifDefined(this.open ? undefined : 'true')}
        @mouseenter=${this.onPanelMouseEnter}
        @mouseleave=${this.onPanelMouseLeave}
        @keydown=${this.onPanelKeyDown}
        @toggle=${this.onToggle}>
        <slot></slot>
      </div>
    `;
  }
}
