export interface UikShellFileTreeNode {
  path: string;
  name: string;
  isDirectory: boolean;
  children?: UikShellFileTreeNode[];
}

export interface UikShellFileTreeSelectDetail {
  path: string;
  checked: boolean;
  node: UikShellFileTreeNode;
}

export interface UikShellFileTreeOpenDetail {
  path: string;
  node: UikShellFileTreeNode;
}

export interface UikShellFileTreeToggleDetail {
  path: string;
  open: boolean;
  node: UikShellFileTreeNode;
}
