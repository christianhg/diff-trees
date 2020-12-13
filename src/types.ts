export type TreeNode<TValues> = {
  id: string;
  children: TreeNode<TValues>[];
} & TValues;

export type TreeNodeContext =
  | { parentNode: undefined; index: 0 }
  | { parentNode: string; index: number };

export type FlatTree<TValues> = [string, FlatTreeNode<TValues>][];

export type FlatTreeNode<TValues> = Omit<TreeNode<TValues>, 'children'> & {
  context: TreeNodeContext;
};
