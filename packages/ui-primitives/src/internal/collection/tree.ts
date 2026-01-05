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

export const buildTreeIndex = <T extends TreeItemBase>(
  items: T[],
): TreeIndex<T> => {
  const itemById = new Map<string, T>();
  const parentById = new Map<string, string | null>();
  const childrenById = new Map<string, string[]>();
  const branchById = new Map<string, boolean>();

  const walk = (entries: T[], parentId: string | null) => {
    entries.forEach((entry) => {
      const childItems = entry.children ?? [];
      const isBranch = Array.isArray(entry.children);
      itemById.set(entry.id, entry);
      parentById.set(entry.id, parentId);
      childrenById.set(
        entry.id,
        childItems.map((child) => child.id),
      );
      branchById.set(entry.id, isBranch);
      if (childItems.length > 0) walk(childItems as T[], entry.id);
    });
  };

  walk(items, null);
  return { itemById, parentById, childrenById, branchById };
};

export const buildTreeItems = <T extends TreeItemBase>(
  items: T[],
  openIds: Set<string>,
): TreeItem<T>[] => {
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
      if (
        isBranch &&
        isExpanded &&
        entry.children &&
        entry.children.length > 0
      ) {
        walk(entry.children as T[], depth + 1, entry.id);
      }
    });
  };

  walk(items, 0, null);
  return treeItems;
};

export const collectTreeIds = (items: TreeItemBase[]): string[] => {
  const ids: string[] = [];
  const walk = (entries: TreeItemBase[]) => {
    entries.forEach((entry) => {
      ids.push(entry.id);
      if (entry.children && entry.children.length > 0) walk(entry.children);
    });
  };
  walk(items);
  return ids;
};
