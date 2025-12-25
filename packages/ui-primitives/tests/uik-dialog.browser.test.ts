import {beforeEach, describe, expect, it} from 'vitest';
import {userEvent} from 'vitest/browser';

import type {UikDialog} from '../src/atomic/overlay/uik-dialog';
import '../src/atomic/overlay/uik-dialog';

describe('uik-dialog', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('opens and closes with Escape', async () => {
    const dialog = document.createElement('uik-dialog') as UikDialog;
    dialog.modal = false;
    dialog.open = true;
    dialog.innerHTML = '<span slot="title">Dialog</span>';
    document.body.append(dialog);

    await dialog.updateComplete;

    const internal = dialog.shadowRoot?.querySelector('dialog');
    expect(internal?.open).toBe(true);

    internal?.focus();
    await userEvent.keyboard('{Escape}');

    await dialog.updateComplete;
    expect(dialog.open).toBe(false);
  });

  it('reports escape close reason and restores focus to opener', async () => {
    const opener = document.createElement('button');
    opener.textContent = 'Open dialog';
    document.body.append(opener);
    opener.focus();

    const dialog = document.createElement('uik-dialog') as UikDialog;
    dialog.modal = false;
    dialog.open = true;
    dialog.innerHTML = '<span slot="title">Dialog</span>';
    document.body.append(dialog);

    await dialog.updateComplete;

    let reason = '';
    dialog.addEventListener('overlay-close', event => {
      reason = (event as CustomEvent<{reason: string}>).detail.reason;
    });

    const internal = dialog.shadowRoot?.querySelector('dialog');
    internal?.focus();
    await userEvent.keyboard('{Escape}');

    await dialog.updateComplete;
    expect(reason).toBe('escape');
    expect(document.activeElement).toBe(opener);
  });

  it('supports modal and non-modal open APIs', async () => {
    const dialog = document.createElement('uik-dialog') as UikDialog;
    dialog.innerHTML = '<span slot="title">Dialog</span>';
    document.body.append(dialog);

    await dialog.updateComplete;

    dialog.show();
    await dialog.updateComplete;
    expect(dialog.open).toBe(true);

    dialog.close();
    await dialog.updateComplete;
    expect(dialog.open).toBe(false);

    dialog.showModal();
    await dialog.updateComplete;
    const internal = dialog.shadowRoot?.querySelector('dialog');
    expect(internal?.open).toBe(true);
  });

  it('keeps dialog open when toggling modal while already open', async () => {
    const dialog = document.createElement('uik-dialog') as UikDialog;
    dialog.open = true;
    dialog.modal = true;
    dialog.innerHTML = '<span slot="title">Dialog</span>';
    document.body.append(dialog);

    await dialog.updateComplete;

    const internal = dialog.shadowRoot?.querySelector('dialog');
    expect(internal?.open).toBe(true);

    dialog.modal = false;
    await dialog.updateComplete;

    expect(internal?.open).toBe(true);
  });

  it('manages aria attributes based on slots', async () => {
    const dialog = document.createElement('uik-dialog') as UikDialog;
    dialog.setAttribute('aria-label', 'Settings');
    dialog.innerHTML = '<div slot="description">Details</div>';
    document.body.append(dialog);

    await dialog.updateComplete;

    const internal = dialog.shadowRoot?.querySelector('dialog');
    expect(internal?.getAttribute('aria-label')).toBe('Settings');

    dialog.innerHTML = '<span slot="title">Title</span><div slot="description">Details</div>';
    dialog.requestUpdate();
    await dialog.updateComplete;
    const updated = dialog.shadowRoot?.querySelector('dialog');
    expect(updated?.getAttribute('aria-label')).toBeNull();
    expect(updated?.getAttribute('aria-labelledby')).toContain('uik-dialog');
  });

  it('ignores non-escape key presses', async () => {
    const dialog = document.createElement('uik-dialog') as UikDialog;
    dialog.open = true;
    document.body.append(dialog);

    await dialog.updateComplete;

    const internal = dialog.shadowRoot?.querySelector('dialog');
    internal?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));

    await dialog.updateComplete;
    expect(dialog.open).toBe(true);
  });

  it('handles close events and missing dialog elements safely', async () => {
    const dialog = document.createElement('uik-dialog') as UikDialog;
    dialog.open = true;
    document.body.append(dialog);

    await dialog.updateComplete;

    const internal = dialog.shadowRoot?.querySelector('dialog');
    internal?.dispatchEvent(new Event('close'));
    await dialog.updateComplete;
    expect(dialog.open).toBe(false);

    dialog.shadowRoot?.querySelector('dialog')?.remove();

    (dialog as unknown as {syncOpenState: () => void}).syncOpenState();

    expect(true).toBe(true);
  });
});
