import type {UikButton} from '@ismail-elkorchi/ui-primitives';
import '@ismail-elkorchi/ui-tokens/index.css';
import {beforeEach, describe, expect, it} from 'vitest';
import {userEvent} from 'vitest/browser';

import type {UikShellActivityBar} from '../index';
import '../index';

const items = [
  {id: 'explorer', label: 'Explorer', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'},
  {id: 'search', label: 'Search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'},
  {id: 'settings', label: 'Settings', icon: 'M10 4h4l1 3 3 1v4l-3 1-1 3h-4l-1-3-3-1V8l3-1 1-3z'},
] as const;

const getButtons = (bar: UikShellActivityBar) =>
  Array.from(bar.querySelectorAll<UikButton>('uik-button[data-activity-item="true"]'));

describe('uik-shell-activity-bar', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('uses roving tabindex and arrow keys to move focus', async () => {
    const bar = document.createElement('uik-shell-activity-bar');
    bar.items = [...items];
    bar.activeId = 'explorer';
    document.body.append(bar);

    await bar.updateComplete;

    let buttons = getButtons(bar);
    expect(buttons).toHaveLength(items.length);
    expect(buttons[0]?.tabIndexValue).toBe(0);
    expect(buttons[1]?.tabIndexValue).toBe(-1);

    buttons[0]?.focus();
    await userEvent.keyboard('{ArrowDown}');
    await bar.updateComplete;

    buttons = getButtons(bar);
    expect(document.activeElement).toBe(buttons[1]);
    expect(buttons[1]?.tabIndexValue).toBe(0);
    expect(buttons[0]?.tabIndexValue).toBe(-1);

    await userEvent.keyboard('{End}');
    await bar.updateComplete;
    buttons = getButtons(bar);
    expect(document.activeElement).toBe(buttons[2]);

    await userEvent.keyboard('{Home}');
    await bar.updateComplete;
    buttons = getButtons(bar);
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('emits selection on keyboard activation', async () => {
    const bar = document.createElement('uik-shell-activity-bar');
    bar.items = [...items];
    document.body.append(bar);

    await bar.updateComplete;

    const buttons = getButtons(bar);
    let selected = '';
    bar.addEventListener('activity-bar-select', event => {
      selected = (event as CustomEvent<{id: string}>).detail.id;
    });

    buttons[0]?.focus();
    await userEvent.keyboard('{Enter}');

    expect(selected).toBe('explorer');
  });

  it('shows focus-visible styling on keyboard focus', async () => {
    const bar = document.createElement('uik-shell-activity-bar');
    bar.items = [...items];
    document.body.append(bar);

    await bar.updateComplete;

    const buttons = getButtons(bar);
    const target = buttons[0];
    if (!target) throw new Error('Expected activity bar button.');
    const internal = target.shadowRoot?.querySelector<HTMLButtonElement>('button');
    if (!internal) throw new Error('Expected internal button.');

    const before = getComputedStyle(internal).boxShadow;

    await userEvent.tab();

    const after = getComputedStyle(internal).boxShadow;
    expect(document.activeElement).toBe(target);
    expect(internal.matches(':focus-visible')).toBe(true);
    expect(after).not.toBe(before);
  });
});
