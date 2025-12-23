import {beforeEach, describe, expect, it} from 'vitest';

import type {UikCheckbox} from '../src/atomic/control/uik-checkbox';
import type {UikSelect} from '../src/atomic/control/uik-select';
import type {UikSwitch} from '../src/atomic/control/uik-switch';
import type {UikTextarea} from '../src/atomic/control/uik-textarea';
import type {UikRadioGroup} from '../src/composed/collection/uik-radio-group';
import '../src/atomic/control/uik-checkbox';
import '../src/atomic/control/uik-radio';
import '../src/atomic/control/uik-select';
import '../src/atomic/control/uik-switch';
import '../src/atomic/control/uik-textarea';
import '../src/composed/collection/uik-radio-group';

describe('form-associated primitives', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('submits textarea value via ElementInternals', async () => {
    const form = document.createElement('form');
    const textarea = document.createElement('uik-textarea') as UikTextarea;
    textarea.name = 'message';
    textarea.value = 'Hello world';
    form.append(textarea);
    document.body.append(form);

    await textarea.updateComplete;

    const data = new FormData(form);
    expect(data.get('message')).toBe('Hello world');
  });

  it('submits select value via ElementInternals', async () => {
    const form = document.createElement('form');
    const select = document.createElement('uik-select') as UikSelect;
    select.name = 'plan';
    select.innerHTML = `
      <option value="starter">Starter</option>
      <option value="pro">Pro</option>
    `;
    select.value = 'pro';
    form.append(select);
    document.body.append(form);

    await select.updateComplete;

    const data = new FormData(form);
    expect(data.get('plan')).toBe('pro');
  });

  it('submits checkbox value when checked', async () => {
    const form = document.createElement('form');
    const checkbox = document.createElement('uik-checkbox') as UikCheckbox;
    checkbox.name = 'terms';
    checkbox.value = 'yes';
    checkbox.checked = true;
    form.append(checkbox);
    document.body.append(form);

    await checkbox.updateComplete;

    const data = new FormData(form);
    expect(data.get('terms')).toBe('yes');
  });

  it('submits switch value when checked', async () => {
    const form = document.createElement('form');
    const toggle = document.createElement('uik-switch') as UikSwitch;
    toggle.name = 'alerts';
    toggle.value = 'enabled';
    toggle.checked = true;
    form.append(toggle);
    document.body.append(form);

    await toggle.updateComplete;

    const data = new FormData(form);
    expect(data.get('alerts')).toBe('enabled');
  });

  it('submits radio-group value via ElementInternals', async () => {
    const form = document.createElement('form');
    const group = document.createElement('uik-radio-group') as UikRadioGroup;
    group.name = 'billing';
    group.innerHTML = `
      <uik-radio value="monthly"><span slot="label">Monthly</span></uik-radio>
      <uik-radio value="annual"><span slot="label">Annual</span></uik-radio>
    `;
    group.value = 'annual';
    form.append(group);
    document.body.append(form);

    await group.updateComplete;

    const data = new FormData(form);
    expect(data.get('billing')).toBe('annual');
  });
});
