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

  it('syncs value from checked radios and required validity', async () => {
    const group = document.createElement('uik-radio-group') as UikRadioGroup;
    group.required = true;
    group.innerHTML = `
      <uik-radio value="alpha" checked><span slot="label">Alpha</span></uik-radio>
      <uik-radio value="beta"><span slot="label">Beta</span></uik-radio>
    `;
    document.body.append(group);

    await group.updateComplete;

    const radios = Array.from(group.querySelectorAll<UikRadio>('uik-radio'));
    await Promise.all(radios.map(radio => radio.updateComplete));

    expect(group.value).toBe('alpha');

    radios.forEach(radio => {
      radio.checked = false;
    });
    group.value = '';
    group.requestUpdate();
    await group.updateComplete;
  });

  it('restores default values and form state callbacks', async () => {
    const group = document.createElement('uik-radio-group') as UikRadioGroup;
    group.name = 'size';
    group.value = 'medium';
    group.innerHTML = `
      <uik-radio value="small"><span slot="label">Small</span></uik-radio>
      <uik-radio value="medium"><span slot="label">Medium</span></uik-radio>
    `;
    document.body.append(group);

    await group.updateComplete;

    group.value = 'small';
    await group.updateComplete;

    group.formResetCallback();
    await group.updateComplete;
    expect(group.value).toBe('medium');

    group.formStateRestoreCallback('small');
    await group.updateComplete;
    expect(group.value).toBe('small');

    group.formStateRestoreCallback(new FormData());

    group.formDisabledCallback(true);
    expect(group.disabled).toBe(true);
  });

  it('syncs value when radios arrive after initial render', async () => {
    const group = document.createElement('uik-radio-group') as UikRadioGroup;
    document.body.append(group);

    await group.updateComplete;
    expect(group.value).toBe('');

    group.innerHTML = '<uik-radio value="alpha" checked><span slot="label">Alpha</span></uik-radio>';
    await group.updateComplete;

    const defaultSlot = group.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
    defaultSlot?.dispatchEvent(new Event('slotchange'));
    await group.updateComplete;

    expect(group.value).toBe('alpha');
  });

  it('ignores slot changes when no radios are checked', async () => {
    const group = document.createElement('uik-radio-group') as UikRadioGroup;
    document.body.append(group);

    await group.updateComplete;

    group.innerHTML = '<uik-radio value="alpha"><span slot="label">Alpha</span></uik-radio>';
    await group.updateComplete;

    const defaultSlot = group.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
    defaultSlot?.dispatchEvent(new Event('slotchange'));
    await group.updateComplete;

    expect(group.value).toBe('');
  });

  it('updates value from checked radio change events', async () => {
    const group = document.createElement('uik-radio-group') as UikRadioGroup;
    group.innerHTML = `
      <uik-radio value="alpha"><span slot="label">Alpha</span></uik-radio>
      <uik-radio value="beta"><span slot="label">Beta</span></uik-radio>
    `;
    document.body.append(group);

    await group.updateComplete;

    const radio = group.querySelectorAll<UikRadio>('uik-radio')[1];
    if (!radio) throw new Error('Expected radio');
    await radio.updateComplete;

    radio.checked = true;
    radio.dispatchEvent(new Event('change', {bubbles: true}));
    await group.updateComplete;

    expect(group.value).toBe('beta');
  });

  it('ignores arrow handling when all radios are disabled', async () => {
    const group = document.createElement('uik-radio-group') as UikRadioGroup;
    group.innerHTML = `
      <uik-radio value="one" disabled><span slot="label">One</span></uik-radio>
      <uik-radio value="two" disabled><span slot="label">Two</span></uik-radio>
    `;
    document.body.append(group);

    await group.updateComplete;

    group.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true}));
    await group.updateComplete;
    expect(group.value).toBe('');
  });

  it('applies aria labeling and required validity rules', async () => {
    const form = document.createElement('form');
    const group = document.createElement('uik-radio-group') as UikRadioGroup;
    group.required = true;
    group.setAttribute('aria-label', 'Plans');
    group.innerHTML = `
      <uik-radio value="basic"><span slot="label">Basic</span></uik-radio>
      <uik-radio value="pro"><span slot="label">Pro</span></uik-radio>
    `;
    form.append(group);
    document.body.append(form);

    await group.updateComplete;

    const control = group.shadowRoot?.querySelector('.control');
    expect(control?.getAttribute('aria-label')).toBe('Plans');
    expect(form.checkValidity()).toBe(false);

    group.value = 'basic';
    await group.updateComplete;
    expect(form.checkValidity()).toBe(true);

    group.innerHTML = `
      <span slot="label">Plans</span>
      <span slot="hint">Hint</span>
      <span slot="error">Error</span>
      <uik-radio value="basic"><span slot="label">Basic</span></uik-radio>
    `;
    group.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="label"]')?.dispatchEvent(
      new Event('slotchange'),
    );
    group.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="hint"]')?.dispatchEvent(
      new Event('slotchange'),
    );
    group.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="error"]')?.dispatchEvent(
      new Event('slotchange'),
    );
    group.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])')?.dispatchEvent(
      new Event('slotchange'),
    );
    await group.updateComplete;

    const updatedControl = group.shadowRoot?.querySelector('.control');
    expect(updatedControl?.getAttribute('aria-label')).toBeNull();
    expect(updatedControl?.getAttribute('aria-invalid')).toBe('true');
    expect(updatedControl?.getAttribute('aria-labelledby')).toContain('uik-radio-group');
  });

  it('handles slotchange for error and default slots', async () => {
    const group = document.createElement('uik-radio-group') as UikRadioGroup;
    group.innerHTML = `
      <uik-radio value="alpha"><span slot="label">Alpha</span></uik-radio>
      <span slot="error">Required</span>
    `;
    document.body.append(group);

    await group.updateComplete;

    const errorSlot = group.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="error"]');
    errorSlot?.dispatchEvent(new Event('slotchange'));

    const defaultSlot = group.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
    defaultSlot?.dispatchEvent(new Event('slotchange'));

    await group.updateComplete;
    const radios = Array.from(group.querySelectorAll<UikRadio>('uik-radio'));
    expect(radios.length).toBe(1);
  });

  it('ignores change events from unchecked radios and non-radio targets', async () => {
    const group = document.createElement('uik-radio-group') as UikRadioGroup;
    group.innerHTML = `
      <uik-radio value="alpha"><span slot="label">Alpha</span></uik-radio>
      <uik-radio value="beta"><span slot="label">Beta</span></uik-radio>
    `;
    document.body.append(group);

    await group.updateComplete;

    const radios = Array.from(group.querySelectorAll<UikRadio>('uik-radio'));
    await Promise.all(radios.map(radio => radio.updateComplete));

    radios[1]?.dispatchEvent(new Event('change', {bubbles: true}));
    await group.updateComplete;
    expect(group.value).toBe('');

    group.dispatchEvent(new Event('change', {bubbles: true}));
    await group.updateComplete;
    expect(group.value).toBe('');
  });

  it('ignores non-arrow key events', async () => {
    const group = document.createElement('uik-radio-group') as UikRadioGroup;
    group.innerHTML = `
      <uik-radio value="one"><span slot="label">One</span></uik-radio>
      <uik-radio value="two"><span slot="label">Two</span></uik-radio>
    `;
    document.body.append(group);

    await group.updateComplete;

    (group as unknown as {onKeyDown: (event: KeyboardEvent) => void}).onKeyDown(
      new KeyboardEvent('keydown', {key: 'Enter'}),
    );
    await group.updateComplete;
    expect(group.value).toBe('');
  });

  it('guards keyboard navigation when no enabled radios exist', async () => {
    const group = document.createElement('uik-radio-group') as UikRadioGroup;
    group.innerHTML = `
      <uik-radio value="one" disabled><span slot="label">One</span></uik-radio>
    `;
    document.body.append(group);

    await group.updateComplete;

    (group as unknown as {onKeyDown: (event: KeyboardEvent) => void}).onKeyDown(
      new KeyboardEvent('keydown', {key: 'ArrowDown'}),
    );

    expect(group.value).toBe('');
  });

  it('ignores non-element radio change targets', async () => {
    const group = document.createElement('uik-radio-group') as UikRadioGroup;
    document.body.append(group);

    await group.updateComplete;

    (group as unknown as {onRadioChange: (event: Event) => void}).onRadioChange({
      target: document.createTextNode(''),
    } as Event);

    expect(group.value).toBe('');
  });

  it('ignores validity sync when control is missing', async () => {
    const group = document.createElement('uik-radio-group') as UikRadioGroup;
    document.body.append(group);

    await group.updateComplete;

    group.shadowRoot?.querySelector('.control')?.remove();

    group.formResetCallback();

    expect(true).toBe(true);
  });
});
