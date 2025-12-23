import {beforeEach, describe, expect, it} from 'vitest';
import {userEvent} from 'vitest/browser';

import type {UikDialog} from '../uik-dialog';
import '../uik-dialog';

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
});
