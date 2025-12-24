import {beforeEach, describe, expect, it} from 'vitest';

import type {UikProgress} from '../src/atomic/feedback/uik-progress';
import type {UikSpinner} from '../src/atomic/feedback/uik-spinner';
import '../src/atomic/feedback/uik-progress';
import '../src/atomic/feedback/uik-spinner';

describe('uik feedback primitives', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders determinate and indeterminate progress', async () => {
    const progress = document.createElement('uik-progress') as UikProgress;
    progress.value = 40;
    progress.max = 100;
    document.body.append(progress);

    await progress.updateComplete;

    const bar = progress.shadowRoot?.querySelector('progress') as HTMLProgressElement | null;
    expect(bar?.value).toBe(40);
    expect(bar?.position).toBeCloseTo(0.4, 3);

    progress.indeterminate = true;
    await progress.updateComplete;

    const indeterminate = progress.shadowRoot?.querySelector('progress') as HTMLProgressElement | null;
    expect(indeterminate?.position).toBe(-1);
  });

  it('renders spinner status semantics', async () => {
    const spinner = document.createElement('uik-spinner') as UikSpinner;
    document.body.append(spinner);

    await spinner.updateComplete;

    const base = spinner.shadowRoot?.querySelector('[part="base"]');
    expect(base?.getAttribute('role')).toBe('status');
    expect(base?.getAttribute('aria-live')).toBe('polite');
  });
});
