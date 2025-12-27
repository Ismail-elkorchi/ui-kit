import { userEvent } from "vitest/browser";

const normalizeKey = (key: string) => (key.startsWith("{") ? key : `{${key}}`);

export const pressKey = async (key: string) => {
  await userEvent.keyboard(normalizeKey(key));
};

export const pressKeys = async (keys: string[]) => {
  for (const key of keys) {
    await pressKey(key);
  }
};
