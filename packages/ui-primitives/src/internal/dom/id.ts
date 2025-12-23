let nextId = 0;

export const createId = (prefix: string) => {
  nextId += 1;
  return `${prefix}-${String(nextId)}`;
};
