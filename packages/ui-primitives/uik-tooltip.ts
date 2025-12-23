import {css} from 'lit';
import type {CSSResultGroup} from 'lit';
import {customElement} from 'lit/decorators.js';

import {UikPopover} from './uik-popover';

@customElement('uik-tooltip')
export class UikTooltip extends UikPopover {
  static override readonly styles: CSSResultGroup = [
    UikPopover.styles,
    css`
      .panel {
        z-index: var(--uik-z-local-tooltip);
        padding: var(--uik-space-2) var(--uik-space-3);
        font-size: var(--uik-typography-font-size-2);
        line-height: var(--uik-typography-line-height-3);
        color: oklch(var(--uik-text-inverse));
        pointer-events: none;
        background-color: oklch(var(--uik-text-strong));
        border-color: oklch(var(--uik-border-default) / var(--uik-opacity-0));
        box-shadow: var(--uik-shadow-2);
      }
    `,
  ];

  protected override readonly openOn: 'click' | 'hover' = 'hover';
  protected override readonly defaultPopoverType: 'auto' | 'manual' | 'hint' = 'hint';
  protected override readonly panelRole = 'tooltip';

  override firstUpdated() {
    super.firstUpdated();
    this.syncTriggerAria();
  }

  protected override onTriggerSlotChange() {
    this.syncTriggerAria();
  }

  private get triggerSlot(): HTMLSlotElement | null {
    return this.renderRoot.querySelector('slot[name="trigger"]');
  }

  private syncTriggerAria() {
    const slot = this.triggerSlot;
    if (!slot) return;
    const elements = slot.assignedElements({flatten: true});
    elements.forEach(element => {
      if (!(element instanceof HTMLElement)) return;
      const existing = element.getAttribute('aria-describedby');
      const ids = new Set((existing ?? '').split(' ').filter(Boolean));
      ids.add(this.panelId);
      element.setAttribute('aria-describedby', Array.from(ids).join(' '));
    });
  }
}
