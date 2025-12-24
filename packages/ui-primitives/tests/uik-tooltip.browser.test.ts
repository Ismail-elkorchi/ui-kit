import {beforeEach, describe, expect, it} from 'vitest';

import type {UikTooltip} from '../src/composed/overlay/uik-tooltip';
import '../src/composed/overlay/uik-tooltip';

describe('uik-tooltip', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('adds tooltip id to trigger aria-describedby', async () => {
    const tooltip = document.createElement('uik-tooltip') as UikTooltip;
    Object.defineProperty(tooltip, 'popoverSupported', {
      get: () => false,
    });
    tooltip.innerHTML = `
      <button slot="trigger" aria-describedby="existing">Help</button>
      <span>Tip</span>
    `;
    document.body.append(tooltip);

    await tooltip.updateComplete;

    const panel = tooltip.shadowRoot?.querySelector<HTMLElement>('.panel');
    const trigger = tooltip.querySelector('button');
    expect(panel?.id).toBeTruthy();
    expect(trigger?.getAttribute('aria-describedby')).toContain(panel?.id ?? '');
    expect(trigger?.getAttribute('aria-describedby')).toContain('existing');
  });

  it('evaluates popover support using the default getter', async () => {
    const tooltip = document.createElement('uik-tooltip') as UikTooltip;
    tooltip.innerHTML = `
      <span slot="trigger">Trigger</span>
      <span>Tip</span>
    `;
    document.body.append(tooltip);

    await tooltip.updateComplete;

    const supported = (tooltip as unknown as {popoverSupported: boolean}).popoverSupported;
    expect(typeof supported).toBe('boolean');
  });

  it('handles hover interactions and escape dismissal', async () => {
    const tooltip = document.createElement('uik-tooltip') as UikTooltip;
    Object.defineProperty(tooltip, 'popoverSupported', {
      get: () => false,
    });
    tooltip.innerHTML = `
      <span slot="trigger">Trigger</span>
      <span>Tip</span>
    `;
    document.body.append(tooltip);

    await tooltip.updateComplete;

    const trigger = tooltip.shadowRoot?.querySelector<HTMLElement>('.trigger');
    const panel = tooltip.shadowRoot?.querySelector<HTMLElement>('.panel');
    if (!trigger || !panel) throw new Error('Expected trigger and panel.');

    trigger.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    trigger.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(false);

    trigger.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(true);

    trigger.dispatchEvent(new MouseEvent('mouseleave', {bubbles: true}));
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(false);

    trigger.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(true);

    panel.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    trigger.dispatchEvent(new MouseEvent('mouseleave', {bubbles: true}));
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(true);

    trigger.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(true);

    panel.dispatchEvent(new MouseEvent('mouseleave', {bubbles: true}));
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(false);

    trigger.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(true);

    trigger.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(false);

    tooltip.open = true;
    await tooltip.updateComplete;
    panel.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(false);
  });

  it('supports click triggers when configured', async () => {
    const tooltip = document.createElement('uik-tooltip') as UikTooltip;
    Object.defineProperty(tooltip, 'popoverSupported', {
      get: () => false,
    });
    (tooltip as unknown as {openOn: 'hover' | 'click'}).openOn = 'click';
    tooltip.innerHTML = `
      <span slot="trigger">Trigger</span>
      <span>Tip</span>
    `;
    document.body.append(tooltip);

    await tooltip.updateComplete;

    const trigger = tooltip.shadowRoot?.querySelector<HTMLElement>('.trigger');
    if (!trigger) throw new Error('Expected trigger.');

    const prevented = new MouseEvent('click', {bubbles: true, cancelable: true});
    prevented.preventDefault();
    trigger.dispatchEvent(prevented);
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(false);

    trigger.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(true);

    trigger.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    trigger.dispatchEvent(new MouseEvent('mouseleave', {bubbles: true}));
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(true);

    trigger.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
    trigger.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(true);

    trigger.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(true);

    trigger.dispatchEvent(new KeyboardEvent('keydown', {key: ' ', bubbles: true}));
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(false);

    trigger.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(true);

    const panel = tooltip.shadowRoot?.querySelector<HTMLElement>('.panel');
    panel?.dispatchEvent(new MouseEvent('mouseleave', {bubbles: true}));
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(true);

    tooltip.innerHTML = `
      <button slot="trigger">Trigger</button>
      <span>Tip</span>
    `;
    await tooltip.updateComplete;

    tooltip.open = false;
    await tooltip.updateComplete;

    const button = tooltip.querySelector('button');
    button?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(false);
  });

  it('skips keydown handling when default is prevented', async () => {
    const tooltip = document.createElement('uik-tooltip') as UikTooltip;
    Object.defineProperty(tooltip, 'popoverSupported', {
      get: () => false,
    });
    (tooltip as unknown as {openOn: 'hover' | 'click'}).openOn = 'click';
    tooltip.innerHTML = `
      <span slot="trigger">Trigger</span>
      <span>Tip</span>
    `;
    document.body.append(tooltip);

    await tooltip.updateComplete;

    const trigger = tooltip.shadowRoot?.querySelector<HTMLElement>('.trigger');
    if (!trigger) throw new Error('Expected trigger.');

    const prevented = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true});
    prevented.preventDefault();
    trigger.dispatchEvent(prevented);
    await tooltip.updateComplete;

    expect(tooltip.open).toBe(false);
  });

  it('syncs trigger aria-describedby for non-HTMLElement triggers', async () => {
    const tooltip = document.createElement('uik-tooltip') as UikTooltip;
    Object.defineProperty(tooltip, 'popoverSupported', {
      get: () => false,
    });
    tooltip.innerHTML = `
      <svg slot="trigger" viewBox="0 0 10 10"></svg>
      <span>Tip</span>
    `;
    document.body.append(tooltip);

    await tooltip.updateComplete;

    const panel = tooltip.shadowRoot?.querySelector<HTMLElement>('.panel');
    const svg = tooltip.querySelector('svg');
    expect(panel?.id).toBeTruthy();
    expect(svg?.getAttribute('aria-describedby')).toBeNull();
  });

  it('syncs toggle events and panel role', async () => {
    const tooltip = document.createElement('uik-tooltip') as UikTooltip;
    Object.defineProperty(tooltip, 'popoverSupported', {
      get: () => false,
    });
    tooltip.innerHTML = `
      <span slot="trigger">Trigger</span>
      <span>Tip</span>
    `;
    document.body.append(tooltip);

    await tooltip.updateComplete;

    const panel = tooltip.shadowRoot?.querySelector<HTMLElement>('.panel');
    expect(panel?.getAttribute('role')).toBe('tooltip');

    const openEvent = new Event('toggle');
    Object.defineProperty(openEvent, 'newState', {value: 'open'});
    panel?.dispatchEvent(openEvent);
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(true);

    const closeEvent = new Event('toggle');
    Object.defineProperty(closeEvent, 'newState', {value: 'closed'});
    panel?.dispatchEvent(closeEvent);
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(false);

    (tooltip as unknown as {onToggle: (event: Event) => void}).onToggle({
      newState: 'closed',
    } as Event);

    (tooltip as unknown as {onToggle: (event: Event) => void}).onToggle({
      newState: 'idle',
    } as Event);
  });

  it('invokes popover methods when supported', async () => {
    const tooltip = document.createElement('uik-tooltip') as UikTooltip;
    Object.defineProperty(tooltip, 'popoverSupported', {
      get: () => true,
    });
    tooltip.popover = 'hint';
    tooltip.innerHTML = `
      <span slot="trigger">Trigger</span>
      <span>Tip</span>
    `;
    document.body.append(tooltip);

    await tooltip.updateComplete;

    const panel = tooltip.shadowRoot?.querySelector<HTMLElement>('.panel');
    if (!panel) throw new Error('Expected panel.');

    let shown = 0;
    let hidden = 0;
    (panel as HTMLElement & {showPopover: () => void}).showPopover = () => {
      shown += 1;
    };
    (panel as HTMLElement & {hidePopover: () => void}).hidePopover = () => {
      hidden += 1;
    };

    tooltip.open = true;
    await tooltip.updateComplete;
    tooltip.open = false;
    await tooltip.updateComplete;

    expect(shown).toBe(1);
    expect(hidden).toBe(1);
  });

  it('supports show and hide helpers and tolerates missing panels', async () => {
    const tooltip = document.createElement('uik-tooltip') as UikTooltip;
    Object.defineProperty(tooltip, 'popoverSupported', {
      get: () => false,
    });
    tooltip.innerHTML = `
      <span slot="trigger">Trigger</span>
      <span>Tip</span>
    `;
    document.body.append(tooltip);

    await tooltip.updateComplete;

    tooltip.show();
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(true);

    tooltip.hide();
    await tooltip.updateComplete;
    expect(tooltip.open).toBe(false);

    tooltip.shadowRoot?.replaceChildren();

    (tooltip as unknown as {syncOpenState: () => void}).syncOpenState();
    (tooltip as unknown as {syncTriggerAria: () => void}).syncTriggerAria();

    expect(true).toBe(true);
  });
});
