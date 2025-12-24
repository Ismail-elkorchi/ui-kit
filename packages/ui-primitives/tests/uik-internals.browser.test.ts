import {beforeEach, describe, expect, it} from 'vitest';

import {buildDescribedBy, createId, hasSlotContent} from '../src/internal';
import {createEscapeKeyHandler, createOutsideDismissController} from '../src/internal/overlay/dismiss';
import {defaultPlacement, resolvePlacement} from '../src/internal/overlay/positioning';

describe('ui-primitives internal helpers', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('creates unique ids with prefixes', () => {
    const first = createId('uik-test');
    const second = createId('uik-test');
    expect(first).not.toBe(second);
    expect(first.startsWith('uik-test-')).toBe(true);
    expect(second.startsWith('uik-test-')).toBe(true);
  });

  it('detects slot content based on text or children', () => {
    const host = document.createElement('div');
    host.innerHTML = '<span slot="label">   </span>'; // whitespace only
    document.body.append(host);

    expect(hasSlotContent(host, 'label')).toBe(false);

    const child = document.createElement('span');
    child.setAttribute('slot', 'label');
    child.textContent = 'Label';
    host.append(child);

    expect(hasSlotContent(host, 'label')).toBe(true);
  });

  it('builds aria-describedby values when ids are provided', () => {
    expect(buildDescribedBy()).toBeUndefined();
    expect(buildDescribedBy(null, undefined)).toBeUndefined();
    expect(buildDescribedBy('hint', null, 'error')).toBe('hint error');
  });

  it('resolves overlay placement with fallbacks', () => {
    expect(resolvePlacement('top')).toBe('top');
    expect(resolvePlacement('invalid')).toBe(defaultPlacement);
    expect(resolvePlacement(undefined, 'bottom')).toBe('bottom');
  });

  it('dismisses on outside pointer events and ignores inside or non-primary clicks', () => {
    const host = document.createElement('div');
    document.body.append(host);

    let dismissed = 0;
    const controller = createOutsideDismissController(host, () => {
      dismissed += 1;
    });

    controller.connect();
    controller.connect();

    host.dispatchEvent(new PointerEvent('pointerdown', {button: 0, bubbles: true, composed: true}));
    expect(dismissed).toBe(0);

    document.dispatchEvent(new PointerEvent('pointerdown', {button: 1, bubbles: true, composed: true}));
    expect(dismissed).toBe(0);

    document.dispatchEvent(new PointerEvent('pointerdown', {button: 0, bubbles: true, composed: true}));
    expect(dismissed).toBe(1);

    controller.disconnect();
  });

  it('handles escape key presses only', () => {
    let escaped = false;
    const handler = createEscapeKeyHandler(() => {
      escaped = true;
    });

    handler(new KeyboardEvent('keydown', {key: 'Enter'}));
    expect(escaped).toBe(false);

    handler(new KeyboardEvent('keydown', {key: 'Escape'}));
    expect(escaped).toBe(true);
  });
});
