import {LitElement, css, html} from 'lit';
import type {CSSResultGroup} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {createId} from './internal';

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

  static override readonly styles: CSSResultGroup = css`
    :host {
      position: relative;
      display: inline-flex;
    }

    .trigger {
      display: inline-flex;
    }

    .panel {
      position: absolute;
      z-index: var(--uik-z-local-overlay);
      min-width: max-content;
      padding: var(--uik-space-3) var(--uik-space-4);
      color: oklch(var(--uik-text-default));
      background-color: oklch(var(--uik-surface-popover));
      border: var(--uik-border-width-1) solid oklch(var(--uik-border-default));
      border-radius: var(--uik-radius-3);
      box-shadow: var(--uik-elevation-popover-shadow);
    }

    :host([placement='bottom-start']) .panel,
    :host([placement='bottom']) .panel,
    :host([placement='bottom-end']) .panel {
      top: calc(100% + var(--uik-space-2));
    }

    :host([placement='top-start']) .panel,
    :host([placement='top']) .panel,
    :host([placement='top-end']) .panel {
      bottom: calc(100% + var(--uik-space-2));
    }

    :host([placement='bottom-start']) .panel,
    :host([placement='top-start']) .panel {
      left: 0;
    }

    :host([placement='bottom']) .panel,
    :host([placement='top']) .panel {
      left: 50%;
      transform: translateX(-50%);
    }

    :host([placement='bottom-end']) .panel,
    :host([placement='top-end']) .panel {
      right: 0;
    }

    .panel[hidden] {
      display: none;
    }
  `;

  protected readonly panelRole?: string;
  protected readonly openOn: 'click' | 'hover' = 'click';
  protected readonly defaultPopoverType: 'auto' | 'manual' | 'hint' = 'auto';

  protected onTriggerSlotChange() {
    // intended for subclasses
  }

  private get panelElement(): HTMLElement | null {
    return this.renderRoot.querySelector('.panel');
  }

  private get popoverSupported(): boolean {
    return Object.hasOwn(HTMLElement.prototype, 'popover');
  }

  override firstUpdated() {
    this.syncOpenState();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('open')) {
      this.syncOpenState();
    }
  }

  show() {
    this.open = true;
  }

  hide() {
    this.open = false;
  }

  toggle() {
    this.open = !this.open;
  }

  private syncOpenState() {
    const panel = this.panelElement;
    if (!panel) return;

    if (this.popoverSupported) {
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

  private onPanelKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.open = false;
    }
  };

  private onToggle = (event: Event) => {
    const nextState = (event as Event & {newState?: string}).newState;
    if (nextState === 'open') {
      this.open = true;
    } else if (nextState === 'closed') {
      this.open = false;
    }
  };

  private handleTriggerSlotChange = () => {
    this.onTriggerSlotChange();
  };

  override render() {
    const popoverValue = this.popover || this.defaultPopoverType;
    const shouldSetPopover = this.popoverSupported ? popoverValue : undefined;

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
