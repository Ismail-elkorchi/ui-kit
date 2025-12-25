import '@ismail-elkorchi/ui-tokens/index.css';
import {beforeEach, describe, expect, it} from 'vitest';
import {userEvent} from 'vitest/browser';

import type {
  UikShellFileTreeOpenDetail,
  UikShellFileTreeSelectDetail,
  UikShellFileTreeToggleDetail,
} from '../index';
import '../index';

const items = [
  {
    path: '/apps',
    name: 'apps',
    isDirectory: true,
    children: [{path: '/apps/main.ts', name: 'main.ts', isDirectory: false}],
  },
] as const;

describe('uik-shell-file-tree', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('toggles folders and emits toggle detail', async () => {
    const tree = document.createElement('uik-shell-file-tree');
    tree.items = [...items];
    document.body.append(tree);

    await tree.updateComplete;

    let detail: UikShellFileTreeToggleDetail | null = null;
    tree.addEventListener('file-tree-toggle', event => {
      detail = (event as CustomEvent<UikShellFileTreeToggleDetail>).detail;
    });

    const toggle = tree.querySelector<HTMLButtonElement>('[data-role="toggle"][data-node-path="/apps"]');
    if (!toggle) throw new Error('Expected toggle button.');

    await userEvent.click(toggle);

    expect(tree.openPaths).toContain('/apps');
    expect(detail?.open).toBe(true);
    expect(detail?.path).toBe('/apps');
  });

  it('emits open events for file labels', async () => {
    const tree = document.createElement('uik-shell-file-tree');
    tree.items = [...items];
    tree.openPaths = ['/apps'];
    document.body.append(tree);

    await tree.updateComplete;

    let detail: UikShellFileTreeOpenDetail | null = null;
    tree.addEventListener('file-tree-open', event => {
      detail = (event as CustomEvent<UikShellFileTreeOpenDetail>).detail;
    });

    const label = tree.querySelector<HTMLButtonElement>('[data-role="label"][data-node-path="/apps/main.ts"]');
    if (!label) throw new Error('Expected file label button.');

    await userEvent.click(label);

    expect(detail?.path).toBe('/apps/main.ts');
  });

  it('emits selection changes from checkboxes', async () => {
    const tree = document.createElement('uik-shell-file-tree');
    tree.items = [...items];
    tree.openPaths = ['/apps'];
    document.body.append(tree);

    await tree.updateComplete;

    const details: UikShellFileTreeSelectDetail[] = [];
    tree.addEventListener('file-tree-select', event => {
      details.push((event as CustomEvent<UikShellFileTreeSelectDetail>).detail);
    });

    const folderCheckbox = tree.querySelector<HTMLElement>('[data-role="checkbox"][data-node-path="/apps"]');
    if (!folderCheckbox) throw new Error('Expected folder checkbox.');
    const fileCheckbox = tree.querySelector<HTMLElement>('[data-role="checkbox"][data-node-path="/apps/main.ts"]');
    if (!fileCheckbox) throw new Error('Expected file checkbox.');

    await userEvent.click(folderCheckbox);
    await new Promise(resolve => setTimeout(resolve, 0));
    await userEvent.click(fileCheckbox);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(details).toHaveLength(2);
    expect(details[0]?.checked).toBe(true);
    expect(details[0]?.path).toBe('/apps');
    expect(details[1]?.checked).toBe(true);
    expect(details[1]?.path).toBe('/apps/main.ts');
  });
});
