import type {UikButton} from '@ismail-elkorchi/ui-primitives';
import '@ismail-elkorchi/ui-tokens/index.css';
import {beforeEach, describe, expect, it} from 'vitest';
import {userEvent} from 'vitest/browser';

import type {UikNavRail} from '../index';
import '../index';

const items = [
  {id: 'explorer', label: 'Explorer', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'},
  {id: 'search', label: 'Search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'},
  {id: 'settings', label: 'Settings', icon: 'M10 4h4l1 3 3 1v4l-3 1-1 3h-4l-1-3-3-1V8l3-1 1-3z'},
] as const;

const getButtons = (rail: UikNavRail) =>
  Array.from(rail.shadowRoot?.querySelectorAll<UikButton>('uik-button') ?? []);

const getActiveButton = (rail: UikNavRail) => rail.shadowRoot?.activeElement;

describe('uik-nav-rail', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('uses roving tabindex and arrow keys to move focus', async () => {
    const rail = document.createElement('uik-nav-rail');
    rail.items = [...items];
    rail.activeId = 'explorer';
    document.body.append(rail);

    await rail.updateComplete;

    let buttons = getButtons(rail);
    expect(buttons).toHaveLength(items.length);
    expect(buttons[0]?.tabIndexValue).toBe(0);
    expect(buttons[1]?.tabIndexValue).toBe(-1);

    buttons[0]?.focus();
    await userEvent.keyboard('{ArrowDown}');
    await rail.updateComplete;

    buttons = getButtons(rail);
    expect(getActiveButton(rail)).toBe(buttons[1]);
    expect(buttons[1]?.tabIndexValue).toBe(0);
    expect(buttons[0]?.tabIndexValue).toBe(-1);

    await userEvent.keyboard('{End}');
    await rail.updateComplete;
    buttons = getButtons(rail);
    expect(getActiveButton(rail)).toBe(buttons[2]);

    await userEvent.keyboard('{Home}');
    await rail.updateComplete;
    buttons = getButtons(rail);
    expect(getActiveButton(rail)).toBe(buttons[0]);
  });

  it('emits selection on keyboard activation', async () => {
    const rail = document.createElement('uik-nav-rail');
    rail.items = [...items];
    document.body.append(rail);

    await rail.updateComplete;

    const buttons = getButtons(rail);
    let selected = '';
    rail.addEventListener('nav-rail-select', event => {
      selected = (event as CustomEvent<{id: string}>).detail.id;
    });

    buttons[0]?.focus();
    await userEvent.keyboard('{Enter}');

    expect(selected).toBe('explorer');
  });
});
