import {beforeEach, describe, expect, it} from 'vitest';
import {userEvent} from 'vitest/browser';

import type {UikButton} from '../src/atomic/control/uik-button';
import '../src/atomic/control/uik-button';

describe('uik-button', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('defaults to type=button to avoid accidental form submits', async () => {
    const form = document.createElement('form');
    const button = document.createElement('uik-button') as UikButton;
    button.textContent = 'Save';
    form.append(button);
    document.body.append(form);

    await button.updateComplete;

    const internal = button.shadowRoot?.querySelector('button');
    expect(internal).not.toBeNull();
    expect(internal?.type).toBe('button');

    let submitted = false;
    form.addEventListener('submit', event => {
      event.preventDefault();
      submitted = true;
    });

    internal?.click();
    expect(submitted).toBe(false);
  });

  it('submits when type=submit is set', async () => {
    const form = document.createElement('form');
    const button = document.createElement('uik-button') as UikButton;
    button.textContent = 'Send';
    button.type = 'submit';
    form.append(button);
    document.body.append(form);

    await button.updateComplete;

    let submitted = false;
    form.addEventListener('submit', event => {
      event.preventDefault();
      submitted = true;
    });

    const internal = button.shadowRoot?.querySelector('button');
    internal?.click();

    expect(submitted).toBe(true);
  });

  it('resets forms when type=reset is set', async () => {
    const form = document.createElement('form');
    const input = document.createElement('input');
    input.name = 'status';
    input.value = 'updated';
    input.defaultValue = 'updated';
    const button = document.createElement('uik-button') as UikButton;
    button.type = 'reset';
    button.textContent = 'Reset';
    form.append(input, button);
    document.body.append(form);

    await button.updateComplete;

    input.value = 'changed';
    const internal = button.shadowRoot?.querySelector('button');
    internal?.click();

    expect(input.value).toBe('updated');
  });

  it('fires click when activated by keyboard', async () => {
    const button = document.createElement('uik-button') as UikButton;
    button.textContent = 'Keyboard';
    document.body.append(button);

    await button.updateComplete;

    let clicks = 0;
    button.addEventListener('click', () => {
      clicks += 1;
    });

    const internal = button.shadowRoot?.querySelector('button');
    if (!internal) throw new Error('Expected internal button.');
    internal.focus();

    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Space}');

    expect(clicks).toBe(2);
  });

  it('does not dispatch click when disabled', async () => {
    const button = document.createElement('uik-button') as UikButton;
    button.textContent = 'Disabled';
    button.disabled = true;
    document.body.append(button);

    await button.updateComplete;

    let clicked = false;
    button.addEventListener('click', () => {
      clicked = true;
    });

    const internal = button.shadowRoot?.querySelector('button');
    internal?.click();

    expect(clicked).toBe(false);
  });

  it('does not submit forms when disabled even if click is dispatched', async () => {
    const form = document.createElement('form');
    const button = document.createElement('uik-button') as UikButton;
    button.type = 'submit';
    button.disabled = true;
    button.textContent = 'Submit';
    form.append(button);
    document.body.append(form);

    await button.updateComplete;

    let submitted = false;
    form.addEventListener('submit', event => {
      event.preventDefault();
      submitted = true;
    });

    const internal = button.shadowRoot?.querySelector('button');
    internal?.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}));

    expect(submitted).toBe(false);
  });

  it('updates disabled state via formDisabledCallback', async () => {
    const button = document.createElement('uik-button') as UikButton;
    document.body.append(button);

    await button.updateComplete;

    button.formDisabledCallback(true);
    await button.updateComplete;

    const internal = button.shadowRoot?.querySelector('button');
    expect(internal?.disabled).toBe(true);
  });

  it('forwards aria-label to the internal button', async () => {
    const button = document.createElement('uik-button') as UikButton;
    button.setAttribute('aria-label', 'Close');
    document.body.append(button);

    await button.updateComplete;

    const internal = button.shadowRoot?.querySelector('button');
    expect(internal?.getAttribute('aria-label')).toBe('Close');
  });
});
