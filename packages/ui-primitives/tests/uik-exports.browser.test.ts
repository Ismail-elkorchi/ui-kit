import {describe, expect, it} from 'vitest';

import * as primitives from '../index';
import '../register';

describe('ui-primitives exports', () => {
  it('re-exports primitives from the package index', () => {
    expect(primitives.UikButton).toBeDefined();
    expect(primitives.UikResizablePanels).toBeDefined();
    expect(primitives.UikTooltip).toBeDefined();
    expect(primitives.UikRadioGroup).toBeDefined();
  });
});
