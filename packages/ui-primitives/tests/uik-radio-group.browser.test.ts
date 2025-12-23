import {beforeEach, describe, expect, it} from 'vitest';
import {userEvent} from 'vitest/browser';

import type {UikRadio} from '../src/atomic/control/uik-radio';
import type {UikRadioGroup} from '../src/composed/collection/uik-radio-group';
import '../src/composed/collection/uik-radio-group';
import '../src/atomic/control/uik-radio';

describe('uik-radio-group', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('moves selection with arrow keys', async () => {
    const group = document.createElement('uik-radio-group') as UikRadioGroup;
    group.name = 'billing';
    group.value = 'monthly';
    group.innerHTML = `
      <uik-radio value="monthly"><span slot="label">Monthly</span></uik-radio>
      <uik-radio value="annual"><span slot="label">Annual</span></uik-radio>
      <uik-radio value="lifetime"><span slot="label">Lifetime</span></uik-radio>
    `;
    document.body.append(group);

    await group.updateComplete;

    const radios = Array.from(group.querySelectorAll<UikRadio>('uik-radio'));
    await Promise.all(radios.map(radio => radio.updateComplete));

    const firstInput = radios[0]?.shadowRoot?.querySelector<HTMLInputElement>('input');
    firstInput?.focus();

    await userEvent.keyboard('{ArrowDown}');
    expect(group.value).toBe('annual');

    await userEvent.keyboard('{ArrowDown}');
    expect(group.value).toBe('lifetime');

    await userEvent.keyboard('{ArrowUp}');
    expect(group.value).toBe('annual');
  });
});
