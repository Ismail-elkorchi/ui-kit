import type {UikShellFileTree} from '@ismail-elkorchi/ui-shell';
import '@ismail-elkorchi/ui-tokens/base.css';
import {beforeEach, describe, expect, it} from 'vitest';
import {userEvent} from 'vitest/browser';

import {mountDocsApp} from '../src/app';

const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

describe('docs navigation', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    const root = document.getElementById('app');
    if (!root) throw new Error('Docs root not found.');
    mountDocsApp(root);
  });

  it('navigates to the tokens page via keyboard', async () => {
    await customElements.whenDefined('uik-shell-file-tree');
    const tree = document.querySelector<UikShellFileTree>('uik-shell-file-tree');
    await tree?.updateComplete;

    const label = document.querySelector<HTMLButtonElement>(
      'uik-shell-file-tree button[part="label"][data-node-path="docs/tokens"]',
    );
    expect(label).toBeTruthy();

    label?.focus();
    await userEvent.keyboard('{Enter}');
    await nextFrame();

    const title = document.querySelector('[data-docs-title]');
    expect(title?.textContent).toContain('Tokens');
  });
});
