import {beforeEach, describe, expect, it} from 'vitest';

import type {UikPopover} from '../src/atomic/overlay/uik-popover';
import '../src/atomic/overlay/uik-popover';

describe('uik-popover', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('toggles open state and hidden attribute when popover is unsupported', async () => {
    const popover = document.createElement('uik-popover') as UikPopover;
    Object.defineProperty(popover, 'popoverSupported', {
      get: () => false,
    });
    popover.innerHTML = `
      <button slot="trigger">Open</button>
      <div>Content</div>
    `;
    document.body.append(popover);

    await popover.updateComplete;

    popover.show();
    await popover.updateComplete;

    const panel = popover.shadowRoot?.querySelector<HTMLElement>('.panel');
    expect(panel?.hasAttribute('hidden')).toBe(false);

    popover.hide();
    await popover.updateComplete;

    expect(panel?.hasAttribute('hidden')).toBe(true);
  });

  it('evaluates popover support using the default getter', async () => {
    const popover = document.createElement('uik-popover') as UikPopover;
    popover.innerHTML = `
      <span slot="trigger">Trigger</span>
      <div>Content</div>
    `;
    document.body.append(popover);

    await popover.updateComplete;

    const supported = (popover as unknown as {popoverSupported: boolean}).popoverSupported;
    expect(typeof supported).toBe('boolean');
  });

  it('handles trigger click and key interactions', async () => {
    const popover = document.createElement('uik-popover') as UikPopover;
    Object.defineProperty(popover, 'popoverSupported', {
      get: () => false,
    });
    popover.innerHTML = `
      <span slot="trigger">Trigger</span>
      <div>Content</div>
    `;
    document.body.append(popover);

    await popover.updateComplete;

    const trigger = popover.shadowRoot?.querySelector<HTMLElement>('.trigger');
    if (!trigger) throw new Error('Expected trigger.');

    const prevented = new MouseEvent('click', {bubbles: true, cancelable: true});
    prevented.preventDefault();
    trigger.dispatchEvent(prevented);
    await popover.updateComplete;
    expect(popover.open).toBe(false);

    trigger.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    await popover.updateComplete;
    expect(popover.open).toBe(true);

    trigger.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
    trigger.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
    await popover.updateComplete;
    expect(popover.open).toBe(true);

    trigger.dispatchEvent(new MouseEvent('mouseleave', {bubbles: true}));
    await popover.updateComplete;
    expect(popover.open).toBe(true);

    const panel = popover.shadowRoot?.querySelector<HTMLElement>('.panel');
    panel?.dispatchEvent(new MouseEvent('mouseleave', {bubbles: true}));
    await popover.updateComplete;
    expect(popover.open).toBe(true);

    trigger.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    await popover.updateComplete;
    expect(popover.open).toBe(true);

    const triggerSlot = popover.querySelector<HTMLElement>('[slot="trigger"]');
    if (!triggerSlot) throw new Error('Expected trigger slot.');
    triggerSlot.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
    await popover.updateComplete;
    expect(popover.open).toBe(false);
  });

  it('ignores click and keydown when configured for hover', async () => {
    const popover = document.createElement('uik-popover') as UikPopover;
    Object.defineProperty(popover, 'popoverSupported', {
      get: () => false,
    });
    (popover as unknown as {openOn: 'hover' | 'click'}).openOn = 'hover';
    popover.innerHTML = `
      <span slot="trigger">Trigger</span>
      <div>Content</div>
    `;
    document.body.append(popover);

    await popover.updateComplete;

    const trigger = popover.shadowRoot?.querySelector<HTMLElement>('.trigger');
    if (!trigger) throw new Error('Expected trigger.');

    trigger.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    trigger.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
    await popover.updateComplete;
    expect(popover.open).toBe(false);
  });

  it('skips keydown handling when default is prevented', async () => {
    const popover = document.createElement('uik-popover') as UikPopover;
    Object.defineProperty(popover, 'popoverSupported', {
      get: () => false,
    });
    popover.innerHTML = `
      <span slot="trigger">Trigger</span>
      <div>Content</div>
    `;
    document.body.append(popover);

    await popover.updateComplete;

    const trigger = popover.shadowRoot?.querySelector<HTMLElement>('.trigger');
    if (!trigger) throw new Error('Expected trigger.');

    const prevented = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true});
    prevented.preventDefault();
    trigger.dispatchEvent(prevented);
    await popover.updateComplete;

    expect(popover.open).toBe(false);
  });

  it('ignores keydown for native controls', async () => {
    const popover = document.createElement('uik-popover') as UikPopover;
    Object.defineProperty(popover, 'popoverSupported', {
      get: () => false,
    });
    popover.innerHTML = `
      <button slot="trigger">Open</button>
      <div>Content</div>
    `;
    document.body.append(popover);

    await popover.updateComplete;

    const triggerButton = popover.querySelector<HTMLButtonElement>('button');
    if (!triggerButton) throw new Error('Expected trigger button.');
    triggerButton.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
    await popover.updateComplete;
    expect(popover.open).toBe(false);
  });

  it('supports hover interactions and escape dismiss', async () => {
    const popover = document.createElement('uik-popover') as UikPopover;
    Object.defineProperty(popover, 'popoverSupported', {
      get: () => false,
    });
    (popover as unknown as {openOn: 'hover' | 'click'}).openOn = 'hover';
    popover.innerHTML = `
      <span slot="trigger">Trigger</span>
      <div>Content</div>
    `;
    document.body.append(popover);

    await popover.updateComplete;

    const trigger = popover.shadowRoot?.querySelector<HTMLElement>('.trigger');
    const panel = popover.shadowRoot?.querySelector<HTMLElement>('.panel');
    if (!trigger || !panel) throw new Error('Expected trigger and panel.');

    trigger.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    await popover.updateComplete;
    expect(popover.open).toBe(true);

    trigger.dispatchEvent(new MouseEvent('mouseleave', {bubbles: true}));
    await popover.updateComplete;
    expect(popover.open).toBe(false);

    trigger.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    await popover.updateComplete;
    expect(popover.open).toBe(true);

    panel.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    trigger.dispatchEvent(new MouseEvent('mouseleave', {bubbles: true}));
    await popover.updateComplete;
    expect(popover.open).toBe(true);

    trigger.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
    await popover.updateComplete;
    expect(popover.open).toBe(true);

    panel.dispatchEvent(new MouseEvent('mouseleave', {bubbles: true}));
    await popover.updateComplete;
    expect(popover.open).toBe(false);

    trigger.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
    await popover.updateComplete;
    expect(popover.open).toBe(true);

    trigger.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
    await popover.updateComplete;
    expect(popover.open).toBe(false);

    popover.open = true;
    await popover.updateComplete;
    panel.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    await popover.updateComplete;
    expect(popover.open).toBe(false);
  });

  it('syncs toggle events and placements', async () => {
    const popover = document.createElement('uik-popover') as UikPopover;
    Object.defineProperty(popover, 'popoverSupported', {
      get: () => false,
    });
    popover.placement = 'invalid' as UikPopover['placement'];
    popover.innerHTML = `
      <span slot="trigger">Trigger</span>
      <div>Content</div>
    `;
    document.body.append(popover);

    await popover.updateComplete;

    const panel = popover.shadowRoot?.querySelector<HTMLElement>('.panel');
    expect(panel?.getAttribute('data-placement')).toBe('bottom-start');

    const openEvent = new Event('toggle');
    Object.defineProperty(openEvent, 'newState', {value: 'open'});
    panel?.dispatchEvent(openEvent);
    await popover.updateComplete;
    expect(popover.open).toBe(true);

    const closeEvent = new Event('toggle');
    Object.defineProperty(closeEvent, 'newState', {value: 'closed'});
    panel?.dispatchEvent(closeEvent);
    await popover.updateComplete;
    expect(popover.open).toBe(false);

    (popover as unknown as {onToggle: (event: Event) => void}).onToggle({
      newState: 'closed',
    } as Event);

    (popover as unknown as {onToggle: (event: Event) => void}).onToggle({
      newState: 'idle',
    } as Event);
  });

  it('dismisses on outside clicks when open and not using Popover API', async () => {
    const popover = document.createElement('uik-popover') as UikPopover;
    Object.defineProperty(popover, 'popoverSupported', {
      get: () => false,
    });
    popover.innerHTML = `
      <span slot="trigger">Trigger</span>
      <div>Content</div>
    `;
    document.body.append(popover);

    await popover.updateComplete;

    popover.open = true;
    await popover.updateComplete;

    document.dispatchEvent(new PointerEvent('pointerdown', {button: 0, bubbles: true, composed: true}));
    await popover.updateComplete;

    expect(popover.open).toBe(false);
  });

  it('invokes popover methods when Popover API is supported', async () => {
    const popover = document.createElement('uik-popover') as UikPopover;
    Object.defineProperty(popover, 'popoverSupported', {
      get: () => true,
    });
    popover.popover = 'auto';
    popover.innerHTML = `
      <span slot="trigger">Trigger</span>
      <div>Content</div>
    `;
    document.body.append(popover);

    await popover.updateComplete;

    const panel = popover.shadowRoot?.querySelector<HTMLElement>('.panel');
    if (!panel) throw new Error('Expected panel.');

    let shown = 0;
    let hidden = 0;
    (panel as HTMLElement & {showPopover: () => void}).showPopover = () => {
      shown += 1;
    };
    (panel as HTMLElement & {hidePopover: () => void}).hidePopover = () => {
      hidden += 1;
    };

    popover.open = true;
    await popover.updateComplete;
    popover.open = false;
    await popover.updateComplete;

    expect(shown).toBe(1);
    expect(hidden).toBe(1);
  });

  it('no-ops open state sync when panel is missing', async () => {
    const popover = document.createElement('uik-popover') as UikPopover;
    Object.defineProperty(popover, 'popoverSupported', {
      get: () => false,
    });
    popover.innerHTML = `
      <span slot="trigger">Trigger</span>
      <div>Content</div>
    `;
    document.body.append(popover);

    await popover.updateComplete;

    popover.shadowRoot?.querySelector('.panel')?.remove();

    (popover as unknown as {syncOpenState: () => void}).syncOpenState();

    expect(true).toBe(true);
  });
});
