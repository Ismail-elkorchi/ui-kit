import {beforeEach, describe, expect, it} from 'vitest';
import {userEvent} from 'vitest/browser';

import type {UikCheckbox} from '../src/atomic/control/uik-checkbox';
import type {UikLink} from '../src/atomic/control/uik-link';
import type {UikSelect} from '../src/atomic/control/uik-select';
import type {UikSwitch} from '../src/atomic/control/uik-switch';
import type {UikTextarea} from '../src/atomic/control/uik-textarea';
import '../src/atomic/control/uik-checkbox';
import '../src/atomic/control/uik-link';
import '../src/atomic/control/uik-select';
import '../src/atomic/control/uik-switch';
import '../src/atomic/control/uik-textarea';

describe('uik control primitives', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('handles checkbox form state and validity', async () => {
    const checkbox = document.createElement('uik-checkbox') as UikCheckbox;
    checkbox.checked = true;
    checkbox.required = true;
    checkbox.innerHTML = '<span slot="error">Error</span>';
    document.body.append(checkbox);

    await checkbox.updateComplete;

    const control = checkbox.shadowRoot?.querySelector('input');
    expect(control?.getAttribute('aria-invalid')).toBe('true');

    checkbox.invalid = false;
    checkbox.innerHTML = '';
    checkbox.required = true;
    await checkbox.updateComplete;

    checkbox.formStateRestoreCallback(null);
    expect(checkbox.checked).toBe(false);

    checkbox.formStateRestoreCallback('yes');
    expect(checkbox.checked).toBe(true);
    expect(checkbox.value).toBe('yes');

    checkbox.formStateRestoreCallback(new FormData());

    checkbox.checked = true;
    await checkbox.updateComplete;

    checkbox.checked = false;
    checkbox.formResetCallback();
    expect(checkbox.checked).toBe(true);

    checkbox.formDisabledCallback(true);
    expect(checkbox.disabled).toBe(true);

    if (control) {
      control.checked = true;
      control.dispatchEvent(new Event('change', {bubbles: true}));
      await checkbox.updateComplete;
      expect(checkbox.checked).toBe(true);
    }
  });

  it('associates checkbox slots with aria and required validity', async () => {
    const form = document.createElement('form');
    const checkbox = document.createElement('uik-checkbox') as UikCheckbox;
    checkbox.name = 'terms';
    checkbox.required = true;
    checkbox.setAttribute('aria-label', 'Accept terms');
    checkbox.setAttribute('aria-labelledby', 'external-label');
    checkbox.setAttribute('aria-describedby', 'external-hint');
    form.append(checkbox);
    document.body.append(form);

    await checkbox.updateComplete;

    let control = checkbox.shadowRoot?.querySelector('input');
    expect(control?.getAttribute('aria-label')).toBe('Accept terms');
    expect(control?.getAttribute('aria-labelledby')).toBe('external-label');
    expect(control?.getAttribute('aria-describedby')).toContain('external-hint');
    expect(form.checkValidity()).toBe(false);

    checkbox.innerHTML = '<span slot="label">Terms</span><span slot="hint">Helpful</span>';
    checkbox.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="label"]')?.dispatchEvent(
      new Event('slotchange'),
    );
    checkbox.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="hint"]')?.dispatchEvent(
      new Event('slotchange'),
    );
    await checkbox.updateComplete;

    control = checkbox.shadowRoot?.querySelector('input');
    const hint = checkbox.shadowRoot?.querySelector('[part="hint"]');
    expect(control?.getAttribute('aria-label')).toBeNull();
    expect(control?.getAttribute('aria-labelledby')).toBeNull();
    expect(control?.getAttribute('aria-describedby')).toContain(hint?.id ?? '');

    checkbox.innerHTML = '<span slot="label">Terms</span><span slot="error">Required</span>';
    checkbox.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="label"]')?.dispatchEvent(
      new Event('slotchange'),
    );
    checkbox.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="error"]')?.dispatchEvent(
      new Event('slotchange'),
    );
    await checkbox.updateComplete;

    control = checkbox.shadowRoot?.querySelector('input');
    expect(control?.getAttribute('aria-invalid')).toBe('true');

    checkbox.checked = true;
    await checkbox.updateComplete;
    expect(form.checkValidity()).toBe(false);

    checkbox.innerHTML = '<span slot="label">Terms</span>';
    checkbox.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="label"]')?.dispatchEvent(
      new Event('slotchange'),
    );
    await checkbox.updateComplete;
    expect(form.checkValidity()).toBe(true);
  });

  it('omits unchecked or disabled checkboxes from form data', async () => {
    const form = document.createElement('form');
    const checkbox = document.createElement('uik-checkbox') as UikCheckbox;
    checkbox.name = 'terms';
    form.append(checkbox);
    document.body.append(form);

    await checkbox.updateComplete;
    let data = new FormData(form);
    expect(data.has('terms')).toBe(false);

    checkbox.checked = true;
    await checkbox.updateComplete;
    data = new FormData(form);
    expect(data.get('terms')).toBe('on');

    checkbox.disabled = true;
    await checkbox.updateComplete;
    data = new FormData(form);
    expect(data.has('terms')).toBe(false);
  });

  it('ignores form callbacks when checkbox control is missing', async () => {
    const checkbox = document.createElement('uik-checkbox') as UikCheckbox;
    document.body.append(checkbox);

    await checkbox.updateComplete;
    checkbox.shadowRoot?.querySelector('input')?.remove();

    checkbox.formResetCallback();
    checkbox.formStateRestoreCallback('restored');

    expect(true).toBe(true);
  });

  it('supports indeterminate state and custom tabindex on checkbox', async () => {
    const checkbox = document.createElement('uik-checkbox') as UikCheckbox;
    checkbox.indeterminate = true;
    checkbox.tabIndexValue = -1;
    document.body.append(checkbox);

    await checkbox.updateComplete;

    const control = checkbox.shadowRoot?.querySelector('input');
    expect(control?.indeterminate).toBe(true);
    expect(control?.getAttribute('tabindex')).toBe('-1');

    if (control) {
      control.checked = true;
      control.dispatchEvent(new Event('change', {bubbles: true}));
      await checkbox.updateComplete;
      expect(checkbox.indeterminate).toBe(false);
    }
  });

  it('handles switch state, aria, and form callbacks', async () => {
    const toggle = document.createElement('uik-switch') as UikSwitch;
    toggle.checked = true;
    toggle.invalid = true;
    toggle.innerHTML = '<span slot="label">Label</span>';
    document.body.append(toggle);

    await toggle.updateComplete;

    const control = toggle.shadowRoot?.querySelector('input');
    expect(control?.getAttribute('role')).toBe('switch');
    expect(control?.getAttribute('aria-checked')).toBe('true');
    expect(control?.getAttribute('aria-invalid')).toBe('true');

    toggle.formStateRestoreCallback('on');
    expect(toggle.checked).toBe(true);

    toggle.formStateRestoreCallback(null);
    expect(toggle.checked).toBe(false);

    toggle.formStateRestoreCallback(new FormData());

    toggle.checked = false;
    toggle.formResetCallback();
    expect(toggle.checked).toBe(true);

    toggle.formDisabledCallback(true);
    expect(toggle.disabled).toBe(true);

    if (control) {
      control.checked = true;
      control.dispatchEvent(new Event('change', {bubbles: true}));
      await toggle.updateComplete;
      expect(toggle.checked).toBe(true);
      expect(control.getAttribute('aria-checked')).toBe('true');
    }
  });

  it('updates switch aria and validity for required states', async () => {
    const form = document.createElement('form');
    const toggle = document.createElement('uik-switch') as UikSwitch;
    toggle.name = 'alerts';
    toggle.required = true;
    toggle.setAttribute('aria-label', 'Alerts');
    form.append(toggle);
    document.body.append(form);

    await toggle.updateComplete;

    let control = toggle.shadowRoot?.querySelector('input');
    expect(control?.getAttribute('aria-label')).toBe('Alerts');
    expect(control?.getAttribute('aria-checked')).toBe('false');
    expect(form.checkValidity()).toBe(false);

    toggle.checked = true;
    await toggle.updateComplete;
    control = toggle.shadowRoot?.querySelector('input');
    expect(control?.getAttribute('aria-checked')).toBe('true');
    expect(form.checkValidity()).toBe(true);

    toggle.innerHTML =
      '<span slot="label">Alerts</span><span slot="hint">Hint</span><span slot="error">Error</span>';
    toggle.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="label"]')?.dispatchEvent(
      new Event('slotchange'),
    );
    toggle.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="hint"]')?.dispatchEvent(
      new Event('slotchange'),
    );
    toggle.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="error"]')?.dispatchEvent(
      new Event('slotchange'),
    );
    await toggle.updateComplete;
    control = toggle.shadowRoot?.querySelector('input');
    expect(control?.getAttribute('aria-label')).toBeNull();
    expect(control?.getAttribute('aria-invalid')).toBe('true');
  });

  it('ignores form callbacks when switch control is missing', async () => {
    const toggle = document.createElement('uik-switch') as UikSwitch;
    document.body.append(toggle);

    await toggle.updateComplete;
    toggle.shadowRoot?.querySelector('input')?.remove();

    toggle.formResetCallback();
    toggle.formStateRestoreCallback('restored');

    expect(true).toBe(true);
  });

  it('syncs select value and resets to default', async () => {
    const select = document.createElement('uik-select') as UikSelect;
    select.required = true;
    select.innerHTML = `
      <span slot="error">Error</span>
      <option value="one">One</option>
      <option value="two">Two</option>
    `;
    document.body.append(select);

    await select.updateComplete;

    select.value = 'one';
    await select.updateComplete;

    const control = select.shadowRoot?.querySelector('select');
    expect(control?.value).toBe('one');
    expect(control?.getAttribute('aria-invalid')).toBe('true');

    if (control) {
      control.value = 'two';
      control.dispatchEvent(new Event('change', {bubbles: true}));
      await select.updateComplete;
      expect(select.value).toBe('two');
    }

    select.formResetCallback();
    expect(select.value).toBe('one');

    select.formStateRestoreCallback('two');
    expect(select.value).toBe('two');

    select.formStateRestoreCallback(new FormData());
  });

  it('initializes select defaults and responds to options slot changes', async () => {
    const select = document.createElement('uik-select') as UikSelect;
    select.name = 'size';
    select.innerHTML = `
      <option value="small">Small</option>
      <option value="large">Large</option>
    `;
    document.body.append(select);

    await select.updateComplete;
    expect(select.value).toBe('small');

    let control = select.shadowRoot?.querySelector('select');
    expect(control?.value).toBe('small');

    const dynamic = document.createElement('uik-select') as UikSelect;
    document.body.append(dynamic);

    await dynamic.updateComplete;
    expect(dynamic.value).toBe('');

    dynamic.innerHTML = `
      <option value="tiny">Tiny</option>
      <optgroup label="Sizes">
        <option value="huge">Huge</option>
      </optgroup>
    `;
    await dynamic.updateComplete;

    const optionsSlot = dynamic.shadowRoot?.querySelector<HTMLSlotElement>('slot[data-options]');
    optionsSlot?.dispatchEvent(new Event('slotchange'));
    await dynamic.updateComplete;

    control = dynamic.shadowRoot?.querySelector('select');
    expect(control?.querySelectorAll('option').length).toBe(2);
    expect(dynamic.value).toBe('tiny');
  });

  it('ignores sync when select control is unavailable', async () => {
    const select = document.createElement('uik-select') as UikSelect;
    document.body.append(select);

    await select.updateComplete;
    select.shadowRoot?.querySelector('select')?.remove();

    (select as unknown as {syncOptions: () => void}).syncOptions();
    (select as unknown as {syncControlValue: () => void}).syncControlValue();

    expect(true).toBe(true);
  });

  it('falls back when the options slot is missing', async () => {
    const select = document.createElement('uik-select') as UikSelect;
    document.body.append(select);

    await select.updateComplete;
    select.shadowRoot?.querySelector('slot[data-options]')?.remove();

    (select as unknown as {syncOptions: () => void}).syncOptions();

    expect(true).toBe(true);
  });

  it('applies select aria attributes and required validity', async () => {
    const form = document.createElement('form');
    const select = document.createElement('uik-select') as UikSelect;
    select.name = 'choice';
    select.required = true;
    select.setAttribute('aria-label', 'Choose one');
    form.append(select);
    document.body.append(form);

    await select.updateComplete;

    let control = select.shadowRoot?.querySelector('select');
    expect(control?.getAttribute('aria-label')).toBe('Choose one');
    expect(form.checkValidity()).toBe(false);

    select.innerHTML =
      '<span slot="label">Choice</span><span slot="hint">Hint</span><option value="a">A</option>';
    select.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="label"]')?.dispatchEvent(
      new Event('slotchange'),
    );
    select.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="hint"]')?.dispatchEvent(
      new Event('slotchange'),
    );
    select.shadowRoot?.querySelector<HTMLSlotElement>('slot[data-options]')?.dispatchEvent(
      new Event('slotchange'),
    );
    await select.updateComplete;

    control = select.shadowRoot?.querySelector('select');
    expect(control?.getAttribute('aria-label')).toBeNull();
    select.formDisabledCallback(true);
    await select.updateComplete;
    select.value = 'a';
    await select.updateComplete;
    expect(form.checkValidity()).toBe(true);
  });

  it('ignores form callbacks when select control is missing', async () => {
    const select = document.createElement('uik-select') as UikSelect;
    document.body.append(select);

    await select.updateComplete;
    select.shadowRoot?.querySelector('select')?.remove();

    select.formResetCallback();
    select.formStateRestoreCallback('restored');

    expect(true).toBe(true);
  });

  it('syncs textarea value on input and change', async () => {
    const textarea = document.createElement('uik-textarea') as UikTextarea;
    textarea.value = 'start';
    document.body.append(textarea);

    await textarea.updateComplete;

    const control = textarea.shadowRoot?.querySelector('textarea');
    if (!control) throw new Error('Expected textarea control.');

    await userEvent.type(control, ' edit');
    expect(textarea.value).toContain('start');

    control.value = 'changed';
    control.dispatchEvent(new Event('change', {bubbles: true}));
    await textarea.updateComplete;
    expect(textarea.value).toBe('changed');

    textarea.formStateRestoreCallback('restored');
    expect(textarea.value).toBe('restored');

    textarea.formStateRestoreCallback(new FormData());

    textarea.formResetCallback();
    expect(textarea.value).toBe('start');
  });

  it('applies textarea aria attributes and required validity', async () => {
    const form = document.createElement('form');
    const textarea = document.createElement('uik-textarea') as UikTextarea;
    textarea.name = 'message';
    textarea.required = true;
    textarea.setAttribute('aria-label', 'Message');
    form.append(textarea);
    document.body.append(form);

    await textarea.updateComplete;

    let control = textarea.shadowRoot?.querySelector('textarea');
    expect(control?.getAttribute('aria-label')).toBe('Message');
    expect(form.checkValidity()).toBe(false);

    textarea.innerHTML =
      '<span slot="label">Message</span><span slot="hint">Hint</span><span slot="error">Error</span>';
    textarea.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="label"]')?.dispatchEvent(
      new Event('slotchange'),
    );
    textarea.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="hint"]')?.dispatchEvent(
      new Event('slotchange'),
    );
    textarea.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="error"]')?.dispatchEvent(
      new Event('slotchange'),
    );
    await textarea.updateComplete;

    control = textarea.shadowRoot?.querySelector('textarea');
    expect(control?.getAttribute('aria-label')).toBeNull();
    expect(control?.getAttribute('aria-invalid')).toBe('true');

    textarea.formDisabledCallback(true);
    await textarea.updateComplete;

    textarea.innerHTML = '<span slot="label">Message</span>';
    textarea.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="label"]')?.dispatchEvent(
      new Event('slotchange'),
    );
    textarea.value = 'Ready';
    await textarea.updateComplete;
    expect(form.checkValidity()).toBe(true);
  });

  it('ignores form callbacks when textarea control is missing', async () => {
    const textarea = document.createElement('uik-textarea') as UikTextarea;
    document.body.append(textarea);

    await textarea.updateComplete;
    textarea.shadowRoot?.querySelector('textarea')?.remove();

    textarea.formResetCallback();
    textarea.formStateRestoreCallback('restored');

    expect(true).toBe(true);
  });

  it('forwards link attributes', async () => {
    const link = document.createElement('uik-link') as UikLink;
    link.href = '/docs';
    link.target = '_blank';
    link.rel = 'noopener';
    link.download = 'file.txt';
    link.setAttribute('aria-describedby', 'hint');
    document.body.append(link);

    await link.updateComplete;

    const anchor = link.shadowRoot?.querySelector('a');
    expect(anchor?.getAttribute('href')).toBe('/docs');
    expect(anchor?.getAttribute('target')).toBe('_blank');
    expect(anchor?.getAttribute('rel')).toBe('noopener');
    expect(anchor?.getAttribute('download')).toBe('file.txt');
    expect(anchor?.getAttribute('aria-describedby')).toBe('hint');
  });

  it('omits link aria attributes when values are empty', async () => {
    const link = document.createElement('uik-link') as UikLink;
    document.body.append(link);

    await link.updateComplete;

    let anchor = link.shadowRoot?.querySelector('a');
    expect(anchor?.getAttribute('aria-label')).toBeNull();

    link.setAttribute('aria-label', 'Details');
    await link.updateComplete;
    anchor = link.shadowRoot?.querySelector('a');
    expect(anchor?.getAttribute('aria-label')).toBe('Details');

    link.removeAttribute('aria-label');
    await link.updateComplete;
    anchor = link.shadowRoot?.querySelector('a');
    expect(anchor?.getAttribute('aria-label')).toBeNull();
  });
});
