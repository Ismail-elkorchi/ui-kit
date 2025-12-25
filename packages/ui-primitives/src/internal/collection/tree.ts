export interface TreeItemBase {
  id: string;
  label: string;
  children?: TreeItemBase[];
  isDisabled?: boolean;
}

export interface TreeItem<T extends TreeItemBase> {
  id: string;
  item: T;
  depth: number;
  parentId: string | null;
  index: number;
  setSize: number;
  isBranch: boolean;
  isExpanded: boolean;
}

export interface TreeIndex<T extends TreeItemBase> {
  itemById: Map<string, T>;
  parentById: Map<string, string | null>;
  childrenById: Map<string, string[]>;
  branchById: Map<string, boolean>;
}

export const buildTreeIndex = <T extends TreeItemBase>(items: T[]): TreeIndex<T> => {
  const itemById = new Map<string, T>();
  const parentById = new Map<string, string | null>();
  const childrenById = new Map<string, string[]>();
  const branchById = new Map<string, boolean>();

  const walk = (entries: T[], parentId: string | null) => {
    entries.forEach(entry => {
      const childItems = entry.children ?? [];
      const isBranch = Array.isArray(entry.children);
      itemById.set(entry.id, entry);
      parentById.set(entry.id, parentId);
      childrenById.set(entry.id, childItems.map(child => child.id));
      branchById.set(entry.id, isBranch);
      if (childItems.length > 0) walk(childItems as T[], entry.id);
    });
  };

  walk(items, null);
  return {itemById, parentById, childrenById, branchById};
};

export const buildTreeItems = <T extends TreeItemBase>(items: T[], openIds: Set<string>): TreeItem<T>[] => {
  const treeItems: TreeItem<T>[] = [];
  const walk = (entries: T[], depth: number, parentId: string | null) => {
    entries.forEach((entry, index) => {
      const isBranch = Array.isArray(entry.children);
      const isExpanded = isBranch && openIds.has(entry.id);
      const setSize = entries.length;
      treeItems.push({
        id: entry.id,
        item: entry,
        depth,
        parentId,
        index,
        setSize,
        isBranch,
        isExpanded,
      });
      if (isBranch && isExpanded && entry.children && entry.children.length > 0) {
        walk(entry.children as T[], depth + 1, entry.id);
      }
    });
  };

  walk(items, 0, null);
  return treeItems;
};

export const collectAncestorIds = <T extends TreeItemBase>(index: TreeIndex<T>, id: string): string[] => {
  const ancestors: string[] = [];
  let current = index.parentById.get(id) ?? null;
  while (current) {
    ancestors.push(current);
    current = index.parentById.get(current) ?? null;
  }
  return ancestors;
};

export const collectDescendantIds = <T extends TreeItemBase>(index: TreeIndex<T>, id: string): string[] => {
  const descendants: string[] = [];
  const walk = (currentId: string) => {
    const children = index.childrenById.get(currentId) ?? [];
    children.forEach(childId => {
      descendants.push(childId);
      walk(childId);
    });
  };
  walk(id);
  return descendants;
};

export const collectLeafIds = <T extends TreeItemBase>(index: TreeIndex<T>, id: string): string[] => {
  const leaves: string[] = [];
  const walk = (currentId: string) => {
    const children = index.childrenById.get(currentId) ?? [];
    if (children.length === 0) {
      leaves.push(currentId);
      return;
    }
    children.forEach(childId => walk(childId));
  };
  walk(id);
  return leaves;
};

export const collectTreeIds = <T extends TreeItemBase>(items: T[]): string[] => {
  const ids: string[] = [];
  const walk = (entries: T[]) => {
    entries.forEach(entry => {
      ids.push(entry.id);
      if (entry.children && entry.children.length > 0) walk(entry.children as T[]);
    });
  };
  walk(items);
  return ids;
};
