import {beforeEach, describe, expect, it} from 'vitest';
import {userEvent} from 'vitest/browser';

import type {UikRadio} from '../src/atomic/control/uik-radio';
import type {UikRadioGroup} from '../src/composed/collection/uik-radio-group';
import '../src/atomic/control/uik-radio';
import '../src/composed/collection/uik-radio-group';

describe('uik-radio', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('syncs radio state and focus', async () => {
    const radio = document.createElement('uik-radio') as UikRadio;
    radio.value = 'alpha';
    radio.innerHTML = '<span slot="label">Alpha</span>';
    document.body.append(radio);

    await radio.updateComplete;

    const control = radio.shadowRoot?.querySelector('input');
    if (!control) throw new Error('Expected input');

    control.checked = true;
    control.dispatchEvent(new Event('change', {bubbles: true}));
    await radio.updateComplete;
    expect(radio.checked).toBe(true);

    radio.focus();
    expect(radio.shadowRoot?.activeElement).toBe(control);
  });

  it('restores radio state from form callbacks', async () => {
    const radio = document.createElement('uik-radio') as UikRadio;
    document.body.append(radio);

    await radio.updateComplete;

    radio.formStateRestoreCallback(null);
    expect(radio.checked).toBe(false);

    radio.formStateRestoreCallback('yes');
    expect(radio.checked).toBe(true);
    expect(radio.value).toBe('yes');

    radio.formStateRestoreCallback(new FormData());
  });

  it('restores checked state and disabled state from form callbacks', async () => {
    const radio = document.createElement('uik-radio') as UikRadio;
    radio.checked = true;
    document.body.append(radio);

    await radio.updateComplete;

    radio.checked = false;
    radio.formResetCallback();
    expect(radio.checked).toBe(true);

    radio.formDisabledCallback(true);
    expect(radio.disabled).toBe(true);
  });

  it('applies aria attributes and required validity for standalone radios', async () => {
    const form = document.createElement('form');
    const radio = document.createElement('uik-radio') as UikRadio;
    radio.name = 'choice';
    radio.required = true;
    radio.setAttribute('aria-label', 'Choice');
    radio.setAttribute('aria-labelledby', 'external');
    form.append(radio);
    document.body.append(form);

    await radio.updateComplete;

    let control = radio.shadowRoot?.querySelector('input');
    expect(control?.getAttribute('aria-label')).toBe('Choice');
    expect(control?.getAttribute('aria-labelledby')).toBe('external');
    expect(form.checkValidity()).toBe(false);

    radio.checked = true;
    await radio.updateComplete;
    expect(form.checkValidity()).toBe(true);

    radio.innerHTML =
      '<span slot="label">Choice</span><span slot="hint">Hint</span><span slot="error">Error</span>';
    radio.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="label"]')?.dispatchEvent(
      new Event('slotchange'),
    );
    radio.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="hint"]')?.dispatchEvent(
      new Event('slotchange'),
    );
    radio.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="error"]')?.dispatchEvent(
      new Event('slotchange'),
    );
    await radio.updateComplete;
    control = radio.shadowRoot?.querySelector('input');
    expect(control?.getAttribute('aria-label')).toBeNull();
    expect(control?.getAttribute('aria-invalid')).toBe('true');

    await radio.updateComplete;
  });

  it('ignores validity sync when the internal input is missing', async () => {
    const radio = document.createElement('uik-radio') as UikRadio;
    document.body.append(radio);

    await radio.updateComplete;
    radio.shadowRoot?.querySelector('input')?.remove();

    radio.formResetCallback();

    expect(true).toBe(true);
  });

  it('respects group disabled state', async () => {
    const group = document.createElement('uik-radio-group') as UikRadioGroup;
    group.name = 'grouped';
    group.innerHTML = '<uik-radio value="a"><span slot="label">A</span></uik-radio>';
    document.body.append(group);

    await group.updateComplete;

    const radio = group.querySelector<UikRadio>('uik-radio');
    if (!radio) throw new Error('Expected radio');

    await radio.updateComplete;
    group.disabled = true;
    await group.updateComplete;
    await radio.updateComplete;

    const control = radio.shadowRoot?.querySelector('input');
    expect(control?.disabled).toBe(true);
  });

  it('omits grouped radios from form data', async () => {
    const form = document.createElement('form');
    const group = document.createElement('uik-radio-group') as UikRadioGroup;
    group.name = 'billing';
    group.innerHTML = `
      <uik-radio value="monthly"><span slot="label">Monthly</span></uik-radio>
      <uik-radio value="annual"><span slot="label">Annual</span></uik-radio>
    `;
    form.append(group);
    document.body.append(form);

    await group.updateComplete;

    const radio = group.querySelector<UikRadio>('uik-radio');
    if (!radio) throw new Error('Expected radio');
    await radio.updateComplete;

    group.value = 'annual';
    await group.updateComplete;

    const data = new FormData(form);
    expect(data.getAll('billing')).toEqual(['annual']);
  });

  it('supports arrow key navigation in horizontal groups', async () => {
    const group = document.createElement('uik-radio-group') as UikRadioGroup;
    group.orientation = 'horizontal';
    group.innerHTML = `
      <uik-radio value="left"><span slot="label">Left</span></uik-radio>
      <uik-radio value="right"><span slot="label">Right</span></uik-radio>
    `;
    document.body.append(group);

    await group.updateComplete;

    const radios = Array.from(group.querySelectorAll<UikRadio>('uik-radio'));
    await Promise.all(radios.map(radio => radio.updateComplete));

    const firstInput = radios[0]?.shadowRoot?.querySelector<HTMLInputElement>('input');
    firstInput?.focus();

    await userEvent.keyboard('{ArrowRight}');
    expect(group.value).toBe('right');

    await userEvent.keyboard('{ArrowLeft}');
    expect(group.value).toBe('left');
  });
});
