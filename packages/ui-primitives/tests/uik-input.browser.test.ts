import {beforeEach, describe, expect, it} from 'vitest';
import {userEvent} from 'vitest/browser';

import type {UikInput} from '../src/atomic/control/uik-input';
import '../src/atomic/control/uik-input';

describe('uik-input', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('associates label and description slots with the input', async () => {
    const input = document.createElement('uik-input') as UikInput;
    input.innerHTML = `
      <span slot="label">Email</span>
      <span slot="hint">Work email only</span>
      <span slot="error">Required</span>
    `;
    document.body.append(input);

    await input.updateComplete;

    const label = input.shadowRoot?.querySelector('label');
    const control = input.shadowRoot?.querySelector('input');
    const hint = input.shadowRoot?.querySelector('[part="hint"]');
    const error = input.shadowRoot?.querySelector('[part="error"]');

    expect(label).not.toBeNull();
    expect(control).not.toBeNull();
    expect(hint).not.toBeNull();
    expect(error).not.toBeNull();

    expect(label?.htmlFor).toBe(control?.id);
    expect(control?.getAttribute('aria-describedby')).toContain(hint?.id ?? '');
    expect(control?.getAttribute('aria-describedby')).toContain(error?.id ?? '');
    expect(control?.getAttribute('aria-invalid')).toBe('true');
  });

  it('forwards aria-label when no label slot is provided', async () => {
    const input = document.createElement('uik-input') as UikInput;
    input.setAttribute('aria-label', 'Search');
    document.body.append(input);

    await input.updateComplete;

    const control = input.shadowRoot?.querySelector('input');
    expect(control?.getAttribute('aria-label')).toBe('Search');
  });

  it('keeps value in sync with user input', async () => {
    const input = document.createElement('uik-input') as UikInput;
    document.body.append(input);

    await input.updateComplete;

    const control = input.shadowRoot?.querySelector('input');
    if (!control) throw new Error('Expected internal input.');
    await userEvent.type(control, 'hello');

    expect(input.value).toBe('hello');
  });

  it('participates in form submission via ElementInternals', async () => {
    const form = document.createElement('form');
    const input = document.createElement('uik-input') as UikInput;
    input.name = 'email';
    input.value = 'hello@uik.dev';
    form.append(input);
    document.body.append(form);

    await input.updateComplete;

    const data = new FormData(form);
    expect(data.get('email')).toBe('hello@uik.dev');
  });
});
