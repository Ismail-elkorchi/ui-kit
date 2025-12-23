import {beforeEach, describe, expect, it} from 'vitest';

import type {UikPopover} from '../src/atomic/overlay/uik-popover';
import '../src/atomic/overlay/uik-popover';

describe('uik-popover', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('does not throw when toggling without Popover API support', async () => {
    const popover = document.createElement('uik-popover') as UikPopover;
    popover.innerHTML = `
      <button slot="trigger">Open</button>
      <div>Content</div>
    `;
    document.body.append(popover);

    await popover.updateComplete;

    popover.open = true;
    await popover.updateComplete;

    const panel = popover.shadowRoot?.querySelector('.panel');
    expect(panel).not.toBeNull();

    if (!Object.hasOwn(HTMLElement.prototype, 'popover')) {
      expect(panel?.hasAttribute('hidden')).toBe(false);
    }
  });
});
