import {expect} from 'vitest';

type TabIndexLike = HTMLElement & {tabIndexValue?: number};

const readTabIndex = (element: TabIndexLike) =>
  typeof element.tabIndexValue === 'number' ? element.tabIndexValue : element.tabIndex;

export const expectRovingTabIndex = (elements: TabIndexLike[], activeIndex: number) => {
  elements.forEach((element, index) => {
    const expected = index === activeIndex ? 0 : -1;
    expect(readTabIndex(element)).toBe(expected);
  });
};

export const getShadowActiveElement = (root: ShadowRoot | null) => root?.activeElement ?? null;
