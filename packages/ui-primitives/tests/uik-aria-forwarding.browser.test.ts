import {beforeEach, describe, expect, it} from 'vitest';

import type {UikLink} from '../src/atomic/control/uik-link';
import type {UikSelect} from '../src/atomic/control/uik-select';
import type {UikTextarea} from '../src/atomic/control/uik-textarea';
import '../src/atomic/control/uik-link';
import '../src/atomic/control/uik-select';
import '../src/atomic/control/uik-textarea';

describe('aria forwarding', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('forwards aria-label to the internal link', async () => {
    const link = document.createElement('uik-link') as UikLink;
    link.setAttribute('aria-label', 'Documentation');
    link.href = '#';
    document.body.append(link);

    await link.updateComplete;

    const anchor = link.shadowRoot?.querySelector('a');
    expect(anchor?.getAttribute('aria-label')).toBe('Documentation');
  });

  it('does not forward aria-label when textarea has a label slot', async () => {
    const textarea = document.createElement('uik-textarea') as UikTextarea;
    textarea.setAttribute('aria-label', 'Hidden label');
    textarea.innerHTML = '<span slot="label">Message</span>';
    document.body.append(textarea);

    await textarea.updateComplete;

    const control = textarea.shadowRoot?.querySelector('textarea');
    expect(control?.getAttribute('aria-label')).toBeNull();
  });

  it('forwards aria-label to select when no label slot is provided', async () => {
    const select = document.createElement('uik-select') as UikSelect;
    select.setAttribute('aria-label', 'Plan');
    select.innerHTML = '<option value="basic">Basic</option>';
    document.body.append(select);

    await select.updateComplete;

    const control = select.shadowRoot?.querySelector('select');
    expect(control?.getAttribute('aria-label')).toBe('Plan');
  });
});
